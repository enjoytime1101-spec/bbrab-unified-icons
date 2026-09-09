import { copyFile, readFile, writeFile } from "node:fs/promises";
import { auditSource } from "./audit.js";
import { renderIcon } from "./icons.js";

function escapeExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function planMigration(file) {
  const source = await readFile(file, "utf8");
  const findings = auditSource(source, file).filter((item) => item.autoMigrate && item.mode === "icon-only-safe" && item.icon && item.label !== "(unnamed)" && !item.hasSvg);
  let output = source;
  const changes = [];
  for (const finding of findings) {
    const label = escapeExpression(finding.label);
    const expression = new RegExp(`<button\\b([^>]*)>(\\s*)${label}(\\s*)<\\/button>`, "g");
    let count = 0;
    output = output.replace(expression, (full, attributes, leading, trailing) => {
      count += 1;
      const hasLabel = /aria-label\s*=/i.test(attributes);
      const nextAttributes = hasLabel ? attributes : `${attributes} aria-label="${finding.label}" title="${finding.label}"`;
      return `<button${nextAttributes}>${leading}${renderIcon(finding.icon)}${trailing}</button>`;
    });
    if (count) changes.push({ line: finding.line, label: finding.label, icon: finding.icon, replacements: count });
  }
  return { file, changed: output !== source, changes, source, output };
}

export async function applyMigration(file, options = {}) {
  if (!options.write || !options.confirm) throw new Error("Writing requires both --write and --confirm; the default mode is a safe preview.");
  const plan = await planMigration(file);
  if (!plan.changed) return plan;
  const backup = `${file}.bbrab-icons.bak`;
  await copyFile(file, backup);
  await writeFile(file, plan.output, "utf8");
  return { ...plan, backup };
}
