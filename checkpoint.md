# DesktopPet — Project Checkpoint

**Checkpoint date:** 2026-10-24  
**Baseline commit:** `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`  
**Interaction branch:** `feat/desktop-pet-interactions`  
**Repository:** https://github.com/sarkarshivaditya-lab/Desktoppet  
**Status:** Core prototype and transparent dog-only presentation are in place. User has confirmed that global typing reactions and the existing interactions work on macOS. Windows runtime verification remains pending; the editing agent has not independently run a local build/runtime check.

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

- **Typing reaction scope:** a native activity-only implementation is now present on the interaction branch for macOS (listen-only CoreGraphics event tap) and Windows (low-level keyboard hook). It records only the time of a key-down activity and exposes only a recent-activity boolean to the frontend. It must not inspect, emit, log, or persist key values or text. macOS Input Monitoring permission may be required. The user has now verified the macOS implementation in runtime; Windows still requires a separate build and runtime test.
- **Window perching:** roaming is screen-bounded, not yet attached to arbitrary application-window edges. Reliable window enumeration/attachment requires OS-specific native work (and separate validation on macOS and Windows).
- **Roaming UX:** native window animation now interpolates between nearby positions rather than jumping instantly. Tauri/macOS scheduling may still constrain how smooth external window movement appears; this needs local runtime testing.
- **Platform verification:** the user reports successful macOS runtime behavior for global typing and existing interactions. Windows behavior remains unverified and must be tested separately.
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


## Build warning fix — tail-idle CSS (2026-10-22)

- User ran `npm run build`: TypeScript and Vite completed, but CSS minification reported literal `\\n` characters inside the `@keyframes tail-idle` declaration.
- Fixed the CSS source by replacing those escaped newline sequences with actual line breaks. The prior build did finish, but this warning meant the idle keyframes were not being parsed correctly.
- Awaiting user's next `npm run build` output to verify the warning is gone.


## Quality-of-life pass 1 — resizable pet window (2026-10-22)

- Enabled native window resizing in `src-tauri/tauri.conf.json`; retained the existing minimum size of 260×280 so the dog cannot be reduced indefinitely.
- Updated `.dog-art` to scale within the available window dimensions while preserving the SVG viewBox aspect ratio, so resizing should visibly change the pet size instead of leaving the artwork capped at 320px wide.
- Changes are on `feat/desktop-pet-interactions`. Build/runtime behavior has not been independently verified; test by pulling the branch, rebuilding, then dragging a window edge/corner.


## Quality-of-life pass 2 — manual dragging (2026-10-22)

- Added native Tauri window dragging when the user presses the primary mouse button on the dog, so the pet can be repositioned manually instead of relying only on autonomous roaming.
- Manual pointer-down refreshes the interaction timestamp, postponing autonomous roaming. A normal click should still trigger the existing petting response; verify on macOS because native drag/click event interaction can vary.
- Uses Tauri's native window-drag API rather than custom JavaScript position tracking. Build/runtime verification remains pending.


## Manual drag permission fix (2026-10-22)

- User reported that click-and-drag did not move the pet after the frontend handler was added.
- Source audit found the Tauri capability file did not grant `core:window:allow-start-dragging`. The frontend was calling `startDragging()`, so the native command could be rejected by the capability boundary.
- Added the narrow `core:window:allow-start-dragging` permission to `src-tauri/capabilities/default.json` on `feat/desktop-pet-interactions`.
- This is the likely root cause, not yet confirmed by a local macOS run. Pull, rebuild and test drag again; if it still fails, capture the terminal/devtools warning from `Could not start manual pet drag.`.


## Global cursor tracking restoration (2026-10-22)

- User reported that the dog's eyes stopped following the cursor when the pet window was not clicked/focused.
- Root cause: DOM `pointermove` events only report movement delivered to the pet webview, so they cannot track the pointer while it is over another app.
- Added a small macOS native CoreGraphics command that returns the current pointer coordinates, and a frontend poll that maps those coordinates into the pet window so eye gaze can update while another app is focused. It reads pointer coordinates only; it does not capture keyboard input or typed text.
- Non-macOS builds currently return no global cursor position and retain in-window pointer tracking.
- This implementation has not been compiled or runtime-tested on the user's Mac. Check Rust FFI compilation and coordinate alignment after pulling; display scaling/multiple-monitor coordinate mapping may need adjustment based on runtime results.


## Documentation and cutout preview (2026-10-22)

- Added `docs/desktop-pet-cutout.svg`, a transparent-background static preview of the German Shepherd artwork, so the README can show the actual pet cutout rather than a generic screenshot.
- README refresh is in progress: document this as a passion project, provide macOS and Windows prerequisites, clone/setup/development commands, and platform-specific packaging output.
- The SVG preview is a static illustration; it does not represent live animation or prove the native app has been built. Build/runtime verification remains pending on macOS and Windows.


## README and setup guide completed (2026-10-22)

- Refreshed `README.md` with a passion-project introduction, the transparent dog cutout preview, feature summary, current limitations, contribution notes, and separate macOS/Windows setup and run instructions.
- Documented development commands (`npm install`, `npm run tauri -- dev`, `npm run build`) and packaging command (`npm run tauri -- build`), with expected DMG/macOS app and Windows NSIS output folders.
- Linked the repository Releases page for installers while making clear that source builds are the fallback if no release assets are published.
- Commits on `feat/desktop-pet-interactions`: cutout preview asset `0356b0b8ac6c4bdab4caedf60cf68a18bd408f51`; checkpointed asset `431a27d5455aa13be43815360d47d70d80cde70a`; README `a7d7dc17ebd646fb2ddd76ee35a2e55b645e7572`.
- Documentation changes are committed remotely. The app itself has not been built or runtime-tested as part of this documentation pass; macOS and Windows packaging/runtime validation remains open.


