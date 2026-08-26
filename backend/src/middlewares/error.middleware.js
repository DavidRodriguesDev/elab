const ApiError = require('../utils/ApiError');

module.exports = function tratarErros(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ sucesso: false, erro: err.message });
  }

  // Erro não previsto: nunca expor stack trace ou detalhes internos ao cliente.
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
};