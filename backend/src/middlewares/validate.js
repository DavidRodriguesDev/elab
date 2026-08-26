const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Roda depois das regras do express-validator nas rotas; se algo falhar,
// interrompe antes de chegar no controller.
module.exports = function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    const mensagem = erros.array().map(e => e.msg).join(', ');
    return next(new ApiError(400, mensagem));
  }
  next();
};