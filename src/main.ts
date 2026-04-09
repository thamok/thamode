import {
  layoutWithLines,
  measureNaturalWidth,
  prepareWithSegments,
} from "@chenglou/pretext";
import "./style.css";

const MONO_FAMILY =
  '"Monaspace Site", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

const COPY = {
  eyebrow: "SYSTEM ARCHITECT × SECURITY",
  title: "Thamo A. Köper",
  body: "I like Salesforce and Apple. And I make them do things.",
  status: "BERLIN 👾 2026",
  links: [
    { label: "GITHUB", href: "https://github.com/thamok", external: true },
    { label: "CONTACT", href: "mailto:contact@thamo.de", external: false },
  ],
} as const;

const APPLE_ASCII = [
  "                     ..'",
  "                 ,xNMM.",
  "               .OMMMMo",
  '               lMM"',
  "     .;loddo:.  .olloddol;.",
  "   cKMMMMMMMMMMNWMMMMMMMMMM0:",
  " .KMMMMMMMMMMMMMMMMMMMMMMMWd.",
  " XMMMMMMMMMMMMMMMMMMMMMMMX.",
  ";MMMMMMMMMMMMMMMMMMMMMMMM:",
  ":MMMMMMMMMMMMMMMMMMMMMMMM:",
  ".MMMMMMMMMMMMMMMMMMMMMMMX.",
  " kMMMMMMMMMMMMMMMMMMMMMMMMWd.",
  " 'XMMMMMMMMMMMMMMMMMMMMMMMMMMk",
  "  'XMMMMMMMMMMMMMMMMMMMMMMMMK.",
  "    kMMMMMMMMMMMMMMMMMMMMMMd",
  "     ;KMMMMMMMWXXWMMMMMMMk.",
  '       "cooc*"    "*coo\'"',
] as const;

const LOWER_ASCII = [
  "",
  "                 .:-=======-:.",
  "             .-=+++++++++++++++=-.        .:--=====--:.",
  "           :=+++++++++++++++++++++=:   .-+++++++++++++++=:",
  "        :++++++++++++++++++++++++++++++++++++++++++++++++++++-   .:::---::..",
  "       -++++++++++++++++++++++++++++++++++++++++++++++++++++++==+++++++++++++=-:",
  "      .++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=:",
  "      -++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.",
  "       +++++++++++++++++++++- -++++++++++++++++++=:..-+++++++++++++++++++++++++++++++++",
  "      .=+++++++===+++=====++- -+++===++++====+++=  ==++===++++=+==+++====+++===++++++++:",
  "    :=+++++++- ::::+=.::: .+- -+: ::: :+- ::::+=. .:=: ::: -+-  ::+: .::-=. ::..=++++++-",
  "  .=+++++++++- .:-=+=:...  =- -=  :::  +- .:-=++: =+- :+++. =- =++- :++++: .::: :++++++-",
  " :+++++++++++=+=-. =. =++. =- -=  =====+=+=-. =+..++= .+++. =- =++= .++++- :=====++++++:",
  ".++++++++++++:... :+-.... .+- -+=. ...-+:... :+= -+++-... .=+- =+++-. ..:+-. ...=++++++.",
  "=++++++++++++++++++++++++++++++++++++++++++++++. +++++++++++++++++++++++++++++++++++++++-",
  "++++++++++++++++++++++++++++++++++++++++++++=..:=+++++++++++++++++++++++++++++++++++++-",
  " =++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=.",
  " .=++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-:",
  "    .-+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++:",
  "       :-=++++++++++++++++++++++++++++++++++++++++++++++++++++=:",
  "            ..::..-+++++++++++++++++++++++++++++-++++++++++=-.",
  "                   -++++++++++++++++++++++++++=.   ......",
  "                    :++++++++++++++++++++++++-",
  "                      :=+++++++++++++++++++-.",
  "                        .-=++++++++++++=-:",
] as const;

type Typography = {
  eyebrowFont: string;
  eyebrowLineHeight: number;
  titleFont: string;
  titleLineHeight: number;
  bodyFont: string;
  bodyLineHeight: number;
  linkFont: string;
  linkLineHeight: number;
  statusFont: string;
  statusLineHeight: number;
  panelWidth: number;
  artFont: string;
  artLineHeight: number;
};

