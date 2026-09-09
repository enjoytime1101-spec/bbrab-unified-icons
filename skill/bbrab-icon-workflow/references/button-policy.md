# Button Policy

## Pure icon allowed

Send, close, back, refresh, search, clear input, copy, expand/collapse, contextual more menu, media play/pause, undo, and redo may use icon-only treatment when the surrounding interface makes the action obvious.

Requirements: `aria-label`, tooltip, keyboard focus, at least 44×44 CSS px hit target on touch surfaces, visible hover/active/disabled states, and immediate outcome feedback.

## Icon plus visible text

Bookmark, like, comment, share, upload, download/export, edit, new/add, and stop should normally retain visible text. Text can be reduced only in a mature, narrow toolbar where every action has an accessible name and tooltip.

## Visible text required

Purchase, payment, recharge, withdrawal, refund, login, registration, identity binding, authorization, deletion, confirmation, save, publish, and submit must retain visible text. Show the object and amount for financial actions. Use confirmation proportional to risk.

## Automation

Audit every button. Auto-migrate only exact, unambiguous `icon-only-safe` labels. Leave all other changes as suggestions. Always preview before writing and keep a backup.
