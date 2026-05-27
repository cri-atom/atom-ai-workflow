# @atom-ai/toolkit

Skills pipeline (discovery → handoff) versionado en el repo. Consumido por `apps/api` y ejecutable por CLI.

## Estructura

```text
skills/
  _registry.yml
  01-ux-analysis-redesign/SKILL.md
  02-user-flows-breadboarding/SKILL.md
  ...
core/OS.md
pipeline.config.yml
runner/          # providers + programmatic API
```

Reemplaza cada `SKILL.md` con tu contenido. El registry define `optional`, `next`, pipelines y modelos por skill.

## API programática

```js
import { runSkill, loadRegistry, getToolkitRoot } from "@atom-ai/toolkit";
```

## CLI (opcional)

```bash
cd packages/toolkit
node runner/index.js run user-flows-breadboarding
```
