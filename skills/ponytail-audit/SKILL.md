---
name: ponytail-audit
description: Audit the whole repository for bugs, security risks, missing tests, slow paths and unnecessary complexity.
---

Read the README, build configuration, dependencies, entry points and tests. Trace the main flows and prioritize code where errors have the highest cost. Look for concrete bugs, security holes, data-loss risks, races, missing tests for risky logic, slow paths, dead code, duplicate helpers, dependencies replaceable by native features, and abstractions with only one implementation. Every finding needs a concrete case and smallest fix. Report ranked findings, verdict and what was not checked. This is a report only; do not change files.
