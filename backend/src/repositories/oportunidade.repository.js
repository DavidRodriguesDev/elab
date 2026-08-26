const oportunidades = [
  { id: 1, empresaId: 1, tipo: 'vaga', titulo: 'Dev Front-end Jr.', status: 'ativo', habilidades: ['javascript', 'react'] },
  { id: 2, empresaId: 1, tipo: 'evento', titulo: 'Workshop de UX', status: 'agendado', habilidades: ['ux design'] }
];
let proximoId = 3;

async function listar({ tipo, status } = {}) {
  return oportunidades.filter(o =>
    (!tipo || o.tipo === tipo) && (!status || o.status === status)
  );
}

async function criar({ empresaId, titulo, tipo, descricao, habilidades = [] }) {
  const nova = { id: proximoId++, empresaId, titulo, tipo, descricao, habilidades, status: 'agendado' };
  oportunidades.push(nova);
  return nova;
}

module.exports = { listar, criar };