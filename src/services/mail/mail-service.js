const nodemailer = require('nodemailer');
const mailConfig = require('./mail.config.json.js');


const awsSesSmtpMailSetup = {
    host: mailConfig.mail.host,
    port: 587,
    secure: false,
    auth: {
        user: mailConfig.mail.auth.user,
        pass: mailConfig.mail.auth.pass
    }
};

/**
 * 
 * @param {SendMailParam} param0
 * @returns 
 */
async function sendEmailNotification({ recipientList, ccList, subject, html }) {
    const transporter = nodemailer.createTransport(awsSesSmtpMailSetup);

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `"${mailConfig.mail.from.name}" <${mailConfig.mail.from.email}>`,
        to: recipientList,
        cc: ccList,
        subject,
        html
    });
    console.log('Message sent', info.messageId, info);
    return info;
}



module.exports = { sendEmailNotification }