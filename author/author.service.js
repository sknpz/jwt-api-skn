const { Author } = require('../models');
const HttpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'nationality', 'birthDate'];

const authorService = {
    create: async (data) => {
        return await Author.create(pick(data, FIELDS));
    },
    findAll: async () => {
        return await Author.findAll({ order: [['name', 'ASC']] });
    },
    findById: async (id) => {
        return await Author.findByPk(id);
    },
    update: async (id, data) => {
        const author = await Author.findByPk(id);
        if (!author) {
            return null;
        }
        return await author.update(pick(data, FIELDS));
    },
    remove: async (id) => {
        const author = await Author.findByPk(id);
        if (!author) {
            return null;
        }
        // Excluir o autor apagaria só a linha de BookAuthor e o livro ficaria sem autor.
        if (await author.countBooks() > 0) {
            throw new HttpError(409, 'Não é possível excluir: o autor tem livros cadastrados');
        }
        await author.destroy();
        return author;
    }
};

module.exports = authorService;
