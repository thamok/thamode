# thamo.de

Minimal personal website for Thamo A. Köper, built with Vite, TypeScript, and @chenglou/pretext. The interactive canvas renders a Salesforce cloud and Apple mark from measured text glyphs.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5178
```

## Validate and build

```sh
npx tsc --noEmit
npm run build
```

Vite emits the static website to `dist/`.

## Deployment

Cloudflare Pages project `thamode` is connected to `https://github.com/thamok/thamode`. Pushing to `main` triggers a production build with `npm run build` and publishes `dist/` to `https://thamo.de` and `https://thamode.pages.dev`.

Open Cloudflare → Workers & Pages → `thamode` → Deployments to check build status or roll back to an earlier successful production deployment. DNS already points `thamo.de` to the Pages project; routine updates only require a Git push.

Before shipping, run the validation commands above, commit the intended source changes, and push to `origin/main`. Confirm the successful Cloudflare deployment matches that commit, then check the custom domain in a browser.

## Interaction

- Speed mode accelerates the scene and triggers recurring scatter/reform cycles.
- Select “do things.” for a single burst.
- Move the pointer through the artwork to repel nearby glyphs.
- Reduced-motion preferences disable continuous motion and bursts.

`src/main.ts` owns semantic content and controls. `src/motion.js` owns the canvas lifecycle and cached Pretext measurements. `src/style.css` owns responsive layout and tokens. Monaspace is self-hosted in `public/fonts` with its license.

The working copy already contained uncommitted changes when this redesign began. `artifacts/before-speed-mode.patch`, `artifacts/before-main.ts`, and `artifacts/before-style.css` preserve that starting point. The patch records the entire pre-existing tracked diff; avoid applying it blindly over later work.
