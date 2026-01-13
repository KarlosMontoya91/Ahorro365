import fs from "fs";
import path from "path";

const root = process.cwd();
const outDir = path.join(root, "out");
const docsDir = path.join(root, "docs");

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function cp(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) cp(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(outDir)) {
  console.error("No existe /out. Ejecuta next build primero.");
  process.exit(1);
}

rm(docsDir);
cp(outDir, docsDir);

// GitHub Pages para SPA/Next export: evita 404 en refresh
const nojekyll = path.join(docsDir, ".nojekyll");
fs.writeFileSync(nojekyll, "");

console.log("✅ Export listo: /docs actualizado desde /out");
