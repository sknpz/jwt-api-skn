const Category = require('./category.model');

const categoryService = {
    create: async (data) => {
        return await Category.create(data);
    },
    findAll: async () => {
        return await Category.findAll();
    },
    findById: async (id) => {
        return await Category.findByPk(id);
    },
    update: async (id, data) => {
        const category = await Category.findByPk(id);
        if (!category) {
            return null;
        }
        return await category.update(data);
    },
    remove: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) {
            return null;
        }
        // regra 6 (409 se tiver livros) entra quando o model Book existir
        await category.destroy();
        return category;
    }
};

module.exports = categoryService;
