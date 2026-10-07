type AstNode = {
  type: string;
  depth?: number;
  value?: string;
  name?: string;
  children?: AstNode[];
  data?: Record<string, unknown>;
  attributes?: { type: string; name: string; value: string }[];
  ordered?: boolean;
  start?: number;
};

const anchorIds: Record<string, string> = {
  "Macro Calculator for Weight Loss": "lose-fat",
  "Macro Calculator for Muscle Gain": "build-muscle",
  "Macro Calculator for Maintenance": "maintain",
  "Keto Macro Calculator": "keto",
};

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idOfHeading(title: string, explicitId?: string): string {
  return explicitId ?? anchorIds[title] ?? slugifyHeading(title);
}

export function getHomepageSectionLinks(content: string) {
  const usedIds = new Set<string>();
  return content
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
      if (!match) return [];
      const title = match[2].replace(/\s+\{#([\w-]+)\}\s*$/, "").trim();
      if (title === "Related Calculators") return [];
      const explicitId = /\s+\{#([\w-]+)\}\s*$/.exec(match[2])?.[1];
      const baseId = idOfHeading(title, explicitId);
      let id = baseId;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix++;
      }
      usedIds.add(id);
      return [{ id, title }];
    });
}

function textOf(node: AstNode): string {
  return node.value ?? (node.children ?? []).map(textOf).join("");
}

function labelOf(node: AstNode | undefined): string | null {
  if (node?.type !== "paragraph" || node.children?.length !== 1 || node.children[0].type !== "strong") return null;
  return textOf(node).trim();
}

function wrapper(className: string, children: AstNode[]): AstNode {
  return {
    type: "mdxJsxFlowElement",
    name: "div",
    attributes: [{ type: "mdxJsxAttribute", name: "className", value: className }],
    children,
  };
}

function groupLabelTables(nodes: AstNode[], matches: (label: string) => boolean, className: string, includeAfterTable = false): AstNode[] {
  const out: AstNode[] = [];
  const groups: AstNode[] = [];
  let insertionIndex: number | null = null;
  for (let i = 0; i < nodes.length; i++) {
    const label = labelOf(nodes[i]);
    if (label && matches(label) && nodes[i + 1]?.type === "table") {
      if (insertionIndex === null) insertionIndex = out.length;
      const group = [nodes[i], nodes[i + 1]];
      if (includeAfterTable && nodes[i + 2]?.type === "paragraph") group.push(nodes[i + 2]);
      groups.push(wrapper("mdx-table-group", group));
      i += group.length === 3 ? 2 : 1;
    } else {
      out.push(nodes[i]);
    }
  }
  if (groups.length < 2) return nodes;
  out.splice(insertionIndex ?? out.length, 0, wrapper(`mdx-grid-group ${className}`, groups));
  return out;
}

function pairLabelTables(nodes: AstNode[], matches: (label: string) => boolean): AstNode[] {
  const out: AstNode[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const label = labelOf(nodes[i]);
    if (!label || !matches(label) || nodes[i + 1]?.type !== "table") {
      out.push(nodes[i]);
      continue;
    }

    const explanatoryText = out[out.length - 1];
    const usePrevious = explanatoryText?.type === "paragraph" && !labelOf(explanatoryText);
    if (usePrevious) out.pop();
    const tableGroup = wrapper("mdx-table-group", [nodes[i], nodes[i + 1]]);
    out.push(wrapper("mdx-pair", [
      wrapper("mdx-pair-copy", usePrevious ? [explanatoryText] : []),
      wrapper("mdx-pair-table", [tableGroup]),
    ]));
    i++;
  }
  return out;
}

function titleOf(nodes: AstNode[]): string {
  const heading = nodes[0];
  return heading?.type === "heading" ? textOf(heading).trim() : "";
}

function paragraph(text: string, className: string): AstNode {
  return wrapper(className, [{ type: "paragraph", children: [{ type: "text", value: text }] }]);
}

function accentHeading(heading: AstNode, leading: string, accent: string, className: string) {
  const title = textOf(heading);
  heading.children = [
    { type: "text", value: leading },
    {
      type: "mdxJsxTextElement",
      name: "span",
      attributes: [{ type: "mdxJsxAttribute", name: "className", value: className }],
      children: [{ type: "text", value: accent }],
    },
    { type: "text", value: title.slice(leading.length + accent.length) },
  ];
}

function jsx(name: string, className: string, children: AstNode[] = [], props: Record<string, string> = {}): AstNode {
  return {
    type: "mdxJsxFlowElement",
    name,
    attributes: [
      { type: "mdxJsxAttribute", name: "className", value: className },
      ...Object.entries(props).map(([key, value]) => ({ type: "mdxJsxAttribute", name: key, value })),
    ],
    children,
  };
}

