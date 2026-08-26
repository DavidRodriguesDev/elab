// Erro "conhecido" (validação, autenticação, permissão) — o middleware de erro
// sabe diferenciar isso de um bug inesperado e responde adequadamente.
class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

module.exports = ApiError;