/**
 * Single source of truth for content categories and how they are grouped in
 * the left navigation. Content validation checks front-matter `category`
 * values against the keys defined here.
 */

export const CATEGORIES = {
  java: { label: "Java", order: 1, group: "foundations" },
  selenium: { label: "Selenium", order: 2, group: "foundations" },
  testng: { label: "TestNG", order: 3, group: "foundations" },
  framework: { label: "Framework", order: 4, group: "engineering" },
  api: { label: "API Testing", order: 5, group: "engineering" },
  sql: { label: "SQL", order: 6, group: "engineering" },
  devops: { label: "CI/CD", order: 7, group: "engineering" },
  playwright: { label: "Playwright", order: 8, group: "modern" },
  "ai-testing": { label: "AI Testing", order: 9, group: "ai" },
  "ai-agents": { label: "AI Agents", order: 10, group: "ai" },
  "real-world": { label: "Real-World Scenarios", order: 11, group: "realworld" },
  interview: { label: "Interview", order: 12, group: "interview" }
};

export const CATEGORY_GROUPS = [
  { key: "foundations", label: "Foundations", categories: ["java", "selenium", "testng"] },
  { key: "engineering", label: "Engineering", categories: ["framework", "api", "sql", "devops"] },
  { key: "modern", label: "Modern Automation", categories: ["playwright"] },
  { key: "ai", label: "AI Era", categories: ["ai-testing", "ai-agents"] },
  { key: "realworld", label: "Real World", categories: ["real-world"] },
  { key: "interview", label: "Interview", categories: ["interview"] }
];

export const VALID_CATEGORIES = Object.keys(CATEGORIES);

export const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export const VALID_STATUS = ["published", "draft"];
