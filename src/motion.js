import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

// Text is measured once. The animation only moves the resulting glyphs.
const FONT = "10px Courier New";
const ALPHABET = "01{}<>/+=:·";
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;
const hash = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function shapes() {
  const cloud = new Path2D();
  cloud.moveTo(19, 75);
  cloud.bezierCurveTo(1, 75, -3, 51, 11, 43);
  cloud.bezierCurveTo(5, 23, 30, 12, 43, 27);
  cloud.bezierCurveTo(54, 9, 78, 14, 84, 32);
  cloud.bezierCurveTo(104, 31, 111, 61, 94, 72);
  cloud.bezierCurveTo(87, 82, 73, 82, 65, 76);
  cloud.bezierCurveTo(55, 89, 34, 86, 29, 76);
  cloud.bezierCurveTo(25, 77, 22, 76, 19, 75);
  cloud.closePath();
  const apple = new Path2D();
  apple.moveTo(53, 29);
  apple.bezierCurveTo(61, 23, 75, 22, 84, 33);
  apple.bezierCurveTo(67, 42, 69, 59, 87, 65);
  apple.bezierCurveTo(82, 77, 72, 92, 63, 92);
  apple.bezierCurveTo(57, 92, 54, 88, 48, 88);
  apple.bezierCurveTo(41, 88, 37, 94, 30, 91);
  apple.bezierCurveTo(18, 87, 7, 65, 8, 49);
  apple.bezierCurveTo(8, 30, 23, 21, 35, 25);
  apple.bezierCurveTo(43, 27, 47, 31, 53, 29);
  apple.closePath();
  apple.moveTo(49, 24);
  apple.bezierCurveTo(48, 12, 57, 3, 70, 1);
  apple.bezierCurveTo(71, 13, 61, 23, 49, 24);
  apple.closePath();
  return [cloud, apple];
}

