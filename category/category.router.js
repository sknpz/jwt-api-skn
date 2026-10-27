const { Router } = require('express');
const router = Router();

const categoryController = require('./category.controller');
const authMiddleware = require('../auth/auth.middleware');

router.get('/', authMiddleware, categoryController.findAll);
router.get('/:id', authMiddleware, categoryController.findById);
router.post('/', authMiddleware, categoryController.create);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.remove);

module.exports = router;
