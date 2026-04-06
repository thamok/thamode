import './style.css';
const canvas=document.getElementById('smoke') as HTMLCanvasElement;
const ctx=canvas.getContext('2d')!;
let mouse={x:0,y:0,active:false};
let ripples: {x:number,y:number,t:number}[]=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();addEventListener('resize',resize);
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true});
addEventListener('touchmove',e=>{mouse.x=e.touches[0].clientX;mouse.y=e.touches[0].clientY;mouse.active=true});
addEventListener('click',e=>{ripples.push({x:e.clientX,y:e.clientY,t:0})});
function draw(time:number){ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
for(let y=0;y<canvas.height;y+=2){for(let x=0;x<canvas.width;x+=2){let dx=x-mouse.x,dy=y-mouse.y;let dist=Math.sqrt(dx*dx+dy*dy)||1;
let influence=mouse.active?Math.max(0,1-dist/300):0;
let base=Math.sin(x*0.002+y*0.002+time*0.0004);
let flow=base+influence*0.8;
for(let r of ripples){let rd=Math.hypot(x-r.x,y-r.y);let wave=Math.sin(rd*0.05-r.t*0.02);flow+=wave*0.5*Math.max(0,1-rd/400)}
let a=Math.pow(Math.abs(flow),2.2);
let rC=5,g=15,b=40+100*a;
ctx.fillStyle=`rgba(${rC},${g},${b},${a})`;
ctx.fillRect(x,y,2,2)}}
for(let r of ripples){r.t+=16}
ripples=ripples.filter(r=>r.t<2000);
// grain
for(let i=0;i<2000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.03})`;ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,1,1)}
requestAnimationFrame(draw)}
requestAnimationFrame(draw);