function rowCells(row: AstNode): AstNode[] {
  return row.children ?? [];
}

function rowLabel(row: AstNode): string {
  return textOf(rowCells(row)[0] ?? {}).trim().toLowerCase();
}

function tableRows(table: AstNode): AstNode[] {
  return table.children ?? [];
}

function cellText(cell: AstNode | undefined): string {
  return cell ? textOf(cell).trim() : "";
}

function macroSplitChart(splitTable: AstNode, resultTable: AstNode) {
  const resultRows = tableRows(resultTable).slice(1);
  const grams = new Map(resultRows.map((row) => [rowLabel(row), cellText(rowCells(row)[1])]));
  const colors = { protein: "var(--protein)", carbs: "var(--carbs)", fat: "var(--fat)" };
  const circumference = 276.46;
  const macroRows = tableRows(splitTable).slice(1).map((row) => {
    const cells = rowCells(row);
    const name = cellText(cells[0]);
    const key = name.toLowerCase() === "protein" ? "protein" : name.toLowerCase() === "fat" ? "fat" : "carbs";
    const percent = Number.parseFloat(cellText(cells[1])) || 0;
    const offset = (circumference * (1 - percent / 100)).toFixed(2);
    const ring = jsx("svg", "mdx-ring-svg", [
      jsx("circle", "mdx-ring-track", [], { cx: "50", cy: "50", r: "44", fill: "none", stroke: "var(--line)", strokeWidth: "8" }),
      jsx("circle", "mdx-ring-progress", [], { cx: "50", cy: "50", r: "44", fill: "none", stroke: colors[key], strokeWidth: "8", strokeDasharray: String(circumference), strokeDashoffset: offset, transform: "rotate(-90 50 50)" }),
    ], { viewBox: "0 0 100 100", role: "img", "aria-label": `${name} ${percent}%` });
    return jsx("div", `mdx-macro-ring mdx-macro-ring-${key}`, [
      wrapper("mdx-ring-visual", [ring, jsx("span", "mdx-ring-percent", [{ type: "text", value: `${percent}%` }])]),
      wrapper("mdx-ring-caption", [
        jsx("span", `mdx-ring-name macro-${key}`, [{ type: "text", value: name === "Carbohydrates" ? "Carbs" : name }]),
        jsx("span", `mdx-ring-grams macro-${key}`, [{ type: "text", value: grams.get(key === "carbs" ? "carbs" : key) ?? "" }]),
      ]),
    ]);
  });
  return wrapper("mdx-macro-rings", macroRows);
}

function splitResultTable(table: AstNode): AstNode[] {
  const rows = tableRows(table);
  const header = rows[0];
  const body = rows.slice(1);
  const macroLabels = new Set(["calories", "protein", "carbs", "fat"]);
  const resultRows = body.filter((row) => macroLabels.has(rowLabel(row)));
  const profileRows = body.filter((row) => !macroLabels.has(rowLabel(row)));
  const half = Math.ceil(resultRows.length / 2);
  const firstResult = profileRows.length ? resultRows : resultRows.slice(0, half);
  const secondResult = profileRows.length ? [] : resultRows.slice(half);
  const first = { ...table, children: [header, ...(profileRows.length ? profileRows : firstResult)] };
  const second = { ...table, children: [header, ...(profileRows.length ? resultRows : secondResult)] };
  return [first, second].filter((group) => tableRows(group).length > 1);
}

