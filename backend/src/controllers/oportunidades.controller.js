const oportunidadeService = require('../services/oportunidade.service');
const asyncHandler = require('../utils/asyncHandler');
const { sucesso } = require('../utils/response');

const listar = asyncHandler(async (req, res) => {
  const { tipo, status } = req.query;
  const lista = await oportunidadeService.listar({ tipo, status });
  sucesso(res, 200, lista);
});

const obter = asyncHandler(async (req, res) => {
  sucesso(res, 200, await oportunidadeService.obter(req.params.id));
});

const criar = asyncHandler(async (req, res) => {
  const nova = await oportunidadeService.criar(req.usuario.id, req.body);
  sucesso(res, 201, nova);
});

const inscrever = asyncHandler(async (req, res) => {
  const r = await oportunidadeService.inscrever(req.usuario.id, req.params.id, req.body.mensagem);
  sucesso(res, 201, r);
});

module.exports = { listar, obter, criar, inscrever };
