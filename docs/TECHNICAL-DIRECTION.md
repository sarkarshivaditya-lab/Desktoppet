# Technical direction

## Runtime choice: Tauri 2

Tauri supports Windows 10+ and macOS 10.15+ and uses each platform's webview, which avoids bundling a separate Chromium runtime. Its window configuration supports transparent, undecorated, always-on-top windows. This fits a desktop pet better than a conventional app window.

References:
- Tauri platform support and licence: https://github.com/tauri-apps/tauri
- Tauri window configuration: https://v2.tauri.app/reference/config/
- Official build prerequisites: https://v2.tauri.app/start/prerequisites/
- Window API: https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/
- Build pipelines: https://v2.tauri.app/distribute/pipelines/

## Cross-platform constraints

- Compile and package on both macOS and Windows; a successful build on one OS does not verify the other.
- macOS development needs Xcode or Command Line Tools and Rust.
- Windows development needs Rust, Microsoft C++ Build Tools and WebView2.
- Verify transparent window behavior, click-through/drag behavior, focus, high-DPI/multi-monitor placement, hide/show, startup and close behavior on real systems.
- Read `skills/tauri-cross-platform/SKILL.md` before changing window configuration, native input, plugins, startup or packaging.
- Treat window transparency and hit-testing details as platform-specific; test them rather than assuming identical rendering.
- Keep Tauri capabilities least-privilege. A permission must map to a concrete feature, and platform tests must run on native OS runners.

## Keep the first version small

A transparent pet with a few reliable states is the first milestone. Defer accounts, remote APIs, analytics, auto-updaters and complex simulation until there is a demonstrated need.

## Reuse and licensing

Do not copy a whole pet application merely because its UI looks reusable. Inspect its license, assets, third-party notices and dependency licenses first. The reference project [Cloudstill/iPet](https://github.com/Cloudstill/iPet) demonstrates Tauri 2 patterns, transparent windows and cross-platform build workflows; it is a reference, not copied code. Ponytail is MIT-licensed and its license is retained in `skills/ponytail/LICENSE`.