function arrangeGoalSection(nodes: AstNode[], kind: "loss" | "muscle" | "maintenance" | "keto"): AstNode[] {
  const heading = nodes[0];
  const body = nodes.slice(1);
  const splitIndex = body.findIndex((node) => /Macro Split$/i.test(labelOf(node) ?? ""));
  const calculationIndex = body.findIndex((node) => /Calculation$/i.test(labelOf(node) ?? ""));
  if (kind === "loss") accentHeading(heading, "Macro Calculator for ", "Weight Loss", "macro-protein");
  if (splitIndex < 0 || calculationIndex < 0 || body[splitIndex + 1]?.type !== "table" || body[calculationIndex + 1]?.type !== "table") {
    return kind === "loss" ? pairLabelTables(nodes, (label) => /Macro Split$/i.test(label)) : nodes;
  }

  if (kind === "muscle") accentHeading(heading, "Macro Calculator for ", "Muscle Gain", "macro-carbs");
  if (kind === "maintenance") accentHeading(heading, "Macro Calculator for ", "Maintenance", "macro-fat");
  if (kind === "keto") accentHeading(heading, "", "Keto", "macro-fat");

  let leftContent = body.slice(0, splitIndex);
  if (kind === "muscle" || kind === "loss") {
    const isTopic = (label: string) => kind === "muscle"
      ? label.startsWith("The Role of ")
      : label === "Why Protein Matters During Fat Loss";
    const firstTopic = leftContent.findIndex((node) => isTopic(labelOf(node) ?? ""));
    if (firstTopic >= 0) {
      const topics: AstNode[] = [];
      for (let i = firstTopic; i < leftContent.length; i++) {
        if (isTopic(labelOf(leftContent[i]) ?? "") && leftContent[i + 1]) {
          topics.push(wrapper("mdx-goal-topic", [leftContent[i], leftContent[i + 1]]));
          i++;
        }
      }
      leftContent = [...leftContent.slice(0, firstTopic), wrapper("mdx-goal-topics", topics)];
    }
  }

  const resultTable = body[calculationIndex + 1];
  const resultNotes = body.slice(calculationIndex + 2);
  const right = wrapper("mdx-goal-data", [
    body[splitIndex],
    macroSplitChart(body[splitIndex + 1], resultTable),
    body[calculationIndex],
    wrapper("mdx-goal-result-tables", splitResultTable(resultTable)),
    ...resultNotes,
  ]);
  return [heading, wrapper(`mdx-goal-layout mdx-goal-layout-${kind}`, [
    wrapper("mdx-goal-copy", leftContent),
    right,
  ])];
}

function arrangePopularTargets(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  accentHeading(heading, "Popular ", "Macro Targets", "macro-fat");
  const body = nodes.slice(1);
  const tables: AstNode[] = [];
  const remaining: AstNode[] = [];
  for (let i = 0; i < body.length; i++) {
    const label = labelOf(body[i]) ?? "";
    if (/Macro Targets$/i.test(label) && body[i + 1]?.type === "table") {
      const weightLoss = /^Weight Loss Macro Targets$/i.test(label);
      const maintenance = /^Maintenance Macro Targets$/i.test(label);
      const muscle = /^Muscle Gain Macro Targets$/i.test(label);
      if (weightLoss) accentStrongLabel(body[i], "", "Weight Loss", " Macro Targets", "macro-protein");
      if (maintenance) accentStrongLabel(body[i], "", "Maintenance", " Macro Targets", "macro-carbs");
      if (muscle) accentStrongLabel(body[i], "", "Muscle Gain", " Macro Targets", "macro-fat");
      const goalClass = weightLoss ? "mdx-target-loss" : maintenance ? "mdx-target-maintenance" : muscle ? "mdx-target-muscle" : "";
      tables.push(wrapper(`mdx-target-table-group ${goalClass}`, [body[i], body[i + 1]]));
      i++;
    } else remaining.push(body[i]);
  }
  if (!tables.length) return nodes;
  const intro = remaining.shift();
  return [heading, ...(intro ? [intro] : []), wrapper("mdx-popular-target-layout", [
    wrapper("mdx-popular-target-tables", tables),
    wrapper("mdx-popular-target-note", remaining),
  ])];
}

function arrangeMistakes(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  accentHeading(heading, "Common ", "Macro Tracking Mistakes", "macro-fat");
  const body = nodes.slice(1);
  const intro = body[0];
  const items: AstNode[] = [];
  for (let i = 1; i < body.length; i++) {
    const label = labelOf(body[i]);
    if (!label) continue;
    items.push(wrapper("mdx-mistake-item", [
      wrapper("mdx-mistake-heading", [
        inlineSpan("mdx-mistake-number", String(items.length + 1).padStart(2, "0")),
        headingFromLabel(body[i], 3),
      ]),
      ...(body[i + 1] ? [body[i + 1]] : []),
    ]));
    i++;
  }
  return [heading, ...(intro ? [intro] : []), wrapper("mdx-mistakes-grid", items)];
}

function arrangeAudienceSection(nodes: AstNode[], kind: "who" | "learn"): AstNode[] {
  const heading = nodes[0];
  if (kind === "who") accentHeading(heading, "Who Should Use ", "This Calculator?", "macro-fat");
  else accentHeading(heading, "Learn More ", "About Macros", "macro-fat");
  return nodes;
}

