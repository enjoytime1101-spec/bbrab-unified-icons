---
name: bbrab-icon-workflow
description: Audit and migrate web UI buttons to a unified, accessible SVG icon system. Use when reviewing inconsistent text buttons or emoji icons, deciding icon-only versus icon-and-text treatment, generating safe inline SVG, preparing a UI icon migration, or checking icon accessibility and interaction states.
---

# BB Rab Icon Workflow

Use the bundled CLI and policy to make icon changes repeatable and safe. Treat UI conformance and real business functionality as separate claims.

## Workflow

1. Read `references/button-policy.md` before deciding which labels may become pure icons.
2. Run a read-only audit first:

   ```bash
   node bin/bbrab-icons.js audit <path> --format markdown
   ```

   When this Skill is installed separately, locate the repository CLI or use the equivalent Agent tools. Do not mutate files during audit.
3. Group findings into:
   - `icon-only-safe`: familiar, low-risk, contextually clear actions.
   - `icon-text`: recognizable actions whose object or state still needs text.
   - `text-required`: money, identity, authorization, deletion, or important submission actions.
   - `review`: ambiguous labels that require product judgment.
4. Explain the proposed mapping and flag every critical business action before editing.
5. Generate a migration preview. Only run the codemod with both `--write --confirm` after the user has explicitly approved the change.
6. Preserve or add `aria-label`, tooltip, keyboard focus, minimum 44×44 CSS px target, disabled/loading/selected states, and post-action feedback.
7. Run `npm run verify` and perform a browser regression check on affected flows.
8. Report what changed, what remains manual, and whether business behavior was actually verified. Never describe a visual button change as a completed payment, login, refund, publishing, or data mutation flow.

## Safety Boundaries

- Never turn purchase, payment, recharge, withdrawal, refund, login, registration, authorization, deletion, confirmation, publishing, or submission into icon-only controls.
- Do not replace unknown UI labels automatically.
- Do not write without a preview, explicit approval, and a recoverable backup.
- Do not inject arbitrary SVG or remote SVG markup. Use the bundled catalog or validated local assets.
- Keep changes scoped to the user-selected project. Confirm the repository path before running migration commands.

## Outputs

For an audit, provide a concise table with file and line, current label, recommendation, icon, risk, and rationale. For a migration, provide the preview summary, modified files, backup locations, validation results, and manual-review items.
