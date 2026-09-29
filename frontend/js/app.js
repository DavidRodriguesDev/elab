(() => {
  const API = '/api/v1';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const token = () => localStorage.getItem('elab_token');
  const TIPOS = { vaga: 'Vaga', evento: 'Evento', palestra: 'Palestra', bolsa: 'Bolsa de estudo' };
  const params = new URLSearchParams(location.search);
  const PUBLICAS = ['index', 'login', 'registro'];
  let user = null;

  async function api(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (auth && token()) headers.Authorization = 'Bearer ' + token();
    let res;
    try { res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
    catch { throw new Error('Não foi possível falar com o servidor. Verifique se ele está rodando.'); }
    const json = await res.json().catch(() => ({}));
    if (res.status === 401 && auth) { sair(); throw new Error('Sessão expirada'); }
    if (!res.ok || !json.sucesso) throw new Error(json.erro || 'Erro inesperado');
    return json.dados;
  }

  function sair() { localStorage.removeItem('elab_token'); location.href = 'login.html'; }
  const erro = (form, msg) => { $('.erro', form).textContent = msg || ''; };
  const dados = form => Object.fromEntries(new FormData(form));
  const enviar = (form, fn) => form.addEventListener('submit', async e => {
    e.preventDefault(); erro(form);
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try { await fn(dados(form)); } catch (x) { erro(form, x.message); btn.disabled = false; }
  });

  const filtrar = (lista, q) => !q ? lista : lista.filter(o =>
    [o.titulo, o.empresaNome, o.local, ...(o.habilidades || [])].join(' ').toLowerCase().includes(q.toLowerCase()));

  const card = o => `<a class="card" href="detalhe.html?id=${Number(o.id)}"><div class="ph" aria-hidden="true"></div><div>
    <span class="tag">${esc(TIPOS[o.tipo] || o.tipo)}</span><h3>${esc(o.titulo)}</h3>
    <p class="mut">${esc([o.empresaNome, o.local].filter(Boolean).join(' • '))}</p>
    <div class="chips">${(o.habilidades || []).map(h => `<span class="chip">${esc(h)}</span>`).join('')}</div></div></a>`;

  const vazio = msg => `<div class="vazio">${esc(msg)}</div>`;
  const dataBR = d => d ? d.split('-').reverse().join('/') : '';

  /* ---------- shell (topo + aba lateral) ---------- */
  function shell() {
    const page = document.body.dataset.page;
    const itens = [['feed.html', '🏠', 'Feed', 'feed'], ['vagas.html', '💼', 'Vagas e Empregos', 'vagas'],
      ['oportunidades.html', '✨', 'Oportunidades', 'oportunidades'], ['perfil.html', '👤', 'Perfil', 'perfil']];
    if (user.tipo === 'empresa') itens.push(['painel-empresa.html', '🏢', 'Painel da empresa', 'empresa']);
    const main = $('main');
    const topo = document.createElement('header');
    topo.className = 'topbar';
    topo.innerHTML = `<button class="icone" id="menu" aria-label="Abrir ou fechar menu lateral" aria-expanded="false">☰</button>
      <a class="logo" href="feed.html">{<span>ELA</span>B}</a>
      <form class="busca" id="busca" role="search"><input name="q" placeholder="Buscar vagas e oportunidades" aria-label="Buscar" value="${esc(params.get('q') || '')}"></form>
      <a class="avatar" href="perfil.html" aria-label="Meu perfil">${esc((user.nome[0] || '?').toUpperCase())}</a>`;
    const lat = document.createElement('aside');
    lat.className = 'lateral'; lat.id = 'lateral';
    lat.innerHTML = `<nav>${itens.map(([h, i, t, k]) => `<a href="${h}" class="${k === page ? 'ativo' : ''}" title="${t}"><span aria-hidden="true">${i}</span><span class="rot">${t}</span></a>`).join('')}</nav>
      <button class="sair" id="sair" title="Sair"><span aria-hidden="true">🚪</span><span class="rot">Sair</span></button>`;
    const corpo = document.createElement('div');
    corpo.className = 'corpo';
    main.replaceWith(corpo); corpo.append(lat, main);
    document.body.prepend(topo);
    const menu = $('#menu');
    const set = aberta => { lat.classList.toggle('aberta', aberta); menu.setAttribute('aria-expanded', aberta); localStorage.setItem('elab_lateral', aberta ? '1' : '0'); };
    if (localStorage.getItem('elab_lateral') === '1' && innerWidth > 820) set(true);
    menu.addEventListener('click', () => set(!lat.classList.contains('aberta')));
    $('#sair').addEventListener('click', sair);
    $('#busca').addEventListener('submit', e => {
      e.preventDefault();
      location.href = 'feed.html?q=' + encodeURIComponent(new FormData(e.target).get('q').trim());
    });
  }

  /* ---------- páginas ---------- */
  const paginas = {
    login() {
      enviar($('form'), async d => {
        const r = await api('/auth/login', { method: 'POST', body: d, auth: false });
        localStorage.setItem('elab_token', r.token);
        location.href = 'feed.html';
      });
    },

    registro() {
      enviar($('form'), async d => {
        const nome = [d.nome, d.sobrenome].map(s => s.trim()).filter(Boolean).join(' ');
        await api('/auth/registrar', { method: 'POST', auth: false, body: { nome, email: d.email, senha: d.senha, tipo: d.tipo } });
        const r = await api('/auth/login', { method: 'POST', auth: false, body: { email: d.email, senha: d.senha } });
        localStorage.setItem('elab_token', r.token);
        location.href = 'feed.html';
      });
    },

    async feed() {
      const q = params.get('q') || '';
      $('#ola').textContent = 'Olá, ' + user.nome.split(' ')[0];
      const todas = await api('/oportunidades', { auth: false });
      const lista = filtrar(todas, q);
      $('#lista').innerHTML = lista.length ? lista.map(card).join('') : vazio(q ? `Nada encontrado para "${q}". Tente outra palavra.` : 'Ainda não há publicações.');
      const dest = todas.filter(o => o.tipo !== 'vaga').slice(0, 4);
      $('#destaques').innerHTML = dest.length ? dest.map(o => `<a class="card" href="detalhe.html?id=${Number(o.id)}"><div><span class="tag">${esc(TIPOS[o.tipo])}</span><h3>${esc(o.titulo)}</h3><p class="mut">${esc(dataBR(o.data))}</p></div></a>`).join('') : vazio('Sem eventos por enquanto.');
    },

    async vagas() {
      const lista = filtrar(await api('/oportunidades?tipo=vaga', { auth: false }), params.get('q') || '');
      $('#lista').innerHTML = lista.length ? lista.map(card).join('') : vazio('Nenhuma vaga encontrada.');
    },

    async oportunidades() {
      const todas = (await api('/oportunidades', { auth: false })).filter(o => o.tipo !== 'vaga');
      const box = $('#lista'), fil = $('#filtros');
      const pintar = t => {
        fil.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t));
        const l = todas.filter(o => !t || o.tipo === t);
        box.innerHTML = l.length ? l.map(card).join('') : vazio('Nenhuma oportunidade nesta categoria.');
      };
      fil.addEventListener('click', e => { if (e.target.dataset.t !== undefined) pintar(e.target.dataset.t); });
      pintar('');
    },

    async detalhe() {
      const o = await api('/oportunidades/' + encodeURIComponent(params.get('id')), { auth: false });
      const vaga = o.tipo === 'vaga';
      const acao = user.tipo === 'colaboradora'
        ? `<a class="btn" href="inscricao.html?id=${Number(o.id)}">${vaga ? 'Candidatar-se' : 'Inscrever-se'}</a>`
        : `<p class="mut">Contas de empresa não se candidatam nem se inscrevem.</p>`;
      $('#conteudo').innerHTML = `<span class="tag">${esc(TIPOS[o.tipo] || o.tipo)}</span><h1>${esc(o.titulo)}</h1>
        <dl><dt>Publicado por</dt><dd>${esc(o.empresaNome || '-')}</dd><dt>Local</dt><dd>${esc(o.local || '-')}</dd>
        ${o.data ? `<dt>Data</dt><dd>${esc(dataBR(o.data))}</dd>` : ''}<dt>Descrição</dt><dd>${esc(o.descricao || 'Sem descrição.')}</dd></dl>
        <div class="chips">${(o.habilidades || []).map(h => `<span class="chip">${esc(h)}</span>`).join('')}</div><p></p>${acao}`;
    },

    async inscricao() {
      const id = params.get('id');
      const o = await api('/oportunidades/' + encodeURIComponent(id), { auth: false });
      const vaga = o.tipo === 'vaga';
      $('#titulo').textContent = (vaga ? 'Candidatura: ' : 'Inscrição: ') + o.titulo;
      $('#enviar').textContent = vaga ? 'Enviar candidatura' : 'Enviar inscrição';
      enviar($('main form'), async d => {
        const r = await api(`/oportunidades/${encodeURIComponent(id)}/inscricoes`, { method: 'POST', body: { mensagem: d.mensagem } });
        sessionStorage.setItem('elab_conf', JSON.stringify(r));
        location.href = 'confirmacao.html';
      });
    },

    confirmacao() {
      const r = JSON.parse(sessionStorage.getItem('elab_conf') || 'null');
      if (!r) return void (location.href = 'feed.html');
      const vaga = r.oportunidade.tipo === 'vaga';
      $('#msg-titulo').textContent = vaga ? 'Candidatura enviada' : 'Inscrição confirmada';
      $('#msg-corpo').textContent = `${r.oportunidade.titulo} (protocolo #${r.protocolo})`;
    },

    perfil() {
      const linhas = [['Nome', user.nome], ['E-mail', user.email], ['Tipo de conta', user.tipo === 'empresa' ? 'Empresa' : 'Colaboradora'],
        ['Área', user.area || '-'], ['Cidade', user.cidade || '-'], ['Sobre', user.bio || '-']];
      $('#dados').innerHTML = linhas.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    },

    editar() {
      const f = $('main form');
      ['nome', 'area', 'cidade', 'bio'].forEach(k => { f.elements[k].value = user[k] || ''; });
      enviar(f, async d => {
        await api('/perfil', { method: 'PUT', body: d });
        location.href = 'perfil.html';
      });
    },

    async empresa() {
      if (user.tipo !== 'empresa') return void (location.href = 'feed.html');
      const f = $('main form');
      const carregar = async () => {
        const minhas = (await api('/oportunidades', { auth: false })).filter(o => o.empresaId === user.id);
        $('#lista').innerHTML = minhas.length ? minhas.map(card).join('') : vazio('Você ainda não publicou nada.');
      };
      enviar(f, async d => {
        const habilidades = d.habilidades.split(',').map(s => s.trim()).filter(Boolean);
        await api('/oportunidades', { method: 'POST', body: { ...d, habilidades } });
        f.reset(); $('button[type=submit]', f).disabled = false;
        $('.ok', f).textContent = 'Publicado!';
        await carregar();
      });
      await carregar();
    }
  };

  /* ---------- início ---------- */
  (async () => {
    const page = document.body.dataset.page;
    const rodar = () => paginas[page] && paginas[page]();
    if (PUBLICAS.includes(page)) return rodar();
    if (!token()) return void (location.href = 'login.html');
    try {
      user = await api('/perfil');
      shell();
      await rodar();
    } catch (x) {
      const alvo = $('main') || document.body;
      alvo.insertAdjacentHTML('afterbegin', `<p class="erro" role="alert">${esc(x.message)}</p>`);
    }
  })();
})();