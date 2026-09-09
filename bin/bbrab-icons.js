#!/usr/bin/env node
import { auditPath, formatAudit, iconNames, planMigration, applyMigration, renderIcon, runChecks, suggestButton } from "../src/index.js";

const [command = "help", ...args] = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

async function main() {
  if (command === "audit") {
    const target = args.find((value) => !value.startsWith("--")) || ".";
    const report = await auditPath(target);
    console.log(formatAudit(report, valueAfter("--format", "text")));
    return;
  }
  if (command === "suggest") {
    const label = args.filter((value) => !value.startsWith("--")).join(" ");
    if (!label) throw new Error("用法：bbrab-icons suggest <按钮文字>");
    console.log(JSON.stringify(suggestButton(label), null, 2));
    return;
  }
  if (command === "render") {
    const name = args.find((value) => !value.startsWith("--"));
    if (!name) throw new Error(`用法：bbrab-icons render <图标名>\n可用：${iconNames.join(", ")}`);
    console.log(renderIcon(name, { size: Number(valueAfter("--size", 20)), label: valueAfter("--label", "") }));
    return;
  }
  if (command === "migrate") {
    const file = args.find((value) => !value.startsWith("--"));
    if (!file) throw new Error("用法：bbrab-icons migrate <文件> [--write --confirm]");
    const write = args.includes("--write");
    const plan = write ? await applyMigration(file, { write, confirm: args.includes("--confirm") }) : await planMigration(file);
    console.log(JSON.stringify({ file: plan.file, changed: plan.changed, changes: plan.changes, backup: plan.backup || null, mode: write ? "written" : "preview" }, null, 2));
    return;
  }
  if (command === "check") {
    const result = runChecks();
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  console.log(`BB Rab Unified Icons\n\nCommands:\n  audit <path> [--format text|json|markdown]\n  suggest <button label>\n  render <icon> [--size 20] [--label text]\n  migrate <file> [--write --confirm]\n  check`);
}

main().catch((error) => {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
});
