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
 */
async function query(fn) {
    const client = await dbClient()
    const res = await fn(client);
    client.end()
    return res.rows;
}

async function userList() {
    const rows = await query((client) => {
        return client.query('SELECT * FROM users')
    });
    // console.log(rows)
    return rows;
}

async function insertUser(email, hashedPassword) {
    const userId = new Date().getTime(); 
    const rows = await query(client => {
        const stmt = 'INSERT INTO users(user_id, email, hashed_password) VALUES($1, $2, $3) RETURNING *';
        const values = [userId, email, hashedPassword];
        return client.query(stmt, values);
    });
    console.log(rows);
    return rows;
}

// userList()
// insertUser('chuck@norris.com', 'chucky')
// .then(v => console.log('inserted, result is',v))
// .catch(e => console.error(e))

userList().then(console.log);