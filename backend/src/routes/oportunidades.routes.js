const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const oportunidadesController = require('../controllers/oportunidades.controller');
const { autenticar, permitir } = require('../middlewares/auth.middleware');
const validar = require('../middlewares/validate');

router.get('/', oportunidadesController.listar);

router.post('/', autenticar, permitir('empresa'), [
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório'),
  body('tipo').isIn(['vaga', 'evento']).withMessage('Tipo inválido')
], validar, oportunidadesController.criar);

module.exports = router;