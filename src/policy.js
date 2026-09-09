const ruleDefinitions = [
  {
    id: "commerce",
    terms: ["购买", "立即购买", "付款", "支付", "充值", "订阅", "buy", "purchase", "pay", "payment", "recharge", "subscribe"],
    icon: "cart",
    mode: "text-required",
    priority: 100,
    reason: "Financial actions must name the action, item, and amount. An icon may only support visible text."
  },
  {
    id: "money-out",
    terms: ["退款", "提现", "refund", "withdraw", "withdrawal"],
    icon: null,
    mode: "text-required",
    priority: 100,
    reason: "Refund and withdrawal actions must retain visible text and risk-appropriate confirmation."
  },
  {
    id: "identity",
    terms: ["登录", "注册", "授权", "绑定", "login", "log in", "sign in", "register", "sign up", "authorize", "connect account", "bind account"],
    icon: null,
    mode: "text-required",
    priority: 100,
    reason: "Identity and authorization actions must retain explicit visible text."
  },
  {
    id: "destructive",
    terms: ["删除", "移除", "清空", "delete", "remove", "erase", "clear all"],
    icon: "trash",
    mode: "text-required",
    priority: 100,
    reason: "Destructive actions must retain visible text and use confirmation proportional to their impact."
  },
  {
    id: "commit",
    terms: ["确认", "保存", "发布", "提交", "创建", "confirm", "save", "publish", "submit", "create"],
    icon: "check",
    mode: "text-required",
    priority: 90,
    reason: "Commit actions must retain visible text because they create or persist user-visible effects."
  },
  { id: "send", terms: ["发送", "发送消息", "send", "send message"], icon: "send", mode: "icon-only-safe", priority: 20, reason: "A familiar low-risk action that may be icon-only in an unambiguous composer." },
  { id: "close", terms: ["关闭", "关闭弹窗", "取消弹窗", "close", "close dialog"], icon: "x", mode: "icon-only-safe", priority: 20, reason: "May be icon-only in a dialog corner when it has an accessible name and tooltip." },
  { id: "back", terms: ["返回", "back", "go back"], icon: "arrow-left", mode: "icon-only-safe", priority: 20, reason: "May be icon-only when the navigation context is explicit." },
  { id: "refresh", terms: ["刷新", "重试", "refresh", "retry"], icon: "refresh", mode: "icon-only-safe", priority: 20, reason: "A familiar system action that may be icon-only with a tooltip." },
  { id: "search", terms: ["搜索", "search"], icon: "search", mode: "icon-only-safe", priority: 20, reason: "May be icon-only inside a clearly labelled search control." },
  { id: "clear-input", terms: ["清除输入", "clear input"], icon: "x", mode: "icon-only-safe", priority: 20, reason: "May be icon-only only when it clears the current field, never all data." },
  { id: "copy", terms: ["复制", "copy"], icon: "copy", mode: "icon-only-safe", priority: 20, reason: "May be icon-only when completion is announced." },
  { id: "expand", terms: ["展开", "收起", "expand", "collapse"], icon: "maximize", mode: "icon-only-safe", priority: 20, reason: "May be icon-only when aria-expanded mirrors the state." },
  { id: "more", terms: ["更多", "more", "more actions"], icon: "more-horizontal", mode: "icon-only-safe", priority: 20, reason: "May be icon-only when it opens a labelled action menu." },
  { id: "play", terms: ["播放", "play"], icon: "play", mode: "icon-only-safe", priority: 20, reason: "May be icon-only in a recognisable media player." },
  { id: "pause", terms: ["暂停", "pause"], icon: "pause", mode: "icon-only-safe", priority: 20, reason: "May be icon-only in a recognisable media player." },
  { id: "undo", terms: ["撤销", "undo"], icon: "undo", mode: "icon-only-safe", priority: 20, reason: "May be icon-only in an editor toolbar with a tooltip." },
  { id: "bookmark", terms: ["收藏", "bookmark", "save item"], icon: "bookmark", mode: "icon-text", priority: 40, reason: "Keep visible text on first use and expose the selected state." },
  { id: "like", terms: ["点赞", "like"], icon: "heart", mode: "icon-text", priority: 40, reason: "Keep text or a count and expose the pressed state." },
  { id: "comment", terms: ["评论", "comment"], icon: "message-circle", mode: "icon-text", priority: 40, reason: "Keep text or a count to disambiguate community interaction." },
  { id: "share", terms: ["分享", "share"], icon: "share", mode: "icon-text", priority: 40, reason: "Keep visible text when multiple share destinations may exist." },
  { id: "download", terms: ["下载", "导出", "download", "export"], icon: "download", mode: "icon-text", priority: 40, reason: "Keep visible text because format and destination matter." },
  { id: "upload", terms: ["上传", "导入", "upload", "import"], icon: "upload", mode: "icon-text", priority: 40, reason: "Keep visible text because the selected source matters." },
  { id: "edit", terms: ["编辑", "edit"], icon: "edit", mode: "icon-text", priority: 40, reason: "Keep visible text unless the edited object is unmistakable." },
  { id: "add", terms: ["添加", "新建", "add", "new"], icon: "plus", mode: "icon-text", priority: 40, reason: "Visible text should name the object being added." },
  { id: "stop", terms: ["停止", "stop"], icon: "stop", mode: "icon-text", priority: 40, reason: "Stopping a task can have consequences, so keep visible text." }
];

