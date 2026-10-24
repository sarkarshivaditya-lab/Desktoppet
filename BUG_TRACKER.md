# Bug & Regression Tracking Log

This is the project-wide register for user-reported issues, source audits, fixes, file-level change history, and verification results. Any code fix should update this file and `checkpoint.md`. Keep hypotheses separate from confirmed findings, and never mark a fix verified until a reproducer/test result exists.

## Workflow

For every issue, assign the next ID (BUG-001, BUG-002, …) and record:
- User-observed behavior, platform/version if known, and reproduction steps.
- Analysis, confidence, and evidence from the source.
- Every changed file, what changed, and the corresponding commit.
- Build/runtime tests and outcomes.
- Regression checks still required.

Use statuses: Reported, Investigating, Fix implemented, Awaiting verification, Verified, Reopened. Preserve old entries when regressions occur; append a new timeline note rather than erasing history.

## Issue index

| ID | Summary | Status | First recorded |
|---|---|---|---|
| BUG-001 | Dog disappears after running for a while, then reappears at launch position | Fix implemented — awaiting verification | 2026-10-24 |

---

## BUG-001 — Dog disappears, then reappears at launch position

**Status:** Fix implemented — awaiting build/runtime verification  
**Reported:** 2026-10-24  
**Platform:** Not yet confirmed  
**Related branch:** `feat/desktop-pet-interactions`  
**Related PR:** [#1](https://github.com/sarkarshivaditya-lab/Desktoppet/pull/1)

### Report

Users report that after DesktopPet has been running for some time, the dog sometimes disappears and later reappears near the position where it was originally launched. No platform details, crash logs, or exact reproduction sequence were provided.

### Audit findings (source-level, not proven root cause)

The roaming loop in `src/main.ts` gets the native window position and size, identifies a monitor, and animates calls to `setPosition(new PhysicalPosition(...))`. The configured initial position is `x: 100, y: 100` in `src-tauri/tauri.conf.json`.

The old roaming implementation lacked a single-flight/generation guard. A delayed animation could keep issuing stale position updates after a user interaction, and the scheduling lifecycle relied on reaching the end of the asynchronous callback. That is a confirmed reliability weakness and worth hardening.

The exact return to the configured launch position may instead indicate native window/webview recreation. Without evidence of process restart, this remains a hypothesis. The source-level roam hardening below cannot be claimed to fix a native process crash/recreation scenario until runtime testing distinguishes those causes.

### Fix attempt

- Make roaming single-flight.
- Invalidate stale animation frames after manual pointer interaction and on window unload.
- Catch failed native position changes and guarantee cleanup/rescheduling through `finally`.
- Check the current monitor and valid destination bounds before starting movement.
- Emit concise diagnostic messages for failures; no user content is logged.

### File-level change history

| File | Change | Commit |
|---|---|---|
| `src/main.ts` | Harden roaming lifecycle, cancellation, cleanup/retry, bounds checks, and diagnostics | [`78239b6`](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/78239b654b64a74a23f5898c2d2a2f4137dd3a4b) |
| `BUG_TRACKER.md` | Created central bug/register file on feature branch before patch; this default-branch copy publishes the record for contributors | [`3083824`](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/3083824ce171fd520b3b97074bfebb582daf880c) |
| `checkpoint.md` | Updated project handoff with BUG-001 analysis and source change | [`4f492c8`](https://github.com/sarkarshivaditya-lab/Desktoppet/commit/4f492c8da4cb3fd1cfc61da0d6d717ab2ff80135) |

### Verification plan

Not run by the editing agent. On the platform where the issue was observed:

1. Run `npm run build`.
2. Run `npm run tauri -- dev`.
3. Leave the app active for at least 30–60 minutes, allowing multiple autonomous roaming cycles.
4. Confirm the pet never disappears, resets to the launch position, or moves outside visible monitor bounds.
5. Drag the dog while roaming is starting; after release it should stay still until a later eligible roam.
6. If it still disappears, record OS/version, display configuration, terminal logs, and whether the native process/window restarted. Process-restart evidence is required to investigate native recreation separately.

### Regression checklist

- Manual drag still works.
- Clicking the dog still triggers petting.
- Nap still pauses roaming.
- Resizing keeps destinations within the monitor.
- Multi-monitor setups and mixed display scaling are tested.
- macOS global cursor gaze still follows the pointer.

**Current conclusion:** this is a defensive fix for a confirmed weakness in the roaming lifecycle, not a proven complete resolution of the user-visible disappearance. Runtime evidence is required to close BUG-001.
