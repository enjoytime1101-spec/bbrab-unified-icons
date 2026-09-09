# BB Rab Unified Icons

统一 SVG 图标体系的开源工程方案：图标资产、按钮决策策略、可访问性检查、代码审计、安全迁移、CI、Codex Skill、Prompt Blocks 与 MCP Agent 工具一次提供。

它解决的不是“换一批 SVG”，而是“什么动作该用纯图标、什么动作必须保留文字、如何在大型项目中自动检查并安全迁移”。

## 开箱即用

要求 Node.js 20 或更高版本，无运行时依赖。当前版本已在 GitHub 开源；克隆后即可运行：

```bash
git clone https://github.com/enjoytime1101-spec/bbrab-unified-icons.git
cd bbrab-unified-icons
npm install
npm exec -- bbrab-icons audit ./src --format markdown
npm exec -- bbrab-icons suggest "发送消息"
npm exec -- bbrab-icons render send --size 20
npm exec -- bbrab-icons migrate ./src/page.html
```

迁移默认仅预览。确认报告后才写入：

```bash
npm exec -- bbrab-icons migrate ./src/page.html --write --confirm
```

写入时会创建 `page.html.bbrab-icons.bak`。购买、付款、充值、提现、退款、登录、注册、授权、删除和关键提交不会被自动改成纯图标。

## JavaScript API

```js
import { renderIcon, suggestButton, auditPath } from "bbrab-unified-icons";

const svg = renderIcon("send", { size: 20 });
const decision = suggestButton("购买套餐");
const report = await auditPath("./src");
```

## Agent / MCP

以 stdio 启动只读 MCP 服务：

```bash
npm exec -- bbrab-icons-mcp
```

提供四个工具：

- `audit_ui`：扫描文件或目录，输出按钮分级与问题。
- `suggest_button`：根据动作语义推荐图标与呈现模式。
- `render_icon`：输出经过约束的内联 SVG。
- `read_policy`：读取完整规范。

通用函数工具 schema 位于 `agent/tool-schema.json`；适用于不支持 MCP、但支持 function calling 的 Agent。

## Codex Skill 与 Prompt Blocks

- Skill：`skill/bbrab-icon-workflow/`
- 审计 Prompt：`prompts/audit.md`
- 安全迁移 Prompt：`prompts/migrate.md`
- PR 检查 Prompt：`prompts/review.md`

复制 Skill 文件夹到个人或项目 Skills 目录后，在请求中使用 `$bbrab-icon-workflow`。Skill 会引导 Agent 先审计、再生成预览、经明确确认后迁移，并验证可访问性与关键业务边界。

## 工程验证

```bash
npm run verify
```

GitHub Actions 会运行结构检查、单元测试和示例审计，并上传 Markdown 审计报告。

## 设计原则

- 高频、低风险、上下文明确的动作可以使用纯图标。
- 资金、身份、授权、删除和关键提交必须保留可见文字。
- 图标可访问、可测试、可自动审计。
- 自动改造必须可预览、可确认、可恢复。
- UI 显示成功不能代替真实业务成功；审计只证明界面符合规范。

完整规范见 [`docs/ICON_STANDARD.md`](docs/ICON_STANDARD.md)。

## 许可证

MIT
