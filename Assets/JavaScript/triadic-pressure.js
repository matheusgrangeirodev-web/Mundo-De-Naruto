'use strict';

const params = {
  seed: 12345,
  particleCount: 3000,
  fieldStrength: 1.2,
  turbulence: 0.35,
  trailAlpha: 12,
  lifespan: 280,
  noiseScale: 0.004,
  colors: ['#5a7ea6', '#a63d3d', '#7b5dad', '#c4a35a']
};

const defaultParams = JSON.parse(JSON.stringify(params));

let particles = [];
let attractors = [];
let pg;
let frameCount_ = 0;
const maxFrames = 800;
let running = false;

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function lerpColor3(c1, c2, t) {
  return [c1[0] + (c2[0] - c1[0]) * t, c1[1] + (c2[1] - c1[1]) * t, c1[2] + (c2[2] - c1[2]) * t];
}

class Attractor {
  constructor(x, y, strength, colorIdx, spread) {
    this.x = x; this.y = y;
    this.strength = strength;
    this.colorIdx = colorIdx;
    this.spread = spread;
  }

  force(px, py) {
    const dx = this.x - px, dy = this.y - py;
    let d = Math.sqrt(dx * dx + dy * dy);
    d = Math.max(d, 30);
    let f = (this.strength * params.fieldStrength * 800) / (d * d);
    f = Math.min(f, 2.5);
    return { fx: dx / d * f, fy: dy / d * f, d };
  }
}

class Particle {
  constructor() { this.reset(); }

  reset() {
    const edge = Math.floor(random(4));
    if (edge === 0)      { this.x = random(width); this.y = 0; }
    else if (edge === 1) { this.x = width; this.y = random(height); }
    else if (edge === 2) { this.x = random(width); this.y = height; }
    else                 { this.x = 0; this.y = random(height); }

    this.vx = 0; this.vy = 0;
    this.age = 0;
    this.maxAge = params.lifespan * (0.6 + random(0.8));
    this.prevX = this.x; this.prevY = this.y;
    this.colorR = 180; this.colorG = 180; this.colorB = 180;
  }

  update() {
    this.prevX = this.x; this.prevY = this.y;
    this.age++;

    let totalFx = 0, totalFy = 0;
    const weights = [];
    let totalWeight = 0;

    for (const a of attractors) {
      const f = a.force(this.x, this.y);
      const w = 1.0 / (f.d * f.d + 1);
      weights.push(w);
      totalWeight += w;
      const angle = Math.atan2(f.fy, f.fx) + Math.PI * 0.4 * a.spread;
      const mag = Math.sqrt(f.fx * f.fx + f.fy * f.fy);
      totalFx += Math.cos(angle) * mag;
      totalFy += Math.sin(angle) * mag;
    }

    const nx = noise(this.x * params.noiseScale, this.y * params.noiseScale, frameCount_ * 0.003) * TWO_PI * 2;
    totalFx += Math.cos(nx) * params.turbulence * 0.8;
    totalFy += Math.sin(nx) * params.turbulence * 0.8;

    this.vx = this.vx * 0.92 + totalFx * 0.08;
    this.vy = this.vy * 0.92 + totalFy * 0.08;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3.5) { this.vx = (this.vx / speed) * 3.5; this.vy = (this.vy / speed) * 3.5; }

    this.x += this.vx; this.y += this.vy;

    let maxW = 0, maxIdx = 0, secondW = 0, secondIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      if (weights[i] > maxW) { secondW = maxW; secondIdx = maxIdx; maxW = weights[i]; maxIdx = i; }
      else if (weights[i] > secondW) { secondW = weights[i]; secondIdx = i; }
    }

    const dominance = maxW / (totalWeight + 0.001);
    let targetColor;
    if (dominance < 0.4 && weights.length >= 3) {
      targetColor = hexToRgb(params.colors[3]);
    } else {
      const c1 = hexToRgb(params.colors[attractors[maxIdx].colorIdx]);
      const c2 = hexToRgb(params.colors[attractors[secondIdx].colorIdx]);
      targetColor = lerpColor3(c1, c2, (secondW / (maxW + secondW + 0.001)) * 0.6);
    }

    this.colorR += (targetColor[0] - this.colorR) * 0.06;
    this.colorG += (targetColor[1] - this.colorG) * 0.06;
    this.colorB += (targetColor[2] - this.colorB) * 0.06;
  }

  draw() {
    const lifeRatio = this.age / this.maxAge;
    const fadeIn = Math.min(lifeRatio * 5, 1);
    const fadeOut = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
    const alpha = params.trailAlpha * fadeIn * fadeOut;
    if (alpha < 0.5) return;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    pg.stroke(this.colorR, this.colorG, this.colorB, alpha);
    pg.strokeWeight(map(speed, 0, 3, 0.4, 1.8));
    pg.line(this.prevX, this.prevY, this.x, this.y);
  }

  isDead() {
    return this.age > this.maxAge || this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20;
  }
}

