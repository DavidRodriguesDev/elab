// Camada de dados em memória. Para trocar por Postgres depois, reescreva o corpo
// destas funções mantendo as assinaturas — nada fora deste arquivo muda.
const bcrypt = require('bcryptjs');
const { nodeEnv } = require('../config/env');

const usuarios = [];
let proximoId = 1;

async function criar({ nome, email, senhaHash, tipo }) {
  const usuario = { id: proximoId++, nome, email, senhaHash, tipo, area: '', cidade: '', bio: '' };
  usuarios.push(usuario);
  return usuario;
}

async function buscarPorEmail(email) {
  return usuarios.find(u => u.email === email) || null;
}

async function buscarPorId(id) {
  return usuarios.find(u => u.id === id) || null;
}

async function atualizar(id, campos) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return null;
  Object.assign(usuario, campos);
  return usuario;
}

// Contas de exemplo (só fora de produção): senha "senha12345"
if (nodeEnv !== 'production') {
  const hash = bcrypt.hashSync('senha12345', 10);
  usuarios.push(
    { id: proximoId++, nome: 'Tech Sabará', email: 'empresa@elab.com', senhaHash: hash, tipo: 'empresa', area: '', cidade: 'Sabará, MG', bio: 'Empresa de exemplo.' },
    { id: proximoId++, nome: 'Ana Souza', email: 'colab@elab.com', senhaHash: hash, tipo: 'colaboradora', area: 'Front-end', cidade: 'Sabará, MG', bio: '' }
  );
}

module.exports = { criar, buscarPorEmail, buscarPorId, atualizar };
