const mariadb = require('mariadb')
const dbConfig = require('./db.config.json.js');


const dbConnection = async () => {
    return mariadb.createConnection({
        host: dbConfig.db.host,
        database: dbConfig.db.database,
        user: dbConfig.db.user,
        password: dbConfig.db.password,
        trace: true,
        bigIntAsNumber: true,
        decimalAsNumber: true,
    })
}

/**
 * 
 * @param {(conn: mariadb.Connection) => Promise<any>} fn 
 * @returns { Promise<any[]> }
 */
async function query(fn) {
    const conn = await dbConnection()
    try {
        const res = await fn(conn)
        delete res.meta 
        return res 
    }
    finally {
        conn.end()
    }
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
        return result;
    }
    catch (e) {
        console.log('rolling back. Error is:', e.message);
        await conn.query("ROLLBACK");
        throw e;
    }
    finally {
        conn.end()
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