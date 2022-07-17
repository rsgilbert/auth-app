const dotenv = require('dotenv')
dotenv.config();

const { env } = process;
module.exports = {
    db: {
        host: env["DB_HOST"],
        database: env["DB_DATABASE"],
        user: env["DB_USER"],
        password: env["DB_PASSWORD"]
    }
}