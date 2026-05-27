# Despliegue (Vercel + Render + Mintlify)

Sustituye los placeholders por tus URLs reales.

| Servicio | Rol | Ejemplo |
|----------|-----|---------|
| **Vercel** | Sitio Astro + `/workflow` | `https://atom-ai-workflow-web.vercel.app` |
| **Render** | API Express + runs LLM | `https://atom-ai-api.onrender.com` |
| **Mintlify** | Documentación | `https://tu-org.mintlify.app` o dominio custom |

---

## 1. Render (API)

En [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → conecta el mismo repo de GitHub.

| Campo | Valor |
|--------|--------|
| **Root Directory** | *(vacío — raíz del monorepo)* |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build -w @atom-ai/api` |
| **Start Command** | `npm run start -w @atom-ai/api` |
| **Instance** | Free o paid (runs LLM pueden superar timeout en free) |

**Node:** 20.x (Settings → Environment → o `NODE_VERSION=20`).

### Variables de entorno en Render

| Variable | Valor en producción |
|----------|---------------------|
| `PORT` | *(Render lo inyecta; no hace falta definirlo)* |
| `WEB_ORIGIN` | URL de Vercel **sin** barra final, ej. `https://atom-ai-workflow-web.vercel.app` |
| `CORS_ALLOW_VERCEL` | `true` (default) — permite cualquier `*.vercel.app` si usas API cross-origin |
| `DOCS_ORIGIN` | URL pública de Mintlify, ej. `https://atomchat.mintlify.app` |
| `API_ORIGIN` | URL del propio servicio Render, ej. `https://atom-ai-api.onrender.com` |
| `ANTHROPIC_API_KEY` | Tu clave (obligatoria para **Run skill**) |
| `GEMINI_API_KEY` | Opcional |
| `KIMI_API_KEY` | Opcional |
| `ATOM_PROVIDER` | `claude` (default) |
| `ATOM_MODEL` | `claude-sonnet-4-20250514` (o el que uses) |
| `SUPABASE_URL` | Opcional |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional (solo servidor) |

**No** pongas `PUBLIC_*` en Render; esas van en Vercel/Mintlify.

Varios orígenes (preview Vercel): separa con comas:

```env
WEB_ORIGIN=https://atom-ai-workflow.vercel.app,https://atom-ai-workflow-git-main-tu-org.vercel.app
```

Tras el deploy, prueba: `https://TU-API.onrender.com/health` → debe responder `{"ok":true,...}`.

---

## 2. Vercel (web — ya desplegada)

**Project → Settings → Environment Variables** (Production, y Preview si quieres):

| Variable | Valor |
|----------|--------|
| `PUBLIC_DOCS_URL` | URL de Mintlify, ej. `https://criatom.mintlify.app` |
| `PUBLIC_API_URL` | **No necesario** si usas el proxy de [`apps/web/vercel.json`](apps/web/vercel.json) (recomendado) |
| `PUBLIC_API_CROSS_ORIGIN` | Solo `true` si insistes en llamar a Render desde el browser (requiere CORS en Render) |

El archivo `apps/web/vercel.json` reescribe `/api/*` → tu servicio Render. La web llama a `/api/v1/...` en el **mismo dominio** y evita CORS.

Edita `destination` en `vercel.json` si tu URL de Render cambia.

Redeploy en Vercel después de guardar (Deployments → Redeploy).

En local, `apps/web/.env` puede seguir con `localhost`; en Vercel solo importan las variables del dashboard.

---

## 3. Mintlify (docs)

### Conectar el repo

1. [mintlify.com](https://mintlify.com) → Dashboard → **Add documentation** / **Connect GitHub**.
2. Repo: `atom-ai-workflow` (o el nombre que uses).
3. **Docs path / Root:** `docs` (carpeta donde está `mint.json`).
4. Rama: `main` (o la que despliegues).

Mintlify hace build y hosting; **no** uses Vercel para `docs/`.

### Editar enlaces en el repo (commit + push)

**[`docs/mint.json`](docs/mint.json)** — enlace “Sitio” del topbar:

```json
"url": "https://TU-DOMINIO.vercel.app"
```

**[`docs/workflow/concepts.mdx`](docs/workflow/concepts.mdx)** — si enlazas al mapa, usa la misma URL de Vercel + `/workflow`.

Opcional **[`docs/.env`](docs/.env)** en Mintlify (Dashboard → Settings → Environment variables), si en el futuro algún snippet usa:

| Variable | Valor |
|----------|--------|
| `PUBLIC_WEB_URL` | URL Vercel |
| `PUBLIC_API_URL` | URL Render |

Hoy la página de conceptos no requiere estas vars para renderizar.

### Sincronizar mapa estático en docs (opcional)

Antes de push, en local:

```bash
npm run sync-workflow
```

Eso actualiza `docs/public/workflow-map.json` para fallback si alguien abre docs sin API.

### Node en Mintlify

Usa **Node 20** en la configuración del proyecto Mintlify (alineado con el README del repo).

---

## 4. Checklist final

- [ ] Render: `/health` OK  
- [ ] Vercel: `PUBLIC_API_URL` y `PUBLIC_DOCS_URL` configuradas + redeploy  
- [ ] Mintlify: repo conectado, path `docs`, `mint.json` con URL de Vercel  
- [ ] Render: `WEB_ORIGIN` = dominio Vercel exacto (https, sin `/` final)  
- [ ] Abrir `https://TU-VERCEL.app/workflow` → mapa carga; skill → **Ejecutar** llama al API  
- [ ] Si CORS falla en consola: revisa `WEB_ORIGIN` en Render  

---

## 5. Local vs producción

| Archivo | Uso |
|---------|-----|
| `.env` (raíz) | Desarrollo API + claves LLM |
| `apps/web/.env` | `PUBLIC_*` para Astro local |
| `docs/.env` | Opcional Mintlify local (`mintlify dev`) |

No subas `.env` a GitHub; solo `.env.example`.
