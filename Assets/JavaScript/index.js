'use strict';

(function() {
  document.documentElement.classList.add('js');

  Konoha.scrollReveal('.clan, .hokage, .leg-card, .rank-row, .origin-text, .founders, .founder, .char-card, .essay-preview');

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

  Konoha.smoothScroll();
})();
