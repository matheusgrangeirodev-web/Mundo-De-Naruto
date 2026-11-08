'use strict';

(function() {
  Konoha.scrollReveal('.hokage, .fv-card, .succ-card, .founding-text');

  const rail = document.querySelectorAll('.hk-rail a');
  if (rail.length && 'IntersectionObserver' in window) {
    const sections = [];
    rail.forEach(link => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) sections.push({ el: target, link });
    });

    const activeObs = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const match = sections.find(s => s.el === entry.target);
        if (match) match.link.classList.toggle('active', entry.isIntersecting);
      }
    }, { threshold: 0.2 });

    sections.forEach(s => activeObs.observe(s.el));
  }

  Konoha.smoothScroll();
})();
