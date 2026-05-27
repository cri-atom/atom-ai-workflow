# Atom AI Workflow

Monorepo interno (npm workspaces) con **sitio en Astro** (mapa conceptual en **`/workflow`**: React Flow, TanStack Query y panel con componentes estilo **shadcn**/Radix), **documentación en Mintlify**, y **API REST en Express** con preparación para **Supabase**.

## Requisitos

- **Node.js 20 LTS** (este repo fija la versión con [**Volta**](https://volta.sh) en el `package.json` raíz). Mintlify no soporta Node **25+**; mantente en la serie 20.
- **Volta (recomendado):** con Volta instalado, al trabajar en esta carpeta se usa automáticamente la versión del bloque `volta`. Si aún no tienes Node 20 en Volta: `volta install node@20`. Para alinear el pin con tu máquina: `volta pin node@20` en la raíz del repo.
- **Alternativa:** [.nvmrc](.nvmrc) contiene `20` por si alguien del equipo usa nvm o fnm.
- npm 10+ (opcionalmente `volta pin npm@10` en la raíz si quieres fijar npm).

## Arranque rápido

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp docs/.env.example docs/.env
npm install
npm run dev
```

Servicios por defecto:

| Servicio | URL |
| --- | --- |
| Sitio (Astro) | http://localhost:4321 |
| Documentación (Mintlify) | http://localhost:3000 |
| API (Express) | http://localhost:4000 |

Flujo sugerido: sitio → **Ver Workflow** → selecciona un skill → **Ejecutar** (necesita `ANTHROPIC_API_KEY` u otro provider en `.env`). Skills en [`packages/toolkit/skills`](packages/toolkit/skills).

### Si Mintlify no arranca (`npm run dev`)

- Debes usar **Node 20.x**. Con Node **25+**, Mintlify falla y verás `mintlify is not supported on node versions 25+` o errores de React.
- El comando `npm run dev` ejecuta primero `scripts/check-node.mjs`: si no estás en Node 20, se detiene con instrucciones.
- Comprueba `node --version` en la misma terminal; con **Volta**, asegúrate de que `~/.volta/bin` esté en tu `PATH` (ver sección Requisitos).
- **Un solo React para docs:** en la raíz hay `overrides` de **`react` / `react-dom` → 19.2.3** (misma versión que `@mintlify/cli`). Sin eso, Radix y otras libs deduplican **React 18** y Mintlify revienta con `Invalid hook call`. No bajes esos overrides a 18.
## Variables de entorno

Definidas en [`.env.example`](.env.example). Puntos clave:

- `PUBLIC_DOCS_URL` / `PUBLIC_API_URL` en `apps/web/.env` para enlaces del sitio y fetch del mapa desde el cliente.
- `PUBLIC_WEB_URL` (opcional) en `docs/.env` si automatizas enlaces al sitio; `PUBLIC_API_URL` en `docs/.env` solo si algún snippet cliente lo necesita.
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son **opcionales** en v1; el endpoint `/health` indica `configured` o `skipped`. La **service role** solo debe usarse en el servidor Express, nunca en el cliente.
- **Toolkit / LLM (solo servidor):** `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `KIMI_API_KEY`, `ATOM_PROVIDER`, `ATOM_MODEL` para `POST /api/v1/projects/:id/run/:skillId`.

## Paquetes

- [`apps/web`](apps/web) — Astro + Tailwind con preset compartido [`packages/ui`](packages/ui); mapa interactivo en **`/workflow`** (React + React Flow).
- [`docs`](docs) — Mintlify; `npm run sync-workflow` regenera el mapa desde el registry y copia artefactos públicos.
- [`apps/api`](apps/api) — Express: mapas, skills, pipelines, runs (`/api/v1/skills`, `/api/v1/projects/...`).
- [`packages/toolkit`](packages/toolkit) — Skills (`SKILL.md`), `_registry.yml`, runner LLM (Claude/Gemini/Kimi).
- [`packages/ui`](packages/ui) — Tokens CSS (`tokens.css`) y preset Tailwind (`tailwind-preset.js`).

### Sincronizar mapa tras editar skills

```bash
npm run sync-workflow
```

## Stack futuro (agente de chat)

Documentado para fases posteriores (no implementado en scope 1):

- **TanStack Query** — ya usado en `/workflow` para el mapa; reutilizable para chat.
- **Zustand** — estado reactivo del chat en cliente.
- **SSE o WebSockets** — streaming de respuestas del modelo.

## Producción

Guía paso a paso: **[DEPLOYMENT.md](DEPLOYMENT.md)** (Vercel web + Render API + Mintlify docs).

- **Vercel:** `PUBLIC_API_URL`, `PUBLIC_DOCS_URL` en el proyecto web.
- **Render:** `WEB_ORIGIN`, `DOCS_ORIGIN`, claves LLM (`ANTHROPIC_API_KEY`, …).
- **Mintlify:** conectar carpeta `docs/` y actualizar URLs en `docs/mint.json`.

## Licencia

Uso interno; ajusta licencia cuando publiques el repo.
