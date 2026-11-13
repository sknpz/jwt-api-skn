const sequelize = require('sequelize');

const db = new sequelize( {
    dialect: 'sqlite',
    storage: './database.sqlite',
    // IMMEDIATE: a transação já nasce com a trava de escrita; evita "database is locked".
    transactionType: 'IMMEDIATE'
});

module.exports = db;
