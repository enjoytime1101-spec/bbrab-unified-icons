import { iconNames, icons, renderIcon } from "./icons.js";

export function runChecks() {
  const errors = [];
  if (new Set(iconNames).size !== iconNames.length) errors.push("图标名称重复");
  for (const name of iconNames) {
    const body = icons[name];
    if (/<script|on\w+=|javascript:/i.test(body)) errors.push(`${name}: 包含不安全 SVG 内容`);
    const rendered = renderIcon(name);
    if (!rendered.includes('aria-hidden="true"')) errors.push(`${name}: 默认图标缺少 aria-hidden`);
    const labelled = renderIcon(name, { label: name });
    if (!labelled.includes(`aria-label="${name}"`)) errors.push(`${name}: 可访问名称渲染失败`);
  }
  return { ok: errors.length === 0, iconCount: iconNames.length, errors };
}
