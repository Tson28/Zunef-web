const transporter = require('../../config/mailer');
const dotenv = require('dotenv');
dotenv.config();

const sendMail = async(to,subject,text,html) => {
    return transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    })
}
module.exports = sendMail;