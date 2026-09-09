import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { suggestButton } from "./policy.js";

const supportedExtensions = new Set([".html", ".htm", ".jsx", ".tsx", ".js", ".mjs", ".vue", ".svelte"]);

async function collectFiles(target) {
  const absolute = resolve(target);
  const info = await stat(absolute);
  if (info.isFile()) return supportedExtensions.has(extname(absolute)) ? [absolute] : [];
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name))
    .map((entry) => collectFiles(join(absolute, entry.name))));
  return nested.flat();
}

function attributeValue(attributes, name) {
  const match = attributes.match(new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2]?.trim() || "";
}

function stripMarkup(content) {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/<[^>]+>/g, " ").replace(/\{[^}]+\}/g, " ").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
}

export function auditSource(source, file = "<source>") {
  const findings = [];
  const expression = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let match;
  while ((match = expression.exec(source))) {
    const before = source.slice(0, match.index);
    const line = before.split("\n").length;
    const attributes = match[1];
    const visibleText = stripMarkup(match[2]);
    const accessibleLabel = attributeValue(attributes, "aria-label") || attributeValue(attributes, "title");
    const label = visibleText || accessibleLabel;
    const suggestion = suggestButton(label);
    const hasSvg = /<svg\b/i.test(match[2]);
    const issues = [];
    if (!visibleText && !accessibleLabel) issues.push("纯图标按钮缺少 aria-label 或 title");
    if (hasSvg && visibleText && suggestion.mode === "icon-only-safe") issues.push("可评估收窄为统一纯图标按钮");
    if (!hasSvg && suggestion.icon) issues.push(`建议使用 ${suggestion.icon} 图标`);
    if (!visibleText && suggestion.mode === "text-required") issues.push("高风险或关键动作必须保留可见文字");
    findings.push({ file, line, label: label || "(未命名)", hasSvg, ...suggestion, issues });
  }
  return findings;
}

export async function auditPath(target) {
  const files = await collectFiles(target);
  const root = resolve(target);
  const rows = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const displayFile = files.length === 1 ? file : relative(root, file);
    rows.push(...auditSource(source, displayFile));
  }
  return { target: root, filesScanned: files.length, buttonsFound: rows.length, findings: rows };
}

export function formatAudit(report, format = "text") {
  if (format === "json") return JSON.stringify(report, null, 2);
  if (format === "markdown") {
    const rows = report.findings.map((item) => `| ${item.file}:${item.line} | ${item.label.replaceAll("|", "\\|")} | ${item.mode} | ${item.icon || "—"} | ${item.issues.join("；") || "通过"} |`);
    return [`# BB Rab 图标审计`, "", `扫描文件：${report.filesScanned}；按钮：${report.buttonsFound}`, "", "| 位置 | 按钮 | 模式 | 图标 | 结论 |", "|---|---|---|---|---|", ...rows].join("\n");
  }
  return report.findings.map((item) => `${item.file}:${item.line} [${item.mode}] ${item.label} -> ${item.icon || "保留文字"}${item.issues.length ? ` | ${item.issues.join("；")}` : " | 通过"}`).join("\n") || "未发现按钮。";
}
