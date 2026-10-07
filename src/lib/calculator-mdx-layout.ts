type AstNode = {
  type: string;
  depth?: number;
  value?: string;
  name?: string;
  children?: AstNode[];
  attributes?: { type: string; name: string; value: string }[];
  ordered?: boolean;
};

function textOf(node: AstNode): string {
  return node.value ?? (node.children ?? []).map(textOf).join("");
}

function element(name: string, className: string, children: AstNode[]): AstNode {
  return {
    type: "mdxJsxFlowElement",
    name,
    attributes: [{ type: "mdxJsxAttribute", name: "className", value: className }],
    children,
  };
}

function inlineElement(name: string, className: string, children: AstNode[]): AstNode {
  return {
    type: "mdxJsxTextElement",
    name,
    attributes: [{ type: "mdxJsxAttribute", name: "className", value: className }],
    children,
  };
}

function formatTdeeCalculationSteps(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "How Is TDEE Calculated?") return nodes;

  const body = nodes.slice(1);
  const stepIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 2 && /^Step [123]:/i.test(textOf(node).trim()) ? [index] : [],
  );
  if (stepIndexes.length !== 3) return nodes;

  const introduction = body.slice(0, stepIndexes[0]);
  const fullWidthNotes: AstNode[] = [];
  const steps = stepIndexes.map((start, index) => {
    const end = stepIndexes[index + 1] ?? body.length;
    const heading = body[start];
    const [, number, title] = textOf(heading).trim().match(/^Step ([123]):\s*(.+)$/i) ?? [];
    if (!number || !title) return null;
    const stepContent = body.slice(start + 1, end);
    const regularContent = stepContent.filter((node) => {
      if (node.type === "paragraph" && /^The Mifflin-St Jeor equation is one of the commonly used equations/i.test(textOf(node))) {
        fullWidthNotes.push(node);
        return false;
      }
      return true;
    });

    return element("div", "mdx-process-step", [
      element("div", "mdx-process-step-heading", [
        inlineElement("span", "mdx-step-number", [{ type: "text", value: number.padStart(2, "0") }]),
        { type: "heading", depth: 3, children: [{ type: "text", value: title }] },
      ]),
      ...regularContent,
    ]);
  });

  if (steps.some((step) => step === null)) return nodes;
  return [
    nodes[0],
    ...introduction,
    element("div", "mdx-process-grid mdx-tdee-process-grid", steps.filter((step): step is AstNode => step !== null)),
    ...(fullWidthNotes.length > 0 ? [element("div", "mdx-tdee-process-note", fullWidthNotes)] : []),
  ];
}

function isLabeledParagraph(node: AstNode): boolean {
  return node.type === "paragraph" && node.children?.[0]?.type === "strong";
}

function formatTdeeComponents(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "What Is Included in TDEE?") return nodes;

  const body = nodes.slice(1);
  const firstItemIndex = body.findIndex(isLabeledParagraph);
  if (firstItemIndex < 0) return nodes;

  let listEnd = firstItemIndex;
  while (listEnd < body.length && isLabeledParagraph(body[listEnd])) listEnd++;
  const items = body.slice(firstItemIndex, listEnd);
  if (items.length !== 4) return nodes;

  const list: AstNode = {
    type: "list",
    ordered: false,
    children: items.map((paragraph) => ({
      type: "listItem",
      children: [paragraph],
    })),
  };

  return [
    nodes[0],
    ...body.slice(0, firstItemIndex),
    list,
    ...body.slice(listEnd),
  ];
}

function makeActivityDescriptionTable(headings: AstNode[], paragraphs: AstNode[]): AstNode {
  const header: AstNode = {
    type: "tableRow",
    children: ["Activity Level", "Description"].map((value) => ({
      type: "tableCell",
      children: [{ type: "text", value }],
    })),
  };
  const rows = headings.map((heading, index): AstNode => ({
    type: "tableRow",
    children: [
      { type: "tableCell", children: heading.children ?? [] },
      { type: "tableCell", children: paragraphs[index]?.children ?? [] },
    ],
  }));

  return { type: "table", children: [header, ...rows] };
}

