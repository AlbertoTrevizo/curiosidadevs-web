// Worker de módulo (Pyodide 314 ya no corre en workers clásicos): carga Pyodide (versión fija) y revisar.py, y responde a {id, codigo, ejercicio}.
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs";

const listo = (async () => {
  const py = await loadPyodide();
  const src = await (await fetch(new URL("revisar.py", self.location.href))).text();
  py.runPython(src);
  return py;
})();
listo.then(() => self.postMessage({ ready: true }), (e) => self.postMessage({ ready: false, mensaje: String(e) }));

self.onmessage = async ({ data: { id, codigo, ejercicio } }) => {
  try {
    const py = await listo;
    const revisar = py.globals.get("revisar");
    const dict = py.toPy(ejercicio);
    const r = revisar(codigo, dict);
    const out = r.toJs({ dict_converter: Object.fromEntries });
    r.destroy(); dict.destroy(); revisar.destroy();
    self.postMessage({ id, ...out });
  } catch (e) {
    self.postMessage({ id, estado: "error", salida: "", mensaje: String(e) });
  }
};
