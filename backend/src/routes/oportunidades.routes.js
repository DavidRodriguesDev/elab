const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const oportunidadesController = require('../controllers/oportunidades.controller');
const { autenticar, permitir } = require('../middlewares/auth.middleware');
const validar = require('../middlewares/validate');

const idValido = param('id').isInt({ min: 1 }).withMessage('ID inválido').toInt();

router.get('/', oportunidadesController.listar);
router.get('/:id', [idValido], validar, oportunidadesController.obter);

router.post('/', autenticar, permitir('empresa'), [
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório').isLength({ max: 120 }).withMessage('Título muito longo'),
  body('tipo').isIn(['vaga', 'evento', 'palestra', 'bolsa']).withMessage('Tipo inválido'),
  body('descricao').optional().trim().isLength({ max: 1000 }).withMessage('Descrição muito longa'),
  body('local').optional().trim().isLength({ max: 80 }).withMessage('Local muito longo'),
  body('data').optional({ checkFalsy: true }).isISO8601().withMessage('Data inválida'),
  body('habilidades').optional().isArray({ max: 10 }).withMessage('Habilidades inválidas')
], validar, oportunidadesController.criar);

router.post('/:id/inscricoes', autenticar, permitir('colaboradora'), [
  idValido,
  body('mensagem').optional().trim().isLength({ max: 500 }).withMessage('Mensagem muito longa')
], validar, oportunidadesController.inscrever);

module.exports = router;