function formatTdeeActivityLevels(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "TDEE Activity Levels") return nodes;

  const body = nodes.slice(1);
  const multiplierTableIndex = body.findIndex((node) => node.type === "table");
  const descriptionHeadingIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 3 ? [index] : [],
  );
  const expectedDescriptions = 5;
  if (multiplierTableIndex < 0 || descriptionHeadingIndexes.length !== expectedDescriptions) return nodes;

  const firstDescriptionIndex = descriptionHeadingIndexes[0];
  const descriptionHeadings = descriptionHeadingIndexes.map((index) => body[index]);
  const descriptionParagraphs = descriptionHeadingIndexes.map((index) => body[index + 1]);
  if (descriptionParagraphs.some((node) => node?.type !== "paragraph")) return nodes;

  const introduction = body.slice(0, multiplierTableIndex);
  const trailingContent = body.slice(descriptionHeadingIndexes[descriptionHeadingIndexes.length - 1] + 2);
  const activityColumns = element("div", "mdx-activity-columns", [
    element("div", "mdx-activity-multiplier", [
      { type: "heading", depth: 3, children: [{ type: "text", value: "Activity Multiplier Table" }] },
      body[multiplierTableIndex],
    ]),
    element("div", "mdx-activity-descriptions", [
      { type: "heading", depth: 3, children: [{ type: "text", value: "Activity Level Descriptions" }] },
      makeActivityDescriptionTable(descriptionHeadings, descriptionParagraphs),
    ]),
  ]);
  const sourceNote = body.slice(multiplierTableIndex + 1, firstDescriptionIndex);

  return [
    nodes[0],
    ...introduction,
    activityColumns,
    ...sourceNote.map((node) => element("div", "mdx-activity-note", [node])),
    ...(trailingContent.length > 0
      ? [element("div", "mdx-activity-recommendation", trailingContent)]
      : []),
  ];
}

function formatTdeeFormulaOptions(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "TDEE Calculator Formula Options") return nodes;

  const body = nodes.slice(1);
  const formulaIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 3 ? [index] : [],
  );
  const noteIndex = body.findIndex((node) => node.type === "paragraph" && /\bImportant:/i.test(textOf(node)));
  if (formulaIndexes.length !== 4 || noteIndex <= formulaIndexes[formulaIndexes.length - 1]) return nodes;

  const introduction = body.slice(0, formulaIndexes[0]);
  const formulaCards = formulaIndexes.map((start, index) => {
    const end = formulaIndexes[index + 1] ?? noteIndex;
    const heading = body[start];
    const description = body.slice(start + 1, end);
    return element("div", "mdx-formula-card", [
      { type: "heading", depth: 3, children: heading.children ?? [] },
      ...description,
    ]);
  });

  return [
    nodes[0],
    ...introduction,
    element("div", "mdx-formula-grid mdx-tdee-formula-grid", formulaCards),
    element("div", "mdx-formula-note", body[noteIndex].children ?? []),
    ...body.slice(noteIndex + 1),
  ];
}

function formatTdeeFormula(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (
      index === 0
      || node.type !== "paragraph"
      || node.children?.length !== 1
      || node.children[0].type !== "strong"
      || textOf(node.children[0]).trim() !== "TDEE = BMR × Activity Multiplier"
    ) {
      return node;
    }
    return element("div", "mdx-tdee-equation", [node]);
  });
}

function formatBmrEquations(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (
      index === 0
      || node.type !== "paragraph"
      || !/\bBMR\s*=/.test(textOf(node))
    ) {
      return node;
    }
    return element("div", "mdx-tdee-equation mdx-bmr-equation", [node]);
  });
}

