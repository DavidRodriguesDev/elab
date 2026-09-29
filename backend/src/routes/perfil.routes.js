const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const perfilController = require('../controllers/perfil.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const validar = require('../middlewares/validate');

router.use(autenticar);

router.get('/', perfilController.obter);

router.put('/', [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 80 }).withMessage('Nome muito longo'),
  body('area').optional().trim().isLength({ max: 80 }).withMessage('Área muito longa'),
  body('cidade').optional().trim().isLength({ max: 80 }).withMessage('Cidade muito longa'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio deve ter no máximo 500 caracteres')
], validar, perfilController.atualizar);

module.exports = router;
