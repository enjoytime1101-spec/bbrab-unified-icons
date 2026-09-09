const paths = {
  "arrow-left": '<path d="m15 18-6-6 6-6"/>',
  "arrow-up": '<path d="m18 15-6-6-6 6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  gift: '<path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  maximize: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
  "message-circle": '<path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.8-4.8A8.5 8.5 0 1 1 21 11.5z"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  "more-horizontal": '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  paperclip: '<path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.5-9.5a4 4 0 0 1 5.7 5.7l-9.5 9.5a2 2 0 1 1-2.8-2.8l8.8-8.8"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  retry: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v8h8"/>',
  scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="m8.7 8.3 12.3 6.2M8.7 15.7 21 9.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  undo: '<path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6"/>',
  upload: '<path d="M12 16V4m0 0-5 5m5-5 5 5M5 21h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>'
};

export const icons = Object.freeze(paths);
export const iconNames = Object.freeze(Object.keys(paths).sort());

const escapeAttribute = (value) => String(value).replace(/[&"<>]/g, (character) => ({
  "&": "&amp;",
  '"': "&quot;",
  "<": "&lt;",
  ">": "&gt;"
}[character]));

export function renderIcon(name, options = {}) {
  if (!Object.hasOwn(paths, name)) throw new Error(`Unknown icon: ${name}`);
  const size = Number.isFinite(Number(options.size)) ? Math.min(128, Math.max(8, Number(options.size))) : 20;
  const className = options.className ? ` class="${escapeAttribute(options.className)}"` : "";
  const label = options.label ? String(options.label).trim() : "";
  const accessibility = label
    ? ` role="img" aria-label="${escapeAttribute(label)}"`
    : ' aria-hidden="true" focusable="false"';
  return `<svg${className}${accessibility} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${paths[name]}</svg>`;
}
