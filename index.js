const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');
require('./models');
const express = require('express');
const cors = require('cors');
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const categoryRouter = require('./category/category.router');
const authorRouter = require('./author/author.router');
const bookRouter = require('./book/book.router');
const readerRouter = require('./reader/reader.router');
const loanRouter = require('./loan/loan.router');
const reportRouter = require('./report/report.router');
const seedAdmin = require('./user/user.seed');
const errorHandler = require('./utils/errorHandler');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.frontend_url,
    credentials: true
}));
app.use(express.json());


app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/categories', categoryRouter);
app.use('/v1/authors', authorRouter);
app.use('/v1/books', bookRouter);
app.use('/v1/readers', readerRouter);
app.use('/v1/loans', loanRouter);
app.use('/v1/reports', reportRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
app.use(errorHandler);

const start = async () => {
    await db.sync();
    await seedAdmin();
    app.listen(PORT, () => {
        console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
    });
};

start();