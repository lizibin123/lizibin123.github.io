/**
 * 永乐工作室 · 需求接收 API (Vercel Serverless)
 *
 * 部署到 Vercel 后自动生成接口：
 *   https://你的项目名.vercel.app/api/submit
 *
 * 环境变量在 Vercel 项目设置里配置：
 *   EMAIL_USER = lizibin123123@outlook.com
 *   EMAIL_PASS = 你的邮箱密码
 *   SMTP_HOST = smtp-mail.outlook.com
 *   SMTP_PORT = 587
 */

const nodemailer = require('nodemailer');

// 创建邮件发送器（只在需要时初始化）
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ 未配置 EMAIL_USER / EMAIL_PASS，邮件不会发送');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });

  return transporter;
}

module.exports = async (req, res) => {
  // CORS — 允许前端跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { name, contact, message } = req.body || {};

  if (!name || !message) {
    return res.status(400).json({ error: 'name 和 message 为必填' });
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  let emailSent = false;

  // 发送邮件
  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // 自己发给自己
        subject: `📩 永乐工作室 · 新需求来自 ${name}`,
        text: [
          `═══════════════════════════════════════`,
          `  永乐工作室 · 客户需求`,
          `═══════════════════════════════════════`,
          ``,
          `  📅 时间: ${time}`,
          `  👤 客户: ${name}`,
          `  📞 联系: ${contact || '（未提供）'}`,
          `  🆔 编号: ${id}`,
          ``,
          `  ─── 需求描述 ───`,
          ``,
          `  ${message}`,
          ``,
          `═══════════════════════════════════════`,
        ].join('\n'),
      });
      emailSent = true;
    } catch (err) {
      console.error('❌ 邮件发送失败:', err.message);
    }
  }

  console.log(`📩 新需求: ${name} - ${message.slice(0, 60)}...`);

  res.json({ success: true, id, emailSent });
};
