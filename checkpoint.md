# DesktopPet — Project Checkpoint

**Checkpoint date:** 2026-10-22  
**Baseline commit:** `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`  
**Branch:** `main`  
**Repository:** https://github.com/sarkarshivaditya-lab/Desktoppet  
**Status:** Working early prototype; interaction and native desktop behaviour remain to be implemented.

## 1. Product goal

Build a lightweight cross-platform desktop companion featuring an original German Shepherd. The intended experience is a pet that lives on the user's desktop rather than a static pet displayed inside a conventional app window.

Target behaviours:
- Freely move around the desktop and interact with window edges, including hanging or perching on them where the platform permits.
- Track the mouse cursor with natural eye movement.
- React to typing with small, non-intrusive animations.
- Provide idle, blink, look, movement, and interaction animations.
- Keep the app lightweight and preserve normal user input and window interaction.
- Support macOS and Windows where practical, with macOS as the current development environment.

## 2. Known architecture

Based on the project configuration and previous local build/debug session:
- **Desktop shell:** Tauri 2, with Rust native entry points in `src-tauri/src/main.rs` and `src-tauri/src/lib.rs`.
- **Frontend:** React, TypeScript, and Vite.
- **Development server:** Vite at `http://localhost:1420/`.
- **Frontend build output:** `dist/`, configured as Tauri's `frontendDist`.
- **Window presentation:** configured as a small, transparent, frameless, always-on-top window; non-resizable and skipped in the taskbar.
- **Packaging targets:** NSIS for Windows and DMG for macOS.
- **Character presentation:** the current prototype shows a stylized German Shepherd and introductory UI inside the app window.

The detailed source-file architecture should be updated after a full code review; this checkpoint deliberately does not assume animation, cursor tracking, or desktop-edge movement already exist.

## 3. Baseline state

At commit `0d878f2a2bbceebc1a68c0d56674712b80c43cf5`:
- The user reports that the app launches and displays the current dog UI.
- A macOS native startup panic was traced to an icon buffer mismatch: Tauri expected 262,144 pixels for a 512×512 icon but received 81,920.
- The committed change adds `src-tauri/icons/icon-test.png` and configures Tauri's bundle to use it. This is a diagnostic/test icon, not the intended final product artwork.
- `package-lock.json` and `src-tauri/Cargo.lock` are committed to preserve dependency resolution.
- The commit also includes `tsconfig.tsbuildinfo`, which is generated TypeScript build state and should generally not be versioned.

The user's local build previously succeeded. The user reports the app is now working, but a fresh build/test has not been independently run as part of this checkpoint.

## 4. Current limitations

1. The pet currently appears as a character in a compact app window, rather than behaving like a desktop-resident companion.
2. Cursor-following eyes have not been verified or established as implemented.
3. Typing-triggered reactions have not been verified or established as implemented.
4. Desktop roaming, screen-boundary handling, and window-edge perching are not yet established as implemented.
5. The test icon is temporary and should be replaced with a correctly encoded production icon once the native icon-loading issue is resolved.
6. The full frontend and Rust source have not yet been exhaustively audited in this checkpoint.

## 5. Recommended implementation order

### Phase A — Establish a stable baseline
- Inspect all frontend components, CSS, Rust commands, Tauri configuration, and available scripts.
- Run the frontend build, tests (if present), and Tauri development launch.
- Record the exact commands and outcomes in this file.
- Remove generated build-state files from version control and add appropriate ignore rules, without deleting useful source or lockfiles.
- Replace the diagnostic icon with the final German Shepherd icon after validating it through Tauri.

### Phase B — Character and animation foundation
- Separate the dog rendering from surrounding prototype/onboarding UI so the pet can be rendered independently.
- Define a small, explicit animation/state model: idle, blink, look, walk, perch, typing reaction, and user interaction.
- Use lightweight vector/CSS animation or another suitable rendering approach based on the existing implementation; avoid introducing a heavy engine without evidence it is needed.
- Ensure animations pause or reduce work when appropriate.

### Phase C — Desktop interaction
- Implement pointer tracking and smooth eye-gaze targets.
- Add typing activity detection using a platform-appropriate, privacy-conscious mechanism. Do not capture or store typed text; detect activity only where possible.
- Implement safe desktop movement and screen-boundary constraints.
- Investigate native window positioning and edge/perching behaviour separately for macOS and Windows. Do not assume ordinary frontend dragging can attach to arbitrary application windows.

### Phase D — Verification and packaging
- Verify transparent rendering, click-through/interaction behaviour, focus behaviour, always-on-top behaviour, and multi-monitor positioning.
- Test keyboard and mouse interactions without disrupting the user's active applications.
- Run release builds for macOS and Windows where the relevant build environments are available.
- Update this checkpoint with each completed phase, test results, and the next bounded task.

## 6. Working rules

- Treat the baseline commit above as the known-good starting point; do not treat this as a fresh project.
- Make small, reviewable changes and verify each change with builds/tests.
- Preserve the original German Shepherd concept and the user's requested desktop-first behaviour.
- Do not claim a feature is complete until it has been implemented and tested.
- Update this file after meaningful code changes with: commit, files changed, implementation status, verification results, known issues, and the next task.

## 7. Immediate next task

Audit the current source at the baseline commit, confirm the actual frontend component structure and available test/build commands, and then propose the first minimal implementation slice for a desktop-resident animated dog. Prioritize a working interaction foundation over cosmetic redesign.


## Default-branch documentation publication (2026-10-22)

- Published the updated README and `docs/desktop-pet-cutout.svg` to `main) as documentation-only commits so visitors opening the default branch can see the current project description and artwork.
- The fuller checkpoint remains on `feat/desktop-pet-interactions`; the `main` checkpoint has not been replaced wholesale to avoid overwriting its independent history.
- The interaction code remains under open draft PR #1 and has **not** been merged to `main`, because native behavior and platform builds remain unverified.
- README on main now links to the cutout asset on the same branch.


## Recommended download branch documented (2026-10-24)

- Updated `README.md` on `main` to explicitly direct users to `feat/desktop-pet-interactions` for the latest prototype.
- Reason: the interaction work remains unmerged, so the default branch does not yet contain all of the features described for the current prototype.
- The README includes a direct `git clone --branch feat/desktop-pet-interactions` command and explains when to choose `main`.
- Updated `BUG_TRACKER.md` to record the documentation-only change.
- Commit on `main` for the README branch guidance: `36731705c2b83955321eb5ab318c80997a79d896`.
- Verification: documentation changes were committed through GitHub; no app build/runtime test was run because no application code changed.
- Branch policy remains unchanged: preserve `feat/desktop-pet-interactions`; it has not been merged or deleted.
