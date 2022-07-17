const express = require('express')
const passport = require('passport');
const bearerStrategy = require('./auth/bearer-strategy.js');
const authRouter = require('./routes/auth-router.js');
const userRouter = require('./routes/user-router.js');
const morgan = require('morgan');

passport.use(bearerStrategy);
const app = express();
app.use(morgan('tiny', { immediate: true })); // log the moment request hits the server
app.use(morgan('tiny'));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => res.send('Success, running'));
app.get('/test', (req, res) => res.send("Test successful. App is running"));

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('running on port', port));