export function createMotion(canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { setSpeed() {}, burst() {}, destroy() {} };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const paths = shapes();
  const colors = ["#28c8ef", "#f3f5f7"];
  const glyphs = [...ALPHABET].map((text) => {
    const prepared = prepareWithSegments(text, FONT);
    const line = layoutWithLines(prepared, 100, 12).lines[0];
    return { text: line.text, width: line.width };
  });
  const brandFont = "italic 19px Georgia";
  const brand = prepareWithSegments("salesforce", brandFont);
  const brandLine = layoutWithLines(brand, 200, 24).lines[0];
  const particles = [];
  let index = 0;
  // Pretext's measured monospace width determines the silhouette's column grid.
  const spacingX = glyphs[0].width / 2.48;
  for (let shape = 0; shape < paths.length; shape++) {
    for (let y = 1; y < 96; y += 3.0) {
      for (let x = 0; x < 106; x += spacingX) {
        if (!ctx.isPointInPath(paths[shape], x, y)) continue;
        const seed = hash(++index);
        particles.push({
          shape,
          x: x - 50,
          y: y - 50,
          seed,
          glyph: glyphs[Math.floor(seed * glyphs.length)],
          angle: seed * Math.PI * 2,
          px: null,
          py: null,
        });
      }
    }
  }
  let width = 1,
    height = 1,
    scale = 1,
    speed = false,
    energy = 0;
  let frame = 0,
    lastTime = 0,
    elapsed = 0,
    impulse = 0,
    disposed = false;
  let pointer = { x: -1000, y: -1000 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(width / 245, height / 210, 3.1);
    particles.forEach((p) => {
      p.px = null;
      p.py = null;
    });
    render(0);
  }

  function center(shape, t) {
    const orbit = energy * 14;
    return {
      x:
        width * (shape ? 0.64 : 0.37) +
        Math.sin(t * 1.4 + shape * Math.PI) * orbit,
      y:
        height * (shape ? 0.67 : 0.32) +
        Math.cos(t * 1.1 + shape * Math.PI) * orbit,
    };
  }

  function render(dt) {
    const motion = !reduced.matches;
    elapsed += motion ? dt : 0;
    energy = mix(
      energy,
      speed ? 1 : 0,
      reduced.matches ? 1 : Math.min(1, dt * 3.5),
    );
    impulse *= Math.exp(-dt * 2.1);
    const t = elapsed;
    ctx.clearRect(0, 0, width, height);
    // A quiet technical field gives the moving type a reference plane.
    ctx.fillStyle = "#a8c1d9";
    for (let x = 22; x < width; x += 30) {
      for (let y = 18; y < height; y += 30) {
        ctx.globalAlpha = 0.105;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Two restrained typographic orbits connect the marks, accelerating with speed mode.
    for (let ring = 0; ring < 2; ring++) {
      ctx.fillStyle = colors[ring];
      ctx.font = 'bold 12px "Courier New"';
      for (let i = 0; i < 170; i++) {
        const a =
          (i / 170) * Math.PI * 2 +
          t * (0.035 + energy * 0.45) * (ring ? -1 : 1);
        const rx = width * 0.43,
          ry = height * (ring ? 0.17 : 0.2);
        const tilt = ring ? -0.48 : -0.64;
        const ex = Math.cos(a) * rx,
          ey = Math.sin(a) * ry;
        const x = width * 0.51 + ex * Math.cos(tilt) - ey * Math.sin(tilt);
        const y =
          height * (ring ? 0.6 : 0.43) +
          ex * Math.sin(tilt) +
          ey * Math.cos(tilt);
        ctx.globalAlpha =
          (0.32 + (Math.sin(a) + 1) * 0.22) * (0.75 + energy * 0.25);
        ctx.fillText(i % 13 === 0 ? "+" : "·", x, y);
      }
    }
    const centers = [center(0, t), center(1, t)];
    const pulse = motion
      ? Math.pow(Math.max(0, Math.sin(t * 1.35 - 1.4)), 8) * energy
      : 0;
    const scatter = Math.min(1.3, pulse * 0.9 + impulse);

    if (energy > 0.02) {
      ctx.strokeStyle = "#45c8f4";
      for (let i = 0; i < 15; i++) {
        const seed = hash(i + 400);
        const x =
          width - ((t * (120 + seed * 160) + seed * width * 3) % (width + 140));
        const y = seed * height;
        ctx.globalAlpha = energy * (0.05 + seed * 0.12);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20 + seed * 90, y - 8 - seed * 24);
        ctx.stroke();
      }
    }

    for (const p of particles) {
      const c = centers[p.shape];
      const breathing = motion ? Math.sin(t * 0.7 + p.shape * 2) * 0.015 : 0;
      const localScale = scale * (p.shape ? 0.91 : 1.1) * (1 + breathing);
      const swirl = scatter * (35 + p.seed * 80) * scale;
      let x =
        c.x + p.x * localScale + Math.cos(p.angle + t * energy * 0.7) * swirl;
      let y =
        c.y +
        p.y * localScale +
        Math.sin(p.angle + t * energy * 0.7) * swirl * 0.7;
      const dx = x - pointer.x,
        dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (motion && distance < 90 && distance > 0) {
        const force = Math.pow(1 - distance / 90, 2) * 34;
        x += (dx / distance) * force;
        y += (dy / distance) * force;
      }
      ctx.fillStyle = colors[p.shape];
      if (p.px !== null && energy > 0.1 && p.seed > 0.65) {
        ctx.strokeStyle = colors[p.shape];
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = energy * 0.16;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      const shimmer = motion ? Math.sin(t * (1 + energy * 6) + p.seed * 40) : 0;
      ctx.globalAlpha = 0.72 + p.seed * 0.23 + shimmer * 0.05;
      const fontSize = clamp(localScale * 3.6, 4.4, 11);
      ctx.font = `bold ${fontSize}px "Courier New"`;
      ctx.fillText(
        p.glyph.text,
        x - (p.glyph.width * fontSize) / 20,
        y + fontSize * 0.34,
      );
      p.px = x;
      p.py = y;
    }

    // The wordmark remains readable while its surrounding glyphs accelerate.
    const cloudCenter = centers[0];
    ctx.save();
    ctx.translate(cloudCenter.x, cloudCenter.y + scale * 2.5);
    const brandScale = scale * 0.68;
    ctx.scale(brandScale, brandScale);
    ctx.globalAlpha = 1 - scatter * 0.65;
    ctx.fillStyle = "#0d1014";
    ctx.beginPath();
    ctx.roundRect(-brandLine.width / 2 - 7, -18, brandLine.width + 14, 26, 12);
    ctx.fill();
    ctx.font = brandFont;
    ctx.fillStyle = "#bceeff";
    ctx.fillText(brandLine.text, -brandLine.width / 2, 1);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function tick(time) {
    frame = 0;
    if (disposed || document.hidden || reduced.matches) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 1 / 60;
    lastTime = time;
    render(dt);
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (!frame && !disposed && !document.hidden && !reduced.matches) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function onPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function onLeave() {
    pointer = { x: -1000, y: -1000 };
  }
  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else start();
  }
  function onReduced() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (reduced.matches) {
      impulse = 0;
      render(0);
    } else start();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("pointermove", onPointer);
  canvas.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReduced);
  resize();
  start();

  return {
    setSpeed(value) {
      speed = Boolean(value);
      if (reduced.matches) render(0);
      else start();
    },
    burst() {
      if (!reduced.matches) {
        impulse = 1.1;
        start();
      }
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onReduced);
    },
  };
}
