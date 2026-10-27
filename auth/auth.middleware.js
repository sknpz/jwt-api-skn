const authService = require("./auth.service");

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;