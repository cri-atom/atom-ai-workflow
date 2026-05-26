/**
 * Mintlify CLI no soporta Node 25+ y el monorepo fija la serie 20 (engines + Volta).
 * Ejecutar antes de `npm run dev` para evitar fallos crípticos en el workspace docs.
 */
const major = Number(process.version.slice(1).split(".")[0]);

if (major !== 20) {
  console.error("");
  console.error("[atom-ai-workflow] Se requiere Node 20.x (Mintlify y engines del repo).");
  console.error(`  Versión actual: ${process.version}`);
  console.error("");
  console.error("  Con Volta (recomendado):");
  console.error("    volta install node@20.20.2");
  console.error("    cd este-repo && node --version   # debe mostrar v20.x");
  console.error("");
  console.error("  Luego vuelve a ejecutar: npm run dev");
  console.error("");
  process.exit(1);
}
