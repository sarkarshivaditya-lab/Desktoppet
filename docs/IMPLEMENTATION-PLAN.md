# Implementation plan

## Goal
Ship a lightweight German Shepherd companion as a native desktop app for Windows and macOS.

## Keep
- Tauri 2, Vite, TypeScript, and the existing original inline SVG character.
- Transparent, frameless, always-on-top window.
- Minimal dependencies and Tauri capabilities.

## Delivery order
1. Read Ponytail before coding; read the Tauri cross-platform skill before native window, plugin, input or packaging changes.
2. Keep the pet states small: idle, happy/wag, nap and hidden.
3. Ensure window dragging and native hide/show semantics work on real desktop builds.
4. Validate the current build and CI on both OS runners.
5. Add additional behaviors only after baseline packaging is reliable.

## Acceptance checklist
- [ ] A clean checkout installs dependencies successfully.
- [ ] `npm run build` succeeds.
- [ ] Tauri builds a Windows installer on a Windows runner.
- [ ] Tauri builds a macOS bundle on a macOS runner.
- [ ] Confirm transparent edges, no visible app background, focus/hide/show and pet dragging on both systems.
- [ ] Confirm buttons remain accessible and reduced-motion preference is honored.
- [ ] Inspect permissions and third-party notices before adding plugins or assets.

## Current limitations
- GitHub file editing can update and commit source, but does not run the app on this machine. Use CI and native OS verification for build/runtime claims.
- The current dog artwork is original inline SVG. Sprite assets were not imported from third-party pet repositories because their licence/provenance did not justify importing them.
