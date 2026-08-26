// Camada de dados. Hoje: array em memória. Amanhã: troca o corpo destas funções
// por queries reais (ex: pg/Prisma) mantendo a mesma assinatura —
// nada fora deste arquivo precisa mudar.

const usuarios = []; // [{ id, nome, email, senhaHash, tipo }]
let proximoId = 1;

async function criar({ nome, email, senhaHash, tipo }) {
  const usuario = { id: proximoId++, nome, email, senhaHash, tipo };
  usuarios.push(usuario);
  return usuario;
}

async function buscarPorEmail(email) {
  return usuarios.find(u => u.email === email) || null;
}

async function buscarPorId(id) {
  return usuarios.find(u => u.id === id) || null;
}

module.exports = { criar, buscarPorEmail, buscarPorId };