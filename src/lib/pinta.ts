// Mismo resaltado que ejercicios.py (pinta): devuelve rangos {desde, hasta, clase} sobre el texto completo.
export type Rango = { desde: number; hasta: number; clase: string };

export function rangos(texto: string): Rango[] {
  const out: Rango[] = [];
  let pos = 0, enRes = false;
  for (const l of texto.split("\n")) {
    const t = l.trim();
    const esRes = /^\s*#\s*Resultado/.test(l);
    enRes = (enRes && t.startsWith("#")) || esRes;
    if (enRes) out.push({ desde: pos, hasta: pos + l.length, clase: "res" });
    else if (t.startsWith("#")) {
      out.push({ desde: pos, hasta: pos + l.length, clase: "c" });
      for (const m of l.matchAll(/TODO[^:]*:/g))
        out.push({ desde: pos + m.index!, hasta: pos + m.index! + m[0].length, clase: "todo" });
    } else for (const m of l.matchAll(/"[^"]*"|'[^']*'/g))
      out.push({ desde: pos + m.index!, hasta: pos + m.index! + m[0].length, clase: "s" });
    pos += l.length + 1;
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function aHtml(texto: string): string {
  let html = "", i = 0;
  for (const r of rangos(texto)) {
    if (r.clase === "todo") continue; // se pinta dentro del comentario
    html += esc(texto.slice(i, r.desde));
    const frag = texto.slice(r.desde, r.hasta);
    html += `<span class="${r.clase}">${r.clase === "c" ? esc(frag).replace(/(TODO[^:]*:)/g, '<b class="todo">$1</b>') : esc(frag)}</span>`;
    i = r.hasta;
  }
  return html + esc(texto.slice(i));
}
