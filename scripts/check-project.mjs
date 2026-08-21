import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "index.html",
  "favicon.svg",
  "src/main.js",
  "src/content/story-content.js",
  "src/ui/dialogue-controller.js",
  "src/ui/notebook-controller.js",
  "src/world/world-builder.js",
  "styles/base.css",
  "data/processed/territory-data.js",
  "data/processed/climate-series.js",
  "analysis/notebooks/pacific-climate-signals-analysis.ipynb",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`missing required file: ${file}`);
}

const ignoredDirectories = new Set([".git", "node_modules", "resources"]);
const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".md"]);
const sourceFiles = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    if (ignoredDirectories.has(name)) continue;
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path);
    else if (textExtensions.has(extname(path))) sourceFiles.push(path);
  }
}

walk(root);

const legacyNames = ["vanilla_site", "three_story", "reproduce_receding_reef", "line-story"];
for (const path of sourceFiles) {
  if (relative(root, path) === "scripts/check-project.mjs") continue;
  const text = readFileSync(path, "utf8");
  for (const legacyName of legacyNames) {
    if (text.includes(legacyName)) {
      failures.push(`legacy name '${legacyName}' remains in ${relative(root, path)}`);
    }
  }
}

for (const path of sourceFiles.filter((file) => [".js", ".mjs"].includes(extname(file)))) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (result.status !== 0) failures.push(`syntax error in ${relative(root, path)}\n${result.stderr.trim()}`);
}

try {
  JSON.parse(readFileSync(join(root, "analysis/notebooks/pacific-climate-signals-analysis.ipynb"), "utf8"));
} catch (error) {
  failures.push(`invalid analysis notebook JSON: ${error.message}`);
}

if (failures.length) {
  console.error(`Project checks failed:\n\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log(`Project checks passed: ${requiredFiles.length} required files and ${sourceFiles.length} source files inspected.`);