type SmokeParticle = {
  node: HTMLDivElement;
  baseX: number;
  driftX: number;
  rise: number;
  phase: number;
  speed: number;
  size: number;
};

const root = getRequiredElement("app", HTMLDivElement);
root.innerHTML = `
  <div class="site-shell">
    <div class="ascii-layer" aria-hidden="true">
      <div class="ascii-stage" id="ascii-stage">
        <div class="ascii-group ascii-apple" id="ascii-apple">
          <div class="smoke-layer" id="smoke-layer"></div>
        </div>
        <div class="ascii-group ascii-cloud" id="ascii-cloud"></div>
      </div>
    </div>
    <main class="hero-layer" aria-label="Thamo site hero">
      <div class="hero-panel" id="hero-panel"></div>
      <div class="status-panel" id="status-panel"></div>
    </main>
    <section class="sr-only" aria-label="Site text">
      <h1>${COPY.title}</h1>
      <p>${COPY.eyebrow}</p>
      <p>${COPY.body}</p>
    </section>
  </div>
`;

const asciiStage = getRequiredElement("ascii-stage", HTMLDivElement);
const asciiApple = getRequiredElement("ascii-apple", HTMLDivElement);
const asciiCloud = getRequiredElement("ascii-cloud", HTMLDivElement);
const smokeLayer = getRequiredElement("smoke-layer", HTMLDivElement);
const heroPanel = getRequiredElement("hero-panel", HTMLDivElement);
const statusPanel = getRequiredElement("status-panel", HTMLDivElement);

let smokeParticles: SmokeParticle[] = [];
let smokeAnchorX = 0;
let smokeAnchorY = 0;
let animationFrameId = 0;

function getRequiredElement<T extends Element>(
  id: string,
  ctor: { new (): T },
): T {
  const element = document.getElementById(id);
  if (!(element instanceof ctor)) {
    throw new Error(`Expected #${id} to be a ${ctor.name}`);
  }
  return element;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function measureTextWidth(text: string, font: string): number {
  return measureNaturalWidth(prepareWithSegments(text, font));
}

function createGlyphSpan(glyph: string, index: number): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = glyph === " " ? "ascii-glyph ascii-glyph-space" : "ascii-glyph";
  span.textContent = glyph;
  span.style.setProperty("--glyph-index", `${index}`);
  return span;
}

function createSmokeParticles(): SmokeParticle[] {
  const glyphs = [".", "·", "°", "~", "˙", "°"] as const;
  return Array.from({ length: 11 }, (_, index) => {
    const node = document.createElement("div");
    node.className = "ascii-smoke rendered-line";
    node.textContent = glyphs[index % glyphs.length]!;
    smokeLayer.appendChild(node);
    return {
      node,
      baseX: (Math.random() - 0.2) * 28,
      driftX: 12 + Math.random() * 30,
      rise: 34 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.55 + Math.random() * 0.75,
      size: 10 + Math.random() * 10,
    };
  });
}

function fitSingleLineFont(
  text: string,
  maxWidth: number,
  minSize: number,
  maxSize: number,
): number {
  let low = minSize;
  let high = maxSize;
  let best = minSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const font = `400 ${mid}px ${MONO_FAMILY}`;
    if (measureTextWidth(text, font) <= maxWidth) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

function fitAsciiArt(
  artLines: readonly string[],
  maxWidth: number,
  maxHeight: number,
  minSize: number,
  maxSize: number,
): { font: string; lineHeight: number } {
  let chosenSize = minSize;

  for (let size = maxSize; size >= minSize; size--) {
    const font = `400 ${size}px ${MONO_FAMILY}`;
    const widestLine = Math.max(
      ...artLines.map((line) => measureTextWidth(line, font)),
    );
    const lineHeight = Math.round(size * 1.02);
    const totalHeight = lineHeight * artLines.length;
    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      chosenSize = size;
      break;
    }
  }

  return {
    font: `400 ${chosenSize}px ${MONO_FAMILY}`,
    lineHeight: Math.round(chosenSize * 1.02),
  };
}

