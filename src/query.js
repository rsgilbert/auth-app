const { Client } = require('pg')

async function dbClient() {
    const client = new Client({
        host: 'localhost',
        database: 'auth',
        user: 'postgres',
        password: 'stanislav100'
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


module.exports = query;