const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sucesso } = require('../utils/response');

const registrar = asyncHandler(async (req, res) => {
  const usuario = await authService.registrar(req.body);
  sucesso(res, 201, usuario);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  sucesso(res, 200, resultado);
});

module.exports = { registrar, login };