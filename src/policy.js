const normalizedEntries = [
  [["发送", "send", "提交消息"], "send", "icon-only-safe", "高频且语义稳定；纯图标时必须有 aria-label 与 tooltip。"],
  [["关闭", "close", "取消弹窗"], "x", "icon-only-safe", "弹窗右上角使用，保留可访问名称。"],
  [["返回", "back"], "arrow-left", "icon-only-safe", "仅在导航上下文清晰时使用纯图标。"],
  [["刷新", "refresh", "重试", "retry"], "refresh", "icon-only-safe", "系统操作可使用纯图标并提供 tooltip。"],
  [["搜索", "search"], "search", "icon-only-safe", "输入框内使用纯图标。"],
  [["清除", "clear"], "x", "icon-only-safe", "只清除当前输入时使用。"],
  [["复制", "copy"], "copy", "icon-only-safe", "执行后应反馈“已复制”。"],
  [["展开", "expand"], "maximize", "icon-only-safe", "应同步 aria-expanded。"],
  [["更多", "more"], "more-horizontal", "icon-only-safe", "仅用于打开操作菜单。"],
  [["收藏", "bookmark"], "bookmark", "icon-text", "首次出现使用图标加文字，熟悉后可收窄。"],
  [["点赞", "like"], "heart", "icon-text", "需展示选中状态和数量变化。"],
  [["评论", "comment"], "message-circle", "icon-text", "社区交互建议保留文字或计数。"],
  [["分享", "share"], "share", "icon-text", "分享方式可能不唯一，文字可降低歧义。"],
  [["下载", "download", "导出", "export"], "download", "icon-text", "涉及文件格式与去向，保留文字。"],
  [["上传", "upload", "导入", "import"], "upload", "icon-text", "涉及文件选择，保留文字。"],
  [["编辑", "edit"], "edit", "icon-text", "对象不明确时必须加文字。"],
  [["添加", "新建", "add", "new"], "plus", "icon-text", "文字需说明新增的对象。"],
  [["播放", "play"], "play", "icon-only-safe", "播放器上下文清晰时使用纯图标。"],
  [["暂停", "pause"], "pause", "icon-only-safe", "播放器上下文清晰时使用纯图标。"],
  [["停止", "stop"], "stop", "icon-text", "停止生成或任务有后果，保留文字。"],
  [["撤销", "undo"], "undo", "icon-only-safe", "编辑器工具栏中使用，需 tooltip。"],
  [["购买", "buy", "立即购买", "支付", "pay", "充值", "recharge", "订阅", "subscribe"], "cart", "text-required", "资金动作必须明确显示动作、金额与对象，不允许只用图标。"],
  [["登录", "login", "注册", "register", "授权", "authorize"], null, "text-required", "身份与授权动作必须保留清晰文字。"],
  [["退款", "refund", "提现", "withdraw"], null, "text-required", "资金回退与出金动作不得纯图标化。"],
  [["删除", "delete", "移除", "remove"], "trash", "text-required", "破坏性动作必须保留文字并按风险确认。"],
  [["确认", "confirm", "保存", "save", "发布", "publish", "提交", "submit"], "check", "text-required", "关键提交动作保留文字，图标只能辅助。"]
];

export function normalizeLabel(label = "") {
  return String(label).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

export function suggestButton(label) {
  const normalized = normalizeLabel(label);
  const match = normalizedEntries.find(([terms]) => terms.some((term) => normalized.includes(term.toLowerCase())));
  if (!match) return {
    label: String(label).trim(),
    icon: null,
    mode: "review",
    reason: "未匹配到稳定语义；保留文字并由设计或产品人员确认。"
  };
  return { label: String(label).trim(), icon: match[1], mode: match[2], reason: match[3] };
}

export const policy = Object.freeze(normalizedEntries.map(([terms, icon, mode, reason]) => ({ terms, icon, mode, reason })));
