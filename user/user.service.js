const bcrypt = require('bcrypt');
const User = require('./user.model');
const RefreshToken = require('../auth/refreshToken.model');
const HttpError = require('../utils/httpError');
const pick = require('../utils/pick');

const MIN_PASSWORD_LENGTH = 6;

const hashPassword = async (password) => {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpError(400, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }
    return bcrypt.hash(password, 10);
};

const userService = {
    create: async (userData) => {
        const data = pick(userData, ['name', 'username', 'email', 'isAdmin']);
        data.password = await hashPassword(userData?.password);
        const user = await User.create(data);
        return User.findByPk(user.id);
    },
    findById: async (id) => {
        return await User.findByPk(id);
    },
    findByEmail: async (email) => {
        return await User.findOne({ where: { email } });
    },
    findByEmailWithPassword: async (email) => {
        return await User.scope('withPassword').findOne({ where: { email } });
    },
    findAll: async () => {
        return await User.findAll({ order: [['name', 'ASC']] });
    },
    update: async (id, userData, requesterId) => {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }
        const data = pick(userData, ['name', 'username', 'email', 'isAdmin']);
        if (user.id === requesterId && data.isAdmin === false) {
            throw new HttpError(400, 'Você não pode remover o seu próprio acesso de administrador');
        }
        if (userData?.password !== undefined) {
            data.password = await hashPassword(userData.password);
        }
        await user.update(data);
        return User.findByPk(id);
    },
    setActive: async (id, active, requesterId) => {
        if (typeof active !== 'boolean') {
            throw new HttpError(400, 'O campo active deve ser true ou false');
        }
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }
        if (user.id === requesterId && !active) {
            throw new HttpError(400, 'Você não pode desativar o seu próprio usuário');
        }
        await user.update({ active });
        if (!active) {
            await RefreshToken.update({ revoked: true }, { where: { userId: user.id, revoked: false } });
        }
        return user;
    }
};

module.exports = userService;
