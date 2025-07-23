const { cmd } = require('../kelumxz/command');
const fetch = require('node-fetch');
const { CREATE_NUMBER } = require('../config');

// Temp in-memory storage for deldatabase confirmation
const pendingDeletes = new Set();

// Helper: Firebase JSON path
const path = (number = '') => `https://kelumxz-default-rtdb.asia-southeast1.firebasedatabase.app/${CREATE_NUMBER}/${number}.json`;




cmd({
  pattern: "accessmenu",
  desc: "Show full access command list",
  category: "main",
  allowOnly: true,
  react: "📂",
  filename: __filename
}, async (conn, mek, m, { isOwner }) => {
  if (!isOwner) return conn.sendMessage(m.chat, { text: "❌ Owner only." }, { quoted: mek });

  const text = `*╭─∘┈ ┈ ┈ ┈ ┈ ୨♡୧ ┈ ┈ ┈ ┈ ┈─•⪨*
*┊* \`「 :) ACCESSES 」\`
*┊ ⭔* register
*┊ ⭔* delverify
*┊ ⭔* ban
*┊ ⭔* deletereg
*┊ ⭔* deldatabase
*┊ ⭔* reglist
*┊ ⭔* allowlist
*┊ ⭔* banlist
*╰─∘₊★₊∘──┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈┈ ─•⪨*

> *─♡──𝓚𝓮𝓵𝓾𝓶𝔁𝔃.*
> *\`ⓘ 𝚆𝙴ɮ:\` https://kelumxz-md.vercel.app/*
૮     🎀. Thanks for choosing *xziy！*`;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: '🧩 ACCESS SETTINGS',
        body: '© SHRII',
        mediaType: 1,
        thumbnailUrl: 'https://files.catbox.moe/45z2k7.jpg',
        sourceUrl: 'https://github.com/KellumXz',
        renderLargerThumbnail: true
      }
    }
  }, { quoted: mek });
});
// REGISTER
cmd({
  pattern: "register",
  desc: "Register user",
  category: "main",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { senderNumber, reply }) => {
  try {
    const res = await fetch(path(senderNumber));
    const val = await res.text();
    if (val && !val.includes('null')) {
      return conn.sendMessage(m.chat, {
        text: "*Ops..!*",
        contextInfo: {
          forwardingScore: 999, isForwarded: true,
          externalAdReply: {
            title: '❕Already Registered',
            body: '© SHRII',
            mediaType: 1,
            thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
            sourceUrl: "https://github.com/KellumXz",
            renderLargerThumbnail: true
          }
        }
      }, { quoted: mek });
    }

    const put = await fetch(path(senderNumber), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify("Allow")
    });

    if (put.ok) {
      await conn.sendMessage(m.chat, {
        text: "`• You can now use the bot...`\n*Unlock All Commands*\n\n> *─♡──𝓚𝓮𝓵𝓾𝓶𝔁𝔃.*\n> *`ⓘ 𝚆𝙴ɮ:` https://kelumxz-md.vercel.app/*\n૮     🎀 Thanks for choosing *xziy！*",
        contextInfo: {
          forwardingScore: 999, isForwarded: true,
          externalAdReply: {
            title: '🎊 REGISTERED !',
            body: '© SHRII',
            mediaType: 1,
            thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
            sourceUrl: "https://github.com/KellumXz",
            renderLargerThumbnail: true
          }
        }
      }, { quoted: mek });
    } else reply("❌ Failed to register.");
  } catch (e) {
    console.error(e);
    reply("🔥 Error: " + e.message);
  }
});

