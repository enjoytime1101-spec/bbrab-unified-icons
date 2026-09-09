import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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

test("risk-first classification protects financial, destructive, authorization, and commit actions", () => {
  for (const label of ["立即购买", "确认退款", "删除作品", "授权 Google", "发送付款", "复制并删除", "确认发送"]) {
    const result = suggestButton(label);
    assert.equal(result.mode, "text-required", `${label} was classified as ${result.mode}`);
    assert.equal(result.autoMigrate, false, `${label} must never auto-migrate`);
  }
});

test("only exact, single low-risk actions are eligible for icon-only migration", () => {
  assert.deepEqual(
    ["发送", "发送消息", "refresh", "关闭弹窗"].map((label) => suggestButton(label).autoMigrate),
    [true, true, true, true]
  );
  assert.equal(suggestButton("复制并发送").mode, "review");
  assert.equal(suggestButton("发送给财务").autoMigrate, false);
  assert.equal(suggestButton("repayment status").matchedRules.includes("commerce"), false, "pay must match a word, not a substring");
  assert.equal(suggestButton("display settings").matchedRules.includes("play"), false, "play must match a word, not a substring");
});

test("audit reports missing accessible name", () => {
  const report = auditSource('<button><svg viewBox="0 0 24 24"></svg></button>', "test.html");
  assert.equal(report.length, 1);
  assert.ok(report[0].issues.some((issue) => issue.includes("aria-label")));
});

test("migration changes only exact safe actions and preserves mixed or protected visible text", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bbrab-icons-"));
  const file = join(directory, "page.html");
  await writeFile(file, '<button class="send">发送</button><button>发送付款</button><button>复制并删除</button><button>确认发送</button><button>发送给财务</button>', "utf8");
  const plan = await planMigration(file);
  assert.equal(plan.changed, true);
  assert.equal(plan.changes.length, 1);
  assert.match(await readFile(file, "utf8"), />发送</);
  await assert.rejects(() => applyMigration(file, { write: true, confirm: false }), /--confirm/);
  const result = await applyMigration(file, { write: true, confirm: true });
  assert.equal(result.changed, true);
  assert.match(await readFile(file, "utf8"), /aria-label="发送"/);
  const migrated = await readFile(file, "utf8");
  for (const protectedLabel of ["发送付款", "复制并删除", "确认发送", "发送给财务"]) assert.match(migrated, new RegExp(`>${protectedLabel}<`));
  assert.match(await readFile(result.backup, "utf8"), />发送</);
});

function collectJsonLines(stream, count, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const messages = [];
    const timer = setTimeout(() => reject(new Error(`Timed out after receiving ${messages.length}/${count} MCP messages`)), timeoutMs);
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) messages.push(JSON.parse(line));
        if (messages.length >= count) {
          clearTimeout(timer);
          resolve(messages);
          return;
        }
      }
    });
  });
}

test("MCP stdio accepts chunked and batched newline-delimited JSON-RPC", async () => {
  const child = spawn(process.execPath, [new URL("../agent/mcp-server.mjs", import.meta.url).pathname], { stdio: ["pipe", "pipe", "pipe"] });
  const responses = collectJsonLines(child.stdout, 4);
  const initialize = `${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "raw-test", version: "1" } } })}\n`;
  child.stdin.write(initialize.slice(0, 17));
  child.stdin.write(initialize.slice(17));
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" })}\n${JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "suggest_button", arguments: { label: "发送付款" } } })}\n${JSON.stringify({ jsonrpc: "2.0", id: 4, method: "missing/method" })}\n`);
  const messages = await responses;
  child.kill();
  assert.equal(messages[0].result.protocolVersion, "2025-03-26");
  assert.ok(messages[1].result.tools.some((tool) => tool.name === "audit_ui"));
  assert.equal(messages[2].result.structuredContent.mode, "text-required");
  assert.equal(messages[3].error.code, -32601);
});

test("MCP stdio returns a parse error for malformed JSON lines", async () => {
  const child = spawn(process.execPath, [new URL("../agent/mcp-server.mjs", import.meta.url).pathname], { stdio: ["pipe", "pipe", "pipe"] });
  const response = collectJsonLines(child.stdout, 1);
  child.stdin.write("{not-json}\n");
  const [message] = await response;
  child.kill();
  assert.equal(message.error.code, -32700);
});

test("official MCP SDK completes handshake, lists tools, and calls a tool", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [new URL("../agent/mcp-server.mjs", import.meta.url).pathname],
    stderr: "pipe"
  });
  const client = new Client({ name: "official-sdk-test", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  const listed = await client.listTools();
  assert.ok(listed.tools.some((tool) => tool.name === "render_icon"));
  const called = await client.callTool({ name: "suggest_button", arguments: { label: "复制并删除" } });
  assert.equal(called.structuredContent.mode, "text-required");
  await client.close();
});
