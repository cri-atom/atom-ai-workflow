import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supabaseConfigured } from "./lib/supabase.js";
import { toolkitRouter } from "./routes/toolkit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);

const defaultOrigins = [
  "http://localhost:4321",
  "http://127.0.0.1:4321",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const extraOrigins = (process.env.WEB_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const docsOrigins = (process.env.DOCS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...extraOrigins, ...docsOrigins]);

const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL !== "false";

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (allowVercelPreviews && /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, origin ?? true);
        return;
      }
      // eslint-disable-next-line no-console
      console.warn("[cors] blocked origin:", origin);
      callback(null, false);
    },
  }),
);

app.use(express.json());

app.use("/api/v1", toolkitRouter);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    supabase: supabaseConfigured() ? "configured" : "skipped",
  });
});

app.get("/api/v1/maps/:id", async (req, res) => {
  const { id } = req.params;
  const safe = id.replace(/[^a-zA-Z0-9-_]/g, "");
  if (safe !== id) {
    res.status(400).json({ error: "invalid_map_id" });
    return;
  }

  const filePath = path.join(__dirname, "..", "data", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf8");
    res.type("application/json").send(raw);
  } catch {
    res.status(404).json({ error: "map_not_found", id });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});
