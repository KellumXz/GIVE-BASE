const { cmd, commands } = require('../kelumxz/command');
const config = require('../config.js')
const fs = require('fs');
const axios = require('axios');
//const { updateUserEnv } = require('../lib/settingsdb');
const { sleep } = require('../lib/functions');
const { exec } = require("child_process");
const {runtime,fetchJson} = require('../lib/functions')
//const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
//=====================================

cmd({
  pattern: "alive",
  alias: ["bot","info","kelumxz","active","aliv"],
  desc: "Show bot alive status",
  category: "main",
  react: "🎀",
  allowOnly: true,
  allowOnly: true,
  filename: __filename,
}, async (conn, m, msg, {
  from, pushname, quoted, reply
}) => {
  const caption = `\`@ Hellow :\` ${pushname}\n*Iᴛᴢ: kelum'Xz* XX WhatsApp simple bot !

╭───•◯
│ Time : ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo' })}
│ Date: ${new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' })}
│ Owner: ${config.CREATE_NUMBER}
╰───•◯

*◯ A B O U T*
> This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot’s behavior.
*◯ D E P L O Y* https://kelumxz-md.vercel.app
> *@kelum'Xz*`;
  await conn.sendMessage(from, {
    text: caption,
    contextInfo: {
      mentionedJid: [m.sender], // tag current user
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-XX BOT",
        serverMessageId: 999
      },
      externalAdReply: {
        title: 'KELUMXZ-XX',
        body: '( The Best Simple XX WhatsApp )',
        mediaType: 1,
        sourceUrl: "https://by.kelumxz/",
        thumbnailUrl: "https://files.catbox.moe/gtg2a2.jpg", // preview image only
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m });

});

//=======================================

cmd({
    pattern: "restart", 
    alias: ["res"],
    react: "♻️",
    desc: "ᴄʏʙᴇʀ ᴍʏ ʀᴇꜱᴛᴀʀᴛᴇᴅ",
    category: "owner",  
    allowOnly: true,
  filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isOwner) return reply("`This Owner Command !`");
const {exec} = require("child_process")
reply("_*♻️ Restarting........*_")
await sleep(1500)
exec("pm2 restart all")
}catch(e){
console.log(e)
reply(`${e}`)
}
})
//=======================================
cmd({
    pattern: "ping",
    react: "🌀",
    alias: ["speed"],
    desc: "Check bot\'s ping",
    category: "main",
    use: '.ping',
    allowOnly: true,
  filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const startTime = Date.now()
        const message = await conn.sendMessage(from, { text: '*_🪄Pinging..._*' })
        const endTime = Date.now()
        const ping = endTime - startTime
        await conn.sendMessage(from, { text: `*♻️ Speed... : ${ping}ms*`}, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
//=======================================

cmd({
  pattern: "menu",
  alias: ["allmenu","list","alllist","cmds","men"],
  desc: "Show bot all commands",
  category: "main",
  react: "🗒️",
  allowOnly: true,
  filename: __filename,
}, async (conn, m, msg, {
  from, pushname, quoted, reply
}) => {
  const caption = `\`@ Hellow :\` ${pushname}\n*-> Iᴛᴢ: kelum'Xz* WhatsApp simple bot !

*💫 NOTE*
> මෙය Give එකක් මගින් ලබාදීමට සදා ඇති නිසාවෙන් කිසිම main menu එකක් add නොමැත.ඔබට *දැනට add කරලා තියන cmd බැලීම සදහා allmenu cmd එක try කරන්න*( මෙය Beta Tester)

*◯ A B O U T*
> This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot’s behavior.*◯ D E P L O Y* https://kelumxz-md.vercel.app
> *@kelum'Xz*`;
  await conn.sendMessage(from, {
    text: caption,
    contextInfo: {
      mentionedJid: [m.sender], // tag current user
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-XX BOT",
        serverMessageId: 999
      },
      externalAdReply: {
        title: 'KELUMXZ-XX',
        body: '( The Best Simple XX WhatsApp )',
        mediaType: 1,
        sourceUrl: "https://by.kelumxz/",
        thumbnailUrl: "https://files.catbox.moe/fkw8ac.jpg", // preview image only
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m });

});

//=======================================

cmd(
  {
    pattern: "allmenu",
    desc: "Displays all available commands",
    category: "main",
    filename: __filename,
  },
  async (
    danuwa,
    mek,
    m,
    {
      from,
      reply
    }
  ) => {
    try {
      const categories = {};

      for (let cmdName in commands) {
        const cmdData = commands[cmdName];
        const cat = cmdData.category?.toLowerCase() || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({
          pattern: cmdData.pattern,
          desc: cmdData.desc || "No description"
        });
      }

      let menuText = "📋 *Available Commands:*\n";

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n📂 *${cat.toUpperCase()}*\n`;
        cmds.forEach(c => {
          menuText += `- .${c.pattern} : ${c.desc}\n`;
        });
      }

      await reply(menuText.trim());
    } catch (err) {
      console.error(err);
      reply("❌ Error generating menu.");
    }
  }
);
