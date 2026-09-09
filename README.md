# BB Rab Unified Icons

[![CI](https://github.com/enjoytime1101-spec/bbrab-unified-icons/actions/workflows/ci.yml/badge.svg)](https://github.com/enjoytime1101-spec/bbrab-unified-icons/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb.svg)](LICENSE)

A policy-aware SVG icon system for product interfaces. The repository combines a consistent icon catalog with an accessibility contract, a read-only UI audit, a conservative codemod, an MCP server, a Codex Skill, reusable Prompt Blocks, automated tests, and a live browser playground.

**[Open the live Playground](https://enjoytime1101-spec.github.io/bbrab-unified-icons/)**

## Why this is an engineering system

Replacing labels with icons is not automatically an improvement. A send control in a composer can be safely icon-only; a payment, login, authorization, refund, delete, or final submit control cannot. This project evaluates the action first, then applies one of four modes:

| Mode | Meaning | Typical examples |
| --- | --- | --- |
| `icon-only-safe` | A familiar low-risk action may use an icon when context is explicit. | Send, close, back, refresh, search, copy, play/pause |
| `icon-text` | The icon supports recognition, while visible text removes ambiguity. | Share, bookmark, upload, export, edit, stop |
| `text-required` | Visible text is mandatory. The icon is secondary. | Payment, recharge, refund, login, authorization, delete, publish |
| `review` | The control is unknown, compound, or ambiguous. | “Copy and send”, product-specific actions |

Risk rules always win. Labels such as “Send payment”, “Copy and delete”, and “Confirm send” cannot be auto-migrated.

## Icon drawing contract

All bundled icons follow one geometry system:

- Canvas: `24 × 24` viewBox.
- Primary keyline: coordinates `2…22`, producing a `20 × 20` safe drawing area.
- Optical safe zone: keep essential detail within `3…21`; curves may overshoot a keyline by at most `0.5` when visual centring requires it.
- Stroke: `2`, with round caps and round joins.
- Default rendered size: `20px`; accepted programmatic range: `8…128px`.
- Fill: `none`; color: `currentColor`.
- Touch target: at least `44 × 44` CSS pixels, independent of the SVG size.
- No scripts, event attributes, remote resources, embedded raster data, or `javascript:` URLs.

See [the complete icon standard](docs/ICON_STANDARD.md) for optical sizing, state, theme, and accessibility rules.

## Color tokens and themes

Icons inherit text color instead of embedding brand colors. Recommended tokens:

```css
:root {
  --icon-default: #334155;
  --icon-muted: #64748b;
  --icon-accent: #2563eb;
  --icon-success: #16a34a;
  --icon-warning: #d97706;
  --icon-danger: #dc2626;
  --icon-on-solid: #ffffff;
}

[data-theme="dark"] {
  --icon-default: #e2e8f0;
  --icon-muted: #94a3b8;
  --icon-accent: #60a5fa;
  --icon-success: #4ade80;
  --icon-warning: #fbbf24;
  --icon-danger: #f87171;
}
```

Use accent for selection and primary actions, muted for passive metadata, semantic colors only for matching states, and `--icon-on-solid` on filled controls. Never encode success or failure by color alone.

## Install and verify

The package is currently distributed from GitHub and is not claimed as an npm registry release.

```bash
git clone https://github.com/enjoytime1101-spec/bbrab-unified-icons.git
cd bbrab-unified-icons
npm install
npm run verify
```

Node.js 20 or newer is required. Runtime code has no external dependency; the official MCP SDK is a development-only interoperability test dependency.

## CLI

Audit the included fixture or your own UI source:

```bash
npm exec -- bbrab-icons audit ./examples/browser.html --format markdown
npm exec -- bbrab-icons suggest "Send payment"
npm exec -- bbrab-icons render send --size 24 --label "Send message"
npm exec -- bbrab-icons check
```

Migration is preview-only by default:

```bash
cp ./examples/browser.html /tmp/bbrab-icons-example.html
npm exec -- bbrab-icons migrate /tmp/bbrab-icons-example.html
```

Writing requires both explicit flags and creates a `.bbrab-icons.bak` backup:

```bash
npm exec -- bbrab-icons migrate /tmp/bbrab-icons-example.html --write --confirm
```

The lightweight scanner intentionally does not pretend to be a complete JSX parser. Complex component factories remain review items.

## JavaScript API

```js
import { auditPath, renderIcon, suggestButton } from "bbrab-unified-icons";

const svg = renderIcon("send", { size: 20, label: "Send message" });
const decision = suggestButton("Confirm and send");
const report = await auditPath("./src");
```

`decision.autoMigrate` is `true` only for an exact, single, low-risk action.

## MCP server

The read-only MCP server uses the standard newline-delimited JSON-RPC stdio transport. It exposes `audit_ui`, `suggest_button`, `render_icon`, and `read_policy`; file mutation is deliberately unavailable.

Generic stdio host configuration:

```json
{
  "mcpServers": {
    "bbrab-unified-icons": {
      "command": "node",
      "args": ["/absolute/path/to/bbrab-unified-icons/agent/mcp-server.mjs"]
    }
  }
}
```

The test suite connects through the official `@modelcontextprotocol/sdk` client and exercises the handshake, tool discovery, and tool calls.

## Skill, Prompt Blocks, and Agent tools

- Codex Skill: [`skill/bbrab-icon-workflow/`](skill/bbrab-icon-workflow/)
- Audit Prompt Block: [`prompts/audit.md`](prompts/audit.md)
- Migration Prompt Block: [`prompts/migrate.md`](prompts/migrate.md)
- Pull-request review Prompt Block: [`prompts/review.md`](prompts/review.md)
- Function-tool schema: [`agent/tool-schema.json`](agent/tool-schema.json)

Install the Skill into a project without changing global configuration:

```bash
mkdir -p .codex/skills
cp -R ./skill/bbrab-icon-workflow .codex/skills/
```

Then invoke `$bbrab-icon-workflow` in a compatible agent host.

## Development

```bash
npm test
npm run check
npm run audit:example
npm run playground
```

Open `http://127.0.0.1:4173/` after starting the playground. Contributions must follow [CONTRIBUTING.md](CONTRIBUTING.md).

The Pages workflow publishes this repository only to its default `github.io` project URL; it does not change or attach any existing product domain.

## Verification boundary

Passing the icon audit proves only that controls follow this repository's visual and accessibility policy. It does not prove that a payment, login, refund, publish action, or other business workflow succeeds. Those flows require their own API, data, and end-to-end tests.

## License

[MIT](LICENSE)