const latinWord = /^[a-z0-9 ]+$/i;
const severity = { "text-required": 3, review: 2, "icon-text": 1, "icon-only-safe": 0 };

export function normalizeLabel(label = "") {
  return String(label)
    .replace(/<[^>]+>/g, " ")
    .normalize("NFKC")
    .replace(/[\s\u00a0]+/g, " ")
    .trim()
    .toLowerCase();
}

function matchesTerm(label, term) {
  const normalizedTerm = normalizeLabel(term);
  if (!latinWord.test(normalizedTerm)) return label.includes(normalizedTerm);
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(label);
}

function exactMatch(label, rule) {
  return rule.terms.some((term) => normalizeLabel(term) === label);
}

export function classifyButton(label) {
  const normalized = normalizeLabel(label);
  const matches = ruleDefinitions.filter((rule) => rule.terms.some((term) => matchesTerm(normalized, term)));
  if (!matches.length) {
    return {
      label: String(label).trim(),
      icon: null,
      mode: "review",
      reason: "No unambiguous action matched. Keep visible text and request product review.",
      matchedRules: [],
      autoMigrate: false
    };
  }

  const ordered = [...matches].sort((a, b) => severity[b.mode] - severity[a.mode] || b.priority - a.priority);
  const protectedMatch = ordered.find((rule) => rule.mode === "text-required");
  if (protectedMatch) {
    return {
      label: String(label).trim(),
      icon: protectedMatch.icon,
      mode: "text-required",
      reason: protectedMatch.reason,
      matchedRules: ordered.map((rule) => rule.id),
      autoMigrate: false
    };
  }

  if (ordered.length !== 1) {
    return {
      label: String(label).trim(),
      icon: null,
      mode: "review",
      reason: "Multiple actions are present. Keep visible text until the control is split or reviewed.",
      matchedRules: ordered.map((rule) => rule.id),
      autoMigrate: false
    };
  }

  const match = ordered[0];
  const isExact = exactMatch(normalized, match);
  return {
    label: String(label).trim(),
    icon: match.icon,
    mode: match.mode,
    reason: isExact ? match.reason : `${match.reason} The label contains additional context, so it must not be auto-migrated.`,
    matchedRules: [match.id],
    autoMigrate: match.mode === "icon-only-safe" && isExact
  };
}

export const suggestButton = classifyButton;
export const policy = Object.freeze(ruleDefinitions.map((rule) => Object.freeze({ ...rule, terms: Object.freeze([...rule.terms]) })));
