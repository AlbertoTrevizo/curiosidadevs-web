// Copia los ejercicios.json de la serie a src/content/dias/<carpeta>.json
import { readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
const origen = new URL("../../Curiosida.devs/videos/30-days-of-python/", import.meta.url);
const destino = new URL("../src/content/dias/", import.meta.url);
mkdirSync(destino, { recursive: true });
let n = 0;
for (const d of readdirSync(origen, { withFileTypes: true })) {
  const f = new URL(`${d.name}/ejercicios.json`, origen + "/");
  if (d.isDirectory() && existsSync(f)) { copyFileSync(f, new URL(`${d.name}.json`, destino)); n++; }
}
console.log(`${n} días sincronizados`);
