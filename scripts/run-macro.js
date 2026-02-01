import fs from "fs-extra";
import path from "path";

const INPUT = "./input.md";
const OUTPUT = "./output.md";
const DOCS_DIR = "./";
const INDEX = "./search-index.json";

const STRONGS_RE = /^[HG]\d{4}$/;
const REF_RE = /^([1-3]?\s?[A-Z][a-z]+)\s+(\d+):(\d+)$/;

/* ---------- Load ---------- */

const inputLines = fs
  .readFileSync(INPUT, "utf8")
  .split(/\r?\n/)
  .map(l => l.trim())
  .filter(Boolean);

const index = fs.readJsonSync(INDEX);

/* ---------- Search Helpers ---------- */

function findByStrongs(code) {
  return index.filter(r => r.strongs?.includes(code));
}

function findByRef(ref) {
  return index.filter(r => r.ref === ref);
}

/* ---------- Macro Execution ---------- */

let output = [];

for (const line of inputLines) {
  if (STRONGS_RE.test(line)) {
    const matches = findByStrongs(line);
    output.push(`## Strong’s ${line}`);
    matches.forEach(m => {
      output.push(formatVerse(m));
    });
  }

  else if (REF_RE.test(line)) {
    const matches = findByRef(line);
    output.push(`## ${line}`);
    matches.forEach(m => {
      output.push(formatVerse(m));
    });
  }

  else {
    output.push(`> Unrecognized: ${line}`);
  }
}

/* ---------- Format ---------- */

function formatVerse(r) {
  const rtl = r.languageTags?.includes("he");
  return `
**${r.ref}**

${rtl ? "<div dir='rtl'>" : ""}${r.text}${rtl ? "</div>" : ""}

`;
}

/* ---------- Write ---------- */

fs.writeFileSync(
  OUTPUT,
  output.join("\n"),
  "utf8"
);

console.log("Macro completed.");
