import './style.css';

const canvas = document.getElementById('smoke') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let mouse = { x: 0, y: 0, active: false };
let ripples: { x: number; y: number; t: number }[] = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener('resize', resize);

addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

addEventListener('touchmove', (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
  mouse.active = true;
});

addEventListener('click', (e) => {
  ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
});

// pseudo velocity buffer
let prevField: Float32Array | null = null;

function draw(time: number) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const field = new Float32Array(w * h);

  // approximate T center influence
  const tCenterX = w * 0.18;
  const tCenterY = h * 0.28;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = y * w + x;

      const dxM = x - mouse.x;
      const dyM = y - mouse.y;
      const distM = Math.hypot(dxM, dyM) || 1;
      const mouseForce = mouse.active ? Math.max(0, 1 - distM / 260) : 0;

      // T gravity
      const dxT = x - tCenterX;
      const dyT = y - tCenterY;
      const distT = Math.hypot(dxT, dyT) || 1;
      const tForce = Math.max(0, 1 - distT / 420);

      const base = Math.sin(x * 0.002 + y * 0.002 + time * 0.00035);

      let flow = base + mouseForce * 1.1 + tForce * 0.6;

      for (let r of ripples) {
        const rd = Math.hypot(x - r.x, y - r.y);
        const wave = Math.sin(rd * 0.045 - r.t * 0.018);
        flow += wave * 0.6 * Math.max(0, 1 - rd / 420);
      }

      // inertia (previous frame influence)
      if (prevField) {
        flow = flow * 0.7 + prevField[i] * 0.3;
      }

      field[i] = flow;

      const a = Math.pow(Math.abs(flow), 2.4);

      const rC = 4 + a * 10;
      const g = 10 + a * 24;
      const b = 28 + a * 90;

      ctx.fillStyle = `rgba(${rC},${g},${b},${a})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  prevField = field;

  for (let r of ripples) r.t += 16;
  ripples = ripples.filter((r) => r.t < 2200);

  // grain
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
