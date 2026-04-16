# XJTLU AI 小鸟 - 快速设置指南

## 🚀 5分钟快速开始

### 1️⃣ 获取新的 DeepSeek API Key

首先，请创建一个**新的** API Key（不要使用之前暴露的）：

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/api/keys)
2. 登录你的账户
3. 点击 "Create New API Key"
4. 给密钥起个名字（如 "XJTLU-Bird"）
5. **复制新生成的密钥**

### 2️⃣ 配置环境变量

在 `frontend/` 目录下创建文件 `.env`：

```bash
# frontend/.env
VITE_DEEPSEEK_API_KEY=sk-你的新密钥粘贴这里
```

**注意：**
- `.env` 文件已在 `.gitignore` 中，不会上传到 Git
- 永远不要将真实密钥提交到仓库
- 每台电脑/开发环境需要单独配置一份 `.env`

### 3️⃣ 启动项目

```bash
cd frontend
npm run dev
```

### 4️⃣ 开始聊天

1. 打开应用，右下角会看到蓝色的 XJTLU 小鸟 🐤
2. 点击小鸟
3. **无需手动输入密钥**，聊天框直接显示
4. 开始和 AI 对话！

---

## 🔄 如果弹出密钥输入框

说明环境变量没有正确加载，有两种解决方案：

**方案A：使用环境变量（推荐）**
- 确保 `.env` 文件在 `frontend/` 目录下
- 检查格式：`VITE_DEEPSEEK_API_KEY=sk-xxxxx`
- 重启开发服务器：`npm run dev`

**方案B：手动输入**
- 在弹出的对话框中粘贴密钥
- 点击 "Confirm"
- 密钥会保存到本地浏览器存储

---

## 🔐 安全建议

| 做 ✅ | 不做 ❌ |
|------|--------|
| 在 `.env` 中本地配置 | 硬编码密钥到代码 |
| 将 `.env` 加入 `.gitignore` | 将密钥上传到 Git |
| 为不同环境使用不同密钥 | 共享同一个密钥 |
| 定期轮换密钥 | 长期使用旧密钥 |

---

## 🎨 小鸟功能一览

| 功能 | 说明 |
|------|------|
| 💙 蓝色小鸟 | XJTLU 吉祥物，固定在右下角 |
| 🎭 表情变化 | 根据 AI 状态改变心情 |
| 💬 聊天框 | 支持多轮对话，记录当前会话 |
| 📣 通知气泡 | 定期友好提醒 |
| 🪶 动画翅膀 | 根据心情状态改变飞行方式 |

---

## 🐛 常见问题

**Q: 为什么显示"API key not configured"？**
- A: 检查 `.env` 文件是否存在且格式正确

**Q: AI 回复很慢？**
- A: DeepSeek API 响应时间 1-5 秒正常，如超过 30 秒可能网络有问题

**Q: 可以存储对话记录吗？**
- A: 可以，修改 `XJTLUBird.vue` 添加 localStorage 持久化

**Q: 如何更换 AI 模型？**
- A: 编辑 `useDeepSeekChat.js` 中的 `model: 'deepseek-chat'`

---

## 🚫 疑难排解

**问题：CORS 错误**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
解决：检查 API 密钥是否正确，DeepSeek 官方 API 已启用 CORS

**问题：403 Unauthorized**
```
Unauthorized: Invalid API key
```
解决：密钥可能过期或格式错误，创建新的密钥

**问题：502 Bad Gateway**
```
Service Unavailable
```
解决：可能是 DeepSeek API 维护中，稍后重试

---

## 📝 下一步

1. ✅ 设置完成后，可在 `XJTLUBird.vue` 中自定义小鸟外观
2. 📊 考虑添加对话历史导出功能
3. 🌍 支持多语言回复
4. 🎤 集成语音输入/输出

祝使用愉快！🎉
