'use strict';

(function() {
  document.documentElement.classList.add('js');

  Konoha.scrollReveal('.clan, .hokage, .leg-card, .rank-row, .origin-text, .founders, .founder');

  Konoha.classReveal('.essay-col p, .essay-col h2, .essay-refs li', 'read');

  Konoha.scrollReveal('.axis-divider, .bq', {
    threshold: 0.12,
    rootMargin: '0px',
    transform: 'translateY(30px)',
    transition: 'opacity 0.8s ease, translate 0.8s var(--ease-out)'
  });

  const counters = document.querySelectorAll('.n[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    let counted = false;
    const obs = new IntersectionObserver(entries => {
      if (counted) return;
      for (const e of entries) {
        if (e.isIntersecting) {
          counted = true;
          counters.forEach(el => {
            const target = +el.dataset.target;
            const duration = 1200;
            const start = performance.now();
            (function tick(now) {
              const p = Math.min((now - start) / duration, 1);
              el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
              if (p < 1) requestAnimationFrame(tick);
            })(start);
          });
          obs.disconnect();
        }
      }
    }, { threshold: 0.5 });
    const stats = document.querySelector('.stats');
    if (stats) obs.observe(stats);
  }

  Konoha.monumentParallax('.monument');

  Konoha.monolithTilt('.monolith', {
    baseTransform: m => {
      const axis = m.dataset.axis;
      return axis === 'pol' ? 'translateZ(0)' : axis === 'mil' ? 'translateZ(10px)' : 'translateZ(20px)';
    }
  });

  Konoha.particles('particles');

  Konoha.progressBar('.progress', {
    axes: [
      { id: 'eixo-pol', glow: 'rgba(90,126,166,0.06)', color: '#5A7EA6' },
      { id: 'eixo-mil', glow: 'rgba(166,61,61,0.06)', color: '#A63D3D' },
      { id: 'eixo-uto', glow: 'rgba(123,93,173,0.06)', color: '#7B5DAD' }
    ],
    ambientSelector: '.ambient'
  });

  Konoha.smoothScroll();
})();
