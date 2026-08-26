// Formato de resposta padronizado — o frontend sempre sabe onde achar os dados,
// independente do endpoint.
function sucesso(res, status, dados) {
  return res.status(status).json({ sucesso: true, dados });
}

module.exports = { sucesso };