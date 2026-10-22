# DesktopPet — Project Checkpoint

**Checkpoint date:** 2026-10-22  
**Baseline commit:** `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`  
**Interaction branch:** `feat/desktop-pet-interactions`  
**Repository:** https://github.com/sarkarshivaditya-lab/Desktoppet  
**Status:** Core prototype and transparent dog-only presentation are in place; moving into fine-tuning. User reports the basics are now complete. The editing agent has not independently run a local build/runtime check.

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

## Fine-tuning phase

The user has confirmed the basics are complete and wants to shift from foundational implementation to polish. Preserve the dog-only transparent cutout; do not reintroduce the card UI.

Priority polish areas:

1. Visual proportions and framing: keep the SVG at its natural aspect ratio, avoid clipping ears/tail/paws, and keep the dog visually centered in the transparent window.
2. Interaction feel: tune blink timing, gaze range/easing, petting feedback, and idle movement so animations feel subtle rather than repetitive.
3. Roaming feel: tune idle delay, movement distance/duration, and pauses based on actual runtime observations; avoid abrupt or overly frequent movement.
4. Desktop integration: evaluate click-through outside the dog while preserving clicks on the dog; separately consider global cursor tracking and opt-in typing activity if still desired.
5. Packaging polish: replace the diagnostic icon and validate macOS behavior before claiming platform support.

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


## Current phase handoff

- Corrected the SVG sizing in `src/style.css`: the dog now uses a bounded width and automatic height, preserving the 280×270 viewBox ratio instead of stretching to fill the 320×360 window. This is a source change only; it has not been runtime-verified by the editing agent.
- User's statement that the basics are complete is the current product-status signal; it does not constitute a build log. Keep verification claims explicit.


## Fine-tuning pass 1 — tail, gaze, gait (2026-10-22)

- Wrapped the tail shape in a dedicated SVG group so the animation pivots near the tail's attachment point rather than around the path's center.
- Increased tail wag angle and repetitions on petting/hello and typing reactions; added a smaller continuous tail swing while walking.
- Increased eye gaze translation range from approximately ±2.5 px horizontally / ±2 px vertically to ±5 px / ±4 px. This still responds only to pointer movement delivered to the pet window; system-wide cursor tracking remains separate native work.
- Added semantic classes to the four leg shapes and CSS gait animation with alternating leg movement plus body bob while the native window is roaming.
- CSS/source changes are committed to the feature branch but have not been built or runtime-tested by the editing agent. Verify that SVG transform origins and leg pivots look natural on the actual macOS runtime; CSS rotations on SVG paths can vary in appearance.


## Fine-tuning pass 2 — fix non-moving tail/legs (2026-10-22)

- User reported the tail and limbs still did not visibly animate; only the entire cutout swayed during roaming.
- Root cause found in the CSS: selectors referenced `@keyframes leg-step` and `@keyframes tail-walk`, but those keyframes were absent, so those animations could not run. Also, the tail group used an unreliable view-box coordinate pivot.
- Added the missing leg-step and tail-walk keyframes, made leg rotation pivots relative to each leg's own SVG bounds, and set the tail pivot relative to the tail group's fill bounds. Increased wag articulation to make it visible.
- Reduced whole-body walk bob to a subtle ±2px / ±0.5deg so it no longer dominates the gait.
- This fixes a confirmed source-level omission, but still requires `npm run build` and runtime confirmation. Do not mark animation verified until user tests it.


## Fine-tuning pass 3 — idle tail wag (2026-10-22)

- Added a subtle looping tail wag while the pet is idle, without requiring a click or roaming.
- Idle wag is paused during the walk, nap, and short typing/petting reaction so the animations do not compete. Idle mode resumes after those reactions.
- Current keydown listener still only receives keys when the pet window itself receives keyboard events. Reacting to typing in other apps needs a native, explicit opt-in activity signal; this pass does not claim system-wide typing detection.
- Build and runtime verification remain pending.
