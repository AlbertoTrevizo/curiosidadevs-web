import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { Decoration, ViewPlugin, type DecorationSet } from "@codemirror/view";
import { rangos } from "../lib/pinta";

type Props = { codigo: string; salida?: string; prueba?: string; entrada?: string; archivo: string };
type Res = { estado: "bien" | "mal" | "error" | "sin_revision"; salida: string; mensaje: string } | { estado: "tiempo" };

// Resaltado propio (mismo que el PDF): comentarios, TODO, bloque "Resultado esperado", strings.
const pintado = ViewPlugin.fromClass(class {
  decos: DecorationSet;
  constructor(v: EditorView) { this.decos = this.calcula(v); }
  update(u: { docChanged: boolean; view: EditorView }) { if (u.docChanged) this.decos = this.calcula(u.view); }
  calcula(v: EditorView) {
    return Decoration.set(rangos(v.state.doc.toString()).filter((r) => r.hasta > r.desde)
      .map((r) => Decoration.mark({ class: "cm-" + r.clase }).range(r.desde, r.hasta)));
  }
}, { decorations: (p) => p.decos });

const tema = EditorView.theme({
  "&": { backgroundColor: "#fff", color: "#0A0A0A", fontSize: "14px" },
  ".cm-content": { fontFamily: '"SF Mono", Menlo, monospace', padding: "12px 0" },
  ".cm-gutters": { backgroundColor: "#fff", color: "#9A937F", border: "none" },
  "&.cm-focused": { outline: "2px solid #C17F5E" },
  ".cm-scroller": { overflow: "auto", fontFamily: '"SF Mono", Menlo, monospace' },
  // `!important` y `*`: le ganan al resaltado por defecto de basicSetup, que pinta spans internos.
  ".cm-c, .cm-c *": { color: "#9A937F !important" }, ".cm-s, .cm-s *": { color: "#B5654A !important" },
  ".cm-res, .cm-res *": { color: "#4E8A5A !important" }, ".cm-todo, .cm-todo *": { color: "#C17F5E !important", fontWeight: "700" },
});