function arrangeFaq(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  accentHeading(heading, "Frequently Asked ", "Questions", "macro-fat");
  const body = nodes.slice(1);
  const items: AstNode[] = [];
  for (let i = 0; i < body.length; i++) {
    const leadingStrong = body[i].type === "paragraph" && body[i].children?.[0]?.type === "strong" && (body[i].children?.length ?? 0) > 1
      ? body[i].children?.[0]
      : null;
    const question = labelOf(body[i]) ?? (leadingStrong ? textOf(leadingStrong) : null);
    if (!question) continue;
    let answer = body[i + 1];
    if (leadingStrong) {
      const answerChildren = body[i].children?.slice(1) ?? [];
      if (answerChildren[0]?.type === "text" && answerChildren[0].value) answerChildren[0].value = answerChildren[0].value.trimStart();
      answer = { ...body[i], children: answerChildren };
    }
    items.push(wrapper("mdx-faq-item", [
      { type: "heading", depth: 3, children: [{ type: "text", value: question }] },
      ...(answer ? [answer] : []),
    ]));
    if (!leadingStrong) i++;
  }
  const split = Math.ceil(items.length / 2);
  return [heading, wrapper("mdx-faq-grid", [
    wrapper("mdx-faq-column mdx-faq-column-first", items.slice(0, split)),
    wrapper("mdx-faq-column mdx-faq-column-second", items.slice(split)),
  ])];
}

function arrangeReferences(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  accentHeading(heading, "Scientific ", "References", "macro-fat");
  const body = nodes.slice(1);
  const listIndex = body.findIndex((node) => node.type === "list");
  if (listIndex < 0) return nodes;
  const list = body[listIndex];
  const items = list.children ?? [];
  const midpoint = Math.ceil(items.length / 2);
  const makeList = (subset: AstNode[], start: number): AstNode => ({ type: "list", ordered: true, start, children: subset });
  return [
    heading,
    ...body.slice(0, listIndex),
    wrapper("mdx-reference-columns", [
      makeList(items.slice(0, midpoint), 1),
      makeList(items.slice(midpoint), midpoint + 1),
    ]),
    ...body.slice(listIndex + 1),
  ];
}

function inlineSpan(className: string, value: string): AstNode {
  return {
    type: "mdxJsxTextElement",
    name: "span",
    attributes: [{ type: "mdxJsxAttribute", name: "className", value: className }],
    children: [{ type: "text", value }],
  };
}

function accentStrongLabel(node: AstNode, before: string, accent: string, after: string, colorClass: string) {
  node.children = [{
    type: "strong",
    children: [
      { type: "text", value: before },
      inlineSpan(colorClass, accent),
      { type: "text", value: after },
    ],
  }];
}

function arrangeMealList(node: AstNode): AstNode {
  const items = (node.children ?? []).filter((child) => child.type === "listItem");
  const meals = items.map((item, index) => {
    const paragraphNode = item.children?.find((child) => child.type === "paragraph");
    const children = paragraphNode?.children ?? [];
    const strong = children.find((child) => child.type === "strong");
    const label = strong ? textOf(strong).replace(/:$/, "") : `Meal ${index + 1}`;
    const labelClass = ["mdx-meal-breakfast", "mdx-meal-lunch", "mdx-meal-dinner", "mdx-meal-snacks"][index] ?? "";
    const remaining = strong ? children.slice(children.indexOf(strong) + 1) : children;
    if (remaining[0]?.type === "text" && remaining[0].value) remaining[0].value = remaining[0].value.trimStart();
    return wrapper("mdx-meal-option", [
      { type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: label }] }], data: { hProperties: { className: labelClass } } },
      { type: "paragraph", children: remaining },
    ]);
  });
  return wrapper("mdx-meal-grid", meals);
}

function arrangeFoodSection(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  accentHeading(heading, "Macro Foods ", "Guide", "macro-fat");
  const body = nodes.slice(1);
  const mealIndex = body.findIndex((node) => /Building a Macro-Friendly Meal/i.test(labelOf(node) ?? ""));
  const foodNodes = mealIndex < 0 ? body : body.slice(0, mealIndex);
  const mealNodes = mealIndex < 0 ? [] : body.slice(mealIndex + 1);
  const foodGroups: AstNode[] = [];
  const otherFoodNodes: AstNode[] = [];

  for (let i = 0; i < foodNodes.length; i++) {
    const label = labelOf(foodNodes[i]);
    const table = foodNodes[i + 1];
    if (!label || table?.type !== "table") {
      otherFoodNodes.push(foodNodes[i]);
      continue;
    }
    const protein = /^High Protein Foods$/i.test(label);
    const carbs = /^High Carbohydrate Foods$/i.test(label);
    const fat = /^Healthy Fat Foods$/i.test(label);
    if (protein) accentStrongLabel(foodNodes[i], "High ", "Protein", " Foods", "macro-protein");
    if (carbs) accentStrongLabel(foodNodes[i], "High ", "Carbohydrate", " Foods", "macro-carbs");
    if (fat) accentStrongLabel(foodNodes[i], "Healthy ", "Fat", " Foods", "macro-fat");
    const kind = protein ? "protein" : carbs ? "carbs" : "fat";
    foodGroups.push(wrapper(`mdx-table-group mdx-food-group mdx-food-${kind}`, [foodNodes[i], table]));
    i++;
  }

  const mealHeading: AstNode = {
    type: "heading",
    depth: 3,
    children: [
      { type: "text", value: "Building a " },
      inlineSpan("macro-fat", "Macro-Friendly Meal"),
    ],
  };
  const mealContent = mealNodes.flatMap((node) => node.type === "list" ? [arrangeMealList(node)] : [node]);
  const mealSection = mealIndex < 0 ? [] : [wrapper("mdx-meal-section", [mealHeading, ...mealContent])];
  return [heading, ...otherFoodNodes, wrapper("mdx-grid-group mdx-grid-3 mdx-food-grid", foodGroups), ...mealSection];
}

