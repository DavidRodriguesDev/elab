const ApiError = require('../utils/ApiError');
const oportunidadeRepository = require('../repositories/oportunidade.repository');
const usuarioRepository = require('../repositories/usuario.repository');

async function listar(filtros) {
  return oportunidadeRepository.listar(filtros);
}

async function obter(id) {
  const o = await oportunidadeRepository.buscarPorId(id);
  if (!o) throw new ApiError(404, 'Oportunidade não encontrada');
  return o;
}

async function criar(empresaId, dados) {
  const empresa = await usuarioRepository.buscarPorId(empresaId);
  const habilidades = (dados.habilidades || []).map(h => String(h).trim().slice(0, 30)).filter(Boolean);
  return oportunidadeRepository.criar({ ...dados, habilidades, empresaId, empresaNome: empresa?.nome || '' });
}

// Serve tanto para candidatura (vaga) quanto para inscrição (demais tipos).
async function inscrever(usuarioId, oportunidadeId, mensagem) {
  const o = await obter(oportunidadeId);
  if (await oportunidadeRepository.buscarInscricao(oportunidadeId, usuarioId)) {
    throw new ApiError(409, 'Você já se inscreveu nesta oportunidade');
  }
  const i = await oportunidadeRepository.criarInscricao({ oportunidadeId, usuarioId, mensagem });
  return { protocolo: i.id, oportunidade: { id: o.id, titulo: o.titulo, tipo: o.tipo } };
}

module.exports = { listar, obter, criar, inscrever };
