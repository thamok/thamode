import './style.css';
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
resize(); addEventListener('resize',resize);

function draw(t:number){
 ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let i=0;i<2000;i++){ ctx.fillStyle=`rgba(10,20,60,${Math.random()*0.2})`; ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,2,2);} 
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
