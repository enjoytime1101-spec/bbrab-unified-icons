# Button Policy

## Risk-first rule

Classify the complete label before choosing presentation. Money, identity, authorization, destructive, and important commit words override lower-risk words in the same label. “Send payment”, “Copy and delete”, and “Confirm send” therefore retain visible text.

## Icon-only allowed

Send, close, back, refresh, search, clear current input, copy, expand/collapse, contextual more menu, media play/pause, and undo may use icon-only treatment only when the label exactly matches one approved action and the surrounding interface makes it obvious.

Requirements: `aria-label`, tooltip, keyboard focus, at least a 44 × 44 CSS pixel hit target on touch surfaces, visible hover/active/disabled states, and immediate outcome feedback.

## Icon plus visible text

Bookmark, like, comment, share, upload, download/export, edit, add/new, and stop should normally retain visible text. Text can be reduced only in a mature, narrow toolbar where the object is explicit and every action remains accessible.

## Visible text required

Purchase, payment, recharge, withdrawal, refund, login, registration, identity binding, authorization, deletion, confirmation, save, publish, and submit must retain visible text. Show the object and amount for financial actions. Use confirmation proportional to risk.

## Automation

Audit every button. Auto-migrate only a single, exact, unambiguous `icon-only-safe` action. Multiple action matches return `review` unless a protected rule applies. Always preview before writing and keep a backup.
