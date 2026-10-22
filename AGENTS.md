# Repository agent rules

**Ponytail is mandatory.** Before coding, read [`skills/ponytail/SKILL.md`](skills/ponytail/SKILL.md) and work in its `full` mode unless the user requests another level. Before any Tauri window, native input, plugin, startup or packaging changes, also read [`skills/tauri-cross-platform/SKILL.md`](skills/tauri-cross-platform/SKILL.md). Read [`docs/TECHNICAL-DIRECTION.md`](docs/TECHNICAL-DIRECTION.md) before changing desktop architecture. Prefer the smallest complete diff, native platform APIs and already-installed dependencies. Add a focused test for non-trivial logic. Do not introduce speculative abstractions or dependencies.

## Product constraints
- This is a real desktop pet, not a conventional dashboard: preserve a transparent, frameless, always-on-top window and a responsive, low-resource frontend.
- The pet is an original German Shepherd character. Do not import third-party character art or model assets without verifying their exact licence and attribution requirements.
- Windows and macOS are first-class targets. Do not claim cross-platform compatibility from a single OS build. Verify packaging and runtime behavior on both platforms.
- Keep native Tauri permissions minimal. Every capability permission must have a concrete feature that needs it.
- Keep builds reproducible. Prefer a committed lockfile with `npm ci` when a valid lockfile exists; otherwise do not create a fake lockfile or claim dependency resolution is locked. Do not silently migrate frameworks.

## Completion report
State checks actually run, checks not run, and material platform/licensing risks. Never imply a build or test ran when it did not.
