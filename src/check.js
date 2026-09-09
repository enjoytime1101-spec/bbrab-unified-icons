import { iconNames, icons, renderIcon } from "./icons.js";

export function runChecks() {
  const errors = [];
  if (new Set(iconNames).size !== iconNames.length) errors.push("Duplicate icon names");
  for (const name of iconNames) {
    const body = icons[name];
    if (/<script|on\w+=|javascript:/i.test(body)) errors.push(`${name}: unsafe SVG content`);
    const rendered = renderIcon(name);
    if (!rendered.includes('aria-hidden="true"')) errors.push(`${name}: decorative output is missing aria-hidden`);
    const labelled = renderIcon(name, { label: name });
    if (!labelled.includes(`aria-label="${name}"`)) errors.push(`${name}: accessible label rendering failed`);
  }
  return { ok: errors.length === 0, iconCount: iconNames.length, errors };
}