function headingFromLabel(node: AstNode, depth = 4): AstNode {
  const label = labelOf(node) ?? textOf(node).trim();
  return { type: "heading", depth, children: [{ type: "text", value: label }] };
}

function activityDescriptionTable(list: AstNode): AstNode {
  const header: AstNode = {
    type: "tableRow",
    children: ["Activity Level", "Description"].map((value) => ({ type: "tableCell", children: [{ type: "text", value }] })),
  };
  const rows = (list.children ?? []).filter((item) => item.type === "listItem").map((item) => {
    const paragraph = item.children?.find((child) => child.type === "paragraph");
    const children = paragraph?.children ?? [];
    const labelNode = children.find((child) => child.type === "strong");
    const label = labelNode ? textOf(labelNode).replace(/:$/, "") : "";
    const remaining = labelNode ? children.slice(children.indexOf(labelNode) + 1) : children;
    if (remaining[0]?.type === "text" && remaining[0].value) remaining[0].value = remaining[0].value.replace(/^\s*:\s*/, "").trimStart();
    return {
      type: "tableRow",
      children: [
        { type: "tableCell", children: [{ type: "text", value: label }] },
        { type: "tableCell", children: remaining.length ? remaining : [{ type: "text", value: "" }] },
      ],
    };
  });
  return { type: "table", children: [header, ...rows] };
}

