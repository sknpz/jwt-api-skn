const loanService = require('./loan.service');
const foundOr404 = require('../utils/foundOr404');

const loanController = {
    create: async (req, res) => {
        res.status(201).json(await loanService.create(req.body, req.user.id));
    },
    returnLoan: async (req, res) => {
        res.json(foundOr404(await loanService.returnLoan(req.params.id), 'Empréstimo não encontrado'));
    },
    findAll: async (req, res) => {
        res.json(await loanService.findAll(req.query));
    }
};

module.exports = loanController;
