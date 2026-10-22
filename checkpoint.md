# DesktopPet — Project Checkpoint

**Checkpoint date:** 2026-10-22  
**Baseline commit:** `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`  
**Interaction branch:** `feat/desktop-pet-interactions`  
**Repository:** https://github.com/sarkarshivaditya-lab/Desktoppet  
**Status:** First interaction milestone committed to `feat/desktop-pet-interactions`; native build/runtime verification pending.\n**Latest implementation commit before this checkpoint update:** `2a5966302c8890c8f44abfe77cc72e8325d41181`

## Product goal

Build a lightweight desktop-resident German Shepherd companion rather than a conventional app panel. Target behaviours are cursor-aware eyes, idle blinks, typing reactions, gentle desktop roaming, and eventually perching/hanging from other windows where native platform APIs allow it.

## Baseline and architecture

- Tauri 2 native desktop shell with Rust entry points under `src-tauri/src/`.
- Vanilla TypeScript frontend served by Vite; the actual entry point is `src/main.ts` and styling is in `src/style.css` (not React).
- The Tauri window is configured transparent, frameless, always-on-top, non-resizable, and hidden from the taskbar.
- Original German Shepherd SVG is embedded in `src/main.ts`.
- Baseline commit: `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`.

## Implemented in this milestone

- Eye groups respond to pointer movement within the pet window, with bounded movement and a short easing transition.
- Periodic idle blinks animate the eye groups.
- Key activity delivered to the pet window triggers a brief bounce/tail animation. The app does not record or retain typed text.
- In Tauri runtime, the pet periodically chooses a nearby safe destination within the current monitor and animates the native window there with eased incremental position updates over roughly 1.4 seconds. Each roam is capped at about 260 physical pixels.
- Manual pointer interaction postpones roaming for 12 seconds; napping pauses roaming.
- Added narrow Tauri permissions for reading the current monitor/outer window size and setting the window position.
- Existing petting, hello, nap, and hide controls are retained.

## Known limitations and risks

- **Typing reaction scope:** current implementation reacts only to keyboard events delivered to the pet window. It does not observe typing in other applications. System-wide activity detection has not been implemented; it needs a native, permission-sensitive design and explicit opt-in, and must never capture key values or typed text.
- **Window perching:** roaming is screen-bounded, not yet attached to arbitrary application-window edges. Reliable window enumeration/attachment requires OS-specific native work (and separate validation on macOS and Windows).
- **Roaming UX:** native window animation now interpolates between nearby positions rather than jumping instantly. Tauri/macOS scheduling may still constrain how smooth external window movement appears; this needs local runtime testing.
- **Platform verification:** the implementation has not yet been built or exercised on the user's machine from this branch. macOS and Windows behavior must be tested separately.
- **Reduced motion:** CSS respects `prefers-reduced-motion`; the native roaming timer should also be disabled when reduced-motion preference is active in a future refinement.
- **Icon:** `icons/icon-test.png` remains a diagnostic icon and should be replaced by the production app icon after validating it.

## Verification status

Not run by the editing agent: `npm run build`, `npm run tauri -- dev`, Rust build, macOS runtime interaction, Windows build/runtime, multi-monitor testing. Smooth roaming was committed in `113532bf1000d78eb692f3734b776473342c8cc3`; no build success is claimed.

## Next steps

1. Pull the latest feature branch and run `npm run build` plus `npm run tauri -- dev`.
2. Implement a native screen-level pointer source so gaze follows the cursor while other applications are focused; keep permissions minimal.
3. Design an explicit opt-in for global typing-activity sensing without collecting key values or text; implement separately for macOS and Windows.
4. Validate movement smoothness and allow roaming to be disabled.
5. Implement window-edge perching only after a platform-specific approach is chosen and tested.


## Transparent cutout milestone (2026-10-22)

- Removed the visible card treatment through CSS: no opaque shell, border, rounded corners, panel shadow, toolbar, text bubble, action buttons, or labels.
- The SVG dog now fills the transparent native window as the only visible element; the SVG's own soft drop shadow remains.
- Tauri window config was already set to `transparent: true`, `decorations: false`, and a fully transparent RGBA background, so no native config change was required for this visual milestone.
- This is a visual cutout, not yet an alpha-shaped native hit-test region: the rectangular transparent window can still intercept pointer input in its bounds. True click-through outside the dog requires native hit-testing work and must be designed without breaking petting.
- Build/runtime verification remains pending.
