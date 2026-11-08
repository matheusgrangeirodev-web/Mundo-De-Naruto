'use strict';

const EnriquecerAPI = (() => {
  const URL_BASE = 'https://dattebayo-api.onrender.com';
  const TEMPO_LIMITE = 8000;
  const CACHE_CHAVE = 'naruto-api-cache';
  const CACHE_DURACAO = 1000 * 60 * 60 * 24;

  function lerCache() {
    try {
      const dados = localStorage.getItem(CACHE_CHAVE);
      if (!dados) return null;
      const cache = JSON.parse(dados);
      if (Date.now() - cache.timestamp > CACHE_DURACAO) {
        localStorage.removeItem(CACHE_CHAVE);
        return null;
      }
      return cache.dados;
    } catch { return null; }
  }

  function salvarCache(dados) {
    try {
      localStorage.setItem(CACHE_CHAVE, JSON.stringify({ timestamp: Date.now(), dados }));
    } catch {}
  }

  async function buscarPersonagem(nome) {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), TEMPO_LIMITE);
    try {
      const resposta = await fetch(
        `${URL_BASE}/characters?name=${encodeURIComponent(nome)}&limit=1`,
        { signal: controlador.signal }
      );
      clearTimeout(timeout);
      if (!resposta.ok) return null;
      const json = await resposta.json();
      return json.characters && json.characters[0] ? json.characters[0] : null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  async function buscarTodos(nomes) {
    const cache = lerCache();
    if (cache) return cache;

    const resultados = {};
    const promessas = nomes.map(async nome => {
      const dado = await buscarPersonagem(nome);
      if (dado) resultados[nome] = dado;
    });
    await Promise.all(promessas);

    if (Object.keys(resultados).length > 0) salvarCache(resultados);
    return resultados;
  }

  function criarListaJutsus(jutsus, maximo = 12) {
    if (!jutsus || !jutsus.length) return null;

    const lista = jutsus
      .filter(j => !j.includes('Anime only') && !j.includes('Game only'))
      .slice(0, maximo);

    const container = document.createElement('div');
    container.className = 'api-jutsus';

    const titulo = document.createElement('span');
    titulo.className = 'hk-sub-title';
    titulo.textContent = 'Jutsus (via API)';

    const fichas = document.createElement('div');
    fichas.className = 'chips';
    lista.forEach(j => {
      const ficha = document.createElement('span');
      ficha.className = 'chip';
      ficha.textContent = j.replace(/\s*\(.*?\)\s*/g, '');
      fichas.appendChild(ficha);
    });

    container.appendChild(titulo);
    container.appendChild(fichas);
    return container;
  }

  function criarInfoFamilia(familia) {
    if (!familia || Object.keys(familia).length === 0) return null;

    const traducoes = {
      father: 'Pai', mother: 'Mãe', son: 'Filho', daughter: 'Filha',
      wife: 'Esposa', husband: 'Marido', brother: 'Irmão', sister: 'Irmã',
      godfather: 'Padrinho', grandmother: 'Avó', grandfather: 'Avô',
      granddaughter: 'Neta', grandson: 'Neto',
      'adoptive son': 'Filho adotivo', 'adoptive father': 'Pai adotivo',
      'adoptive mother': 'Mãe adotiva', uncle: 'Tio', aunt: 'Tia',
      cousin: 'Primo', 'clone/son': 'Clone/Filho'
    };

    const container = document.createElement('div');
    container.className = 'api-familia';

    const titulo = document.createElement('span');
    titulo.className = 'hk-sub-title';
    titulo.textContent = 'Família';

    const lista = document.createElement('ul');
    lista.className = 'events';
    Object.entries(familia).forEach(([parentesco, nome]) => {
      const item = document.createElement('li');
      const rotulo = traducoes[parentesco] || parentesco;
      item.innerHTML = `<b>${rotulo}:</b> ${nome}`;
      lista.appendChild(item);
    });

    container.appendChild(titulo);
    container.appendChild(lista);
    return container;
  }

  function criarNaturezas(naturezas) {
    if (!naturezas || !naturezas.length) return null;

    const mapaElementos = {
      'Fire Release': { nome: 'Katon', atributo: 'fire' },
      'Water Release': { nome: 'Suiton', atributo: 'water' },
      'Earth Release': { nome: 'Doton', atributo: 'earth' },
      'Wind Release': { nome: 'Fūton', atributo: 'wind' },
      'Lightning Release': { nome: 'Raiton', atributo: 'lightning' },
      'Wood Release': { nome: 'Mokuton', atributo: '' },
      'Yin Release': { nome: 'Inton', atributo: '' },
      'Yang Release': { nome: 'Yōton', atributo: '' },
      'Yin–Yang Release': { nome: 'Onmyōton', atributo: '' },
      'Lava Release': { nome: 'Yōton', atributo: '' },
      'Magnet Release': { nome: 'Jiton', atributo: '' },
      'Boil Release': { nome: 'Futton', atributo: '' },
      'Ice Release': { nome: 'Hyōton', atributo: '' },
      'Scorch Release': { nome: 'Shakuton', atributo: '' }
    };

    const fichas = document.createElement('div');
    fichas.className = 'hk-elements';
    naturezas.forEach(n => {
      const info = mapaElementos[n] || { nome: n, atributo: '' };
      const tag = document.createElement('span');
      tag.className = 'el-tag';
      if (info.atributo) tag.dataset.el = info.atributo;
      tag.textContent = info.nome;
      fichas.appendChild(tag);
    });
    return fichas;
  }

  async function enriquecerHokages() {
    const mapaHokages = {
      hk1: 'Hashirama Senju',
      hk2: 'Tobirama Senju',
      hk3: 'Hiruzen Sarutobi',
      hk4: 'Minato Namikaze',
      hk5: 'Tsunade',
      hk6: 'Kakashi Hatake',
      hk7: 'Naruto Uzumaki'
    };

    const nomes = Object.values(mapaHokages);
    const dados = await buscarTodos(nomes);
    if (!dados || Object.keys(dados).length === 0) return;

    Object.entries(mapaHokages).forEach(([idSecao, nomePersonagem]) => {
      const secao = document.getElementById(idSecao);
      if (!secao) return;
      const personagem = dados[nomePersonagem];
      if (!personagem) return;

      const info = secao.querySelector('.hk-info');
      if (!info) return;

      const citacao = info.querySelector('.hk-quote');

      const jutsusExistentes = info.querySelectorAll('.chips .chip');
      const nomesjutsusExistentes = new Set();
      jutsusExistentes.forEach(el => nomesjutsusExistentes.add(el.textContent.trim()));

      if (personagem.jutsu) {
        const jutsusNovos = personagem.jutsu.filter(j => {
          const limpo = j.replace(/\s*\(.*?\)\s*/g, '');
          return !nomesjutsusExistentes.has(limpo);
        });
        const listaJutsus = criarListaJutsus(jutsusNovos, 8);
        if (listaJutsus && citacao) info.insertBefore(listaJutsus, citacao);
        else if (listaJutsus) info.appendChild(listaJutsus);
      }

      if (personagem.family) {
        const infoFamilia = criarInfoFamilia(personagem.family);
        if (infoFamilia && citacao) info.insertBefore(infoFamilia, citacao);
        else if (infoFamilia) info.appendChild(infoFamilia);
      }
    });

    document.body.classList.add('api-carregada');
  }

  async function enriquecerTime7() {
    const mapaTime7 = [
      { seletor: '.char-card:nth-child(1)', nome: 'Naruto Uzumaki' },
      { seletor: '.char-card:nth-child(2)', nome: 'Sasuke Uchiha' },
      { seletor: '.char-card:nth-child(3)', nome: 'Sakura Haruno' },
      { seletor: '.char-card:nth-child(4)', nome: 'Kakashi Hatake' }
    ];

    const nomes = mapaTime7.map(m => m.nome);
    const dados = await buscarTodos(nomes);
    if (!dados || Object.keys(dados).length === 0) return;

    mapaTime7.forEach(({ seletor, nome }) => {
      const carta = document.querySelector(seletor);
      if (!carta) return;
      const personagem = dados[nome];
      if (!personagem) return;

      const verso = carta.querySelector('.back');
      if (!verso) return;

      if (personagem.jutsu) {
        const topJutsus = personagem.jutsu
          .filter(j => !j.includes('Anime only') && !j.includes('Game only'))
          .slice(0, 5);
        if (topJutsus.length) {
          const container = document.createElement('div');
          container.className = 'api-jutsus-card';
          container.innerHTML = '<small class="cs-lbl" style="margin-bottom:0.3rem;display:block">Jutsus</small>';
          const fichas = document.createElement('div');
          fichas.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.2rem';
          topJutsus.forEach(j => {
            const ficha = document.createElement('span');
            ficha.className = 'chip';
            ficha.style.fontSize = '0.45rem';
            ficha.textContent = j.replace(/\s*\(.*?\)\s*/g, '');
            fichas.appendChild(ficha);
          });
          container.appendChild(fichas);
          verso.appendChild(container);
        }
      }
    });
  }

  async function iniciar() {
    const paginaIndex = !!document.querySelector('#hokages');
    const paginaHistoria = !!document.querySelector('.timeline');

    if (paginaIndex || paginaHistoria) {
      await enriquecerHokages();
      if (paginaIndex) await enriquecerTime7();
    }
  }

  return { iniciar, buscarPersonagem, buscarTodos };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EnriquecerAPI.iniciar());
} else {
  EnriquecerAPI.iniciar();
}
