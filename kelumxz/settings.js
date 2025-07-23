const { getAllUserEnv } = require('./settingsdb');

let envsettings = {}; // in-memory settings

async function initEnvsettings() {
  envsettings = await getAllUserEnv();
  console.log("⚙️ Settings load Done !");
}

function KelumXzsettings(key) {
  return envsettings[key] || null;
}

function updateEnvsettings(key, value) {
  envsettings[key] = value;
}

function getFullEnvsettings() {
  return envsettings;
}

module.exports = {
  initEnvsettings,
  KelumXzsettings,
  updateEnvsettings,
  getFullEnvsettings
};
