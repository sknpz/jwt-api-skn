const isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
};

module.exports = isAdmin;