function formatBodyFatEquations(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (
      index === 0
      || node.type !== "paragraph"
      || !/\b(?:BF%|Fat mass|Lean mass|BFP)\s*=/.test(textOf(node))
    ) {
      return node;
    }
    return element("div", "mdx-tdee-equation mdx-bmr-equation", [node]);
  });
}

function formatLeanMassEquations(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (
      index === 0
      || node.type !== "paragraph"
      || !/\b(?:LBM\s*=|Men: LBM|Women: LBM|0\.407 ×|1\.1 ×|0\.32810 ×|0\.252 ×|1\.07 ×|0\.29569 ×)/i.test(textOf(node))
    ) {
      return node;
    }
    return element("div", "mdx-tdee-equation mdx-bmr-equation", [node]);
  });
}

function formatNutrientEquations(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (
      index === 0
      || node.type !== "paragraph"
      || node.children?.length !== 1
      || node.children[0].type !== "strong"
      || !/^(?:Protein target \(g\/day\)|Protein calories =|75 kg × 1\.6 g\/kg =|Carbohydrate grams =|Common shorthand: Net carbs =|1 g carbohydrate =|2,200 × 0\.50 =|1,100 ÷ 4 =|Fat grams per day =|Fat calories =|Fat grams =|Fat calorie percentage =|1 g fat =|10 g fat =|50 g fat =|Saturated-fat calories =)/i.test(textOf(node.children[0]).trim())
    ) {
      return node;
    }
    return element("div", "mdx-tdee-equation mdx-protein-equation", [node]);
  });
}

function formatCalorieDeficitEquations(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (index === 0 || node.type !== "paragraph") return node;
    const content = textOf(node).trim();
    const isEquation = /^(?:Calorie Deficit\s*=|Estimated Maintenance Calories\s*≈|Daily Deficit\s*=|Daily Calorie Target\s*=)/i.test(content);
    const isCalculation = /^(?:Example:\s*)?[\d,]+.*[−-]\s*[\d,]+.*=\s*[\d,]+.*(?:kcal|calorie|daily deficit)/i.test(content);
    return isEquation || isCalculation
      ? element("div", "mdx-tdee-equation mdx-protein-equation", [node])
      : node;
  });
}

function formatCalorieDeficitImportantNote(nodes: AstNode[]): AstNode[] {
  return nodes.map((node, index) => {
    if (index === 0 || node.type !== "paragraph" || node.children?.[0]?.type !== "strong") return node;
    if (textOf(node.children[0]).trim().replace(/:$/, "") !== "Important") return node;
    const remaining = node.children.slice(1);
    if (remaining.length === 0) return node;
    return element("div", "mdx-calorie-deficit-important-note", [
      { type: "heading", depth: 3, children: [{ type: "text", value: "Important" }] },
      { ...node, children: remaining },
    ]);
  });
}

function formatCalorieCalculatorArticle(nodes: AstNode[]): AstNode[] {
  const output: AstNode[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const label = node.type === "paragraph" && node.children?.[0]?.type === "strong"
      ? textOf(node.children[0]).trim()
      : "";
    if (["Important", "Related tool", "Topic boundary"].includes(label) && nodes[index + 1]?.type === "paragraph") {
      output.push(element("div", "mdx-calorie-deficit-important-note", [
        { type: "heading", depth: 3, children: [{ type: "text", value: label }] },
        nodes[index + 1],
      ]));
      index++;
      continue;
    }

    if (node.type === "paragraph") {
      const content = textOf(node).trim();
      const formula = /^(?:BMR\s*=|Estimated daily calories\s*=|Maintenance calories\s*≈)/i.test(content);
      const workedCalculation = /^(?:[\d,]+\s*\([^)]*\).*(?:=|≈)\s*[\d,]+(?:\.\d+)?\s*kcal\/day|[\d,]+(?:\.\d+)?\s*[×x]\s*[\d.]+\s*≈\s*[\d,]+(?:\.\d+)?\s*kcal\/day)/i.test(content);
      if (formula || workedCalculation) {
        output.push(element("div", "mdx-tdee-equation mdx-protein-equation", [node]));
        continue;
      }
    }
    output.push(node);
  }
  return output;
}

