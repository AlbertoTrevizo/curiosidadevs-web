---
titulo: "La terminal sin miedo"
descripcion: "Guía rápida para perder el miedo a la terminal: qué es y los comandos básicos."
fecha: 2026-11-19
---


## 1. ¿Qué es la terminal?

La terminal es una ventana donde, en lugar de hacer clic, **escribes** lo que quieres que haga tu computadora. Es el Finder (o el Explorador de archivos), pero escrito: las mismas carpetas y archivos.

**Terminal vs. shell**
- **Terminal**: la ventana.
- **Shell**: el programa que entiende lo que escribes (zsh, bash, PowerShell).

Desde macOS Catalina (2019), el shell por defecto del Mac es **zsh**.

Para abrirla en Mac: Cmd + Espacio, escribe "Terminal" y Enter.

## 2. Comandos básicos

| Comando | Qué hace | Equivalente en Finder |
|---|---|---|
| `pwd` | ¿Dónde estoy? Muestra la ruta de la carpeta actual | Ver la ruta de la ventana |
| `ls` | Lista lo que hay en la carpeta | Abrir la carpeta |
| `cd carpeta` | Entra a una carpeta | Doble clic |
| `cd ..` | Sube un nivel | Botón "atrás" |
| `cd ~` o `cd` | Va a tu carpeta personal | Ir a Inicio |
| `mkdir nombre` | Crea una carpeta | Nueva carpeta |
| `touch archivo.txt` | Crea un archivo vacío | — |
| `open .` (Mac) | Abre la carpeta actual en el Finder | — |
| `clear` o Ctrl+L | Limpia la pantalla | — |
| `rm archivo` | Borra un archivo (sin papelera) | Mover a la papelera, pero sin papelera |

## 3. Trucos

- **Tab**: autocompleta nombres de carpetas y archivos. Escribe las primeras letras y presiona Tab.
- **Flecha arriba (↑)**: repite comandos anteriores.
- **Control C**: cancela lo que esté corriendo. Si algo se atora, esta es tu salida.
- **`clear`**: limpia la pantalla.
- **`man comando`** o **`comando --help`**: muestra la ayuda de un comando (por ejemplo `man ls`). En `man`, sal con la tecla `q`.

## 4. Aviso: `rm`

`rm` **no manda a la papelera: borra directo**, y no hay forma fácil de deshacerlo. Es el único comando "peligroso" de los básicos. Antes de usarlo, revisa con `ls` qué vas a borrar y escribe el nombre con calma.

## 5. Práctica paso a paso

Escribe cada línea y presiona Enter.

1. `pwd`: mira dónde estás.
2. `mkdir mi-proyecto`: crea una carpeta.
3. `ls`: confirma que `mi-proyecto` aparece.
4. `cd mi-` y presiona **Tab**: se completa el nombre. Enter para entrar.
5. `pwd`: la ruta ahora termina en `mi-proyecto`.
6. `touch notas.txt`: crea un archivo vacío.
7. `ls`: verás `notas.txt`.
8. `cd ..`: regresa a la carpeta anterior.
9. `cd mi-proyecto` y luego `open .`: se abre la carpeta en el Finder. Ahí está tu `notas.txt`. Es la misma carpeta.

## 6. Notas para Windows

- Usa **PowerShell**; casi todos los comandos de esta guía funcionan igual (`pwd`, `ls`, `cd`, `mkdir`).
- Para abrir la carpeta actual en el Explorador, usa `explorer .` en lugar de `open .`.

## 7. Terminales más bonitas

La terminal que viene con tu Mac funciona bien. Si quieres algo más cómodo:

**iTerm2** (Mac, gratis y de código abierto)
- Paneles divididos (Cmd+D) y una ventana "hotkey" que aparece con una tecla.
- Búsqueda y muy configurable. Es el clásico del Mac.
- Instalar: [iterm2.com](https://iterm2.com) o `brew install --cask iterm2`

**Warp** (Mac, Linux y Windows; tiene plan gratis)
- Cada comando y su salida es un "bloque" que puedes copiar o compartir.
- Editas el comando como en un editor de texto, con el mouse. Muy amigable para principiantes.
- Instalar: [warp.dev](https://www.warp.dev) o `brew install --cask warp`

---

Con Claude Code hoy trabajo en la terminal todos los días: pruébalo cuando ya te sientas cómodo.
