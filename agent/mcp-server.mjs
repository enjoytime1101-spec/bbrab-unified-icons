#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { auditPath, renderIcon, suggestButton } from "../src/index.js";

const serverInfo = { name: "bbrab-unified-icons", version: "0.1.0" };
const tools = [
  {
    name: "audit_ui",
    description: "Read-only audit of buttons in a local UI path. Classifies safe icon-only, icon+text, and text-required actions.",
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

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

async function callTool(name, args = {}) {
  if (name === "audit_ui") return await auditPath(args.path);
  if (name === "suggest_button") return suggestButton(args.label);
  if (name === "render_icon") return { svg: renderIcon(args.name, { size: args.size, label: args.label }) };
  if (name === "read_policy") return { markdown: await readFile(new URL("../docs/ICON_STANDARD.md", import.meta.url), "utf8") };
  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  const { id, method, params = {} } = message;
  if (method === "initialize") return send({ jsonrpc: "2.0", id, result: { protocolVersion: params.protocolVersion || "2025-03-26", capabilities: { tools: {} }, serverInfo } });
  if (method === "notifications/initialized") return;
  if (method === "tools/list") return send({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") {
    try {
      const result = await callTool(params.name, params.arguments);
      return send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result } });
    } catch (error) {
      return send({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: error.message }] } });
    }
  }
  if (id !== undefined) send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
}

let buffer = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const header = buffer.subarray(0, separator).toString("utf8");
    const length = Number(header.match(/Content-Length:\s*(\d+)/i)?.[1]);
    if (!Number.isFinite(length) || buffer.length < separator + 4 + length) break;
    const bodyStart = separator + 4;
    const body = buffer.subarray(bodyStart, bodyStart + length).toString("utf8");
    buffer = buffer.subarray(bodyStart + length);
    Promise.resolve().then(() => handle(JSON.parse(body))).catch((error) => send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: error.message } }));
  }
});
