import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { applyMigration, auditSource, iconNames, planMigration, renderIcon, runChecks, suggestButton } from "../src/index.js";

test("catalog passes structural and accessibility checks", () => {
  const result = runChecks();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.ok(iconNames.length >= 30);
});

test("renderIcon escapes labels and constrains size", () => {
  const svg = renderIcon("send", { size: 999, label: '发"送<script>' });
  assert.match(svg, /width="128"/);
  assert.match(svg, /aria-label="发&quot;送&lt;script&gt;"/);
  assert.doesNotMatch(svg, /<script>/);
});

test("financial and destructive actions keep visible text", () => {
  assert.equal(suggestButton("立即购买").mode, "text-required");
  assert.equal(suggestButton("确认退款").mode, "text-required");
  assert.equal(suggestButton("删除作品").mode, "text-required");
  assert.equal(suggestButton("发送").mode, "icon-only-safe");
});

test("audit reports missing accessible name", () => {
  const report = auditSource('<button><svg viewBox="0 0 24 24"></svg></button>', "test.html");
  assert.equal(report.length, 1);
  assert.ok(report[0].issues.some((issue) => issue.includes("aria-label")));
});

test("migration is preview-only by default and writes with backup after confirmation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bbrab-icons-"));
  const file = join(directory, "page.html");
  await writeFile(file, '<button class="send">发送</button><button>购买</button>', "utf8");
  const plan = await planMigration(file);
  assert.equal(plan.changed, true);
  assert.match(await readFile(file, "utf8"), />发送</);
  await assert.rejects(() => applyMigration(file, { write: true, confirm: false }), /--confirm/);
  const result = await applyMigration(file, { write: true, confirm: true });
  assert.equal(result.changed, true);
  assert.match(await readFile(file, "utf8"), /aria-label="发送"/);
  assert.match(await readFile(file, "utf8"), />购买</);
  assert.match(await readFile(result.backup, "utf8"), />发送</);
});

test("MCP server answers initialize over stdio", async () => {
  const child = spawn(process.execPath, [new URL("../agent/mcp-server.mjs", import.meta.url).pathname], { stdio: ["pipe", "pipe", "pipe"] });
  const request = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } });
  child.stdin.write(`Content-Length: ${Buffer.byteLength(request)}\r\n\r\n${request}`);
  const response = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("MCP response timeout")), 2000);
    child.stdout.once("data", (data) => {
      clearTimeout(timer);
      resolve(data.toString("utf8"));
    });
    child.once("error", reject);
  });
  child.kill();
  assert.match(response, /bbrab-unified-icons/);
  assert.match(response, /2025-03-26/);
});
