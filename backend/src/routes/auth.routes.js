const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validar = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/registrar', authLimiter, [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('senha').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  body('tipo').isIn(['empresa', 'colaboradora']).withMessage('Tipo de conta inválido')
], validar, authController.registrar);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], validar, authController.login);

module.exports = router;