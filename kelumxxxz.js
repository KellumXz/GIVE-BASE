//========= IMPORT MODULES================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const util = require('util');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require("express");
const { File } = require('megajs');
const path = require('path');
const { cmd, commands } = require('./kelumxz/command');
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require('./lib/functions');

//========= FIREBASE & CACHING ============
const { initUserEnvIfMissing } = require('./kelumxz/settingsdb');
const { initEnvsettings, KelumXzsettings } = require('./kelumxz/settings');

// ========== BASIC SETUP =================
const app = express();
const port = process.env.PORT || 8000;
const prefix = '.';
const ownerNumber = ['94756917921'];

// =============== SESSION =================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID.split("KELUMXZ=")[1];
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', data);
    console.log("💡 Session downloaded");
  });
}

// ======= CONNECT TO WHATSAPP ============
async function connectToWA() {
  console.log("🗿 Connecting wa bot...!");
//=========================================
  await initUserEnvIfMissing();
  await initEnvsettings();
  
  //============== SETTINGS ENV ==============
  
  const auto_react = KelumXzsettings('AUTO_REACT') || 'on';
  const presence_type = KelumXzsettings('PRESENCE_TYPE') || 'on';
  const presence_fake = KelumXzsettings('PRESENCE_FAKE') || 'both';
  const anti_call = KelumXzsettings('ANTI_CALL') || 'on';
  const anti_delete = KelumXzsettings('ANTI_DELETE') || 'on';
const autoRead = KelumXzsettings('AUTO_READ') || 'on';
const oneView = KelumXzsettings('ONE_VIEW') || 'on';
const readStatus = KelumXzsettings('READ_STATUS') || 'true';


  //============================================
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  // ====== ANTI CALL HANDLER =======
  conn.ev.on('call', async (call) => {
    const callerId = call.from || call.peerJid || call.id;
    if (!callerId) return;

    if (anti_call === 'off') {
      return;
    }

    if (anti_call === 'on') {
      await conn.sendMessage(callerId, { text: "🚫 Sorry, calls are not allowed on this bot." });
      await conn.rejectCall(callerId);
    }

    if (anti_call === 'block') {
      await conn.sendMessage(callerId, { text: "🚫 You are blocked for calling the bot." });
      await conn.rejectCall(callerId);
      await conn.updateBlockStatus(callerId, 'block');
    }
  });

  //========= SETTINGS RUNNING ===============
  const commandConfig = { on: "body" };
  cmd(commandConfig, async (
    client, message, chat, {
      from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender,
      senderNumber, botNumber2, botNumber, pushname, isMe, isOwner,
      groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,
      reply
    }) => {
    if (auto_react === 'on' && !isCmd) {
      const emojis = ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🐚', '🍃', '🎋', '🌷', '🌹', '🥀', '💐', '🌾', '🌺', '🌸', '🪨', '🌼', '⚡', '✨', '💫', '⭐', '🪐', '🌑', '🌝', '🌚', '☂️', '☔', '💧', '⛅', '🎾', '🏐', '🎲', '🧩', '🧼', '🎈', '🪣', '🏮'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      client.sendMessage(from, {
        react: {
          text: randomEmoji,
          key: message.key
        }
      });
    }
  });

  //======= CONNECTION EVENTS ===============
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        connectToWA();
      } else {
        console.log('Connection closed. You are logged out.');
      }
    } else if (connection === 'open') {
      console.log('😼 Installing plugins...');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require("./plugins/" + plugin);
        }
      });

      // Anti Delete Event
      conn.ev.on('messages.delete', async (item) => {
        if (anti_delete === 'off') return;

        try {
          const key = item.keys[0];
          const msg = await conn.loadMessage(key.remoteJid, key.id);
          if (!msg) return;

          const senderJid = key.participant || key.remoteJid;
          const senderNumber = senderJid.split('@')[0];
          const isGroup = key.remoteJid.endsWith('@g.us');
          const isStatus = key.remoteJid === 'status@broadcast';
          const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });

          let messageContent = '';
          if (msg.message?.conversation) {
            messageContent = msg.message.conversation;
          } else if (msg.message?.extendedTextMessage?.text) {
            messageContent = msg.message.extendedTextMessage.text;
          } else if (msg.message?.imageMessage?.caption) {
            messageContent = msg.message.imageMessage.caption;
          } else if (msg.message?.videoMessage?.caption) {
            messageContent = msg.message.videoMessage.caption;
          } else {
            messageContent = '[Media/Unsupported]';
          }

          const originalText = `🗑️ *Message Deleted!*
👤 *Sent By:* wa.me/${senderNumber}
❌ *Deleted By:* wa.me/${senderNumber}
⏰ *Time:* ${time}
📩 *Message:* ${messageContent}
`;

          if (anti_delete === 'on' && isGroup) {
            await conn.sendMessage(key.remoteJid, { text: originalText });
          } else if (anti_delete === 'private') {
            await conn.sendMessage(senderJid, { text: originalText });
          } else if (anti_delete === 'on' && isStatus) {
            for (const owner of ownerNumber) {
              await conn.sendMessage(owner + '@s.whatsapp.net', {
                text: `🗑️ Status message deleted by wa.me/${senderNumber}\n\n${originalText}`
              });
            }
          }
        } catch (err) {
          console.log("Anti-delete error:", err);
        }
      });

      // PRESENCE TYPE ON/OFF
      if (presence_type === 'on') {
        await conn.sendPresenceUpdate('available');
      } else {
        await conn.sendPresenceUpdate('unavailable');
      }

      console.log('✅ Plugins installed');
      console.log('✅ Bot Working...');

      const up = `CONNECTED!\n> By KelumXz`;

      conn.sendMessage(conn.user.id, {
        image: { url: 'https://i.ibb.co/rfcQVDsk/a0119355c261425e6c4c2a13f97c97e3.jpg' },
        caption: up,
        contextInfo: {
          mentionedJid: ['94704020146@s.whatsapp.net'],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363373642098017@newsletter',
            newsletterName: "KELUMXZ-MD",
            serverMessageId: 999
          },
          externalAdReply: {
            title: 'KELUMXZ-MD VERSION X0.1',
            body: 'BY : KELUMXZ',
            mediaType: 1,
            sourceUrl: "https://youtube.com/@tech_with_pamiya",
            thumbnailUrl: 'https://i.ibb.co/svT32Mjm/SulaMd.jpg',
            renderLargerThumbnail: false,
            showAdAttribution: true
          }
        }
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ======= HANDLE MESSAGES ===============
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      mek = mek.messages[0];
      if (!mek.message) return;
//=======================================      
//if (!mek.message) return	

            // ===== AUTO READ FEATURE =====
if (autoRead === 'on' && mek.key && mek.key.remoteJid) {
  try {
    await conn.readMessages([mek.key]);
  } catch (e) {
    console.log("Auto Read Error:", e);
  }
}
           mek.message = (getContentType(mek.message) === 'ephemeralMessage')
        ? mek.message.ephemeralMessage.message
        : mek.message;
// ===== VIEW ONCE FEATURE =====
if (oneView !== 'off' && getContentType(mek.message) === 'viewOnceMessage') {
  try {
    const msg = mek.message.viewOnceMessage.message;
    mek.message = msg;
    delete mek.message?.[Object.keys(msg)[0]]?.viewOnce;
  } catch (e) {
    console.log("OneView Error:", e);
  }
}
      const m = sms(conn, mek);
      const type = getContentType(mek.message);
      const from = mek.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      //====================================================
      const ppuser = "https://telegra.ph/file/24fa902ead26340f3df2c.png";

      const quoted = { key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': 'pushname', 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;'ᴅᴀɴᴜxᴢ 💜',;;;\nFN:'ᴅᴀɴᴜxᴢ 💜'\nitem1.TEL;waid=94766911711:94766911711\nitem1.X-ABLabel:Mobile\nEND:VCARD`, 'jpegThumbnail': ppuser, thumbnail: ppuser,sendEphemeral: true}}}
      //===========================================
      const body = (type === 'conversation') ? mek.message.conversation
        : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text
        : (type === 'imageMessage') ? mek.message.imageMessage.caption
        : (type === 'videoMessage') ? mek.message.videoMessage.caption
        : '';

      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);
      const q = args.join(' ');
      const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid);
      const senderNumber = sender.split('@')[0];
      const botNumber = conn.user.id.split(':')[0];
      const pushname = mek.pushName || 'Sin Nombre';
      const isMe = botNumber.includes(senderNumber);
      const isOwner = ownerNumber.includes(senderNumber) || isMe;
      const botNumber2 = await jidNormalizedUser(conn.user.id);

      let groupMetadata = {}, participants = [], groupAdmins = [], isBotAdmins = false, isAdmins = false;
      if (isGroup) {
        try {
          groupMetadata = await conn.groupMetadata(from);
          participants = groupMetadata.participants || [];
          groupAdmins = await getGroupAdmins(participants);
          isBotAdmins = groupAdmins.includes(botNumber2);
          isAdmins = groupAdmins.includes(sender);
        } catch (e) {
          console.error("Error fetching group metadata:", e);
        }
      }

      const reply = (teks) => {
        conn.sendMessage(from, {
          text: teks,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: true,
            externalAdReply: {
              title: `KELUMXZ-MD`,
              body: `This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot’s behavior.`,
              thumbnailUrl: `https://files.catbox.moe/hikhh5.jpg`,
              mediaType: 1,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: mek });
      };

      conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        try {
          let mime = (await axios.head(url)).headers['content-type'];
          const buffer = await getBuffer(url);

          if (mime.includes("gif")) {
            return conn.sendMessage(jid, { video: buffer, caption, gifPlayback: true, ...options }, { quoted });
          } else if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: buffer, mimetype: mime, caption, ...options }, { quoted });
          } else if (mime.startsWith("image")) {
            return conn.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
          } else if (mime.startsWith("video")) {
            return conn.sendMessage(jid, { video: buffer, caption, mimetype: 'video/mp4', ...options }, { quoted });
          } else if (mime.startsWith("audio")) {
            return conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ...options }, { quoted });
          }
        } catch (e) {
          console.error("Error in sendFileUrl:", e);
          throw e;
        }
      };

      const events = require('./kelumxz/command');
      const cmdName = isCmd ? command : false;

      // === PRESENCE_FAKE HANDLING ===
      if (presence_fake !== 'off' && isGroup) {
        if (presence_fake === 'typing') {
          await conn.sendPresenceUpdate('composing', from);
        } else if (presence_fake === 'recording') {
          await conn.sendPresenceUpdate('recording', from);
        } else if (presence_fake === 'both') {
          await conn.sendPresenceUpdate('composing', from);
          await sleep(1500);
          await conn.sendPresenceUpdate('recording', from);
          await sleep(1500);
          await conn.sendPresenceUpdate('paused', from);
        }
      }

      if (cmdName) {
        const cmd = events.commands.find((cmd) => cmd.pattern === cmdName || (cmd.alias && cmd.alias.includes(cmdName)));
        if (cmd) {
          if (cmd.group && !isGroup) return reply("❌ Group only command!");
          if (cmd.admin && !isAdmins && !isOwner) return reply("❌ Admin only command!");
          if (cmd.owner && !isOwner) return reply("❌ Owner only command!");
          if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

          try {
            await cmd.function(conn, mek, m, {
              from, quoted, body, isCmd, command, args, q, isGroup,
              sender, senderNumber, botNumber2, botNumber, pushname, isMe,
              isOwner, groupMetadata, participants, groupAdmins, isBotAdmins,
              isAdmins, reply
            });
          } catch (e) {
            console.error("[PLUGIN ERROR]", e);
            reply("❌ Command error!");
          }
        }
      }

      //========= Non-Command Events ========
      events.commands.map(async (command) => {
        if (body && command.on === "body") {
          command.function(conn, mek, m, {
            from, prefix, quoted, body, isCmd, command, args, q, isGroup,
            sender, senderNumber, botNumber2, botNumber, pushname, isMe,
            isOwner, groupMetadata, participants, groupAdmins, isBotAdmins,
            isAdmins, reply
          });
        }
      });
    } catch (error) {
      console.error("Error in message processing:", error);
    }
  });
}

// ========== EXPRESS SERVER ===========
app.get("/", (req, res) => {
  res.send("hey, bot started✅");
});
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// ===== DELAYED START =========
setTimeout(() => {
  connectToWA();
}, 4000);
