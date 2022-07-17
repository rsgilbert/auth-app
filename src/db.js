const { Client } = require('pg')
const dbConfig = require('./db.config.json.js');

async function dbClient() {
    const client = new Client({
        host: dbConfig.db.host,
        database: dbConfig.db.database,
        user: dbConfig.db.user,
        password: dbConfig.db.password
    });
    await client.connect()
    return client;
}

/**
 * 
 * @param {(client: Client) => Promise<any>} fn 
 * @returns { Promise<any[]> }
 */
async function query(fn) {
    const client = await dbClient()
    const res = await fn(client);
    client.end()
    // console.log(res)
    return res.rows;
}

/**
 *
 * @param {(tQuery: transactionQuery) => Promise<any>} fn
 * @returns { Promise<any> }
 */
async function transaction(fn) {
    const client = await dbClient()
    await client.query('BEGIN');
    try {
        const result = await fn(transactionQuery);
        await client.query("COMMIT");
        client.end();
        return result;
    }
    catch(e) {
        console.log('rolling back. Error is:', e.message);
        await client.query("ROLLBACK");
        throw e;
    }
    async function transactionQuery(fn) {
        const res = await fn(client);
        return res.rows;
    }
}

module.exports = {
    query,
    transaction
};