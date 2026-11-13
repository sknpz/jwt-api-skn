const { Op } = require('sequelize');
const { Reader } = require('../models');
const pick = require('../utils/pick');

const FIELDS = ['name', 'cpf', 'email', 'phone'];

const readerService = {
    create: async (data) => {
        return await Reader.create(pick(data, FIELDS));
    },
    findAll: async ({ search }) => {
        const where = {};
        if (typeof search === 'string' && search) {
            const conditions = [{ name: { [Op.substring]: search } }];
            const digits = search.replace(/\D/g, '');
            if (digits) {
                conditions.push({ cpf: { [Op.substring]: digits } });
            }
            where[Op.or] = conditions;
        }
        return await Reader.findAll({ where, order: [['name', 'ASC']] });
    },
    findById: async (id) => {
        return await Reader.findByPk(id);
    },
    update: async (id, data) => {
        const reader = await Reader.findByPk(id);
        if (!reader) {
            return null;
        }
        return await reader.update(pick(data, FIELDS));
    }
};

module.exports = readerService;
