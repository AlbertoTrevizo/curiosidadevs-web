import contextlib
import io
import sys


def _input_falso(lineas):
    def _input(prompt=""):
        print(prompt, end="")
        if not lineas:
            raise EOFError("EOF when reading a line")
        return lineas.pop(0)
    return _input


def revisar(codigo, ejercicio):
    """Ejecuta codigo y lo revisa. Devuelve {"estado","salida","mensaje"}."""
    salida_esp = ejercicio.get("salida")
    prueba = ejercicio.get("prueba")
    lineas = ejercicio.get("entrada", "").split("\n") if ejercicio.get("entrada") else []
    buf = io.StringIO()
    ns = {"__name__": "__main__", "input": _input_falso(lineas)}

    def res(estado, mensaje=""):
        return {"estado": estado, "salida": buf.getvalue(), "mensaje": mensaje}

    try:
        with contextlib.redirect_stdout(buf):
            exec(codigo, ns)
            if prueba:
                exec(prueba, ns)
    except AssertionError as e:
        return res("mal", str(e) or "Algo no cuadra todavía")
    except BaseException as e:  # incluye SystemExit y errores de sintaxis
        return res("error", f"{type(e).__name__}: {e}")

    if salida_esp is not None:
        obtenida = " ".join(buf.getvalue().split())
        esperada = " ".join(salida_esp.split())
        if obtenida != esperada:
            return res("mal", f"Tu salida fue {obtenida}, se esperaba {esperada}")
        return res("bien")
    if prueba:
        return res("bien")
    return res("sin_revision")


if __name__ == "__main__":
    r = revisar("print(1+1)", {"salida": "2"})
    assert r["estado"] == "bien" and r["salida"] == "2\n", r
    r = revisar("print(1\n+1)", {"salida": "2"})
    assert r["estado"] == "bien", r
    r = revisar("print(3)", {"salida": "2"})
    assert r["estado"] == "mal" and r["mensaje"] == "Tu salida fue 3, se esperaba 2", r
    r = revisar("x = 1", {"prueba": "assert x == 2, 'Pista: x vale 2'"})
    assert r["estado"] == "mal" and r["mensaje"] == "Pista: x vale 2", r
    r = revisar("x = 1", {"prueba": "assert x == 2"})
    assert r["estado"] == "mal" and r["mensaje"] == "Algo no cuadra todavía", r
    r = revisar("x = 2", {"prueba": "assert x == 2"})
    assert r["estado"] == "bien", r
    r = revisar("1/0", {"salida": "x"})
    assert r["estado"] == "error" and r["mensaje"] == "ZeroDivisionError: division by zero", r
    r = revisar("x = (1,2)\nx[0] = 3", {})
    assert r["estado"] == "error" and r["mensaje"].startswith("TypeError:"), r
    r = revisar("print('hola')", {})
    assert r["estado"] == "sin_revision" and r["salida"] == "hola\n", r
    r = revisar("e = int(input('edad? '))\nprint(e >= 18)", {"entrada": "20", "salida": "edad? True"})
    assert r["estado"] == "bien", r
    r = revisar("input()", {})
    assert r["estado"] == "error" and r["mensaje"].startswith("EOFError"), r
    print("revisar.py: autoprueba OK")