function formatTdeeChangeReasons(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "Why Your TDEE Changes") return nodes;

  const body = nodes.slice(1);
  const reasonIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 3 ? [index] : [],
  );
  if (reasonIndexes.length !== 5) return nodes;

  const introEnd = reasonIndexes[0];
  const reasons = reasonIndexes.map((start) => {
    const heading = body[start];
    const description = body[start + 1];
    if (description?.type !== "paragraph") return null;
    return element("div", "mdx-tdee-change-reason", [
      { type: "heading", depth: 3, children: heading.children ?? [] },
      description,
    ]);
  });

  if (reasons.some((reason) => reason === null)) return nodes;
  const finalReasonEnd = reasonIndexes[reasonIndexes.length - 1] + 2;
  return [
    nodes[0],
    ...body.slice(0, introEnd),
    element("div", "mdx-tdee-change-grid", reasons.filter((reason): reason is AstNode => reason !== null)),
    ...body.slice(finalReasonEnd),
  ];
}

function formatTdeeReferences(nodes: AstNode[]): AstNode[] {
  if (textOf(nodes[0]).trim() !== "Scientific References") return nodes;

  const body = nodes.slice(1);
  const referenceIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 3 ? [index] : [],
  );
  if (referenceIndexes.length < 2) return nodes;

  const references = referenceIndexes.map((start, index) => {
    const next = referenceIndexes[index + 1] ?? body.length;
    const description = body[start + 1];
    if (description?.type !== "paragraph" || start + 2 !== next) return null;
    return element("div", "mdx-reference-item", [
      { type: "heading", depth: 3, children: body[start].children ?? [] },
      description,
    ]);
  });
  if (references.some((reference) => reference === null)) return nodes;

  const split = Math.ceil(references.length / 2);
  return [
    nodes[0],
    element("div", "mdx-reference-columns", [
      element("div", "mdx-reference-column mdx-reference-column-first", references.slice(0, split).filter((reference): reference is AstNode => reference !== null)),
      element("div", "mdx-reference-column mdx-reference-column-second", references.slice(split).filter((reference): reference is AstNode => reference !== null)),
    ]),
    ...body.slice(referenceIndexes[referenceIndexes.length - 1] + 2),
  ];
}

function isFaqHeading(node: AstNode): boolean {
  return node.type === "heading"
    && node.depth === 1
    && /\b(?:faq|frequently asked questions)\b/i.test(textOf(node));
}

function formatFaqSection(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  const body = nodes.slice(1).filter((node) => node.type !== "thematicBreak");
  const questionIndexes = body.flatMap((node, index) =>
    node.type === "heading" && node.depth === 2 ? [index] : [],
  );

  if (questionIndexes.length === 0) return nodes;

  const items = questionIndexes.map((start, index) => {
    const end = questionIndexes[index + 1] ?? body.length;
    const question = body[start];
    const answer = body.slice(start + 1, end);
    return element("details", "calculator-faq-item", [
      element("summary", "calculator-faq-question", question.children ?? []),
      ...answer,
    ]);
  });
  const split = Math.ceil(items.length / 2);
  const introduction = body.slice(0, questionIndexes[0]);

  return [
    heading,
    ...introduction,
    element("div", "calculator-faq-grid", [
      element("div", "calculator-faq-column calculator-faq-column-first", items.slice(0, split)),
      element("div", "calculator-faq-column calculator-faq-column-second", items.slice(split)),
    ]),
  ];
}

function isSectionHeading(node: AstNode): boolean {
  return node.type === "heading" && node.depth === 1;
}

export function remarkCalculatorFaqs() {
  return (tree: AstNode) => {
    const nodes = tree.children ?? [];
    const output: AstNode[] = [];

    for (let index = 0; index < nodes.length; index++) {
      if (!isFaqHeading(nodes[index])) {
        output.push(nodes[index]);
        continue;
      }

      let end = index + 1;
      while (end < nodes.length && !(nodes[end].type === "heading" && nodes[end].depth === 1)) end++;
      output.push(...formatFaqSection(nodes.slice(index, end)));
      index = end - 1;
    }

    tree.children = output;
  };
}