function arrangeCalculationSteps(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  const activityIndex = nodes.findIndex((node) => node.type === "heading" && node.depth === 3 && textOf(node).trim() === "Activity Levels Explained");
  const formulaIndex = nodes.findIndex((node) => node.type === "heading" && node.depth === 3 && textOf(node).trim() === "The Formulas Behind Our Macro Calculator");
  if (activityIndex < 0 || formulaIndex < 0) return nodes;

  accentHeading(heading, "How We Calculate ", "Macros", "macro-fat");
  const top = nodes.slice(1, activityIndex);
  const firstStep = top.findIndex((node) => /^Step [123]:/.test(labelOf(node) ?? ""));
  const goalTableIndex = top.findIndex((node) => node.type === "table");
  const intro = firstStep < 0 ? top : top.slice(0, firstStep);
  const stepNodes = firstStep < 0 ? [] : top.slice(firstStep, goalTableIndex < 0 ? top.length : goalTableIndex);
  const steps: AstNode[] = [];
  for (let i = 0; i < stepNodes.length; i++) {
    const label = labelOf(stepNodes[i]);
    if (!label || !/^Step [123]:/.test(label)) continue;
    const colon = label.indexOf(":");
    const number = label.slice(0, colon).replace("Step ", "").padStart(2, "0");
    const title = label.slice(colon + 1).trim();
    steps.push(wrapper("mdx-process-step", [
      wrapper("mdx-process-step-heading", [
        inlineSpan("mdx-step-number", number),
        { type: "heading", depth: 4, children: [{ type: "text", value: title }] },
      ]),
      ...(stepNodes[i + 1] ? [stepNodes[i + 1]] : []),
    ]));
    i++;
  }
  const finalTarget = goalTableIndex < 0 ? null : top[goalTableIndex + 1];
  if (finalTarget && steps[2]) steps[2].children?.push(finalTarget);
  const goalAdjustment = goalTableIndex < 0 ? [] : [wrapper("mdx-process-adjustment", [
    { type: "heading", depth: 4, children: [{ type: "text", value: "Goal Adjustment" }] },
    top[goalTableIndex],
  ])];
  const process = wrapper("mdx-process-grid", [...steps, ...goalAdjustment]);

  const activityHeading = nodes[activityIndex];
  accentHeading(activityHeading, "Activity Levels ", "Explained", "macro-fat");
  const activity = nodes.slice(activityIndex + 1, formulaIndex);
  const multiplierLabelIndex = activity.findIndex((node) => /Activity Multiplier Table/i.test(labelOf(node) ?? ""));
  const multiplierTableIndex = multiplierLabelIndex < 0 ? -1 : multiplierLabelIndex + 1;
  const activityTable = multiplierTableIndex >= 0 ? activity[multiplierTableIndex] : null;
  const listIndex = activity.findIndex((node) => node.type === "list");
  const activityIntro = activity.slice(0, multiplierLabelIndex >= 0 ? multiplierLabelIndex : 0);
  const activityDescriptions = listIndex < 0 ? [] : activity.slice(listIndex + 1);
  const descriptionList = listIndex < 0 ? null : activity[listIndex];
  const activityColumns = wrapper("mdx-activity-columns", [
    wrapper("mdx-activity-multiplier", [
      ...(multiplierLabelIndex >= 0 ? [headingFromLabel(activity[multiplierLabelIndex])] : []),
      ...(activityTable ? [activityTable] : []),
    ]),
    wrapper("mdx-activity-descriptions", [
      { type: "heading", depth: 4, children: [{ type: "text", value: "Activity Level Descriptions" }] },
      ...(descriptionList ? [activityDescriptionTable(descriptionList)] : []),
    ]),
  ]);

  const formulaHeading = nodes[formulaIndex];
  accentHeading(formulaHeading, "The Formulas Behind Our ", "Macro Calculator", "macro-fat");
  const formulaBody = nodes.slice(formulaIndex + 1);
  const formulaLabels = /^(Mifflin-St Jeor Formula|Katch-McArdle Formula|Cunningham Formula|Harris-Benedict Formula)$/i;
  const formulaCards: AstNode[] = [];
  const remaining: AstNode[] = [];
  for (let i = 0; i < formulaBody.length; i++) {
    const label = labelOf(formulaBody[i]);
    if (label && formulaLabels.test(label) && formulaBody[i + 1]) {
      formulaCards.push(wrapper("mdx-formula-card", [headingFromLabel(formulaBody[i]), formulaBody[i + 1]]));
      i++;
    } else remaining.push(formulaBody[i]);
  }
  const formulaIntro = remaining[0]?.type === "paragraph" ? remaining.shift() : null;
  const updatedBodyFatIndex = remaining.findIndex((node) => node.type === "heading" && node.depth === 4 && /How Do I Find My Body Fat Percentage\?/i.test(textOf(node)));
  const updatedComparisonIndex = remaining.findIndex((node) => /Formula Comparison/i.test(labelOf(node) ?? ""));
  const bodyFat = updatedBodyFatIndex < 0 ? [] : remaining.slice(updatedBodyFatIndex, updatedComparisonIndex < 0 ? remaining.length : updatedComparisonIndex);
  const comparison = updatedComparisonIndex < 0 ? [] : remaining.slice(updatedComparisonIndex);
  if (updatedComparisonIndex >= 0 && labelOf(comparison[0])) comparison[0] = headingFromLabel(comparison[0]);
  const activityNote = activityDescriptions.filter((node) => node.type !== "list");
  return [
    heading,
    ...intro,
    process,
    wrapper("mdx-method-subsection mdx-activity-subsection", [activityHeading, ...activityIntro, activityColumns, ...activityNote]),
    wrapper("mdx-method-subsection mdx-formula-subsection", [
      formulaHeading,
      ...(formulaIntro ? [formulaIntro] : []),
      wrapper("mdx-formula-grid", formulaCards),
      wrapper("mdx-formula-details", [
        wrapper("mdx-bodyfat-details", bodyFat),
        wrapper("mdx-formula-comparison-details", comparison),
      ]),
    ]),
  ];
}

function arrangeNutrientSection(nodes: AstNode[], kind: "overview" | "protein" | "carbs" | "fat"): AstNode[] {
  const heading = nodes[0];
  const body = nodes.slice(1);
  const firstLabel = body.findIndex((node) => labelOf(node) !== null);

  if (kind === "overview") {
    const tableIndex = body.findIndex((node) => node.type === "table");
    if (tableIndex < 0) return nodes;
    return [heading, wrapper("mdx-editorial-columns mdx-overview-columns", [
      wrapper("mdx-editorial-copy", body.filter((node) => node.type !== "table")),
      wrapper("mdx-editorial-data", [body[tableIndex]]),
    ])];
  }

  if (kind === "protein") accentHeading(heading, "", "Protein", "macro-protein");
  if (kind === "carbs") accentHeading(heading, "", "Carbohydrates", "macro-carbs");
  if (kind === "fat") accentHeading(heading, "", "Fat", "macro-fat");

  if (kind === "carbs") {
    const foodLabel = body.findIndex((node, index) => index > firstLabel && /Common High-Carb Foods/i.test(labelOf(node) ?? ""));
    if (firstLabel < 0 || foodLabel < 0) return nodes;
    const explanation = body.slice(0, foodLabel).map((node) =>
      /Total Carbohydrates.*Fiber.*Net Carbs/i.test(textOf(node))
        ? wrapper("mdx-carb-formula", [node])
        : node,
    );
    return [heading, wrapper("mdx-editorial-columns mdx-carbs-columns", [
      wrapper("mdx-editorial-copy", explanation),
      wrapper("mdx-editorial-data", body.slice(foodLabel)),
    ])];
  }

  if (firstLabel < 0) return nodes;
  return [heading, wrapper("mdx-editorial-columns mdx-macro-columns", [
    wrapper("mdx-editorial-copy", body.slice(0, firstLabel)),
    wrapper("mdx-editorial-data", body.slice(firstLabel)),
  ])];
}

