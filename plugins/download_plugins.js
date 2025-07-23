const axios = require("axios");
const cheerio = require('cheerio');
const { cmd } = require('../kelumxz/command');
const { fetchJson } = require('../lib/functions');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
//const apkdl = require('../lib/apkdl');
const path = require("path");
//=======================================
cmd({
  pattern: "tiktok",
  alias: ["ttdl", "tt", "tiktokdl"],
  desc: "Download TikTok video without watermark",
  category: "downloader",
  react: "🎥",
  allowOnly: true,
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply("🔗 *Please provide a TikTok video link.*");
    if (!q.includes("tiktok.com")) return reply("❌ *Invalid TikTok link.*");
    const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.data) {
      return reply("❌ Failed to fetch TikTok video.");
    }
    const { title, like, comment, share, author, meta, cover } = data.data;
    const video = meta.media.find(v => v.type === "video");
    const videoUrl = video?.org;
    if (!videoUrl) return reply("❌ Video URL not found.");
    const caption =`乂  *T I K T O K - D L*\n*◦  Creator |* ${author.nickname}
> ✨ \`KELUMXZ-MINI BOT\`` ;
    await conn.sendMessage(
      from,
      {
        video: { url: videoUrl },
        caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: `${author.nickname} | TikTok`,
            body: title,
            thumbnailUrl: cover || "https://files.catbox.moe/gtg2a2.jpg", // fallback thumbnail
            sourceUrl: q,
            mediaType: 1,
            renderLargerThumbnail: true
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-MINI BOT",
          }
        }
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error("TikTok Downloader Error:", e);
    reply(`❌ *An error occurred:* ${e.message}`);
  }
});
//=======================================
const api = `https://nethu-api-ashy.vercel.app`;
//=======================================
cmd({
  pattern: "fb",
  react: "🎥",
  alias: ["facebook", "fbb", "fbvideo"],
  desc: "Download HD/SD videos from Facebook",
  category: "download",
  use: '.fb <facebook_url>',
  allowOnly: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🚩 *Please provide a valid Facebook video URL!*");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);

    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("🚫 *Video not found or unsupported link.*");
    }

    const isHD = fb.result.hd ? true : false;
    const videoUrl = isHD ? fb.result.hd : fb.result.sd;
    const qualityTag = isHD ? "HD" : "SD";

    const caption = `乂  *F B - D L*
    \`	◦  KELUMXZ-MINI BOT !\``;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      caption: caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-MINI BOT",
        },
        externalAdReply: {
          title: "KELUMXZ-MINI",
          body: 'Facebook HD/SD Video Downloader',
          thumbnailUrl: 'https://files.catbox.moe/gtg2a2.jpg',
          sourceUrl: "https://github.com/niko-boy3/ElsaX_MD",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ *ERROR:* Something went wrong. Please try again later.");
  }
});
//=======================================

cmd({
  pattern: "img",
  alias: ["image", "googleimage", "searchimg"],
  react: "🏕️",
  desc: "Search and download Google images",
  category: "fun",
  use: ".img <keywords>",
  allowOnly: true,
  filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
  try {
    const query = args.join(" ");
    if (!query) {
      return reply("*E R R O R❕*.\n> Example: .img cute cats");
    };
    const url = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    if (!data?.success || !data.results?.length) {
      return reply("❌ No images found. Try a different keyword.");
    }
    const selectedImages = data.results.sort(() => 0.5 - Math.random()).slice(0, 1); // Only 3 for simplicity
    for (const imageUrl of selectedImages) {
      await conn.sendMessage(
        from,
        {
          image: { url: imageUrl },
          caption: `📷 *Result for:* ${query}\n> ✨ \`KELUMXZ-MINI BOT\``,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
              title: "IMAGE SEARCH",
              body: `🔎 ${query}`,
              thumbnailUrl: imageUrl,
              sourceUrl: "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query),
              mediaType: 1,
              renderLargerThumbnail: true
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-MINI BOT",
            }
          }
        },
        { quoted: mek }
      );
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for anti-spam
    }
  } catch (err) {
    console.error("Image Search Error:", err);
    reply("❌ Error fetching image. Please try again.");
  }
});

//=======================================

cmd({
  pattern: "ringtone",
  alias: ["ringtones", "ring"],
  desc: "Get a random ringtone from the API.",
  react: "🎵",
  category: "fun",
  allowOnly: true,
  filename: __filename,
},
async (conn, mek, m, { from, reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) {
      return reply("🎵 Please provide a search keyword.\nExample: .ringtone Suna");
    }
    await reply(`🔍 Searching ringtones for: *${query}* ...`);
    const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);
    if (!data.status || !data.result || data.result.length === 0) {
      return reply("❌ No ringtones found. Try different keywords.");
    }
    const tone = data.result[Math.floor(Math.random() * data.result.length)];
    await conn.sendMessage(
      from,
      {
        audio: { url: tone.dl_link },
        mimetype: "audio/mpeg",
        fileName: `${tone.title}.mp3`,
        ptt: false,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: `🎵 Ringtone: ${tone.title}`,
            body: `🔊 Search: ${query}`,
            thumbnailUrl: "https://files.catbox.moe/gtg2a2.jpg", // Replace with any image you like
            mediaType: 1,
            sourceUrl: tone.dl_link, // Optional: make it clickable to download directly
            renderLargerThumbnail: true
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420985544024@newsletter',
        newsletterName: "🎀 KELUMXZ-MINI BOT",
          }
        }
      },
      { quoted: mek }
    );
  } catch (error) {
    console.error("Ringtone Error:", error);
    reply("❌ Error: Could not fetch ringtone. Try again later.");
  }
});

//=======================================

cmd({
  pattern: "tourl",
  alias: ["imgtourl", "imgurl", "url", "geturl", "upload"],
  react: '⛓️‍💥',
  desc: "Convert media to Catbox URL",
  category: "utility",
  use: ".tourl [reply to media]",
  allowOnly: true,
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

    if (!mimeType) {
      throw "⚠️ Please reply to an image, video, or audio file!";
    }

    // Download media
    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Determine file extension
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio')) extension = '.mp3';

    const fileName = `file${extension}`;

    // Prepare form data
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
    form.append('reqtype', 'fileupload');

    // Upload to Catbox
    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    if (!response.data || !response.data.startsWith("https://")) {
      throw "❌ Failed to upload to Catbox.";
    }

    const mediaUrl = response.data;
    fs.unlinkSync(tempFilePath);

    // Determine media type
    let mediaType = '📁 File';
    if (mimeType.includes('image')) mediaType = '🖼 Image';
    else if (mimeType.includes('video')) mediaType = '🎞 Video';
    else if (mimeType.includes('audio')) mediaType = '🎵 Audio';

    // Format message
    const contextMsg =
`*⛓️‍💥Ur :l* ${mediaUrl}

"${mediaType} •* ${formatBytes(mediaBuffer.length)}
> *🖇 bY: KelumXz*`;

    // Send reply with newsletter-style context
    await client.sendMessage(message.chat, {
      text: contextMsg,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420985544024@newsletter", // Your channel JID
          newsletterName: config.CHANNEL_NAME || "🎀 KELUMXZ-MINI BOT"
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    await reply(`❌ *Upload Failed!*\n\n_Reason:_ ${error.message || error}`);
  }
});

// Helper
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

//=======================================