- README follow-up: clarified that macOS users should drag the app bundle from the generated DMG into Applications when the disk image contains one. This is a documentation-only correction; app verification is still pending.


## Bug investigation — BUG-001 disappearing/resetting pet (2026-10-24)

- Created `BUG_TRACKER.md` before making source changes, so the user-reported symptom and intended audit trail exist independently of the patch.
- Audited the roaming loop in `src/main.ts`. It was asynchronous and lacked a single-flight lifecycle guard; movement-frame errors were caught locally, but scheduling relied on reaching the end of `roam()`, and stale animation frames were not invalidated explicitly on interaction/unload.
- Implemented a more defensive roam lifecycle in commit `78239b654b64a74a23f5898c2d2a2f4137dd3a4b`: single-flight guard, generation token, interaction cancellation, guaranteed rescheduling through `finally`, and monitor/bounds checks with diagnostic messages.
- This is a plausible source-level hardening, not a confirmed root cause. The report's return-to-launch-position symptom may also indicate native window/webview recreation or OS-level behavior; no crash logs or reproduction sequence have been supplied.
- Updated `BUG_TRACKER.md` with the exact file, commit, hypothesis, and runtime regression plan. No build/runtime test has been run by the editing agent.


## BUG-002 — global typing reaction (2026-10-24)

- User confirmed the dog should react to typing across all applications, not only when DesktopPet is focused.
- Source audit found the previous frontend `keydown` listener only receives keys delivered to the pet webview. The animation already existed; global activity sensing was missing.
- Added `rdev = "0.5"` in `src-tauri/Cargo.toml` (commit `81dbb706af23de8f2e8a0fe575df30e6f535f681`).
- Added the native `start_typing_monitor` command in `src-tauri/src/lib.rs` (commit `53885e5b285a21fa741ed6bd4cab13bc725a2907`). It emits only a generic `typing-activity` signal; key identity is discarded and no key values or text are sent, logged, or persisted.
- Updated `src/main.ts` to subscribe to the generic event and trigger the existing reaction (commit `e9f56e3902dd39b0e55fb6cc4cf52e7d21c80fe3`).
- Updated README and BUG_TRACKER.md to document the feature, permissions caveat, file history, and test plan.
- Verification remains pending: no build or runtime test was run by the editing agent. `src-tauri/Cargo.lock` still needs to be regenerated by a local Cargo build for the new dependency and the resulting lockfile update committed. Test separately on macOS and Windows, including permission-denied behavior.


## BUG-002 crash investigation / hotfix (2026-10-24)

- User supplied macOS crash report: `EXC_BREAKPOINT (SIGTRAP)` in process `desktoppet`; triggered stack includes `rdev::macos::keyboard::string_from_code`, `create_string_for_key`, `rdev::macos::common::convert`, and `rdev::macos::listen::raw_callback`.
- Evidence strongly implicates the new `rdev` listener's macOS key-event conversion path. Exact upstream defect not independently reproduced.
- Safety hotfix: removed `rdev` listener/command and dependency; restored window-focused `keydown` reaction to stop repeat crashes. Global typing reaction is temporarily disabled.
- Commits: `3df9f4c802574bee0640f9dee4389b79104af438` (`src-tauri/src/lib.rs`), `6e713445216f71a20f431d5d1120af62fe296ee4` (`src-tauri/Cargo.toml`), `6f0e7b0267149eae325676d30c3ade5590c3cdba` (`src/main.ts`).
- Build/runtime verification after hotfix remains pending. Next: rebuild, verify dog stays visible while typing in another app, then implement/test a safer platform-native activity-only signal without key-string conversion.


## Global typing activity replacement — 2026-10-24

- User confirmed the focused-window reaction works; only typing in other applications failed.
- Replaced the prior crashing global listener with platform-native activity-only hooks: a macOS CoreGraphics listen-only event tap and a Windows low-level keyboard hook. Both record only a timestamp and do not inspect key values or typed text.
- Added the native `typing_activity_recent` command, which exposes only a recent-activity boolean. The frontend polls it and triggers the existing rate-limited animation.
- Added a Windows-only `windows-sys` dependency.
- Commits: Rust hook `8032bd2faddac073e83495bbe0e8b243531acea1`; callback hardening `be0a8bdc80b3f7e94c15c50cc7d837f3e5c9a874`; Cargo dependency `21788c9bd49b6691fdaab37f6f888132297725e6`; frontend poll `dbefdc48f575351acc8e5401aabad70cedcfb7e2`.
- macOS may require enabling DesktopPet under System Settings > Privacy & Security > Input Monitoring and restarting the app.
- Build/runtime verification remains pending on macOS and Windows. Cargo may update `src-tauri/Cargo.lock` during the first build.


## User verification checkpoint — global typing and core interactions (2026-10-24)

- User reports that everything works after testing the new native global typing activity implementation on macOS.
- Confirmed by user: typing in other applications triggers the dog without first clicking/focusing DesktopPet; the existing core interactions also work.
- BUG-002 status is now **macOS verified by user; Windows verification pending**. README and BUG_TRACKER.md updated to match.
- This is user-reported runtime verification on the user's Mac, not an independent build/test by the editing agent. Do not infer Windows compatibility from the macOS result.
- Keep BUG-001's long-duration roaming observation open until the dog has been observed over an extended session; the user's statement that all tested interactions work does not specify a 30–60 minute soak test.
- Next platform step: build and test on Windows, including global typing activity and regression checks for click/pet, drag, resize, nap, roaming, and animations.