// BAN
cmd({
  pattern: "ban",
  allowOnly: true,
  desc: "Ban user",
  category: "main",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { isOwner, senderNumber, reply }) => {
  if (!isOwner) return reply("❌ Only owner can use this.");
  const put = await fetch(path(senderNumber), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify("Band")
  });
  if (put.ok) {
    await conn.sendMessage(m.chat, {
      text: `🚫 *${senderNumber}* has been banned.`,
      contextInfo: {
        forwardingScore: 999, isForwarded: true,
        externalAdReply: {
          title: '💔 YOUR BANNED',
          body: '© SHRII',
          mediaType: 1,
          thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
          sourceUrl: "https://github.com/KellumXz",
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });
  } else reply("❌ Failed to ban.");
});

// DELETE SPECIFIC REG
cmd({
  pattern: "removeregister",
  allowOnly: true,
  desc: "Delete registered user",
  category: "main",
  react: "🗑️",
  filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
  if (!isOwner) return reply("❌ Only owner allowed.");
  if (!args[0]) return reply("❗ Usage: .deletereg 947XXXXXXXX");
  const number = args[0].replace(/\D/g, '');
  const del = await fetch(path(number), { method: 'DELETE' });
  if (del.ok) {
    await conn.sendMessage(m.chat, {
      text: `🗑️ *${number}* removed.`,
      contextInfo: {
        forwardingScore: 999, isForwarded: true,
        externalAdReply: {
          title: '♻️ REMOVE',
          body: '© SHRII',
          mediaType: 1,
          thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
          sourceUrl: "https://github.com/KellumXz",
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });
  } else reply("❌ Delete failed.");
});

// DELETE ALL DATABASE
cmd({
  pattern: "deldatabase",
  allowOnly: true,
  desc: "Delete full DB",
  category: "main",
  react: "⚠️",
  filename: __filename
}, async (conn, mek, m, { isOwner, senderNumber, reply }) => {
  if (!isOwner) return reply("❌ Only owner allowed.");
  pendingDeletes.add(senderNumber);
  await conn.sendMessage(m.chat, {
    text: `⚠️ *Are you sure to delete entire database?*\nReply with *1* within 30s.`,
    contextInfo: { forwardingScore: 999, isForwarded: true }
  }, { quoted: mek });

  setTimeout(() => {
    pendingDeletes.delete(senderNumber);
  }, 30000);
});

// MESSAGE LISTENER FOR DELETE CONFIRMATION
cmd.onEvents = (conn) => {
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      const msg = messages[0];
      if (!msg.message || type !== 'notify') return;
      const sender = msg.key.participant || msg.key.remoteJid;
      const number = sender.split('@')[0];
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (pendingDeletes.has(number) && text?.trim() === "1") {
        pendingDeletes.delete(number);
        const del = await fetch(path().replace(/\/\.json$/, '.json'), { method: 'DELETE' });
        if (del.ok) {
          await conn.sendMessage(msg.key.remoteJid, {
            text: "✅ *Database deleted successfully.*",
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              externalAdReply: {
                title: '🔥 DATABASE DELETED',
                body: '© SHRII',
                thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
                mediaType: 1,
                sourceUrl: "https://github.com/KellumXz",
                renderLargerThumbnail: true
              }
            }
          }, { quoted: msg });
        } else {
          conn.sendMessage(msg.key.remoteJid, { text: "❌ Delete failed." }, { quoted: msg });
        }
      }
    } catch (e) {
      console.error("confirm error:", e);
    }
  });
};

// SEND LISTS
async function sendList(conn, mek, m, type = "reg") {
  const url = path().replace(/\/\.json$/, '.json');
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data) return conn.sendMessage(m.chat, { text: "🚫 No data found." }, { quoted: mek });

    let filtered, title, emoji;
    switch (type) {
      case "allow":
        filtered = Object.entries(data).filter(([_, v]) => v === "Allow");
        title = "✅ ALLOW LIST"; emoji = "🟢"; break;
      case "ban":
        filtered = Object.entries(data).filter(([_, v]) => /ban/i.test(v));
        title = "🚫 BAN LIST"; emoji = "🔴"; break;
      default:
        filtered = Object.entries(data);
        title = "📃 REGISTERED LIST"; emoji = "📌";
    }

    const list = filtered.map(([num, status], i) => `*${i + 1}.* wa.me/${num} ~ _${status}_`).join('\n') || "🚫 No users found.";
    const text = `*╭─∘┈ ┈ ┈ ୨♡୧ ┈ ┈ ┈─•⪨*\n*┊*   ${emoji} *${title}*\n*╰─∘┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ─•⪨*\n\n${list}`;

    await conn.sendMessage(m.chat, {
      text,
      contextInfo: {
        forwardingScore: 999, isForwarded: true,
        externalAdReply: {
          title, body: 'KelumXz Firebase Bot',
          thumbnailUrl: 'https://files.catbox.moe/3e6xzq.jpg',
          mediaType: 1,
          sourceUrl: 'https://github.com/KellumXz',
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });
  } catch (e) {
    console.error(e);
    conn.sendMessage(m.chat, { text: "❌ Error: " + e.message }, { quoted: mek });
  }
}

// COMMANDS FOR LISTS
cmd({
  pattern: "allowlist",
  allowOnly: true,
  desc: "Show allowed users",
  category: "main",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { isOwner }) => {
  if (!isOwner) return conn.sendMessage(m.chat, { text: "❌ Owner only." }, { quoted: mek });
  await sendList(conn, mek, m, "allow");
});

cmd({
  pattern: "banlist",
  allowOnly: true,
  desc: "Show banned users",
  category: "main",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { isOwner }) => {
  if (!isOwner) return conn.sendMessage(m.chat, { text: "❌ Owner only." }, { quoted: mek });
  await sendList(conn, mek, m, "ban");
});

cmd({
  pattern: "reglist",
  allowOnly: true,
  desc: "Show all users",
  category: "main",
  react: "📃",
  filename: __filename
}, async (conn, mek, m, { isOwner }) => {
  if (!isOwner) return conn.sendMessage(m.chat, { text: "❌ Owner only." }, { quoted: mek });
  await sendList(conn, mek, m, "reg");
});
