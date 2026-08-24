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
  "data/processed/water-story-data.js",
  "data/source/challenge-2026/mean-surface-temperature-anomalies.csv",
  "data/source/challenge-2026/mean-sea-surface-temperature-anomalies.csv",
  "data/source/challenge-2026/sea-level-anomalies.csv",
  "data/source/challenge-2026/rainfall-anomalies.csv",
  "data/source/challenge-2026/proportion-of-population-using-safely-managed-drinking-water-services.csv",
  "data/source/challenge-2026/meteorological-monitoring-network.csv",
  "analysis/notebooks/pacific-climate-signals-analysis.ipynb",
  "analysis/scripts/build_water_story_data.py",
  "analysis/scripts/build_analysis_notebook.py",
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

const researchCitations = [
  "https://doi.org/10.3390/atmos15060666",
  "https://doi.org/10.2166/wh.2024.144",
];
for (const citation of researchCitations) {
  for (const file of ["README.md", "index.html", "src/ui/notebook-controller.js", "analysis/notebooks/pacific-climate-signals-analysis.ipynb"]) {
    if (!readFileSync(join(root, file), "utf8").includes(citation)) {
      failures.push(`research citation '${citation}' is missing from ${file}`);
    }
  }
}

try {
  const source = readFileSync(join(root, "data/processed/water-story-data.js"), "utf8");
  const waterStory = JSON.parse(source.slice(source.indexOf("=") + 1, source.lastIndexOf(";")).trim());
  const expected = {
    sst_territories: 21,
    sst_positive_trends: 21,
    sea_level_territories: 21,
    sea_level_positive_trends: 21,
    rainfall_territories: 22,
    rainfall_positive_trends: 15,
    rainfall_negative_trends: 7,
    water_territories_2020: 19,
    water_2020_min: 48.11,
    water_2020_max: 100,
    water_2020_below_70: 3,
    station_territories_2026: 18,
    station_2026_zero: 3,
    station_2026_one_or_less: 5,
    station_2026_min: 0,
    station_2026_max: 8,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (waterStory.summary?.[key] !== value) failures.push(`water story summary mismatch for ${key}: expected ${value}, received ${waterStory.summary?.[key]}`);
  }
} catch (error) {
  failures.push(`invalid water story data: ${error.message}`);
}

if (failures.length) {
  console.error(`Project checks failed:\n\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log(`Project checks passed: ${requiredFiles.length} required files and ${sourceFiles.length} source files inspected.`);
