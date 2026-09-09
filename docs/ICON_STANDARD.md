# Unified SVG Icon and Button Standard

## Purpose

Consistency means that one action has the same geometry, size, state, and behavior across a product. It does not mean replacing every label with an icon. Icons accelerate recognition; visible text removes ambiguity and protects consequential actions.

## Drawing grid

| Property | Contract |
| --- | --- |
| Coordinate system | `viewBox="0 0 24 24"` |
| Primary keyline | `2…22`, a 20-unit square |
| Optical safe zone | Keep essential detail within `3…21` |
| Optical correction | Curves may overshoot by no more than `0.5` units |
| Default stroke | `2` units |
| Caps and joins | `round` |
| Default output | `20px`; accepted API range `8…128px` |
| Touch target | At least `44 × 44` CSS pixels |

Use the optical centre, not only mathematical bounds. A circular shape may extend slightly farther than a square so both appear equal in weight. Avoid detail that collapses at 16px.

## SVG contract

- Use `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, and `stroke-linejoin="round"` on the rendered root.
- Catalog fragments may contain simple SVG geometry only.
- Do not include scripts, event attributes, remote resources, embedded raster data, inline brand colors, or `javascript:` URLs.
- Decorative SVGs use `aria-hidden="true" focusable="false"`.
- A semantic standalone SVG uses `role="img"` and an escaped `aria-label`.
- Do not use emoji as production UI icons or mix unrelated icon families.

## Button presentation modes

| Mode | Use | Requirements |
| --- | --- | --- |
| `icon-only-safe` | Familiar, low-risk, contextually explicit actions | Exact approved action; accessible name; tooltip; 44px target; focus and outcome feedback |
| `icon-text` | Recognisable actions whose object, format, or state still matters | Icon before visible text; expose toggle state where relevant |
| `text-required` | Money, identity, authorization, destructive, or commit actions | Visible action text; object and amount for money; confirmation proportional to risk |
| `review` | Unknown, compound, or ambiguous controls | Keep visible text and request product review |

Risk is evaluated before presentation. “Send payment”, “Copy and delete”, and “Confirm send” therefore remain text-required. “Copy and send” contains two low-risk actions and remains a review item until it is split or explicitly designed.

## Color tokens

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

Icons inherit `currentColor`. Use default for ordinary controls, muted for passive metadata, accent for current selection, and semantic colors only for matching status or risk. Pair semantic color with text or another visible state cue.

## Light and dark themes

The geometry does not change between themes. Change tokens and surface contrast only. On a filled accent or danger button, use `--icon-on-solid`; on a neutral surface, meet WCAG contrast for the complete control. Avoid faint icon strokes that disappear against dark cards.

## Interaction states

- `hover`: change surface or border clearly; do not rely on a one-step color shift.
- `focus-visible`: show a focus ring of at least 2px with an offset.
- `active`: use a subtle scale or color response without moving surrounding layout.
- `disabled`: disable semantics and interaction, reduce emphasis, and explain the reason when it is not obvious.
- `loading`: preserve button width, announce progress, and prevent duplicate submission.
- `selected`: synchronize toggles with `aria-pressed` and disclosure controls with `aria-expanded`.

## Automation boundary

The CLI audits all discovered buttons. The codemod changes only an exact label that matches one approved `icon-only-safe` rule. It is dry-run by default; `--write --confirm` is required for mutation, and a `.bbrab-icons.bak` backup is created. The scanner is intentionally lightweight, so component factories and computed labels remain manual review items.

## Product verification checklist

1. Is the icon recognizable without relying on color?
2. Does the same action use the same icon throughout the product?
3. Is the control reachable and operable on mobile and by keyboard?
4. Can a screen reader announce its purpose and state?
5. Does the action provide visible success or error feedback?
6. Do consequential controls retain visible text and necessary confirmation?
7. Was the underlying business workflow tested separately from visual conformance?
