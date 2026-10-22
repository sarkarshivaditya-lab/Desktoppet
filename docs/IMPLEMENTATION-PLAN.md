# Implementation plan

## Goal
Ship a lightweight German Shepherd companion as a native desktop app for Windows and macOS.

## Keep
- Tauri 2, Vite, TypeScript, and the existing original inline SVG character.
- Transparent, frameless, always-on-top window.
- Minimal dependencies and Tauri capabilities.

## Delivery order
1. Keep Ponytail mandatory and keep research/licensing rules visible to agents.
2. Make the interactive pet work with a small, testable state model: idle, happy/wag, nap, hidden.
3. Ensure window dragging and native hide/show semantics work on real desktop builds.
4. Validate the current build and CI on both OS runners; keep CI installs reproducible.
5. Add a small set of genuinely useful behaviors only after baseline packaging is reliable.

## Acceptance checklist
- [ ] `npm ci` succeeds on a clean checkout.
- [ ] `npm run build` succeeds.
- [ ] Tauri builds a Windows installer on a Windows runner.
- [ ] Tauri builds a macOS bundle on a macOS runner.
- [ ] Confirm transparent edges, no visible app background, focus/hide/show and pet dragging on both systems.
- [ ] Confirm buttons remain accessible and reduced-motion preference is honored.
- [ ] Inspect permissions and third-party notices before adding plugins or assets.

## Current limitations
- The code-hosting editor can update repository text, but not run the app on this machine. Use CI and physical OS verification for build/runtime claims.
- Sprite assets are not imported from third-party pet repos. The current dog artwork is original SVG and avoids unclear art provenance.
