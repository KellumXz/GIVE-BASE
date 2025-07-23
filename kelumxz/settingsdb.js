const axios = require('axios');
const config = require('../config');

const BASE_URL = 'https://shriiy-default-rtdb.asia-southeast1.firebasedatabase.app';

// 🔧 Random ID generator with mix letters + numbers
function generateRandomId(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// 🔁 Update one key in Firebase under user
async function updateUserEnv(key, value) {
  const userId = config.CREATE_NUMBER;
  if (!userId) throw new Error("CREATE_NUMBER missing");

  const res = await axios.put(`${BASE_URL}/${userId}/${key}.json`, JSON.stringify(value));
  return res.data;
}

// 🔍 Get one key from Firebase under user
async function getUserEnv(key) {
  const userId = config.CREATE_NUMBER;
  if (!userId) throw new Error("CREATE_NUMBER missing");

  const res = await axios.get(`${BASE_URL}/${userId}/${key}.json`);
  return res.data;
}

// 📦 Get all keys from Firebase for the user
async function getAllUserEnv() {
  const userId = config.CREATE_NUMBER;
  if (!userId) throw new Error("CREATE_NUMBER missing");

  const res = await axios.get(`${BASE_URL}/${userId}.json`);
  return res.data || {};
}

// 🚀 Initialize missing keys (default values + custom ID)
async function initUserEnvIfMissing() {
  const userId = config.CREATE_NUMBER;
  if (!userId) {
    console.error("❌ CREATE_NUMBER is missing in config.js");
    return;
  }

  const defaults = {
    AUTO_REACT: "off",
    PRESENCE_TYPE: "on",
    PRESENCE_FAKE: "both",
    CREATE_NB: userId
  };

  // 🆔 Custom ID creation with prefix if not exists
  const existingId = await getUserEnv('id');
  if (!existingId) {
    const newId = `KELUMXZ=${generateRandomId()}`;
    await updateUserEnv('id', newId);
    console.log(`✅ Generated new ID for user: ${newId}`);
  } else {
    console.log(`ℹ️ User already has ID: ${existingId}`);
  }

  // 🧱 Set default values if missing
  for (const key in defaults) {
    const current = await getUserEnv(key);
    if (current === null || current === undefined) {
      await updateUserEnv(key, defaults[key]);
      console.log(`✅ Initialized [${userId}] ${key} = ${defaults[key]}`);
    } else {
      console.log(`ℹ️ [${userId}] ${key} already exists (${current})`);
    }
  }
}

module.exports = {
  updateUserEnv,
  getUserEnv,
  getAllUserEnv,
  initUserEnvIfMissing
};
