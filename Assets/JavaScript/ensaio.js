'use strict';

(function() {
  document.documentElement.classList.add('js');

  Konoha.monumentParallax('.monumento');

  Konoha.monolithTilt('.monolito', {
    entranceClass: 'entrada',
    baseTransform: m => {
      if (m.classList.contains('monolito-pol')) return 'translateZ(0)';
      if (m.classList.contains('monolito-mil')) return 'translateZ(10px)';
      return 'translateZ(20px)';
    }
  });

  Konoha.particles('particulas', {
    count: 70,
    palette: [
      [90,126,166],[90,126,166],
      [166,61,61],[166,61,61],
      [123,93,173],[123,93,173],
      [196,163,90]
    ]
  });

  Konoha.progressBar('.progress-bar', {
    axes: [
      { id: 'eixo-politico', glow: 'rgba(90,126,166,0.06)', color: '#5A7EA6', activeClass: 'visivel' },
      { id: 'eixo-militar', glow: 'rgba(166,61,61,0.06)', color: '#A63D3D', activeClass: 'visivel' },
      { id: 'eixo-utopico', glow: 'rgba(123,93,173,0.06)', color: '#7B5DAD', activeClass: 'visivel' }
    ],
    ambientSelector: '.ambient-glow'
  });

  Konoha.classReveal('.divisor-eixo, .citacao', 'visivel', {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
    fallback: false
  });

  if (!Konoha.reduced) {
    document.querySelectorAll('.divisor-eixo, .citacao').forEach(el => el.classList.add('revelar'));
  }

  Konoha.classReveal('.coluna-leitura p, .coluna-leitura h2, .secao-refs li', 'lido');

  if ('IntersectionObserver' in window) {
    const links = document.querySelectorAll('.nav-chapters a');
    const nav = document.querySelector('.chapter-nav');

    if (links.length) {
      const axisObs = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
            if (nav) {
              const cor = id === 'eixo-politico' ? 'rgba(90,126,166,0.4)' :
                          id === 'eixo-militar' ? 'rgba(166,61,61,0.4)' :
                          'rgba(123,93,173,0.4)';
              nav.style.setProperty('--nav-accent', cor);
            }
          }
        }
      }, { threshold: 0.15, rootMargin: '-20% 0px -60% 0px' });

      document.querySelectorAll('[id^="eixo-"]').forEach(el => axisObs.observe(el));
    }
  }

  Konoha.smoothScroll();
})();
