const oportunidadeService = require('../services/oportunidade.service');
const asyncHandler = require('../utils/asyncHandler');
const { sucesso } = require('../utils/response');

const listar = asyncHandler(async (req, res) => {
  const { tipo, status } = req.query;
  const lista = await oportunidadeService.listar({ tipo, status });
  sucesso(res, 200, lista);
});

const criar = asyncHandler(async (req, res) => {
  const nova = await oportunidadeService.criar(req.usuario.id, req.body);
  sucesso(res, 201, nova);
});

module.exports = { listar, criar };