import { iconNames, renderIcon } from "../src/icons.js";
import { suggestButton } from "../src/policy.js";

const elements = {
  search: document.querySelector("#icon-search"),
  size: document.querySelector("#icon-size"),
  sizeOutput: document.querySelector("#size-output"),
  color: document.querySelector("#icon-color"),
  colorOutput: document.querySelector("#color-output"),
  background: document.querySelector("#stage-background"),
  grid: document.querySelector("#icon-grid"),
  count: document.querySelector("#result-count"),
  total: document.querySelector("#icon-count"),
  empty: document.querySelector("#empty-state"),
  title: document.querySelector("#inspector-title"),
  preview: document.querySelector("#icon-preview"),
  stage: document.querySelector("#preview-stage"),
  code: document.querySelector("#code-preview"),
  copySvg: document.querySelector("#copy-svg"),
  copyCall: document.querySelector("#copy-call"),
  theme: document.querySelector("#theme-toggle"),
  themeIcon: document.querySelector("#theme-icon"),
  policyInput: document.querySelector("#policy-input"),
  evaluate: document.querySelector("#evaluate-policy"),
  policyResult: document.querySelector("#policy-result"),
  policyMode: document.querySelector("#policy-mode"),
  policyReason: document.querySelector("#policy-reason"),
  policyIcon: document.querySelector("#policy-icon"),
  policyAuto: document.querySelector("#policy-auto"),
  policyRules: document.querySelector("#policy-rules"),
  toast: document.querySelector("#toast")
};

const state = { selected: "send", size: 32, color: "#2563eb", filter: "" };
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 1800);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
  showToast(message);
}

function svgMarkup() {
  return renderIcon(state.selected, { size: state.size, label: state.selected.replaceAll("-", " ") });
}

function callMarkup() {
  return `renderIcon(${JSON.stringify(state.selected)}, { size: ${state.size}, label: ${JSON.stringify(state.selected.replaceAll("-", " "))} });`;
}

function updateInspector() {
  elements.title.textContent = state.selected;
  elements.preview.style.color = state.color;
  elements.preview.innerHTML = renderIcon(state.selected, { size: state.size });
  elements.code.textContent = svgMarkup();
}

function selectIcon(name, focus = false) {
  state.selected = name;
  elements.grid.querySelectorAll(".icon-card").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.name === name)));
  updateInspector();
  if (focus) elements.grid.querySelector(`[data-name="${CSS.escape(name)}"]`)?.focus();
}

function renderGrid() {
  const matches = iconNames.filter((name) => name.includes(state.filter));
  const fragment = document.createDocumentFragment();
  for (const name of matches) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-card";
    button.dataset.name = name;
    button.setAttribute("aria-label", `Select ${name} icon`);
    button.setAttribute("aria-pressed", String(name === state.selected));
    button.innerHTML = `${renderIcon(name, { size: 24 })}<span>${name}</span>`;
    button.addEventListener("click", () => selectIcon(name));
    fragment.append(button);
  }
  elements.grid.replaceChildren(fragment);
  elements.count.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"}`;
  elements.empty.hidden = matches.length !== 0;
}

function evaluatePolicy() {
  const result = suggestButton(elements.policyInput.value);
  elements.policyResult.dataset.mode = result.mode;
  elements.policyMode.textContent = result.mode;
  elements.policyReason.textContent = result.reason;
  elements.policyIcon.textContent = result.icon || "None";
  elements.policyAuto.textContent = result.autoMigrate ? "Allowed" : "Blocked";
  elements.policyRules.textContent = result.matchedRules.length ? result.matchedRules.join(", ") : "None";
}

elements.search.addEventListener("input", () => {
  state.filter = elements.search.value.trim().toLowerCase();
  renderGrid();
});
elements.size.addEventListener("input", () => {
  state.size = Number(elements.size.value);
  elements.sizeOutput.value = `${state.size}px`;
  updateInspector();
});
elements.color.addEventListener("input", () => {
  state.color = elements.color.value;
  elements.colorOutput.textContent = state.color;
  updateInspector();
});
elements.background.addEventListener("change", () => {
  elements.stage.className = `preview-stage ${elements.background.value}`;
});
elements.copySvg.addEventListener("click", () => copyText(svgMarkup(), "SVG copied"));
elements.copyCall.addEventListener("click", () => copyText(callMarkup(), "JavaScript call copied"));
elements.evaluate.addEventListener("click", evaluatePolicy);
elements.policyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") evaluatePolicy();
});
document.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", () => {
  elements.policyInput.value = button.dataset.example;
  evaluatePolicy();
}));
elements.theme.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  elements.theme.setAttribute("aria-pressed", String(dark));
  elements.theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  elements.themeIcon.innerHTML = renderIcon(dark ? "sun" : "moon", { size: 20 });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});

elements.total.textContent = String(iconNames.length);
elements.themeIcon.innerHTML = renderIcon("moon", { size: 20 });
renderGrid();
updateInspector();
evaluatePolicy();
