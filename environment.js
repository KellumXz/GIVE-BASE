const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "KELUMXZ=v1Jy3BJT#jVY-VsgOh23JF4IMyw7prtkqF5wC8k_Ll9eIgfRmr3M",
CREATE_NUMBER:"94766927934"
};
