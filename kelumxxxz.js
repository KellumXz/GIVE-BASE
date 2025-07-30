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
const autoRead = KelumXzsettings('AUTO_READ') || 'off';
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
  cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
  } catch (e) {
  console.error("[PLUGIN ERROR] " + e);
  }
  }
  }
  events.commands.map(async(command) => {
  if (body && command.on === "body") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (mek.q && command.on === "text") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  (command.on === "image" || command.on === "photo") &&
  mek.type === "imageMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  command.on === "sticker" &&
  mek.type === "stickerMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  }});
  
  });
    //===================================================   
    conn.decodeJid = jid => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (
          (decode.user &&
            decode.server &&
            decode.user + '@' + decode.server) ||
          jid
        );
      } else return jid;
    };
    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
      let vtype
      if (options.readViewOnce) {
          message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
          vtype = Object.keys(message.message.viewOnceMessage.message)[0]
          delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
          delete message.message.viewOnceMessage.message[vtype].viewOnce
          message.message = {
              ...message.message.viewOnceMessage.message
          }
      }
    
      let mtype = Object.keys(message.message)[0]
      let content = await generateForwardMessageContent(message, forceForward)
      let ctype = Object.keys(content)[0]
      let context = {}
      if (mtype != "conversation") context = message.message[mtype].contextInfo
      content[ctype].contextInfo = {
          ...context,
          ...content[ctype].contextInfo
      }
      const waMessage = await generateWAMessageFromContent(jid, content, options ? {
          ...content[ctype],
          ...options,
          ...(options.contextInfo ? {
              contextInfo: {
                  ...content[ctype].contextInfo,
                  ...options.contextInfo
              }
          } : {})
      } : {})
      await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
      return waMessage
    }
    //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(quoted, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
      }
      let type = await FileType.fromBuffer(buffer)
      trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
          // save to file
      await fs.writeFileSync(trueFileName, buffer)
      return trueFileName
    }
    //=================================================
    conn.downloadMediaMessage = async(message) => {
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(message, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
      }
    
      return buffer
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} message
    * @param {*} forceForward
    * @param {*} options
    * @returns
    */
    //================================================
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                  let mime = '';
                  let res = await axios.head(url)
                  mime = res.headers['content-type']
                  if (mime.split("/")[1] === "gif") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
                  }
                  let type = mime.split("/")[0] + "Message"
                  if (mime === "application/pdf") {
                    return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
                  }
                  if (mime.split("/")[0] === "image") {
                    return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
                  }
                  if (mime.split("/")[0] === "video") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
                  }
                  if (mime.split("/")[0] === "audio") {
                    return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
                  }
                }
    //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
      //let copy = message.toJSON()
      let mtype = Object.keys(copy.message)[0]
      let isEphemeral = mtype === 'ephemeralMessage'
      if (isEphemeral) {
          mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
      let content = msg[mtype]
      if (typeof content === 'string') msg[mtype] = text || content
      else if (content.caption) content.caption = text || content.caption
      else if (content.text) content.text = text || content.text
      if (typeof content !== 'string') msg[mtype] = {
          ...content,
          ...options
      }
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
      copy.key.remoteJid = jid
      copy.key.fromMe = sender === conn.user.id
    
      return proto.WebMessageInfo.fromObject(copy)
    }
    
    
    /**
    *
    * @param {*} path
    * @returns
    */
    //=====================================================
    conn.getFile = async(PATH, save) => {
      let res
      let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
          //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
      let type = await FileType.fromBuffer(data) || {
          mime: 'application/octet-stream',
          ext: '.bin'
      }
      let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext)
      if (data && save) fs.promises.writeFile(filename, data)
      return {
          res,
          filename,
          size: await getSizeMedia(data),
          ...type,
          data
      }
    
    }
    //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
      let types = await conn.getFile(PATH, true)
      let { filename, size, ext, mime, data } = types
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif.js')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: Config.packname, author: Config.packname, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    //=====================================================
    conn.parseMention = async(text) => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
      let types = await conn.getFile(path, true)
      let { mime, ext, res, data, filename } = types
      if (res && res.status !== 200 || file.length <= 65536) {
          try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
      }
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: options.packname ? options.packname : Config.packname, author: options.author ? options.author : Config.author, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          caption,
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    /**
    *
    * @param {*} message
    * @param {*} filename
    * @param {*} attachExtension
    * @returns
    */
    //=====================================================
    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
    //=====================================================
    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
        /**
         *
         * @param {*} jid
         * @param {*} path
         * @param {*} quoted
         * @param {*} options
         * @returns
         */
    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
    
            /**
             *
             * @param {*} jid
             * @param {*} path
             * @param {*} quoted
             * @param {*} options
             * @returns
             */
    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} path
    * @param {*} caption
    * @param {*} quoted
    * @param {*} options
    * @returns
    */
    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })
    
    /**
     *
     * @param {*} jid
     * @param {*} path
     * @param {*} caption
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = {
              text,
              footer,
              buttons,
              headerType: 2,
              ...options
          }
          //========================================================================================================================================
      conn.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
      let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
          templateMessage: {
              hydratedTemplate: {
                  imageMessage: message.imageMessage,
                  "hydratedContentText": text,
                  "hydratedFooterText": footer,
                  "hydratedButtons": but
              }
          }
      }), options)
      conn.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} buttons
    * @param {*} caption
    * @param {*} footer
    * @param {*} quoted
    * @param {*} options
    */
    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
            id = conn.decodeJid(jid);

            withoutContact = conn.withoutContact || withoutContact;

            let v;

            if (id.endsWith('@g.us'))
                return new Promise(async resolve => {
                    v = store.contacts[id] || {};

                    if (!(v.name.notify || v.subject))
                        v = conn.groupMetadata(id) || {};

                    resolve(
                        v.name ||
                            v.subject ||
                            PhoneNumber(
                                '+' + id.replace('@s.whatsapp.net', ''),
                            ).getNumber('international'),
                    );
                });
            else
                v =
                    id === '0@s.whatsapp.net'
                        ? {
                                id,

                                name: 'WhatsApp',
                          }
                        : id === conn.decodeJid(conn.user.id)
                        ? conn.user
                        : store.contacts[id] || {};

            return (
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.verifiedName ||
                PhoneNumber(
                    '+' + jid.replace('@s.whatsapp.net', ''),
                ).getNumber('international')
            );
        };

        // Vcard Functionality
        conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
  let list = [];

  for (let i of kon) {
    const name = await conn.getName(i + '@s.whatsapp.net');

    list.push({
      displayName: name,
      vcard: `BEGIN:VCARD
VERSION:3.0
N:${name}
FN:${config.OWNER_NAME}
item1.TEL;waid=${i}:${i}
item1.X-ABLabel:Click here to chat
item2.EMAIL;type=INTERNET:${config.EMAIL}
item2.X-ABLabel:Email
item3.URL:https://github.com/${config.GITHUB}
item3.X-ABLabel:GitHub
item4.ADR:;;${config.LOCATION};;;;
item4.X-ABLabel:Region
END:VCARD`,
    });
  }

  await conn.sendMessage(
    jid,
    {
      contacts: {
        displayName: `${list.length} Contact`,
        contacts: list,
      },
      ...opts,
    },
    { quoted }
  );
};
// ========== EXPRESS SERVER ===========
app.get("/", (req, res) => {
  res.send("hey, bot started✅");
});
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// ===== DELAYED START =========
setTimeout(() => {
  connectToWA();
}, 4000);
