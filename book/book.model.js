const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Book = db.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O título é obrigatório' },
            notEmpty: { msg: 'O título é obrigatório' }
        }
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'O ISBN é obrigatório' },
            notEmpty: { msg: 'O ISBN é obrigatório' }
        }
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: { msg: 'O ano deve ser um número inteiro' }
        }
    },
    totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: { msg: 'O total de exemplares deve ser um número inteiro' },
            min: { args: [0], msg: 'O total de exemplares não pode ser negativo' }
        }
    },
    availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: { msg: 'Os exemplares disponíveis devem ser um número inteiro' },
            min: { args: [0], msg: 'Os exemplares disponíveis não podem ser negativos' }
        }
    }
}, {
    validate: {
        availableNotAboveTotal() {
            if (this.availableCopies > this.totalCopies) {
                throw new Error('Os exemplares disponíveis não podem passar do total');
            }
        }
    }
});

module.exports = Book;
