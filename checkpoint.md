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
- In Tauri runtime, the pet periodically chooses a random safe position within the current monitor and moves there after a short walking animation.
- Manual pointer interaction postpones roaming for 12 seconds; napping pauses roaming.
- Added narrow Tauri permissions for reading the current monitor/outer window size and setting the window position.
- Existing petting, hello, nap, and hide controls are retained.

## Known limitations and risks

- **Typing reaction scope:** current implementation reacts only to keyboard events delivered to the pet window. It does not observe typing in other applications. Detecting system-wide keyboard activity would require a separate native, permission-sensitive design and privacy review; no keystroke contents should ever be captured.
- **Window perching:** roaming is screen-bounded, not yet attached to arbitrary application-window edges. Reliable window enumeration/attachment requires OS-specific native work (and separate validation on macOS and Windows).
- **Roaming UX:** the window moves between random positions every roughly 22–40 seconds. This must be tried locally; if disruptive, reduce frequency or add a user toggle.
- **Platform verification:** the implementation has not yet been built or exercised on the user's machine from this branch. macOS and Windows behavior must be tested separately.
- **Reduced motion:** CSS respects `prefers-reduced-motion`; the native roaming timer should also be disabled when reduced-motion preference is active in a future refinement.
- **Icon:** `icons/icon-test.png` remains a diagnostic icon and should be replaced by the production app icon after validating it.

## Verification status

Not run by the editing agent: `npm run build`, `npm run tauri -- dev`, Rust build, macOS runtime interaction, Windows build/runtime, multi-monitor testing.

## Next steps

1. Pull this branch and run the frontend build.
2. Run Tauri development mode; resolve any permission/API compile or runtime errors.
3. Validate cursor gaze, blink, typing reaction while the pet window is focused, and safe roaming. Adjust or disable roaming if it interferes with normal use.
4. Design a dedicated, user-controlled desktop mode.
5. Implement window-edge perching only after a platform-specific approach is chosen and tested.
