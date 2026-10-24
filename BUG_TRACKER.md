# Bug & Regression Tracking Log

This file is the source of truth for reported bugs, source audits, fixes, test status, and file-level change history. Add an entry whenever a bug is reported or any files are changed to investigate/fix one. Keep conclusions separated from hypotheses; never mark a fix verified without a reproducer/test result.

## How to use this log

For each issue, record:
- **ID and status**: use sequential IDs (BUG-001, BUG-002, …); status is Reported, Investigating, Fix implemented, Awaiting verification, Verified, or Reopened.
- **Observed behavior**: what a user actually reported, not a theory.
- **Analysis**: plausible mechanism and evidence from source.
- **Files changed**: exact paths, purpose, and commit SHA once committed.
- **Verification**: commands, platform, observed results, and any remaining gaps.
- **Regression notes**: adjacent behaviors that must be re-tested.

Do not collapse multiple symptoms into one issue unless there is evidence they share a cause. Update entries rather than deleting old findings; preserve fix history when a regression appears.

## Issue index

| ID | Summary | Status | First recorded |
|---|---|---|---|
| BUG-001 | Pet disappears after some runtime, then reappears at launch position | Investigating | 2026-10-24 |
| BUG-002 | Typing reaction does not work in other applications | Fix implemented — awaiting verification | 2026-10-24 |

---

## BUG-001 — Pet disappears, then reappears at initial launch position

**Status:** Fix implemented — awaiting build/runtime verification  
**Reported:** 2026-10-24  
**Affected areas:** Native window roaming and window coordinate handling  
**Platforms:** Not yet established from user reports; source-level concern is cross-platform.

### User-observed behavior

Users report that, after the app has been running for some time, the dog can disappear and later reappear at approximately the position where it was first launched. No crash logs, OS/version details, or exact reproduction sequence have been supplied yet.

### Source audit and hypothesis

The roaming loop in `src/main.ts` reads `outerPosition()` and `outerSize()`, identifies the current monitor, then animates `setPosition(new PhysicalPosition(...))`. It chooses a destination within the monitor, while the Tauri window starts with configured `x: 100`, `y: 100`.

Two source-level risks were identified:

1. **Coordinate-space ambiguity (strong candidate):** monitor positions and sizes are physical coordinates, while `CGEventGetLocation` yields macOS screen coordinates that can have different conventions on multi-display / scaled setups. This global cursor code does not move the window itself, so it is unlikely to explain a reset to launch position by itself.
2. **Overlapping roam cycles (strong candidate):** the `roam()` callback schedules the next timeout at the *end* of the current async callback. A roam can await multiple native position changes through `requestAnimationFrame`; if callbacks are delayed or an exception/slow native call occurs, timer cadence is implicit and there is no explicit single-flight guard or cancellation token. This is a reliability issue, but by itself does not explain an exact reset to `(100,100)`.
3. **Launch-position reset (not yet proven):** the static `x: 100`, `y: 100` config can be reapplied when the native window is recreated. The user symptom is consistent with a native webview/window process restarting, but there is no crash evidence to establish that. A CSS-only disappearance should not reset native window coordinates.

**Most likely actionable code defect:** roaming uses asynchronous animation steps without guarding against overlapping/manual interactions and does not recover or preserve the last stable position if the operation is interrupted. The patch below strengthens this lifecycle and adds diagnostics. It does not prove the underlying OS/window recreation scenario.

### Fix implemented

- Make roaming single-flight with an explicit running flag.
- Prevent a roam from continuing to issue stale position updates after a user interaction is detected.
- Catch errors in each animation frame and always resolve the movement promise.
- Ensure a roam is scheduled again from a `finally` path, avoiding a dead roaming loop after an unexpected rejection.
- Bound the destination to the current monitor based on the native window's latest physical position/size.
- Add concise console diagnostics for roam failures without logging user content.

### Files changed

| File | Change | Commit |
|---|---|---|
| `src/main.ts` | Roam lifecycle/single-flight guard, cancellation after interaction, resilient animation scheduling and safer monitor bounds | `78239b654b64a74a23f5898c2d2a2f4137dd3a4b` |
| `BUG_TRACKER.md` | New issue register; captures symptom, hypotheses, source audit, patch details, and required verification | Created before code audit |

### Verification plan

Run on the operating system where the issue was observed, then on the other supported OS:

1. `npm run build`
2. `npm run tauri -- dev`
3. Leave the app running at least 30–60 minutes, including multiple autonomous roam cycles.
4. Confirm the dog never vanishes, jumps back to the initial position, or leaves the visible monitor area.
5. Drag the dog manually during/just before a scheduled roam; it should remain where released until the next eligible idle roam.
6. If the app still disappears, capture terminal output and OS crash/restart evidence. Record whether the whole native window process restarted; that would distinguish process recreation from an in-process position bug.

**Verification status:** Source patch committed (`78239b654b64a74a23f5898c2d2a2f4137dd3a4b`), but not compiled or runtime-tested by the editing agent. Fix is not considered verified until a real runtime test is reported.

**Regression checks:** manual drag still works; click still pets; nap still pauses roaming; resizing does not break the bounds check; multiple monitors / mixed display scale factors are tested; global cursor gaze remains functional on macOS.



---

## BUG-002 — Typing reaction does not work in other applications

**Status:** Fix implemented — awaiting build/runtime verification  
**Reported:** 2026-10-24  
**Platforms:** macOS and Windows intended; verification pending

### Report and audit

The dog does not react while the user types in other applications. The prior `window.addEventListener("keydown", ...)` listener only received events while the pet webview was focused. The animation already existed; global activity sensing was missing.

### Fix attempt

- Added `rdev = "0.5"` to `src-tauri/Cargo.toml`.
- Added a native Tauri command in `src-tauri/src/lib.rs` that emits a generic `typing-activity` event on key-down activity. It discards key identity and does not send, log, store, or persist key values or text. Events are rate-limited.
- Updated `src/main.ts` to subscribe to the generic event and trigger the existing animation. Browser preview still reacts only when focused.
- OS input-monitoring/accessibility permissions may be required. Permission-denied behavior must be tested.

### Files changed

| File | Change | Commit |
|---|---|---|
| `src-tauri/Cargo.toml` | Add native input-event dependency | [81dbb70](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/81dbb706af23de8f2e8a0fe575df30e6f535f681) |
| `src-tauri/src/lib.rs` | Add generic activity event command | [53885e5](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/53885e5b285a21fa741ed6bd4cab13bc725a2907) |
| `src/main.ts` | Subscribe to activity event and trigger animation | [e9f56e3](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/e9f56e3902dd39b0e55fb6cc4cf52e7d21c80fe3) |
| `README.md` | Document feature and permissions | Pending commit |
| `checkpoint.md` | Record implementation and verification plan | Pending commit |

### Verification plan

Not run by the editing agent. Test separately on macOS and Windows: run `npm run build` and `npm run tauri -- dev`; grant permission if requested; type in an unrelated editor/browser/terminal and confirm the dog reacts without focusing itself; confirm no typed content is logged; test behavior when permission is denied; then re-test petting, drag, nap, roaming, and idle animations. Cargo may update `src-tauri/Cargo.lock` when resolving the new dependency; commit that generated update after a successful build.

**Verification status:** Not compiled or runtime-tested by the editing agent. Do not mark verified until tested on both platforms.
