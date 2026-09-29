const oportunidades = [
  { id: 1, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'vaga', titulo: 'Dev Front-end Jr.', status: 'ativo', local: 'Remoto', data: '', descricao: 'Desenvolvimento de interfaces web com JavaScript e React, em time ágil.', habilidades: ['javascript', 'react'] },
  { id: 2, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'evento', titulo: 'Workshop de UX', status: 'agendado', local: 'Online', data: '2026-10-20', descricao: 'Oficina prática de pesquisa e prototipação para iniciantes.', habilidades: ['ux design'] },
  { id: 3, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'vaga', titulo: 'Analista de Dados Jr.', status: 'ativo', local: 'Belo Horizonte, MG', data: '', descricao: 'Análise de dados e criação de dashboards.', habilidades: ['sql', 'python'] },
  { id: 4, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'palestra', titulo: 'Carreira em Tecnologia', status: 'agendado', local: 'IFMG Sabará', data: '2026-11-05', descricao: 'Mulheres da área contam suas trajetórias e respondem perguntas.', habilidades: [] },
  { id: 5, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'bolsa', titulo: 'Bolsa em Desenvolvimento Web', status: 'ativo', local: 'Remoto', data: '2026-12-01', descricao: 'Bolsa de estudo para curso de desenvolvimento web full stack.', habilidades: ['html', 'css', 'javascript'] },
  { id: 6, empresaId: 1, empresaNome: 'Tech Sabará', tipo: 'vaga', titulo: 'Estágio em Back-end', status: 'ativo', local: 'Híbrido', data: '', descricao: 'Estágio com Node.js e APIs REST, com mentoria.', habilidades: ['node', 'sql'] }
];
let proximoId = 7;

const inscricoes = []; // [{ id, oportunidadeId, usuarioId, mensagem }]
let proximaInscricao = 1;

async function listar({ tipo, status } = {}) {
  return oportunidades.filter(o =>
    (!tipo || o.tipo === tipo) && (!status || o.status === status)
  );
}

async function buscarPorId(id) {
  return oportunidades.find(o => o.id === id) || null;
}

async function criar({ empresaId, empresaNome, titulo, tipo, descricao = '', local = '', data = '', habilidades = [] }) {
  const nova = {
    id: proximoId++, empresaId, empresaNome, titulo, tipo, descricao, local, data, habilidades,
    status: tipo === 'vaga' ? 'ativo' : 'agendado'
  };
  oportunidades.push(nova);
  return nova;
}

async function buscarInscricao(oportunidadeId, usuarioId) {
  return inscricoes.find(i => i.oportunidadeId === oportunidadeId && i.usuarioId === usuarioId) || null;
}

async function criarInscricao({ oportunidadeId, usuarioId, mensagem = '' }) {
  const inscricao = { id: proximaInscricao++, oportunidadeId, usuarioId, mensagem };
  inscricoes.push(inscricao);
  return inscricao;
}

module.exports = { listar, buscarPorId, criar, buscarInscricao, criarInscricao };
