const dotenv = require('dotenv')
dotenv.config();

const { env } = process;
module.exports = {
    mail: {
        from: {
            name: env.MAIL_FROM_NAME,
            email: env.MAIL_FROM_EMAIL
        },
        /** 
         * Credentials for accessing email account. 
         * For AWS-SES both user and password are generated from the AWS SES account dashboard. 
         * For google, you generate what they call an app password. The user is the email address.
         */
        auth: {
            user: env.MAIL_AUTH_USER,
            pass: env.MAIL_AUTH_PASS
        },
        host: env.MAIL_HOST
    }
}