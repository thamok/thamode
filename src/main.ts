import './style.css';
const canvas=document.getElementById('smoke') as HTMLCanvasElement;
const ctx=canvas.getContext('2d')!;
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();addEventListener('resize',resize);
function noise(x:number,y:number){return Math.sin(x*12.9898+y*78.233)*43758.5453%1}
function draw(t:number){ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
for(let y=0;y<canvas.height;y+=2){for(let x=0;x<canvas.width;x+=2){let n=Math.abs(Math.sin(x*0.002+y*0.002+t*0.0005));let a=Math.pow(n,3);let r=5,g=15,b=40+80*a;ctx.fillStyle=`rgba(${r},${g},${b},${a})`;ctx.fillRect(x,y,2,2)}}
// grain
for(let i=0;i<3000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.03})`;ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,1,1)}
requestAnimationFrame(draw)}
requestAnimationFrame(draw);
