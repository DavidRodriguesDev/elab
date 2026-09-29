const perfilService = require('../services/perfil.service');
const asyncHandler = require('../utils/asyncHandler');
const { sucesso } = require('../utils/response');

const obter = asyncHandler(async (req, res) => sucesso(res, 200, await perfilService.obter(req.usuario.id)));

const atualizar = asyncHandler(async (req, res) => {
  const { nome, area = '', cidade = '', bio = '' } = req.body;
  sucesso(res, 200, await perfilService.atualizar(req.usuario.id, { nome, area, cidade, bio }));
});

module.exports = { obter, atualizar };