function arrangeIndividualDifferences(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  const body = nodes.slice(1).flatMap((node) => {
    if (node.type !== "paragraph" || node.children?.[0]?.type !== "strong" || node.children.length < 2) return [node];
    const copy = node.children.slice(1);
    if (copy[0]?.type === "text" && copy[0].value) copy[0].value = copy[0].value.trimStart();
    return [
      { type: "paragraph", children: [node.children[0]] },
      { ...node, children: copy },
    ];
  });
  const firstTopic = body.findIndex((node) => ["Women", "Men", "Older Adults"].includes(labelOf(node) ?? ""));
  if (firstTopic < 0) return nodes;
  const intro = body.slice(0, firstTopic);
  const topics: AstNode[] = [];
  let note: AstNode[] = [];
  for (let i = firstTopic; i < body.length; i++) {
    if (["Women", "Men", "Older Adults"].includes(labelOf(body[i]) ?? "")) {
      const next = body[i + 1];
      if (next) topics.push(wrapper("mdx-individual-topic", [body[i], next]));
      i++;
    } else {
      note = body.slice(i);
      break;
    }
  }
  return [heading, ...intro, wrapper("mdx-individual-grid", [...topics, ...(note.length ? [wrapper("mdx-individual-note", note)] : [])])];
}

function arrangeQuickAnswer(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  const title = textOf(heading).replace(/^Quick Answer:\s*/i, "");
  heading.children = [{ type: "text", value: title }];
  const description = nodes[1];
  const goalLead = nodes[2];
  const goalList = nodes[3];
  const close = nodes[4];
  return [wrapper("mdx-quick-answer", [
    wrapper("mdx-quick-answer-main", [
      wrapper("mdx-quick-answer-title", [paragraph("Quick Answer", "mdx-eyebrow"), heading]),
      ...(description ? [description] : []),
    ]),
    wrapper("mdx-quick-answer-aside", [goalLead, goalList, close].filter((node): node is AstNode => Boolean(node))),
  ])];
}

function arrangeUnderstanding(nodes: AstNode[]): AstNode[] {
  const heading = nodes[0];
  const introduction = nodes[1];
  const columns: AstNode[] = [];
  let current: AstNode[] = [];
  let currentTitle = "";
  const flush = () => {
    if (!current.length) return;
    const macro = currentTitle.toLowerCase();
    const macroClass = macro === "calories" ? "mdx-result-calories" : macro === "protein" ? "mdx-result-protein" : macro === "carbohydrates" ? "mdx-result-carbs" : "mdx-result-fat";
    columns.push(wrapper(`mdx-result-column ${macroClass}`, current));
    current = [];
  };

  for (const node of nodes.slice(2)) {
    if (node.type === "heading" && node.depth === 3) {
      flush();
      currentTitle = textOf(node).trim();
    }
    current.push(node);
  }
  flush();
  return [heading, ...(introduction ? [introduction] : []), wrapper("mdx-understanding-grid", columns)];
}

