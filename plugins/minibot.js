const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { cmd } = require('../kelumxz/command');

cmd({
  pattern: 'add',
  alias: [],
  desc: 'Add a new mini bot (WhatsApp number)',
  category: 'owner',
  owner: true,
  use: '.add <session_name>',
  filename: __filename
}, async (conn, mek, m, { reply, args, q }) => {
  if (!q) return reply('❌ Please provide a unique session name.\nExample: `.add bot2`');

  const sessionId = q.trim();
  const folderPath = path.join(__dirname, '../miniBots', sessionId);

  if (fs.existsSync(folderPath)) {
    return reply(`⚠️ Session "${sessionId}" already exists.`);
  }

  // Create folder and auth state
  fs.mkdirSync(path.join(folderPath, 'auth_info_baileys'), { recursive: true });
  fs.writeFileSync(path.join(folderPath, 'start.js'), generateMiniBotCode(sessionId));

  reply(`✅ Mini bot session "${sessionId}" created.\n🟢 Starting...`);

  // Start mini bot
  spawn('node', [path.join(folderPath, 'start.js')], {
    stdio: 'inherit',
    shell: true
  });
});

// Function to generate mini bot starter code
function generateMiniBotCode(sessionId) {
  return `
// Mini Bot: ${sessionId}
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version
  });

  conn.ev.on('creds.update', saveCreds);
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      console.log("🔁 Reconnecting...");
      startBot();
    } else if (connection === 'open') {
      console.log("✅ ${sessionId} connected");
    }
  });

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    const msg = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (msg.toLowerCase().includes("ping")) {
      await conn.sendMessage(m.key.remoteJid, { text: "pong!" }, { quoted: m });
    }
  });
}

startBot();
`;
}
