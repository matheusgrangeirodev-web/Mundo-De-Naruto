# Projeto Naruto — Ensaios & Vila da Folha

## Projeto
Site estático (HTML + CSS + JS vanilla) com conteúdo sobre o universo Naruto:
- `index.html` — página principal da Vila da Folha (cinematográfica)
- `historia-konoha.html` — perfis dos Hokages com timeline vertical
- `ensaio.html` — ensaio filosófico "Entre a Espada e o Sonho"
- `triadic-pressure.html` — arte generativa com p5.js (Pressão Triádica)

## Diretrizes de Design
- Estilo minimalista, moderno, fora do padrão — sem vícios de design
- Imersivo visualmente para atrair leitores ao conteúdo escrito
- Tokens CSS centralizados em `tokens.css`, dark mode por padrão
- Responsivo mobile-first com breakpoints a 768px e 480px
- JS organizado em `Assets/JavaScript/` com `core.js` compartilhado

## Engenharia de Projeto
- Antes de criar qualquer arquivo, verificar se já existe algo similar no projeto
- Reutilizar tokens de design existentes quando fizer sentido
- Manter coerência visual entre páginas mas com identidade própria por seção
- Preferir editar arquivos existentes em vez de criar novos
- CSS organizado por seções semânticas, sem frameworks

## Economia de Tokens
- Usar agentes `Explore` para buscas rápidas no código em vez de leituras completas
- Para tarefas independentes, usar chamadas paralelas de ferramentas
- Ler apenas as linhas necessárias de arquivos grandes (usar offset/limit)
- Não re-ler arquivos que acabaram de ser escritos/editados
- Forks para pesquisas longas que encheriam o contexto

## Modelos
- Tarefas de design/criação complexas: Opus (modelo atual, mais capaz)
- Buscas e exploração de código: agentes Explore (mais rápidos, read-only)
- Revisão de código: skill `/code-review` com nível apropriado
- Planejamento de arquitetura: agente Plan

## Estrutura de Arquivos
```
Assets/
  css/
    tokens.css             — design system compartilhado (tokens, reset, nav, footer)
    index.css              — estilos da página principal (cinematográfica)
    historia.css           — estilos da página de Hokages (timeline)
    ensaio.css             — estilos do ensaio filosófico (scroll storytelling)
    responsivo-tablet.css  — breakpoint 768px (todas as páginas)
    responsivo-celular.css — breakpoint 480px (todas as páginas)
  JavaScript/
    core.js        — utilidades compartilhadas (reveals, particles, parallax, progress)
    index.js       — init da página principal
    ensaio.js      — init do ensaio
    historia.js    — init da página de Hokages
    triadic-pressure.js — arte generativa p5.js
  images/          — assets visuais
index.html         — Vila da Folha
historia-konoha.html — Hokages
ensaio.html        — Ensaio filosófico
triadic-pressure.html — Arte generativa
```
