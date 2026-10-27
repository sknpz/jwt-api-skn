const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('../user/user.service');
const LogoutList = require('./logoutList.model');
const authService = {
    login: async (email, password) => {
        const user = await userService.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name
            }, process.env.JWT_SECRET,
            { expiresIn: '1h', });
        return token;
    },

    logout: async (token) => {
        // Implement logout logic if needed (e.g., token blacklisting)
        await LogoutList.create({ token });
    },

    verifyToken: async (token) => {
        try {
            const isBlacklisted = await LogoutList.findOne(
                { where: { token } });
            if (isBlacklisted) {
                throw new Error('Token revogado');
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
};

module.exports = authService;