# DesktopPet

A lightweight desktop companion for Windows and macOS, modeled as a German Shepherd.

## Design direction

- **Desktop runtime:** Tauri 2 (Rust backend and web frontend) to keep the app lightweight and access native desktop window behavior.
- **Pet UI:** transparent, frameless, draggable, always-on-top window; simple idle and interaction states; avoid blocking normal desktop work.
- **Pet character:** original German Shepherd artwork and animations. Do not redistribute unlicensed art or assume every public repository is permissively licensed.
- **Scope first:** a small working pet, basic interactions and reliable packaging. Add persistence, tray controls and richer animation only where needed.

## Agent guidance

All agents should read [AGENTS.md](AGENTS.md) and use the local Ponytail skill at [skills/ponytail/SKILL.md](skills/ponytail/SKILL.md). Project review skills live under `skills/`.

## Setup direction

Install Node.js LTS and Rust. On macOS install Xcode Command Line Tools. On Windows install Microsoft C++ Build Tools and the WebView2 runtime as described in the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

This repository is being bootstrapped; platform packaging must be built and tested on the corresponding operating systems before release.
