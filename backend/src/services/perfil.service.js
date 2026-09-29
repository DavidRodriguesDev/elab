const ApiError = require('../utils/ApiError');
const usuarioRepository = require('../repositories/usuario.repository');

const publico = ({ id, nome, email, tipo, area, cidade, bio }) => ({ id, nome, email, tipo, area, cidade, bio });

async function obter(id) {
  const u = await usuarioRepository.buscarPorId(id);
  if (!u) throw new ApiError(404, 'Usuário não encontrado');
  return publico(u);
}

// Lista explícita de campos editáveis: impede alterar tipo, e-mail ou senha por aqui.
async function atualizar(id, { nome, area, cidade, bio }) {
  const u = await usuarioRepository.atualizar(id, { nome, area, cidade, bio });
  if (!u) throw new ApiError(404, 'Usuário não encontrado');
  return publico(u);
}

module.exports = { obter, atualizar };