function setup() {
  const canvas = createCanvas(1200, 1200);
  canvas.parent('canvas-container');
  document.querySelector('.loading').style.display = 'none';
  pixelDensity(1);
  pg = createGraphics(1200, 1200);
  pg.pixelDensity(1);
  initializeSystem();
}

function initializeSystem() {
  randomSeed(params.seed);
  noiseSeed(params.seed);
  particles = [];
  attractors = [];
  frameCount_ = 0;
  running = true;
  pg.background(12, 11, 16);

  const cx = width / 2, cy = height / 2, sp = width * 0.22;
  attractors.push(new Attractor(cx + random(-30, 30), cy + sp * 0.5 + random(-20, 20), 0.8 + random(0.4), 0, 0.7 + random(0.3)));
  attractors.push(new Attractor(cx - sp * 0.55 + random(-20, 20), cy - sp * 0.15 + random(-20, 20), 0.6 + random(0.3), 1, 0.5 + random(0.4)));
  attractors.push(new Attractor(cx + sp * 0.55 + random(-20, 20), cy - sp * 0.55 + random(-20, 20), 0.4 + random(0.3), 2, 0.9 + random(0.3)));

  for (let i = 0; i < params.particleCount; i++) particles.push(new Particle());
  loop();
}

function draw() {
  if (!running) { noLoop(); return; }
  frameCount_++;
  for (let step = 0; step < 3; step++) {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) particles[i].reset();
    }
  }
  image(pg, 0, 0);
  if (frameCount_ >= maxFrames) { running = false; noLoop(); }
}

function updateParam(name, value) {
  const v = parseFloat(value);
  params[name] = v;
  document.getElementById(name + '-value').textContent = v;
}

function updateColor(colorId, value) {
  const idx = parseInt(colorId.replace('color', '')) - 1;
  params.colors[idx] = value;
  document.getElementById(colorId + '-value').textContent = value;
}

function regenerate() { initializeSystem(); }

function updateSeedDisplay() { document.getElementById('seed-input').value = params.seed; }

function updateSeed() {
  const newSeed = parseInt(document.getElementById('seed-input').value);
  if (newSeed && newSeed > 0) { params.seed = newSeed; initializeSystem(); }
  else updateSeedDisplay();
}

function previousSeed() { params.seed = Math.max(1, params.seed - 1); updateSeedDisplay(); initializeSystem(); }
function nextSeed() { params.seed++; updateSeedDisplay(); initializeSystem(); }
function randomSeedAndUpdate() { params.seed = Math.floor(Math.random() * 999999) + 1; updateSeedDisplay(); initializeSystem(); }

function resetParameters() {
  Object.assign(params, JSON.parse(JSON.stringify(defaultParams)));
  ['particleCount', 'fieldStrength', 'turbulence', 'trailAlpha', 'lifespan', 'noiseScale'].forEach(k => {
    document.getElementById(k).value = params[k];
    document.getElementById(k + '-value').textContent = params[k];
  });
  for (let i = 0; i < params.colors.length; i++) {
    document.getElementById('color' + (i + 1)).value = params.colors[i];
    document.getElementById('color' + (i + 1) + '-value').textContent = params.colors[i];
  }
  updateSeedDisplay();
  initializeSystem();
}

function downloadPNG() {
  const link = document.createElement('a');
  link.download = `triadic-pressure-${params.seed}.png`;
  link.href = pg.canvas.toDataURL('image/png');
  link.click();
}

window.addEventListener('load', updateSeedDisplay);
