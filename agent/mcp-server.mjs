#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { auditPath, renderIcon, suggestButton } from "../src/index.js";

const PROTOCOL_VERSION = "2025-03-26";
const serverInfo = { name: "bbrab-unified-icons", version: "0.2.0" };
const tools = [
  {
    name: "audit_ui",
    description: "Read-only audit of buttons in a local UI path. Classifies safe icon-only, icon-and-text, and text-required actions.",
    inputSchema: { type: "object", properties: { path: { type: "string", description: "File or directory to inspect." } }, required: ["path"], additionalProperties: false }
  },
  {
    name: "suggest_button",
    description: "Recommend an icon and presentation mode for a button label without modifying files.",
    inputSchema: { type: "object", properties: { label: { type: "string" } }, required: ["label"], additionalProperties: false }
  },
  {
    name: "render_icon",
    description: "Render one safe inline SVG icon from the bundled catalog.",
    inputSchema: { type: "object", properties: { name: { type: "string" }, size: { type: "number", minimum: 8, maximum: 128 }, label: { type: "string" } }, required: ["name"], additionalProperties: false }
  },
  {
    name: "read_policy",
    description: "Read the icon and button policy document.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  }
];

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function writeError(id, code, message) {
  writeMessage({ jsonrpc: "2.0", id, error: { code, message } });
}

async function callTool(name, args = {}) {
  if (name === "audit_ui") {
    if (typeof args.path !== "string" || !args.path.trim()) throw new Error("audit_ui requires a non-empty path.");
    return await auditPath(args.path);
  }
  if (name === "suggest_button") {
    if (typeof args.label !== "string") throw new Error("suggest_button requires a label string.");
    return suggestButton(args.label);
  }
  if (name === "render_icon") {
    if (typeof args.name !== "string") throw new Error("render_icon requires an icon name.");
    return { svg: renderIcon(args.name, { size: args.size, label: args.label }) };
  }
  if (name === "read_policy") return { markdown: await readFile(new URL("../docs/ICON_STANDARD.md", import.meta.url), "utf8") };
  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  if (!message || typeof message !== "object" || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    writeError(message && Object.hasOwn(message, "id") ? message.id : null, -32600, "Invalid Request");
    return;
  }

  const { id, method, params = {} } = message;
  const isNotification = !Object.hasOwn(message, "id");
  if (method === "initialize") {
    if (isNotification) return;
    writeMessage({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo,
        instructions: "Audit and render accessible icons. File mutation is intentionally unavailable through MCP."
      }
    });
    return;
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") return;
  if (method === "ping") {
    if (!isNotification) writeMessage({ jsonrpc: "2.0", id, result: {} });
    return;
  }
  if (method === "tools/list") {
    if (!isNotification) writeMessage({ jsonrpc: "2.0", id, result: { tools } });
    return;
  }
  if (method === "tools/call") {
    if (isNotification) return;
    try {
      const result = await callTool(params.name, params.arguments);
      writeMessage({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result } });
    } catch (error) {
      writeMessage({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }] } });
    }
    return;
  }
  if (!isNotification) writeError(id, -32601, `Method not found: ${method}`);
}

let input = "";
let queue = Promise.resolve();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
  let newline;
  while ((newline = input.indexOf("\n")) >= 0) {
    const line = input.slice(0, newline).trim();
    input = input.slice(newline + 1);
    if (!line) continue;
    queue = queue.then(async () => {
      try {
        await handle(JSON.parse(line));
      } catch (error) {
        if (error instanceof SyntaxError) writeError(null, -32700, "Parse error");
        else writeError(null, -32603, "Internal error");
      }
    });
  }
});

process.stdin.on("end", () => {
  if (input.trim()) writeError(null, -32700, "Parse error: incomplete JSON-RPC line");
});
