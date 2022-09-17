const { Client } = require('pg')
const mariadb = require('mariadb')
const dbConfig = require('./db.config.json.js');


const dbConnection = async () => {
    return mariadb.createConnection({
        host: dbConfig.db.host,
        database: dbConfig.db.database,
        user: dbConfig.db.user,
        password: dbConfig.db.password,
        trace: true
    })
}



/**
 * 
 * @param {(client: mariadb.Connection) => Promise<any>} fn 
 * @returns { Promise<any[]> }
 */
async function query(fn) {
    const res = await fn(await dbConnection());
    delete res.meta 
    return res 
}

/**
 *
 * @param {(tQuery: transactionQuery) => Promise<any>} fn
 * @returns { Promise<any> }
 */
async function transaction(fn) {
    const conn = await dbConnection()
    await conn.query('BEGIN');
    try {
        const result = await fn(transactionQuery);
        await conn.query("COMMIT");
        conn.end();
        return result;
    }
    catch (e) {
        console.log('rolling back. Error is:', e.message);
        await conn.query("ROLLBACK");
        throw e;
    }
    async function transactionQuery(fn) {
        const res = await fn(conn);
        delete res.meta
        return res
    }
}

module.exports = {
    query,
    transaction
};