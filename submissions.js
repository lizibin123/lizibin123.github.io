/**
 * 查看收到的需求
 * 使用：node submissions.js
 * 或：node submissions.js --watch （持续监听新模式）
 */

const fs = require('fs');
const path = require('path');

const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');

function listSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_DIR)) {
    console.log('📭 还没有收到任何需求。');
    return;
  }

  const files = fs.readdirSync(SUBMISSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('📭 还没有收到任何需求。');
    return;
  }

  console.log('');
  console.log(`📋 共收到 ${files.length} 条需求：`);
  console.log('');

  files.forEach((file, i) => {
    const content = JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, file), 'utf-8'));
    const time = new Date(content.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`  ${i + 1}. [${content.id}]`);
    console.log(`     客户: ${content.name}`);
    console.log(`     联系: ${content.contact || '（未提供）'}`);
    console.log(`     时间: ${time}`);
    console.log(`     需求: ${content.message.slice(0, 80)}${content.message.length > 80 ? '...' : ''}`);
    console.log('');
  });
}

// 监听模式
function watchMode() {
  console.log('👀 正在监听新需求...（按 Ctrl+C 退出）\n');
  fs.watch(SUBMISSIONS_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      const filepath = path.join(SUBMISSIONS_DIR, filename);
      if (fs.existsSync(filepath)) {
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        const time = new Date(content.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        console.log('═══════════════════════════════════════');
        console.log('  📩 新需求！');
        console.log(`  客户: ${content.name}`);
        console.log(`  联系: ${content.contact || '（未提供）'}`);
        console.log(`  时间: ${time}`);
        console.log(`  需求: ${content.message}`);
        console.log('═══════════════════════════════════════\n');
      }
    }
  });
}

// CLI
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  watchMode();
} else {
  listSubmissions();
}
