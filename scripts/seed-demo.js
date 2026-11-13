require('dotenv').config();
const db = require('../config/db');
const { Author, Book, Category, Loan, Reader, User } = require('../models');
const seedAdmin = require('../user/user.seed');
const userService = require('../user/user.service');
const { today, addDays } = require('../utils/date');

const ATTENDANT = {
    name: 'Ana Atendente',
    username: 'ana',
    email: 'atendente@biblioteca.com',
    password: '123456'
};

const createBook = async (data, authors, transaction) => {
    const book = await Book.create({ ...data, availableCopies: data.totalCopies }, { transaction });
    await book.setAuthors(authors, { transaction });
    return book;
};

const lend = async (book, reader, user, dueDate, transaction) => {
    await Loan.create({
        bookId: book.id,
        readerId: reader.id,
        userId: user.id,
        loanDate: addDays(dueDate, -7),
        dueDate
    }, { transaction });
    await book.update({ availableCopies: book.availableCopies - 1 }, { transaction });
};

const run = async () => {
    await db.sync();
    await seedAdmin();

    if (await Book.count() > 0) {
        console.log('O banco já tem livros: nada foi alterado. Apague o database.sqlite para começar do zero.');
        return;
    }

    const existing = await User.findOne({ where: { email: ATTENDANT.email } });
    const attendant = existing ?? await userService.create(ATTENDANT);

    await db.transaction(async (transaction) => {
        const [romance, technical, fantasy] = await Category.bulkCreate([
            { name: 'Romance', description: 'Literatura brasileira e estrangeira' },
            { name: 'Técnico', description: 'Programação e tecnologia' },
            { name: 'Fantasia', description: 'Mundos imaginários' }
        ], { transaction });

        const [machado, martin, gamma, helm, tolkien] = await Author.bulkCreate([
            { name: 'Machado de Assis', nationality: 'Brasileira', birthDate: '1839-06-21' },
            { name: 'Robert C. Martin', nationality: 'Americana', birthDate: '1952-12-05' },
            { name: 'Erich Gamma', nationality: 'Suíça', birthDate: '1961-03-13' },
            { name: 'Richard Helm', nationality: 'Australiana' },
            { name: 'J. R. R. Tolkien', nationality: 'Britânica', birthDate: '1892-01-03' }
        ], { transaction });

        const domCasmurro = await createBook(
            { title: 'Dom Casmurro', isbn: '9788535911640', year: 1899, totalCopies: 3, categoryId: romance.id },
            [machado], transaction
        );
        await createBook(
            { title: 'Memórias Póstumas de Brás Cubas', isbn: '9788535910667', year: 1881, totalCopies: 2, categoryId: romance.id },
            [machado], transaction
        );
        const cleanCode = await createBook(
            { title: 'Clean Code', isbn: '9780132350884', year: 2008, totalCopies: 2, categoryId: technical.id },
            [martin], transaction
        );
        await createBook(
            { title: 'Design Patterns', isbn: '9780201633610', year: 1994, totalCopies: 1, categoryId: technical.id },
            [gamma, helm], transaction
        );
        await createBook(
            { title: 'O Hobbit', isbn: '9788595084742', year: 1937, totalCopies: 1, categoryId: fantasy.id },
            [tolkien], transaction
        );

        const [lia, bruno] = await Reader.bulkCreate([
            { name: 'Lia Souza', cpf: '12345678900', email: 'lia@exemplo.com', phone: '(44) 99999-0001' },
            { name: 'Bruno Lima', cpf: '98765432100', email: 'bruno@exemplo.com', phone: '(44) 99999-0002' },
            { name: 'Carla Dias', cpf: '11122233344', phone: '(44) 99999-0003' }
        ], { validate: true, transaction });

        await lend(domCasmurro, lia, attendant, addDays(today(), 3), transaction);
        await lend(cleanCode, bruno, attendant, addDays(today(), -5), transaction);
    });

    console.log('Dados de demonstração criados.');
    console.log(`Atendente: ${ATTENDANT.email} / ${ATTENDANT.password}`);
    console.log('Bruno Lima tem um empréstimo com 5 dias de atraso: a devolução gera multa de R$ 5,00.');
};

run()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => db.close());
