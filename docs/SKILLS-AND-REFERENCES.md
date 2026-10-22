# Skills and implementation references

## Required coding skill

- **Ponytail** — required before all coding tasks. Local source: [`skills/ponytail/SKILL.md`](../skills/ponytail/SKILL.md). Upstream: https://github.com/DietrichGebert/ponytail. Licence: MIT; the original notice is retained in [`skills/ponytail/LICENSE`](../skills/ponytail/LICENSE).
- **Ponytail review** — use after meaningful changes and before calling a feature complete: [`skills/ponytail-review/SKILL.md`](../skills/ponytail-review/SKILL.md).
- **Ponytail audit** — use for whole-repository audits, not for every small edit: [`skills/ponytail-audit/SKILL.md`](../skills/ponytail-audit/SKILL.md).

These are repository guidance files. Whether an agent automatically loads them depends on its host. `AGENTS.md` points agents to the mandatory skill, but it does not install host-specific plugins or hooks.

## Cross-platform framework

Use Tauri 2, which is already integrated. Official references:
- Prerequisites: https://v2.tauri.app/start/prerequisites/
- App configuration: https://v2.tauri.app/reference/config/
- Window API: https://v2.tauri.app/reference/javascript/api/namespacewindow/
- Build pipelines: https://v2.tauri.app/distribute/pipelines/
- Global shortcuts: https://v2.tauri.app/plugin/global-shortcut/
- Autostart: https://v2.tauri.app/plugin/autostart/

Window transparency, hit-testing/click-through, dragging, focus, multi-monitor placement and packaging must be tested on Windows and macOS separately. Use Tauri capabilities to expose only required native permissions.

## Reference implementation

- [`Cloudstill/iPet`](https://github.com/Cloudstill/iPet) is an MIT-licensed Tauri desktop pet with a transparent window. Learn from its patterns or review focused implementation details, but do not replace this repo wholesale. Inspect each file, dependency, asset and licence before copying code.
- [`Asuraaaaaaaa/border-collie-pet`](https://github.com/Asuraaaaaaaa/border-collie-pet) demonstrates sprite states and a behavior state machine for a Tauri 2 pet. Its visible character art is a border collie and is **not** to be reused for this German Shepherd project; inspect its project licence before copying any implementation code.
- Official Tauri documentation is the source of truth for APIs. Prefer native window APIs before adding dependencies.

## Asset and licensing policy

Open source does not mean attribution-free. Before importing code, fonts, models, images, sprites, sounds or animation files, verify the specific licence at the source revision and preserve required notices. Avoid assets with unclear provenance. Prefer original vector art or art created for this project; keep its source file in the repository.

## Build verification

CI should build on native Windows and macOS runners. A passing TypeScript build does not verify Rust compilation, native window behavior, installer packaging or code signing. Do not claim those checks passed unless native build output confirms it.
