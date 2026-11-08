# Projeto Naruto — Ensaios & Vila da Folha

Site estático (HTML + CSS + JS vanilla) com conteúdo sobre o universo Naruto.

## Páginas

- **index.html** — página principal da Vila da Folha, experiência cinematográfica
- **historia-konoha.html** — perfis dos Hokages com timeline vertical
- **ensaio.html** — ensaio filosófico "Entre a Espada e o Sonho"

## Estrutura de Arquivos

```
Assets/
  css/
    tokens.css             — design system compartilhado (tokens, reset, nav, footer)
    index.css              — estilos da página principal
    historia.css           — estilos da página de Hokages
    ensaio.css             — estilos do ensaio filosófico
    responsivo-tablet.css  — breakpoint 768px
    responsivo-celular.css — breakpoint 480px
  JavaScript/
    core.js        — utilidades compartilhadas (reveals, particles, parallax, progress)
    index.js       — init da página principal
    ensaio.js      — init do ensaio
    historia.js    — init da página de Hokages
    api-naruto.js  — enriquecimento via Dattebayo API (jutsus, família)
  images/          — assets visuais
```

## Design

- Estilo minimalista, moderno e imersivo
- Dark mode por padrão
- Responsivo mobile-first (breakpoints: 768px e 480px)
- CSS sem frameworks, organizado por seções semânticas
- Tokens de design centralizados em `tokens.css`

## API

Integração com a [Dattebayo API](https://dattebayo-api.onrender.com) para enriquecer dados dos personagens com jutsus e árvore familiar. Cache de 24h no localStorage — o site funciona normalmente sem conexão com a API.
