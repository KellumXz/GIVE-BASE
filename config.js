const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
DELETE_MESSAGES:"private",
OWNER_NUMBER:"94755084612",
READ_MESSAGE: "true",
AUTO_STATUS_SEEN: "true",
AUTO_STATUS_REACT: "true",
ONE_VIEW:"on",
AUTO_STATUS_REPLY:"ture",
AUTO_STATUS_MSG:"*Seen Now*",
PASSWORD:"Kalum@2008",
SESSION_ID: process.env.SESSION_ID || "KELUMXZ=v1Jy3BJT#jVY-VsgOh23JF4IMyw7prtkqF5wC8k_Ll9eIgfRmr3M",
CREATE_NUMBER:"94766927934"
};