// Un solo worker por página; se recrea si se termina por tiempo.
let worker: Worker | null = null;
let listo: Promise<Worker> | null = null;
function obtenerWorker(): Promise<Worker> {
  if (listo) return listo;
  const w = new Worker(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/pyodide-worker.js`, { type: "module" });
  worker = w;
  listo = new Promise((ok, no) => {
    w.addEventListener("message", function f(e) {
      if (e.data.ready === undefined) return;
      w.removeEventListener("message", f);
      e.data.ready ? ok(w) : no(new Error(e.data.mensaje));
    });
    w.addEventListener("error", () => no(new Error("No se pudo cargar Python")));
  });
  listo.catch(() => { worker = null; listo = null; });
  return listo;
}
function matarWorker() { worker?.terminate(); worker = null; listo = null; }

let nextId = 0;
async function ejecuta(codigo: string, ejercicio: object): Promise<Res> {
  const w = await obtenerWorker();
  const id = ++nextId;
  return new Promise((ok) => {
    const t = setTimeout(() => { matarWorker(); ok({ estado: "tiempo" }); }, 5000);
    w.addEventListener("message", function f(e) {
      if (e.data.id !== id) return;
      clearTimeout(t); w.removeEventListener("message", f); ok(e.data);
    });
    w.postMessage({ id, codigo, ejercicio });
  });
}

export default function Editor({ codigo, salida, prueba, entrada, archivo }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const vista = useRef<EditorView | null>(null);
  const [res, setRes] = useState<Res | null>(null);
  const [cargando, setCargando] = useState(false);
  const [ent, setEnt] = useState(entrada ?? "");
  const usaInput = codigo.includes("input(");

  useEffect(() => {
    vista.current = new EditorView({ doc: codigo, parent: host.current!, extensions: [basicSetup, python(), pintado, tema, EditorView.lineWrapping] });
    return () => vista.current?.destroy();
  }, [codigo]);

  async function ejecutar() {
    setCargando(true); setRes(null);
    try {
      setRes(await ejecuta(vista.current!.state.doc.toString(), ent === (entrada ?? "") ? { salida, prueba, entrada: ent } : { entrada: ent } /* otra entrada: solo ejecutar, la revisión es para la entrada por defecto */));
    } catch (e) {
      setRes({ estado: "error", salida: "", mensaje: String((e as Error).message) });
    }
    setCargando(false);
  }
  function reiniciar() {
    const v = vista.current!;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: codigo } });
    setRes(null); setEnt(entrada ?? "");
  }

  return (
    <div className="ed">
      <div className="ed-barra">
        <span className="pt" style={{ background: "#ff5c7a" }} /><span className="pt" style={{ background: "#ffc857" }} /><span className="pt" style={{ background: "#5ce6a1" }} />
        <span className="ed-nombre">{archivo}</span>
      </div>
      <div ref={host} />
      {usaInput && (
        <label className="ed-ent">Entrada
          <input value={ent} onChange={(e) => setEnt(e.target.value)} />
        </label>
      )}
      <div className="ed-btns">
        <button type="button" className="btn pri" onClick={ejecutar} disabled={cargando}>{cargando ? "Cargando Python…" : "Ejecutar"}</button>
        <button type="button" className="btn" onClick={reiniciar} disabled={cargando}>Reiniciar</button>
      </div>
      <div role="status" aria-live="polite" className="ed-res">
        {res && res.estado === "tiempo" && <p className="msg mal">Tardó demasiado. ¿Un ciclo que nunca termina?</p>}
        {res && res.estado !== "tiempo" && (
          <>
            {res.salida && <pre className="ed-term">{res.salida}</pre>}
            {res.estado === "bien" && <p className="msg bien">✅ ¡Lo lograste!</p>}
            {res.estado === "mal" && <p className="msg mal">🟠 {res.mensaje}</p>}
            {res.estado === "error" && <p className="msg err">🔴 {res.mensaje}</p>}
          </>
        )}
      </div>
      <style>{`
        .ed{background:#fff;border:1px solid #E2DCCD;border-radius:16px;box-shadow:0 24px 60px rgba(60,45,20,.16);overflow:hidden;max-width:100%}
        .ed-barra{display:flex;align-items:center;gap:7px;padding:10px 14px;border-bottom:1px solid #E2DCCD}
        .pt{width:12px;height:12px;border-radius:50%}
        .ed-nombre{margin-left:8px;color:#7A7466;font:.8rem "SF Mono",Menlo,monospace}
        .ed-ent{display:flex;gap:10px;align-items:center;padding:8px 14px;border-top:1px solid #E2DCCD;color:#7A7466;font-size:.9rem}
        .ed-ent input{flex:1;min-width:0;font:.9rem "SF Mono",Menlo,monospace;padding:6px 8px;border:1px solid #E2DCCD;border-radius:8px}
        .ed-btns{display:flex;gap:10px;padding:10px 14px;border-top:1px solid #E2DCCD}
        .btn{font:inherit;font-weight:700;padding:8px 16px;border-radius:10px;border:1px solid #E2DCCD;background:#fff;color:#0A0A0A;cursor:pointer}
        .btn.pri{background:#C17F5E;border-color:#C17F5E;color:#fff}
        .btn:disabled{opacity:.6;cursor:wait}
        .btn:focus-visible{outline:2px solid #0A0A0A;outline-offset:2px}
        .ed-res:not(:empty){border-top:1px solid #E2DCCD;padding:10px 14px}
        .ed-term{margin:0 0 8px;padding:10px 12px;background:#F6F2E8;border-radius:10px;font:.85rem "SF Mono",Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
        .msg{margin:0;font-weight:600;overflow-wrap:anywhere}.msg.bien{color:#4E8A5A}.msg.mal{color:#a8620f}.msg.err{color:#C8452F}
      `}</style>
    </div>
  );
}
