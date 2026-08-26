const oportunidadeRepository = require('../repositories/oportunidade.repository');

async function listar(filtros) {
  return oportunidadeRepository.listar(filtros);
}

async function criar(empresaId, dados) {
  return oportunidadeRepository.criar({ ...dados, empresaId });
}

module.exports = { listar, criar };