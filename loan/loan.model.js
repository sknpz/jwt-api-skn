const db = require('../config/db');
const { DataTypes } = require('sequelize');
const { today } = require('../utils/date');

const LOAN_STATUS = {
    ATIVO: 'ATIVO',
    DEVOLVIDO: 'DEVOLVIDO',
    ATRASADO: 'ATRASADO'
};

const Loan = db.define('Loan', {
    loanDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
        allowNull: false,
        defaultValue: LOAN_STATUS.ATIVO,
        // No SQLite o ENUM vira texto e aceita qualquer valor: quem barra é o isIn.
        validate: {
            isIn: {
                args: [Object.values(LOAN_STATUS)],
                msg: 'Status de empréstimo inválido'
            }
        },
        // ATRASADO não é gravado: é calculado na leitura a partir do prazo (regra 5).
        get() {
            const status = this.getDataValue('status');
            const dueDate = this.getDataValue('dueDate');
            if (status === LOAN_STATUS.ATIVO && dueDate < today()) {
                return LOAN_STATUS.ATRASADO;
            }
            return status;
        }
    },
    fine: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Loan;
module.exports.LOAN_STATUS = LOAN_STATUS;
