const query  = require('./query.js');
const express = require('express')
const passport = require('passport');
const bearerStrategy = require('./auth/bearer-strategy.js');
const authRouter = require('./routes/auth-router.js');
const userRouter = require('./routes/user-router.js');

passport.use(bearerStrategy);
const app = express();

app.use(authRouter);
app.use(userRouter);

app.get('/', (req, res) => res.send('Success, running'));

app.get('/users/:id', async (req, res) => {
    const stmt = 'SELECT user_id, email FROM users WHERE user_id = $1';
    const values = [req.params.id];
    const users = await query(client => client.query(stmt, values));
    const user = users[0];
    if(!user) {
        res.statusCode = 404;
        return res.send('No user with user_id ' + values[0])
    }
    res.json(user);
});



const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('running on port', port));




