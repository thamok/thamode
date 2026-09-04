import { createMotion } from "./motion.js";
import "./style.css";

const arrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="site-shell">
    <header><a class="wordmark" href="/" aria-label="Thamo home">thamo.</a>
      <button class="speed-control" id="speed" aria-pressed="false"><span>Speed mode</span><span class="speed-light" aria-hidden="true"></span></button>
    </header>
    <main>
      <section class="intro" aria-label="About Thamo">
        <p class="eyebrow">SYSTEM ARCHITECT × SECURITY</p>
        <h1>Thamo A.<br>Köper</h1>
        <p class="description">I like Salesforce and Apple.<br>And I make them <button id="burst" class="inline-action">do things.</button></p>
        <nav aria-label="Get in touch"><a href="https://github.com/thamok" target="_blank" rel="noopener noreferrer">GITHUB ${arrow}</a><a href="mailto:contact@thamo.de">CONTACT ${arrow}</a></nav>
      </section>
      <figure class="scene"><canvas id="motion" aria-label="Interactive ASCII Salesforce cloud and Apple logo"></canvas><figcaption>Move your cursor. Make a little chaos.</figcaption></figure>
    </main>
    <footer><span>BERLIN, DE</span><span class="footer-note">Built with curiosity.</span><span>2026</span></footer>
    <p id="motion-status" class="sr-only" role="status"></p>
  </div>`;
const canvas = document.querySelector<HTMLCanvasElement>("#motion")!;
const speedButton = document.querySelector<HTMLButtonElement>("#speed")!;
const burstButton = document.querySelector<HTMLButtonElement>("#burst")!;
const status = document.querySelector<HTMLParagraphElement>("#motion-status")!;
let speed = false;
const motion = createMotion(canvas);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
function toggleSpeed() {
  speed = !speed;
  speedButton.setAttribute("aria-pressed", String(speed));
  document.documentElement.dataset.speed = String(speed);
  motion.setSpeed(speed);
  status.textContent = reduced.matches
    ? "Reduced motion is enabled. The artwork changes without continuous animation."
    : `Speed mode ${speed ? "on" : "off"}.`;
}
speedButton.addEventListener("click", toggleSpeed);
burstButton.addEventListener("click", () => {
  motion.burst();
  status.textContent = reduced.matches
    ? "Reduced motion is enabled. The artwork stays still."
    : "The characters scatter and reform.";
});
if (import.meta.hot) import.meta.hot.dispose(() => motion.destroy());
