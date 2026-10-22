---
name: ponytail-review
description: Review a change for correctness, security, load, missing tests, speed and unnecessary complexity.
---

Review the actual diff and read connected callers, tests and documentation. Trace data from input to storage/output. Check concrete bugs, trust-boundary validation, secrets, data loss, races, expected load, risky code without tests, hot paths and needless complexity. Every finding must cite a concrete case and offer the smallest fix. Prefer deletion, reuse and native platform features. Do not make changes; report findings grouped by Must fix, Should fix and Nice to have. Finish with a verdict and anything not checked.