function computeTypography(): Typography {
  const viewportWidth = window.innerWidth;
  const panelWidth = clamp(viewportWidth * 0.58, 360, 760);
  const eyebrowSize = clamp(Math.round(viewportWidth * 0.012), 12, 15);
  const titleMaxSize = clamp(Math.round(viewportWidth * 0.058), 40, 76);
  const titleSize = fitSingleLineFont(COPY.title, panelWidth, 30, titleMaxSize);
  const bodySize = clamp(Math.round(viewportWidth * 0.017), 16, 20);
  const linkSize = clamp(Math.round(viewportWidth * 0.012), 12, 14);
  const statusSize = clamp(Math.round(viewportWidth * 0.01), 11, 13);
  const artMetrics = fitAsciiArt(
    APPLE_ASCII,
    clamp(window.innerWidth * 0.34, 220, 520),
    clamp(window.innerHeight * 0.28, 120, 280),
    8,
    18,
  );

  return {
    eyebrowFont: `400 ${eyebrowSize}px ${MONO_FAMILY}`,
    eyebrowLineHeight: Math.round(eyebrowSize * 1.5),
    titleFont: `400 ${titleSize}px ${MONO_FAMILY}`,
    titleLineHeight: Math.round(titleSize * 1.06),
    bodyFont: `400 ${bodySize}px ${MONO_FAMILY}`,
    bodyLineHeight: Math.round(bodySize * 1.7),
    linkFont: `400 ${linkSize}px ${MONO_FAMILY}`,
    linkLineHeight: Math.round(linkSize * 1.4),
    statusFont: `400 ${statusSize}px ${MONO_FAMILY}`,
    statusLineHeight: Math.round(statusSize * 1.4),
    panelWidth,
    artFont: artMetrics.font,
    artLineHeight: artMetrics.lineHeight,
  };
}

function renderAsciiGroup(
  container: HTMLDivElement,
  artLines: readonly string[],
  font: string,
  lineHeight: number,
  includeSmokeLayer = false,
): { width: number; height: number } {
  container.replaceChildren();
  if (includeSmokeLayer) container.appendChild(smokeLayer);

  let widestLine = 0;
  for (const line of artLines) {
    widestLine = Math.max(widestLine, Math.ceil(measureTextWidth(line, font)));
    const row = document.createElement("div");
    row.className = "ascii-row ascii-art-line";
    row.style.font = font;
    row.style.height = `${lineHeight}px`;
    row.style.lineHeight = `${lineHeight}px`;
    Array.from(line).forEach((glyph, index) => {
      row.appendChild(createGlyphSpan(glyph, index));
    });
    container.appendChild(row);
  }

  container.style.width = `${Math.max(widestLine, 1)}px`;
  container.style.height = `${artLines.length * lineHeight}px`;
  return {
    width: Math.max(widestLine, 1),
    height: artLines.length * lineHeight,
  };
}

function createBlock(
  text: string,
  font: string,
  lineHeight: number,
  maxWidth: number,
  className: string,
): HTMLDivElement {
  const prepared = prepareWithSegments(text, font);
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);
  const block = document.createElement("div");
  block.className = `hero-block ${className}`;
  let widestLine = 0;

  for (const line of lines) {
    const width = Math.ceil(measureTextWidth(line.text, font));
    widestLine = Math.max(widestLine, width);
    const lineNode = document.createElement("div");
    lineNode.className = "rendered-line";
    lineNode.textContent = line.text;
    lineNode.style.font = font;
    lineNode.style.height = `${lineHeight}px`;
    lineNode.style.lineHeight = `${lineHeight}px`;
    lineNode.style.width = `${Math.max(width, 1)}px`;
    block.appendChild(lineNode);
  }

  block.style.width = `${Math.max(widestLine, 1)}px`;
  return block;
}

function createSingleLineBlock(
  text: string,
  font: string,
  lineHeight: number,
  className: string,
): HTMLDivElement {
  const block = document.createElement("div");
  block.className = `hero-block ${className}`;
  const width = Math.ceil(measureTextWidth(text, font));
  const lineNode = document.createElement("div");
  lineNode.className = "rendered-line";
  lineNode.textContent = text;
  lineNode.style.font = font;
  lineNode.style.height = `${lineHeight}px`;
  lineNode.style.lineHeight = `${lineHeight}px`;
  lineNode.style.width = `${Math.max(width, 1)}px`;
  block.style.width = `${Math.max(width, 1)}px`;
  block.appendChild(lineNode);
  return block;
}

