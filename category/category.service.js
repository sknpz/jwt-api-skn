const { Category } = require('../models');
const HttpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'description'];

const categoryService = {
    create: async (data) => {
        return await Category.create(pick(data, FIELDS));
    },
    findAll: async () => {
        return await Category.findAll({ order: [['name', 'ASC']] });
    },
    findById: async (id) => {
        return await Category.findByPk(id);
    },
    update: async (id, data) => {
        const category = await Category.findByPk(id);
        if (!category) {
            return null;
        }
        return await category.update(pick(data, FIELDS));
    },
    remove: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) {
            return null;
        }
        if (await category.countBooks() > 0) {
            throw new HttpError(409, 'Não é possível excluir: a categoria tem livros cadastrados');
        }
        await category.destroy();
        return category;
    }
};

module.exports = categoryService;
