const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.frontend_url,
    credentials: true
}));
app.use(express.json());


app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);

db.sync()
app.listen(PORT, () => {
    console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
});