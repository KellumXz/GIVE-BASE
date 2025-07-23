const { cmd } = require('../kelumxz/command');
const { updateUserEnv } = require('../kelumxz/settingsdb');
const { sleep } = require('../lib/functions');
const { exec } = require("child_process");

cmd({
    pattern: "settings",
    desc: "To get the menu.",
    react: "📚",
    category: "main",
    allowOnly: true,
  filename: __filename
},
async(conn, mek, m,{from,users , quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
let menumsg = `╭╌╌╌◯
┆ \`ャ ONLINE ャ\`
┆ *◌ .setonline* Always online
┆ *◌ .setoffline* Always offline
╰╌╌╌◯
╭╌╌╌◯
┆ \`ャ PRESENCE ャ\`
┆ *◌ .nonpre* No action
┆ *◌ .faketyping* Fake typing action
┆ *◌ .fakerecoding* Fake recording action
┆ *◌ .fakerectyping* recoding & typing action
╰╌╌╌◯
╭╌╌╌◯
┆ \`ャ REACT ャ\`
┆ *◌ .autoreacton* Message reaction on
┆ *◌ .autoreactoff* Message reaction off
╰╌╌╌◯`;

await conn.sendMessage(
    m.chat,
    {
        document: fs.readFileSync("./package.json"),
        fileName: "FUCKYOU",
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileLength: 99999999999999,
        pageCount: 2024,
        caption: menumsg,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: 'FUCKYOU',
                newsletterJid: "120363373642098017@newsletter"
            },
            externalAdReply: {
                title: "KelumXz",
                body: ' Test md',
                thumbnailUrl: 'https://i.ibb.co/LtDg0DV/31a34fdb88271d7f.jpg',
                sourceUrl: "https://github.com/",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    },
    { quoted: mek }
);

} catch(e){
    console.log(e)
    reply(`${e}`)
}
})

cmd({
    pattern: "setonline",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_TYPE: "on",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "setoffline",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_TYPE: "off",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "nonpre",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_FAKE: "off",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "faketyping",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_FAKE: "typing",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "fakerecoding",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_FAKE: "recording",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "fakerectyping",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    PRESENCE_FAKE: "both",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "autoreacton",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    AUTO_REACT: "on",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});

cmd({
    pattern: "autoreactoff",
    desc: "Change bot to Style 1 and restart",
    category: "owner",
    react: "🛜",
    allowOnly: true,
  filename: __filename,
    onlyOwner: true,
}, async (conn, m) => {
    try {
        const newValues = {
    AUTO_REACT: "off",
        };

        // Update each value in Firebase
        for (const key in newValues) {
            await updateUserEnv(key, newValues[key]);
        }

        await m.reply(
            `💕 Updated\n\n` +
            `🔁 Restarting bot...`
        );


    } catch (e) {
        console.error(e);
        await m.reply("❌ Failed to apply Style 1 and restart. Check console.");
    }
});