function arrangeSection(nodes: AstNode[], title: string): AstNode[] {
  if (title.startsWith("Quick Answer:")) return arrangeQuickAnswer(nodes);
  if (title === "Understanding Your Results") return arrangeUnderstanding(nodes);
  if (title === "What Are Macronutrients?") return arrangeNutrientSection(nodes, "overview");
  if (title === "Protein Explained") return arrangeNutrientSection(nodes, "protein");
  if (title === "Carbohydrates Explained") return arrangeNutrientSection(nodes, "carbs");
  if (title === "Fat Explained") return arrangeNutrientSection(nodes, "fat");
  if (title === "Macro Needs Can Vary Between Individuals") return arrangeIndividualDifferences(nodes);
  if (title === "Macro Calculator for Weight Loss") return arrangeGoalSection(nodes, "loss");
  if (title === "Common Macro Tracking Mistakes") return arrangeMistakes(nodes);
  if (title === "Who Should Use This Calculator?") return arrangeAudienceSection(nodes, "who");
  if (title === "Learn More About Macros") return arrangeAudienceSection(nodes, "learn");
  if (title === "Frequently Asked Questions") return arrangeFaq(nodes);
  if (title === "Scientific References") return arrangeReferences(nodes);
  if (title === "Macro Foods Guide") {
    return arrangeFoodSection(nodes);
  }
  if (title === "Macro Calculator for Muscle Gain") return arrangeGoalSection(nodes, "muscle");
  if (title === "Macro Calculator for Maintenance") return arrangeGoalSection(nodes, "maintenance");
  if (title === "Keto Macro Calculator") return arrangeGoalSection(nodes, "keto");
  if (title === "Real-Life Macro Examples") {
    return groupLabelTables(nodes, (label) => /^Example [123]:/.test(label), "mdx-grid-3 mdx-example-grid", true);
  }
  if (title === "Popular Macro Targets") {
    return arrangePopularTargets(nodes);
  }
  if (title === "How We Calculate Macros") {
    return arrangeCalculationSteps(nodes);
  }
  return nodes;
}

export function remarkHomepageLayout() {
  return (tree: AstNode) => {
    const children = tree.children ?? [];
    const preamble: AstNode[] = [];
    const sections: AstNode[][] = [];
    let current: AstNode[] | null = null;

    for (const node of children) {
      const childHeading = node.type === "heading" && node.depth === 3 && ["Protein Explained", "Carbohydrates Explained", "Fat Explained"].includes(textOf(node).trim());
      if (node.type === "heading" && (node.depth === 2 || childHeading)) {
        if (current) sections.push(current);
        if (childHeading) node.depth = 2;
        current = [node];
        const headingText = textOf(node).replace(/\s+\{#[\w-]+\}\s*$/, "").trim();
        node.data = { ...node.data, hProperties: { ...((node.data?.hProperties as Record<string, unknown> | undefined) ?? {}), id: idOfHeading(headingText) } };
      } else if (current) {
        current.push(node);
      } else {
        if (node.type === "heading" && node.depth === 1) {
          const headingText = textOf(node).trim();
          node.data = { ...node.data, hProperties: { ...((node.data?.hProperties as Record<string, unknown> | undefined) ?? {}), id: idOfHeading(headingText) } };
        }
        preamble.push(node);
      }
    }
    if (current) sections.push(current);

    const popularTargetsIndex = sections.findIndex((section) => titleOf(section) === "Popular Macro Targets");
    const ketoIndex = sections.findIndex((section) => titleOf(section) === "Keto Macro Calculator");
    if (popularTargetsIndex >= 0 && ketoIndex >= 0 && popularTargetsIndex !== ketoIndex + 1) {
      const [popularTargets] = sections.splice(popularTargetsIndex, 1);
      const updatedKetoIndex = sections.findIndex((section) => titleOf(section) === "Keto Macro Calculator");
      sections.splice(updatedKetoIndex + 1, 0, popularTargets);
    }

    const rendered: AstNode[] = preamble.length ? [wrapper("mdx-intro", preamble)] : [];
    for (let index = 0; index < sections.length; index++) {
      const section = sections[index];
      const title = titleOf(section);
      if (title === "Related Calculators") continue;
      if (title === "Who Should Use This Calculator?" && titleOf(sections[index + 1] ?? []) === "Learn More About Macros") {
        const who = arrangeSection(section, title);
        const learn = arrangeSection(sections[index + 1], "Learn More About Macros");
        rendered.push({
          type: "mdxJsxFlowElement",
          name: "section",
          attributes: [{ type: "mdxJsxAttribute", name: "className", value: "content-section mdx-section mdx-audience-guides" }],
          children: [wrapper("mdx-audience-guide-grid", [
            wrapper("mdx-audience-guide-column mdx-audience-column-who", who),
            wrapper("mdx-audience-guide-column mdx-audience-column-learn", learn),
          ])],
        });
        index++;
        continue;
      }
      const content = arrangeSection(section, title);

      const sectionClass = title.startsWith("Quick Answer:")
        ? "content-section mdx-section mdx-quick-section"
        : title === "Understanding Your Results"
          ? "content-section mdx-section mdx-understanding-section"
          : "content-section mdx-section";
      rendered.push({
        type: "mdxJsxFlowElement",
        name: "section",
        attributes: [{ type: "mdxJsxAttribute", name: "className", value: sectionClass }],
        children: content,
      });
    }
    tree.children = rendered;
  };
}
