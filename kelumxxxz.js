//========= IMPORT MODULES================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto
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
//=======================================
const initButtonFunctions = (connection) => {
  return {
    // 1. Simple Text Buttons
    sendButtonText: (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = {
        text,
        footer,
        buttons,
        headerType: 2,
        ...options
      }
      return connection.sendMessage(jid, buttonMessage, { quoted, ...options });
    },

    // 2. Image with Buttons
    send5ButImg: async(jid, text = '', footer = '', img, but = [], options = {}) => {
      let message = await prepareWAMessageMedia({ image: img }, { upload: connection.waUploadToServer });
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: message.imageMessage,
            "hydratedContentText": text,
            "hydratedFooterText": footer,
            "hydratedButtons": but
          }
        }
      }), options);
      return connection.relayMessage(jid, template.message, { messageId: template.key.id });
    },

    // 3. List Message
    sendListMsg: (jid, text = '', footer = '', title = '', butText = '', sections = [], quoted) => {
      let listMessage = {
        text: text,
        footer: footer,
        title: title,
        buttonText: butText,
        sections
      }
      return connection.sendMessage(jid, listMessage, { quoted });
    }
  };
};
// ======= CONNECT TO WHATSAPP ============
async function connectToWA() {
  console.log("🗿 Connecting wa bot...!");
  
  await initUserEnvIfMissing();
  await initEnvsettings();
  
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

  // Initialize button functions
  const buttonFunctions = initButtonFunctions(conn);
  Object.assign(conn, buttonFunctions);

  //======= CONNECTION EVENTS ===============
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('😼 Installing plugins...');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require("./plugins/" + plugin);
        }
      });
      console.log('✅ Plugins installed');
      console.log('✅ Bot Working...');

      // Example button usage on startup
      const buttons = [
        {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
        {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1}
      ]
      
      conn.sendButtonText(
        conn.user.id, 
        buttons, 
        'Bot Started Successfully!', 
        'Choose an option below:'
      );
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ======= HANDLE MESSAGES ===============
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      mek = mek.messages[0];
      if (!mek.message) return;

      mek.message = (getContentType(mek.message) === 'ephemeralMessage')
        ? mek.message.ephemeralMessage.message
        : mek.message;

      const m = sms(conn, mek);
      const type = getContentType(mek.message);
      const from = mek.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const body = (type === 'conversation') ? mek.message.conversation
        : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text
        : (type === 'imageMessage') ? mek.message.imageMessage.caption
        : (type === 'videoMessage') ? mek.message.videoMessage.caption
        : '';

      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
      
      // Example command with buttons
      if (command === 'menu') {
        const sections = [
          {
            title: "Section 1",
            rows: [
              {title: "Option 1", rowId: "option1"},
              {title: "Option 2", rowId: "option2"}
            ]
          },
          {
            title: "Section 2",
            rows: [
              {title: "Option 3", rowId: "option3"},
              {title: "Option 4", rowId: "option4"}
            ]
          }
        ]
        
        conn.sendListMsg(
          from,
          "Main Menu",
          "Select an option below",
          "Menu Title",
          "Click to select",
          sections,
          mek
        );
      }
      
      // Example image with buttons
      if (command === 'image') {
        const buttons = [
          {buttonId: 'id1', buttonText: {displayText: 'View More'}, type: 1},
          {buttonId: 'id2', buttonText: {displayText: 'Download'}, type: 1}
        ]
        
        const imageUrl = 'https://i.ibb.co/svT32Mjm/SulaMd.jpg';
        const imageBuffer = await getBuffer(imageUrl);
        
        conn.send5ButImg(
          from,
          "Image Caption",
          "Footer Text",
          imageBuffer,
          buttons,
          mek
        );
      }

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