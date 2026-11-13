const { Op } = require('sequelize');
const db = require('../config/db');
const { Loan, Book, Reader, User } = require('../models');
const { LOAN_STATUS } = require('./loan.model');
const HttpError = require('../utils/httpError');
const { today, addDays, daysBetween } = require('../utils/date');

const LOAN_DAYS = 7;
const MAX_ACTIVE_LOANS = 3;
const FINE_PER_DAY = 1;

const INCLUDE = [
    { model: Book, as: 'book', attributes: ['id', 'title', 'isbn'] },
    { model: Reader, as: 'reader', attributes: ['id', 'name', 'cpf'] },
    { model: User, as: 'user', attributes: ['id', 'name'] }
];

const whereForStatus = (status) => {
    if (status === LOAN_STATUS.ATIVO) {
        return { status: LOAN_STATUS.ATIVO, dueDate: { [Op.gte]: today() } };
    }
    if (status === LOAN_STATUS.ATRASADO) {
        return { status: LOAN_STATUS.ATIVO, dueDate: { [Op.lt]: today() } };
    }
    return { status };
};

const parseId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id)) {
        throw new HttpError(400, 'Informe o livro e o leitor do empréstimo');
    }
    return id;
};

const loanService = {
    create: async (data, userId) => {
        const bookId = parseId(data?.bookId);
        const readerId = parseId(data?.readerId);

        // Transação única (regra 7): segura a escrita, então dois empréstimos não pegam o último exemplar.
        const loanId = await db.transaction(async (transaction) => {
            const book = await Book.findByPk(bookId, { transaction });
            if (!book) {
                throw new HttpError(404, 'Livro não encontrado');
            }
            const reader = await Reader.findByPk(readerId, { transaction });
            if (!reader) {
                throw new HttpError(404, 'Leitor não encontrado');
            }
            if (book.availableCopies <= 0) {
                throw new HttpError(409, 'Não há exemplares disponíveis deste livro');
            }
            const overdue = await Loan.count({
                where: { readerId, ...whereForStatus(LOAN_STATUS.ATRASADO) },
                transaction
            });
            if (overdue > 0) {
                throw new HttpError(409, 'O leitor tem empréstimo em atraso e não pode pegar outro livro');
            }
            const active = await Loan.count({
                where: { readerId, ...whereForStatus(LOAN_STATUS.ATIVO) },
                transaction
            });
            if (active >= MAX_ACTIVE_LOANS) {
                throw new HttpError(409, `O leitor já tem ${MAX_ACTIVE_LOANS} empréstimos ativos, o máximo permitido`);
            }

            const loanDate = today();
            const loan = await Loan.create({
                bookId,
                readerId,
                userId,
                loanDate,
                dueDate: addDays(loanDate, LOAN_DAYS)
            }, { transaction });
            await book.update({ availableCopies: book.availableCopies - 1 }, { transaction });
            return loan.id;
        });
        return Loan.findByPk(loanId, { include: INCLUDE });
    },

    returnLoan: async (id) => {
        const found = await db.transaction(async (transaction) => {
            const loan = await Loan.findByPk(id, { transaction });
            if (!loan) {
                return false;
            }
            if (loan.status === LOAN_STATUS.DEVOLVIDO) {
                throw new HttpError(409, 'Este empréstimo já foi devolvido');
            }
            const returnDate = today();
            const daysLate = Math.max(daysBetween(loan.dueDate, returnDate), 0);
            await loan.update({
                returnDate,
                status: LOAN_STATUS.DEVOLVIDO,
                fine: daysLate * FINE_PER_DAY
            }, { transaction });
            const book = await Book.findByPk(loan.bookId, { transaction });
            await book.update({ availableCopies: book.availableCopies + 1 }, { transaction });
            return true;
        });
        return found ? Loan.findByPk(id, { include: INCLUDE }) : null;
    },

    findAll: async ({ status }) => {
        if (status !== undefined && !Object.values(LOAN_STATUS).includes(status)) {
            throw new HttpError(400, 'Status inválido: use ATIVO, ATRASADO ou DEVOLVIDO');
        }
        return await Loan.findAll({
            where: status ? whereForStatus(status) : {},
            include: INCLUDE,
            order: [['loanDate', 'DESC'], ['id', 'DESC']]
        });
    },

    findByReader: async (readerId) => {
        const reader = await Reader.findByPk(readerId);
        if (!reader) {
            return null;
        }
        return await Loan.findAll({
            where: { readerId },
            include: INCLUDE,
            order: [['loanDate', 'DESC'], ['id', 'DESC']]
        });
    },

    countByStatus: async (status) => {
        return await Loan.count({ where: whereForStatus(status) });
    }
};

module.exports = loanService;