function renderAsciiArt(typography: Typography): void {
  asciiStage.className = "ascii-stage ascii-art";
  const apple = renderAsciiGroup(
    asciiApple,
    APPLE_ASCII,
    typography.artFont,
    typography.artLineHeight,
    true,
  );
  const cloudFont = typography.artFont.replace(
    /\d+px/,
    `${Math.max(6, Math.round(typography.artLineHeight * 0.72))}px`,
  );
  const cloudLineHeight = Math.max(
    7,
    Math.round(typography.artLineHeight * 0.72),
  );
  renderAsciiGroup(asciiCloud, LOWER_ASCII, cloudFont, cloudLineHeight);
  smokeLayer.style.width = `${apple.width}px`;
  smokeLayer.style.height = `${apple.height}px`;
  smokeAnchorX = Math.ceil(
    measureTextWidth("                 ,xNMM.", typography.artFont),
  );
  smokeAnchorY = typography.artLineHeight * 1.2;
}

function renderHero(): void {
  const typography = computeTypography();
  renderAsciiArt(typography);
  heroPanel.replaceChildren();
  heroPanel.style.width = `${typography.panelWidth}px`;

  heroPanel.append(
    createBlock(
      COPY.eyebrow,
      typography.eyebrowFont,
      typography.eyebrowLineHeight,
      typography.panelWidth,
      "hero-eyebrow",
    ),
    createSingleLineBlock(
      COPY.title,
      typography.titleFont,
      typography.titleLineHeight,
      "hero-title",
    ),
    createBlock(
      COPY.body,
      typography.bodyFont,
      typography.bodyLineHeight,
      typography.panelWidth * 0.78,
      "hero-body",
    ),
  );

  const links = document.createElement("div");
  links.className = "hero-links";
  for (const link of COPY.links) {
    const width = Math.ceil(measureTextWidth(link.label, typography.linkFont));
    const anchor = document.createElement("a");
    anchor.className = "hero-link";
    anchor.href = link.href;
    anchor.ariaLabel = link.label;
    if (link.external) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }
    anchor.style.width = `${width}px`;
    anchor.style.height = `${typography.linkLineHeight}px`;

    const label = document.createElement("div");
    label.className = "rendered-line";
    label.textContent = link.label;
    label.style.font = typography.linkFont;
    label.style.height = `${typography.linkLineHeight}px`;
    label.style.lineHeight = `${typography.linkLineHeight}px`;
    label.style.width = `${width}px`;
    anchor.appendChild(label);
    links.appendChild(anchor);
  }
  heroPanel.appendChild(links);

  statusPanel.replaceChildren(
    createBlock(
      COPY.status,
      typography.statusFont,
      typography.statusLineHeight,
      220,
      "hero-status",
    ),
  );
}

function relayout(): void {
  renderHero();
}

function updateSmoke(now: number): void {
  const glowBoost = 0.72;
  for (const particle of smokeParticles) {
    const t = now * 0.001 * particle.speed + particle.phase;
    const sin = Math.sin(t);
    const cos = Math.cos(t * 0.8);
    const rise = ((t * 18) % particle.rise) / particle.rise;
    const x = smokeAnchorX + particle.baseX + sin * particle.driftX * glowBoost;
    const y = smokeAnchorY - rise * particle.rise - cos * 8;
    const opacity = (1 - rise) * (0.16 + glowBoost * 0.22);
    const scale = 0.78 + rise * 0.7;
    particle.node.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    particle.node.style.opacity = opacity.toFixed(3);
    particle.node.style.font = `300 ${particle.size}px ${MONO_FAMILY}`;
  }
}

function animate(now: number): void {
  updateSmoke(now);
  animationFrameId = window.requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  relayout();
});

async function bootstrap(): Promise<void> {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
  smokeParticles = createSmokeParticles();
  relayout();
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(animate);
}

void bootstrap();