export function remarkCalculatorSections() {
  return (tree: AstNode) => {
    const nodes = (tree.children ?? []).filter((node) => node.type !== "thematicBreak");
    const sections: AstNode[] = [];
    let current: AstNode[] = [];

    const flush = () => {
      if (current.length === 0) return;
      const heading = current.find(isSectionHeading);
      const title = heading ? textOf(heading) : "";
      const sectionClass = title.startsWith("Quick Answer:")
        ? "content-section mdx-section mdx-quick-section"
        : "content-section mdx-section";

      const sectionContent = title.startsWith("Quick Answer:")
        ? formatCalorieDeficitImportantNote(formatCalorieDeficitEquations(formatTdeeFormula(current)))
        : title === "TDEE Formula"
        ? formatTdeeFormula(current)
        : title === "How the Calorie Deficit Calculator Works"
          || title === "How to Calculate a Calorie Deficit"
          || title === "What Is a 500-Calorie Deficit?"
          || title === "Real-Life Calorie Deficit Examples"
          ? formatCalorieDeficitEquations(current)
        : title === "Step 1: Estimate Resting Energy Expenditure"
          || title === "Step 2: Account for Physical Activity"
          || title === "Step 3: Estimate Maintenance Calories"
          || title === "Step 4: Adjust Calories for Your Goal"
          || title === "Calorie Calculator for Weight Loss"
          || title === "Calories and BMR"
          || title === "Calories and TDEE"
          || title === "Real-Life Calorie Calculation Examples"
          ? formatCalorieCalculatorArticle(current)
        : title === "Protein Intake Formula" || title === "How Many Calories Are in Protein?" || title === "Real-Life Protein Examples"
          ? formatNutrientEquations(current)
        : title === "How the Carb Calculator Works" || title === "Carb Calculation Formula" || title === "Total Carbohydrates vs Net Carbs" || title === "How Many Calories Are in a Gram of Carbohydrate?" || title === "Real-Life Carb Examples"
          || title === "Quick Answer: How Much Fat Should I Eat Per Day?" || title === "How the Fat Intake Calculator Works" || title === "Fat Per Gram and Calories From Fat" || title === "How to Calculate the Percentage of Calories From Fat" || title === "Real-Life Fat Intake Examples" || title === "Saturated Fat"
          ? formatNutrientEquations(current)
        : title === "How Is BMR Calculated?" || title === "BMR Examples"
          ? formatBmrEquations(current)
        : title === "How to Calculate Body Fat Percentage" || title === "Body Fat Mass and Lean Body Mass" || title === "U.S. Navy vs BMI Body Fat Estimates" || title === "Body Fat Examples"
          ? formatBodyFatEquations(current)
        : title === "How Is Lean Body Mass Calculated?" || title === "Lean Body Mass From Body Fat Percentage" || title === "Real-Life Lean Body Mass Examples"
          ? formatLeanMassEquations(current)
        : title === "How Is TDEE Calculated?"
        ? formatTdeeCalculationSteps(current)
        : title === "What Is Included in TDEE?"
          ? formatTdeeComponents(current)
        : title === "TDEE Activity Levels"
          ? formatTdeeActivityLevels(current)
          : title === "TDEE Calculator Formula Options"
            ? formatTdeeFormulaOptions(current)
            : title === "Why Your TDEE Changes"
              ? formatTdeeChangeReasons(current)
              : title === "Scientific References"
                ? formatTdeeReferences(current)
          : current;
      sections.push(element("section", sectionClass, sectionContent));
      current = [];
    };

    for (const node of nodes) {
      if (isSectionHeading(node)) flush();
      current.push(node);
    }
    flush();
    tree.children = sections;
  };
}
