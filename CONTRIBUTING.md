# Contributing to BB Rab Unified Icons

Thank you for improving the icon system. Contributions should preserve its two core properties: visual consistency and conservative product safety.

## Environment

- Node.js 20 or newer
- npm 10 or newer
- Git
- A modern browser for Playground verification

## Setup

```bash
git clone https://github.com/enjoytime1101-spec/bbrab-unified-icons.git
cd bbrab-unified-icons
npm install
npm run verify
```

## Development commands

```bash
npm test                 # Unit, regression, raw stdio, and official MCP SDK tests
npm run check             # Catalog structure and SVG safety checks
npm run audit:example     # Markdown audit against the included fixture
npm run playground        # Local static Playground on 127.0.0.1:4173
```

## Adding or changing an icon

1. Add a unique lowercase kebab-case name to `src/icons.js`.
2. Draw on a `24 × 24` viewBox. Keep essential geometry in the `2…22` keyline and preferably the `3…21` optical safe zone.
3. Use a `2` unit stroke with round caps and joins. Do not embed `stroke`, `fill`, dimensions, color, scripts, event attributes, IDs, external resources, or raster data inside the path fragment.
4. Prefer simple paths, circles, rectangles, and polylines. Remove invisible or duplicate geometry.
5. Check recognition at 16, 20, 24, 32, and 48 pixels in both Playground themes.
6. Add or update meaningful tests when behavior changes.

## Changing button policy

- Add protected money, identity, authorization, destructive, and commit rules before lower-risk presentation rules.
- A protected match always wins over a safe match.
- Auto-migration requires exactly one matched rule and an exact approved label.
- Compound or unknown actions remain visible text and return `review` or `text-required`.
- Add positive, negative, substring, compound-action, and migration-preservation tests.

## Pull request workflow

1. Create a focused branch.
2. Make the smallest coherent change.
3. Run `npm run verify`.
4. Verify the Playground with keyboard navigation and at desktop and mobile viewport widths.
5. Describe the user-facing change, policy impact, screenshots when visual output changed, test evidence, and any unverified limits.
6. Open a pull request. Do not combine unrelated product or deployment changes.

Commits should be short, imperative, and scoped when useful, for example `fix(policy): protect compound payment actions`.

## Accessibility acceptance

- Decorative SVGs use `aria-hidden="true"` and `focusable="false"`.
- Standalone semantic SVGs have an accessible name.
- Icon-only buttons have an `aria-label`, tooltip, visible focus ring, and at least a 44 × 44 CSS pixel target.
- Toggle buttons expose `aria-pressed`; disclosure controls expose `aria-expanded`.
- State is not communicated by color alone.

## Security and generated SVG

Never accept arbitrary SVG markup into the catalog. Reject scripts, event handlers, remote references, embedded data URLs, and dynamic unescaped fragments. Report security concerns privately to the repository owner rather than opening a public exploit demonstration.
