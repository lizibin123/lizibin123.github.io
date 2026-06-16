/**
 * 莫门工作室 · 需求接收服务
 *
 * 启动方式：
 *   EMAIL_USER=your-email@outlook.com EMAIL_PASS=your-password node server.js
 *
 * 如果是用 QQ 邮箱，换 smtp.qq.com，密码填授权码。
 * 如果是用 Gmail，换 smtp.gmail.com，密码填 App Password。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 3456;
const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');
const TO_EMAIL = 'lizibin123123@outlook.com';

// SMTP 配置（通过环境变量传入）
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

// 确保 submissions 目录存在
if (!fs.existsSync(SUBMISSIONS_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

// 创建邮件发送器
let transporter = null;
if (SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
  transporter = nodemailer.createTransport(SMTP_CONFIG);
  // 验证连接
  transporter.verify().then(() => {
    console.log('  ✅ 邮箱配置正确，可以发送邮件');
  }).catch(err => {
    console.log('  ⚠️ 邮箱验证失败:', err.message);
    console.log('  服务仍会启动，但邮件发送可能失败');
  });
}

/**
 * 发送邮件通知
 */
async function sendEmailNotification({ name, contact, message, id }) {
  if (!transporter) {
    console.log('  ⏭️ 未配置邮箱，跳过邮件发送');
    return false;
  }

  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const mailOptions = {
    from: SMTP_CONFIG.auth.user,
    to: TO_EMAIL,
    subject: `📩 莫门工作室 · 新需求来自 ${name}`,
    text: [
      `═══════════════════════════════════════`,
      `  莫门工作室 · 客户需求`,
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
      `  此邮件由莫门工作室官网自动发送`,
    ].join('\n'),
    html: [
      `<div style="font-family: -apple-system, 'PingFang SC', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e0e0e0; padding: 32px; border-radius: 16px;">`,
      `<div style="font-size: 24px; margin-bottom: 24px; color: #64ffda; font-weight: 700;">📩 莫门工作室 · 新需求</div>`,
      `<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">`,
      `<tr><td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 13px; width: 80px;">时间</td><td style="padding: 8px 0; color: #fff;">${time}</td></tr>`,
      `<tr><td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 13px;">客户</td><td style="padding: 8px 0; color: #fff;">${name}</td></tr>`,
      `<tr><td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 13px;">联系</td><td style="padding: 8px 0; color: #fff;">${contact || '未提供'}</td></tr>`,
      `<tr><td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 13px;">编号</td><td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 12px;">${id}</td></tr>`,
      `</table>`,
      `<div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin-bottom: 20px;">`,
      `<div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 10px;">需求描述</div>`,
      `<div style="font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.8); white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>`,
      `</div>`,
      `<div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 12px; color: rgba(255,255,255,0.2);">此邮件由莫门工作室官网自动发送</div>`,
      `</div>`
    ].join('\n')
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`  ✅ 邮件已发送到 ${TO_EMAIL} (${info.messageId})`);
    return true;
  } catch (err) {
    console.log(`  ❌ 邮件发送失败: ${err.message}`);
    return false;
  }
}

// ===== HTTP 服务 =====
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/submit') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);

      if (!data.name || !data.message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'name 和 message 为必填' }));
        return;
      }

      const timestamp = new Date().toISOString();
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: data.name.trim(),
        contact: (data.contact || '').trim(),
        message: data.message.trim(),
        createdAt: timestamp
      };

      // 1. 保存到本地文件（备份）
      const filename = `${entry.id}.json`;
      fs.writeFileSync(
        path.join(SUBMISSIONS_DIR, filename),
        JSON.stringify(entry, null, 2),
        'utf-8'
      );

      // 2. 发送邮件
      const emailSent = await sendEmailNotification(entry);

      // 3. 终端打印
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  📩 收到新需求！');
      console.log('  ────────────────────────────────');
      console.log(`  客户: ${entry.name}`);
      console.log(`  联系: ${entry.contact || '（未提供）'}`);
      console.log(`  需求: ${entry.message.slice(0, 100)}${entry.message.length > 100 ? '...' : ''}`);
      console.log(`  邮件: ${emailSent ? '✅ 已发送' : '⏭️ 未发送（请配置邮箱）'}`);
      console.log('═══════════════════════════════════════');
      console.log('');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        id: entry.id,
        emailSent
      }));

    } catch (err) {
      console.error('❌ 处理请求失败:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '服务器内部错误' }));
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🐉 莫门工作室 · 需求接收服务已启动');
  console.log('  ────────────────────────────────');
  console.log(`  收件邮箱: ${TO_EMAIL}`);
  console.log(`  SMTP: ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}`);
  if (SMTP_CONFIG.auth.user) {
    console.log(`  发件账号: ${SMTP_CONFIG.auth.user}`);
  } else {
    console.log('  ⚠️  未配置发件邮箱');
    console.log('  用法: EMAIL_USER=xxx@outlook.com EMAIL_PASS=密码 node server.js');
  }
  console.log('  ────────────────────────────────');
  console.log('  收到需求后会自动：');
  console.log('  1. ✅ 发送邮件到您的 Outlook');
  console.log('  2. ✅ 保存到 submissions/ 目录');
  console.log('  3. ✅ 终端打印提示');
  console.log('  ────────────────────────────────');
  console.log('  按 Ctrl+C 停止服务');
  console.log('═══════════════════════════════════════');
  console.log('');
});
