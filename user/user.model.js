const db = require('../config/db');
const { DataTypes } = require('sequelize');
const User = db.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O nome é obrigatório' },
            notEmpty: { msg: 'O nome é obrigatório' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'O e-mail é obrigatório' },
            isEmail: { msg: 'E-mail inválido' }
        }
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'O nome de usuário é obrigatório' },
            notEmpty: { msg: 'O nome de usuário é obrigatório' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {}
    }
});

module.exports = User;
