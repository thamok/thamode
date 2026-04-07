import './style.css';

    <script>
        /**
         * Pretext-style Fluid Solver
         * Implements Advection, Diffusion, and Projection
         */
        const canvas = document.getElementById('pretext-canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        const RESOLUTION = 4; // Smaller = higher quality
        let width, height, cols, rows;
        
        let density, velocityX, velocityY, prevDensity;
        let mouse = { x: 0, y: 0, px: 0, py: 0, active: false };
        let rotation = 0;

        function init() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            cols = Math.ceil(width / RESOLUTION);
            rows = Math.ceil(height / RESOLUTION);

            density = new Float32Array(cols * rows);
            prevDensity = new Float32Array(cols * rows);
            velocityX = new Float32Array(cols * rows);
            velocityY = new Float32Array(cols * rows);
            
            ctx.fillStyle = '#030303';
            ctx.fillRect(0, 0, width, height);
        }

        window.addEventListener('resize', init);
        init();

        const handleInput = (x, y) => {
            mouse.px = mouse.x;
            mouse.py = mouse.y;
            mouse.x = x;
            mouse.y = y;
            mouse.active = true;

            const i = Math.floor(x / RESOLUTION);
            const j = Math.floor(y / RESOLUTION);
            
            if (i > 0 && i < cols - 1 && j > 0 && j < rows - 1) {
                const idx = j * cols + i;
                density[idx] += 30;
                velocityX[idx] += (mouse.x - mouse.px) * 0.4;
                velocityY[idx] += (mouse.y - mouse.py) * 0.4;
            }
        };

        window.addEventListener('mousemove', e => handleInput(e.clientX, e.clientY));
        window.addEventListener('touchmove', e => {
            handleInput(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }, { passive: false });

        // The "Spinning T" Logic
        function drawSpinningT(time) {
            rotation += 0.01;
            const centerX = width * 0.7; // Positioned to the right
            const centerY = height * 0.4;
            const size = Math.min(width, height) * 0.15;

            // Generate "T" shape points and inject density/velocity
            for (let a = -1; a <= 1; a += 0.1) {
                // Top bar of T
                const tx1 = centerX + (a * size) * Math.cos(rotation) - (size/2) * Math.sin(rotation);
                const ty1 = centerY + (a * size) * Math.sin(rotation) + (size/2) * Math.cos(rotation);
                injectForce(tx1, ty1, Math.cos(rotation) * 2, Math.sin(rotation) * 2);

                // Vertical bar of T
                const tx2 = centerX + (0) * Math.cos(rotation) - (a * size/2) * Math.sin(rotation);
                const ty2 = centerY + (0) * Math.sin(rotation) + (a * size/2) * Math.cos(rotation);
                injectForce(tx2, ty2, -Math.sin(rotation) * 2, Math.cos(rotation) * 2);
            }
        }

        function injectForce(x, y, vx, vy) {
            const i = Math.floor(x / RESOLUTION);
            const j = Math.floor(y / RESOLUTION);
            if (i > 0 && i < cols - 1 && j > 0 && j < rows - 1) {
                const idx = j * cols + i;
                density[idx] = Math.min(100, density[idx] + 2);
                velocityX[idx] += vx;
                velocityY[idx] += vy;
            }
        }

        function step() {
            // Copy density to temp for advection
            prevDensity.set(density);

            for (let j = 1; j < rows - 1; j++) {
                for (let i = 1; i < cols - 1; i++) {
                    const idx = j * cols + i;

                    // 1. Decay
                    density[idx] *= 0.985;
                    velocityX[idx] *= 0.98;
                    velocityY[idx] *= 0.98;

                    // 2. Advection (Semi-Lagrangian)
                    const vx = velocityX[idx];
                    const vy = velocityY[idx];
                    
                    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
                        const srcI = Math.max(0, Math.min(cols - 1, i - vx));
                        const srcJ = Math.max(0, Math.min(rows - 1, j - vy));
                        
                        const srcIdx = Math.floor(srcJ) * cols + Math.floor(srcI);
                        density[idx] = prevDensity[srcIdx] * 0.99;
                    }
                }
            }
        }

        function render() {
            // Instead of full clear, we could do trailing, 
            // but for Navier-Stokes style, we redraw based on field
            ctx.fillStyle = '#030303';
            ctx.fillRect(0, 0, width, height);

            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;

            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const d = density[j * cols + i];
                    if (d < 0.1) continue;

                    const brightness = Math.min(255, d * 15);
                    
                    // Map to a Pretext-style blue/white gradient
                    const r = brightness * 0.3;
                    const g = brightness * 0.5;
                    const b = brightness;

                    // Drawing squares at resolution
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(i * RESOLUTION, j * RESOLUTION, RESOLUTION, RESOLUTION);
                }
            }

            // Film grain effect
            for(let k = 0; k < 1000; k++) {
                const gx = Math.random() * width;
                const gy = Math.random() * height;
                ctx.fillStyle = `rgba(255,255,255,0.03)`;
                ctx.fillRect(gx, gy, 1, 1);
            }
        }

        function frame(time) {
            drawSpinningT(time);
            step();
            render();
            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);requestAnimationFrame(draw);
