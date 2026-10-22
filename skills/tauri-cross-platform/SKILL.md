---
name: tauri-cross-platform
description: >
  Implement and verify Tauri desktop features across Windows and macOS without
  assuming their windowing, input, packaging or WebView behavior is identical.
---

# Tauri cross-platform implementation

Use this skill when changing Tauri window configuration, native commands, plugins, app startup/exit, input handling, icons or release workflows.

## Before editing
- Read `AGENTS.md` and `docs/TECHNICAL-DIRECTION.md`.
- Check the installed Tauri major version and use its official docs; do not copy v1 APIs into a v2 app.
- Prefer built-in Tauri window APIs and capabilities. Add a plugin only for a requested behavior the core API does not provide.
- Keep capabilities least-privilege: every added permission must map to a concrete feature. Do not grant broad permissions to avoid understanding a permission error.

## Window and input behavior
- Transparent desktop pets need the native window to be transparent and the frontend root/body backgrounds to remain transparent.
- Keep the pet always-on-top and frameless by configuration, but verify actual behavior on both OSs.
- Use the documented Tauri drag-region mechanism for draggable areas. Keep interactive controls outside drag regions so their clicks still work.
- Treat click-through/hit-testing, focus, hide/show, screen coordinates, DPI and multi-monitor handling as platform-specific. Never claim an OS feature works because it works in browser preview.
- Preserve accessible names and keyboard operation on interactive HTML elements. Honor `prefers-reduced-motion`.

## Native build and release checks
- Run the frontend build and Rust/Tauri build where toolchains are available.
- CI should use native Windows and macOS runners, with failures visible separately; do not infer macOS success from Windows or vice versa.
- Verify the generated `.dmg` or `.app` on macOS and the actual Windows installer on Windows. Building artifacts is not equivalent to code signing, notarization or a successful first launch.
- Confirm window transparency, move/drag, hide/show, quit/relaunch, focus and asset paths on each target OS before release.
- Report exactly which checks ran and which remain unverified. Never fabricate test or CI success.

## Sources
- Tauri v2 prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri v2 config reference: https://v2.tauri.app/reference/config/
- Tauri v2 WebviewWindow API: https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/
- Tauri v2 build pipelines: https://v2.tauri.app/distribute/pipelines/
