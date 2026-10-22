# Skills and implementation references

## Required coding skill

- **Ponytail** — required before all coding tasks. Local source: [`skills/ponytail/SKILL.md`](../skills/ponytail/SKILL.md). Upstream: https://github.com/DietrichGebert/ponytail. Licence: MIT; the upstream notice is retained in [`skills/ponytail/LICENSE`](../skills/ponytail/LICENSE).
- **Ponytail review** — use after meaningful changes and before calling a feature complete: [`skills/ponytail-review/SKILL.md`](../skills/ponytail-review/SKILL.md).
- **Ponytail audit** — use for whole-repository audits, not for every small edit: [`skills/ponytail-audit/SKILL.md`](../skills/ponytail-audit/SKILL.md).

The skills are repository guidance files. Whether an agent automatically loads them depends on the host; `AGENTS.md` explicitly points agents at the mandatory skill, but it does not install a host-specific plugin or hook.

## Cross-platform framework

Use Tauri 2, which is already integrated. Official docs:
- Prerequisites: https://v2.tauri.app/start/prerequisites/
- App configuration: https://v2.tauri.app/reference/config/
- Window API: https://v2.tauri.app/reference/javascript/api/namespacewindow/
- Build pipelines: https://v2.tauri.app/distribute/pipelines/
- Global shortcuts: https://v2.tauri.app/plugin/global-shortcut/
- Autostart: https://v2.tauri.app/plugin/autostart/

Window transparency, hit-testing/click-through, dragging, focus, multi-monitor placement, and packaging must be tested on Windows and macOS separately. Use Tauri capabilities to expose only the window/plugin permissions the feature needs.

## Reference implementation

- [`Cloudstill/iPet`](https://github.com/Cloudstill/iPet) is an MIT-licensed Tauri desktop pet with a transparent window. Use it to learn patterns or identify a small, useful implementation detail, not as a reason to replace this repo wholesale. Review each file, dependency, asset and licence before copying any code.
- Official Tauri project and its documentation are the source of truth for APIs. Use the framework's native window APIs before adding another dependency.

## Asset and licensing policy

Open source does not mean no attribution. Before importing code, fonts, models, images, sprites, sounds, or animation files, verify the specific licence at the source revision and preserve required notices. Avoid assets with unclear provenance. Prefer original vector art or art created for this project; keep its source file in the repository.

## Build verification

CI should build on native Windows and macOS runners. A passing TypeScript build does not verify Rust compilation, native window behavior, installer packaging or code signing. Do not claim those checks passed unless the workflow or local native machine reports success.
