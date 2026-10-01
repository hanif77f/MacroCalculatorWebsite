import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

export interface Frontmatter {
  title: string;
  description: string;
  slug: string;
  cluster?: string;
  keywords?: string[];
  related?: string[];
  updated?: string;
}

// Reads one .mdx file's frontmatter + body for a given content type/slug.
// type = "calculators" | "guides" | "foods" | "glossary"
export function getContent(type: string, slug: string) {
  const filePath = path.join(CONTENT_DIR, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as Frontmatter, content };
}

// Lists every .mdx file's frontmatter in a content type folder —
// used to build hub pages (e.g. /guides) without a separate data file.
export function listContent(type: string) {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data } = matter(raw);
      return data as Frontmatter;
    });
}

export function getAllSlugs(type: string) {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}
