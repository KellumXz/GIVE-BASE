const commands = [];
const fetch = require('node-fetch');
const { CREATE_NUMBER } = require('./config');

// 🔗 Normal User Database
const firebasePath = (number = '') =>
  `https://kelumxz-default-rtdb.asia-southeast1.firebasedatabase.app/${CREATE_NUMBER}/${number}.json`;

// 💎 Premium User Database
const premiumPath = (number = '') =>
  `https://kalumxz-premium-default-rtdb.asia-southeast1.firebasedatabase.app/${CREATE_NUMBER}/${number}.json`;

// 📡 Get Normal Status
const getUserStatus = async (number) => {
  try {
    const res = await fetch(firebasePath(number));
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch {
    return null;
  }
};

// 📡 Get Premium Status
const getPremiumStatus = async (number) => {
  try {
    const res = await fetch(premiumPath(number));
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch {
    return null;
  }
};

// 🔐 Message Handler
const sendBlockedMessage = async (conn, m, mek, type = "banned") => {
  let messageData = {
    banned: {
      text: "*Ops..!*",
      title: '❗ You are BANNED',
      body: '© KELUMXZ-MD',
      caption: `*• Your request failed !*\n> You are banned. Therefore, you cannot use the bot.\n\n👤 Owner : +${CREATE_NUMBER}`,
      thumbnail: 'https://i.ibb.co/mF5x4d7D/a398ed130673ea30a799c18606b6d841.jpg',
      source: 'https://wa.me/' + CREATE_NUMBER
    },
    not_registered: {
      text: "*• Oops baby !*\n`• Use : .registere`\n> 🎀 You are not registered yet!",
      title: '🔐 Registration Required',
      body: '© KELUMXZ-MD',
      caption: 'Please register to continue',
      thumbnail: 'https://i.ibb.co/mF5x4d7D/a398ed130673ea30a799c18606b6d841.jpg',
      source: 'https://wa.me/' + CREATE_NUMBER
    },
    premium_required: {
      text: "*• Premium Only Command !*",
      title: '💎 Premium Access Required',
      body: '© KELUMXZ-MD',
      caption: `*• This command is for Premium users only !*\n> Buy premium to access this command.\n\n👤 Contact Owner: +${CREATE_NUMBER}`,
      thumbnail: 'https://i.ibb.co/mF5x4d7D/a398ed130673ea30a799c18606b6d841.jpg',
      source: 'https://wa.me/' + CREATE_NUMBER
    }
  };

  const msg = messageData[type];

  return conn.sendMessage(m.chat, {
    text: msg.text,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: msg.title,
        body: msg.body,
        mediaType: 1,
        thumbnailUrl: msg.thumbnail,
        sourceUrl: msg.source,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: mek });
};

// 🧩 Command Registration
function cmd(info, func) {
  const data = info;

  data.function = async function (conn, mek, m, extra) {
    const sender = extra.senderNumber;

    let normalStatus = null;
    let premiumStatus = null;

    // 🔒 Check for Normal DB
    if (info.allowOnly) {
      normalStatus = await getUserStatus(sender);

      if (!normalStatus) {
        return sendBlockedMessage(conn, m, mek, "not_registered");
      }

      if (normalStatus === "Banned" || normalStatus === "Band") {
        return sendBlockedMessage(conn, m, mek, "banned");
      }

      if (normalStatus !== "Allow") {
        return sendBlockedMessage(conn, m, mek, "not_registered");
      }
    }

    // 💎 Check for Premium DB
    if (info.premiumOnly) {
      premiumStatus = await getPremiumStatus(sender);

      if (!premiumStatus || premiumStatus !== "Allow") {
        return sendBlockedMessage(conn, m, mek, "premium_required");
      }
    }

    // ✅ Run the actual command
    return func(conn, mek, m, extra);
  };

  // 🔧 Defaults
  if (!data.dontAddCommandList) data.dontAddCommandList = false;
  if (!data.desc) data.desc = '';
  if (!data.fromMe) data.fromMe = false;
  if (!data.category) data.category = 'misc';
  if (!data.filename) data.filename = 'Not Provided';

  commands.push(data);
  return data;
}

module.exports = {
  cmd,
  commands
};