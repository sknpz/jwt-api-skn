const { Book, Loan } = require('../models');
const { LOAN_STATUS } = require('../loan/loan.model');
const loanService = require('../loan/loan.service');

const reportService = {
    dashboard: async () => {
        const [totalBooks, activeLoans, overdueLoans, totalFines] = await Promise.all([
            Book.count(),
            loanService.countByStatus(LOAN_STATUS.ATIVO),
            loanService.countByStatus(LOAN_STATUS.ATRASADO),
            Loan.sum('fine')
        ]);
        return { totalBooks, activeLoans, overdueLoans, totalFines: totalFines ?? 0 };
    }
};

module.exports = reportService;
