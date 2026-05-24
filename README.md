# 永乐工作室 🐉

作品集 + 个人笔记 + 需求接收的展示网站。

## 目录结构

```
个人官网/
├── index.html          ← 主页
├── server.js           ← 需求接收服务（启动后表单才能用）
├── submissions.js      ← 查看已收到的需求
├── submissions/        ← 客户提交的需求（自动生成）
├── notes/
│   ├── xianyu-30-days.html
│   ├── pricing-guide.html
│   ├── mini-program-guide.html
│   └── dev-tools.html
├── assets/
│   ├── style.css
│   ├── main.js
│   └── grid_result.png
└── README.md
```

## 怎么用

### 本地查看
双击 `index.html` 即可在浏览器中打开查看效果。

### 启动需求接收服务（推荐）
启动后，客户提交的需求会**自动发邮件**到你的 Outlook 邮箱：

```bash
cd /Users/mac/.openclaw/workspace/个人官网
EMAIL_USER=lizibin123123@outlook.com EMAIL_PASS=你的邮箱密码 node server.js
```

#### 如果用 QQ 邮箱
```bash
SMTP_HOST=smtp.qq.com SMTP_PORT=465 SMTP_SECURE=true EMAIL_USER=你的QQ号@qq.com EMAIL_PASS=授权码 node server.js
```
> QQ 邮箱请到「设置 → 账户 → 生成授权码」获取，不要用登录密码。

服务启动后在终端保持运行，收到新需求会自动：
1. ✅ 发送邮件到 `lizibin123123@outlook.com`
2. ✅ 保存到 `submissions/` 目录做备份
3. ✅ 终端打印提示

按 `Ctrl+C` 停止。

### 不启动服务也能用
如果没启动服务，客户提交表单时会**自动打开邮件客户端**，
邮件已填好收件人、标题和内容，你只需点发送。

### 查看已收到的需求
```bash
node submissions.js       # 列出所有需求
node submissions.js -w    # 持续监听新模式
```

## 自定义内容

- **个人信息** → 改 `index.html` 里的文案
- **作品集** → 在 `#portfolio` 区块复制卡片结构添加
- **笔记** → 在 `#notes` 区块复制笔记结构添加
- **颜色主题** → 改 `style.css` 里的 `#64ffda`（主色调）

## 页面结构

- Hero → 首页大标题 + 快捷导航
- About → 个人介绍 + 技能标签
- Portfolio → 作品案例展示（AIChat、ClipBar、FileBat、QuantGrid）
- Notes → 技术笔记/文章（可点击跳转详情页）
- Contact → 联系方式 + 需求提交表单
