'use strict';

const Konoha = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollReveal(selector, { threshold = 0.06, rootMargin = '0px 0px -40px 0px', transform = 'translateY(30px)', transition = 'opacity 0.7s ease, transform 0.7s var(--ease-out)' } = {}) {
    if (reduced || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      }
    }, { threshold, rootMargin });

    for (const el of document.querySelectorAll(selector)) {
      el.style.opacity = '0';
      el.style.transform = transform;
      el.style.transition = transition;
      obs.observe(el);
    }
  }

  function classReveal(selector, className, { threshold = 0.15, rootMargin = '0px 0px -60px 0px', fallback = true } = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      if (fallback) els.forEach(el => el.classList.add(className));
      return;
    }

    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add(className);
          obs.unobserve(e.target);
        }
      }
    }, { threshold, rootMargin });

    els.forEach(el => obs.observe(el));
  }

  function smoothScroll(offset = 80) {
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        }
      });
    }
  }

  function progressBar(barSelector, { axes = [], ambientSelector = null } = {}) {
    const bar = document.querySelector(barSelector);
    const ambient = ambientSelector ? document.querySelector(ambientSelector) : null;
    if (!bar) return;

    let currentAxis = null;
    let ticking = false;

    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';

      let next = null;
      for (let i = axes.length - 1; i >= 0; i--) {
        const el = document.getElementById(axes[i].id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) {
          next = axes[i];
          break;
        }
      }

      if (next !== currentAxis) {
        currentAxis = next;
        bar.style.background = next ? next.color : 'var(--gold)';
        if (ambient && !reduced) {
          if (next) {
            ambient.style.background = `radial-gradient(ellipse 80% 60% at 50% 50%, ${next.glow}, transparent)`;
            ambient.classList.add(next.activeClass || 'on');
          } else {
            ambient.className = ambient.className.replace(/\b(on|visivel)\b/g, '').trim();
          }
        }
      }
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function monumentParallax(selector) {
    const el = document.querySelector(selector);
    if (!el || reduced) return;

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    (function raf() {
      cx += (mx - cx) * 0.04;
      cy += (my - cy) * 0.04;
      el.style.perspectiveOrigin = `${50 + cx * 6}% ${80 + cy * 4}%`;
      requestAnimationFrame(raf);
    })();
  }

  function monolithTilt(selector, { baseTransform = null, axisAttr = 'data-axis', entranceClass = 'in', entranceDelay = 200, startDelay = 400 } = {}) {
    const monoliths = document.querySelectorAll(selector);
    if (!monoliths.length) return;

    monoliths.forEach(m => {
      if (reduced) { m.classList.add(entranceClass); return; }

      m.addEventListener('mousemove', e => {
        const r = m.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;

        let base = '';
        if (baseTransform) {
          base = typeof baseTransform === 'function' ? baseTransform(m) : baseTransform;
        }
        m.style.transform = `${base} rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.03)`;
      });

      m.addEventListener('mouseleave', () => { m.style.transform = ''; });
    });

    if (!reduced) {
      setTimeout(() => {
        monoliths.forEach((m, i) => {
          setTimeout(() => m.classList.add(entranceClass), i * entranceDelay);
        });
      }, startDelay);
    }
  }

  function particles(canvasId, { count = 60, palette = [[90,126,166],[166,61,61],[123,93,173],[196,163,90]], attract = true, attractRadius = 200 } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d');
    const parts = [];
    let pmx = null, pmy = null, w, h, t = 0, visible = true;

    function resize() {
      const parent = canvas.parentElement;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) {
        pmx = e.clientX - r.left;
        pmy = e.clientY - r.top;
      } else pmx = null;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas.parentElement);
    }

    for (let i = 0; i < count; i++) {
      const c = palette[i % palette.length];
      parts.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.8 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.08,
        fx: 3e-4 + Math.random() * 6e-4,
        fy: 2e-4 + Math.random() * 5e-4,
        px: Math.random() * 6.28, py: Math.random() * 6.28,
        ax: 0.15 + Math.random() * 0.3,
        ay: 0.1 + Math.random() * 0.25,
        c, o: 0.06 + Math.random() * 0.15
      });
    }

    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      t++;
      ctx.clearRect(0, 0, w, h);
      for (const q of parts) {
        q.x += Math.sin(t * q.fx + q.px) * q.ax + q.vx;
        q.y += Math.cos(t * q.fy + q.py) * q.ay + q.vy;
        if (q.x < -30) q.x = w + 30; if (q.x > w + 30) q.x = -30;
        if (q.y < -30) q.y = h + 30; if (q.y > h + 30) q.y = -30;
        if (attract && pmx !== null) {
          const dx = pmx - q.x, dy = pmy - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < attractRadius && d > 0) { q.x += dx * 0.06 / d; q.y += dy * 0.06 / d; }
        }
        const rgba = `rgba(${q.c[0]},${q.c[1]},${q.c[2]},`;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 4, 0, 6.28); ctx.fillStyle = rgba + (q.o * 0.12) + ')'; ctx.fill();
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.28); ctx.fillStyle = rgba + q.o + ')'; ctx.fill();
      }
    })();
  }

  return { reduced, scrollReveal, classReveal, smoothScroll, progressBar, monumentParallax, monolithTilt, particles };
})();
