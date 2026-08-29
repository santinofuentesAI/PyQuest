"""Full topical units that replace the playable templates."""
from __future__ import annotations

import json
import re

FENCE_RE = re.compile(r"```(?:[a-zA-Z0-9_+-]*)[ \t]*\n?(.*?)```", re.S)


def split_prompt_code(prompt, starter=None):
    """Keep the question in the prompt; move fenced snippets into starterCode."""
    code = starter
    m = FENCE_RE.search(prompt or "")
    if m and not code:
        code = m.group(1).strip("\n")
    text = FENCE_RE.sub("", prompt or "").strip()
    return text, code


def mc(eid, prompt, choices, correct, explanation, xp=10, difficulty=1, hint=None, solution=None):
    opts = [{"id": c[0], "text": c[1]} for c in choices]
    d = {
        "id": eid,
        "type": "multiple_choice",
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": solution or next(c[1] for c in choices if c[0] == correct),
        "choices": opts,
        "correctChoiceId": correct,
    }
    return {k: v for k, v in d.items() if v is not None}


def predict(eid, prompt, code, accepted, explanation, xp=10, difficulty=1, hint=None):
    acc = accepted if isinstance(accepted, list) else [accepted]
    d = {
        "id": eid,
        "type": "predict_output",
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": acc[0],
        "acceptedOutputs": acc,
        "starterCode": code,
    }
    return {k: v for k, v in d.items() if v is not None}


def fill(eid, prompt, template, blanks, explanation, xp=12, difficulty=1, hint=None, solution=None):
    filled = template
    for b in blanks:
        filled = filled.replace("___", b["accepted"][0], 1)
    d = {
        "id": eid,
        "type": "fill_blank",
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": solution or filled,
        "template": template,
        "blanks": blanks,
    }
    return {k: v for k, v in d.items() if v is not None}


def code(
    eid, prompt, starter, tests, solution, explanation, xp=18, difficulty=2, hint=None,
    expected_stdout=None, files=None, capture_plots=False, etype="code",
):
    ex = {
        "id": eid, "type": etype, "prompt": prompt, "difficulty": difficulty, "xp": xp,
        "explanation": explanation, "solution": solution, "starterCode": starter,
        "tests": [{"assert": t} if isinstance(t, str) else t for t in tests],
    }
    if hint:
        ex["hint"] = hint
    if expected_stdout is not None:
        ex["expectedStdout"] = expected_stdout
    if files:
        ex["files"] = files
    if capture_plots:
        ex["capturePlots"] = True
    return ex


def reorder(eid, prompt, blocks, order, explanation, xp=14, difficulty=2, hint=None):
    sol = "\n".join(next(b["code"] for b in blocks if b["id"] == i) for i in order)
    d = {
        "id": eid, "type": "reorder", "prompt": prompt, "difficulty": difficulty, "xp": xp,
        "hint": hint, "explanation": explanation, "solution": sol, "blocks": blocks, "correctOrder": order,
    }
    return {k: v for k, v in d.items() if v is not None}


def matching(eid, prompt, left, right, pairs, explanation, xp=12, difficulty=2, hint=None):
    d = {
        "id": eid, "type": "matching", "prompt": prompt, "difficulty": difficulty, "xp": xp,
        "hint": hint, "explanation": explanation, "solution": json.dumps(pairs, ensure_ascii=False),
        "left": left, "right": right, "pairs": pairs,
    }
    return {k: v for k, v in d.items() if v is not None}


def find_err(eid, prompt, choices, correct, explanation, xp=12, difficulty=2, hint=None, starter=None):
    text, code = split_prompt_code(prompt, starter)
    if not text:
        text = "¿Qué está mal en este código?"
    ex = mc(eid, text, choices, correct, explanation, xp, difficulty, hint)
    ex["type"] = "find_error"
    if code:
        ex["starterCode"] = code
    return ex


def lesson(lid, title, description, exercises, level=1):
    return {
        "id": lid,
        "title": title,
        "description": description,
        "xp": sum(e["xp"] for e in exercises),
        "exercises": exercises,
        "level": level,
    }


def unit(uid, index, title, description, icon, lessons, is_project=False):
    return {
        "id": uid, "index": index, "title": title, "description": description, "icon": icon,
        "isProject": is_project, "isTemplate": False, "lessons": lessons,
    }


def u4():
    return unit("u4", 4, "Strings", "Indexado, slicing, métodos y f-strings.", "type", [
        lesson("u4-l1", "Texto que se puede cortar", "Los strings son secuencias: cada letra tiene un índice.", [
            mc("u4-e1", "En `s = \"PyQuest\"`, `s[0]` vale…",
               [("a", "P"), ("b", "y"), ("c", "t")], "a",
               "El índice 0 es el primer carácter. Python cuenta desde cero."),
            predict("u4-e2", "¿Qué imprime?", 's = "datos"\nprint(s[1:4])', "ato",
                    "El slice [1:4] incluye 1 y excluye 4: a, t, o."),
            fill("u4-e3", "Pasa a mayúsculas.", 'msg = "hola"\nprint(msg.___())', [{"accepted": ["upper"]}],
                 "upper() no modifica el string: devuelve uno nuevo (son inmutables)."),
            matching("u4-e4", "Empareja el método con el resultado sobre `'a,b,c'`.",
                     [{"id": "l1", "text": ".split(',')"}, {"id": "l2", "text": ".replace('a','z')"}, {"id": "l3", "text": ".strip()"}],
                     [{"id": "r1", "text": "['a', 'b', 'c']"}, {"id": "r2", "text": "'z,b,c'"}, {"id": "r3", "text": "Quita espacios de los bordes"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "split convierte texto en lista: el día a día al leer CSV a mano."),
            code("u4-e5",
                 "Crea `nombre = \"ana\"` y `saludo` con un f-string que diga `Hola, Ana` (usa `.title()`). Imprime `saludo`.",
                 'nombre = "ana"\n',
                 ["saludo == 'Hola, Ana'"],
                 'nombre = "ana"\nsaludo = f"Hola, {nombre.title()}"\nprint(saludo)',
                 "Los f-strings interpolan con llaves. title() capitaliza cada palabra.",
                 expected_stdout="Hola, Ana"),
            find_err("u4-e6", "```python\ns = 'abc'\ns[0] = 'A'\n```",
                     [("a", "Los strings son inmutables: no puedes asignar a un índice"),
                      ("b", "Falta print"), ("c", "abc no es un string")],
                     "a", "Para 'cambiar' un string construyes otro: 'A' + s[1:]."),
            predict("u4-e7", "¿Salida?", 'print("ML" * 3)', "MLMLML",
                    "* en strings concatena la repetición. Útil para relleno, no para matemáticas."),
            mc("u4-e8", "`len(\"ñandú\")` en Python 3 cuenta…",
               [("a", "Caracteres Unicode (5)"), ("b", "Bytes UTF-8"), ("c", "Siempre 1")],
               "a", "len sobre str cuenta code points. Para bytes usa len(s.encode())."),
        ])
    ])


def u5():
    return unit("u5", 5, "Listas", "Creación, indexado, métodos y comprensiones.", "list", [
        lesson("u5-l1", "Colecciones ordenadas", "La estructura #1 para datos en crudo.", [
            mc("u5-e1", "¿Qué hace `xs.append(4)` sobre `[1,2,3]`?",
               [("a", "Añade 4 al final, in-place"), ("b", "Devuelve una lista nueva [1,2,3,4] y deja xs igual"),
                ("c", "Inserta en la posición 0")],
               "a", "append muta. Si quieres una copia: xs + [4] o [*xs, 4]."),
            fill("u5-e2", "Ordena de menor a mayor in-place.", "xs = [3, 1, 2]\nxs.___()", [{"accepted": ["sort"]}],
                 "sort() muta. sorted(xs) devuelve una lista nueva."),
            predict("u5-e3", "¿Salida?", "xs = [10, 20, 30]\nprint(xs[-1])", "30", "Índice negativo: el último."),
            code("u5-e4",
                 "Dada `temps = [18, 21, 19]`, añade 23 y guarda `n = len(temps)`. Imprime `n`.",
                 "temps = [18, 21, 19]\n",
                 ["temps == [18, 21, 19, 23]", "n == 4"],
                 "temps = [18, 21, 19]\ntemps.append(23)\nn = len(temps)\nprint(n)",
                 "append + len es el patrón de 'ir acumulando filas'.",
                 expected_stdout="4"),
            matching("u5-e5", "Empareja la operación.",
                     [{"id": "l1", "text": "xs.pop()"}, {"id": "l2", "text": "xs[1:3]"}, {"id": "l3", "text": "[x*2 for x in xs]"}],
                     [{"id": "r1", "text": "Saca y devuelve el último"}, {"id": "r2", "text": "Una rebanada (copia)"},
                      {"id": "r3", "text": "Comprensión: lista transformada"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Las comprensiones sustituyen muchos for de una línea."),
            find_err("u5-e6", "```python\nxs = [1, 2]\nprint(xs[2])\n```",
                     [("a", "Índice 2 no existe: solo 0 y 1"), ("b", "Las listas no se indexan"), ("c", "Falta coma")],
                     "a", "IndexError: len 2 → último índice 1."),
            code("u5-e7",
                 "Crea `pares` con una comprensión: los pares de `range(8)`. Imprime `pares`.",
                 "",
                 ["pares == [0, 2, 4, 6]"],
                 "pares = [x for x in range(8) if x % 2 == 0]\nprint(pares)",
                 "if al final de la comprensión filtra. No confundir con el if-expresion ternario."),
            mc("u5-e8", "`xs.copy()` o `xs[:]` sirven para…",
               [("a", "Evitar que un sort o append aliene a la lista original"),
                ("b", "Hacer la lista inmutable"), ("c", "Convertir a tuple")],
               "a", "Sin copia, dos nombres apuntan al mismo objeto. En pandas pasa igual con vistas."),
        ])
    ])


def u6():
    return unit("u6", 6, "Tuplas y sets", "Inmutabilidad, unicidad y cuándo usar cada una.", "hash", [
        lesson("u6-l1", "Fijas y únicas", "Tupla = registro; set = conjunto.", [
            mc("u6-e1", "¿Por qué una tupla no tiene `.append()`?",
               [("a", "Es inmutable: una vez creada no cambia"), ("b", "Las tuplas están vacías siempre"),
                ("c", "append solo existe en NumPy")],
               "a", "Sirven como claves de dict y como filas que no quieres pisar por accidente."),
            predict("u6-e2", "¿Salida?", "t = (1, 2, 3)\nprint(t[1])", "2", "Se indexan igual que las listas."),
            fill("u6-e3", "Set a partir de una lista con duplicados.", "unicos = ___( [1, 1, 2, 2, 3] )",
                 [{"accepted": ["set"]}],
                 "set elimina duplicados. El orden no está garantizado (en 3.11+ se insert-order, no te fíes para lógica)."),
            matching("u6-e4", "Elige la estructura.",
                     [{"id": "l1", "text": "Coordenada (lat, lon)"}, {"id": "l2", "text": "Etiquetas únicas de un CSV"},
                      {"id": "l3", "text": "Historial de clics ordenado"}],
                     [{"id": "r1", "text": "tuple"}, {"id": "r2", "text": "set"}, {"id": "r3", "text": "list"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "El tipo documenta la intención."),
            code("u6-e5",
                 "`a = {1, 2, 3}` y `b = {3, 4}`. Guarda `inter = a & b` e imprime `sorted(inter)`.",
                 "a = {1, 2, 3}\nb = {3, 4}\n",
                 ["inter == {3}"],
                 "a = {1, 2, 3}\nb = {3, 4}\ninter = a & b\nprint(sorted(inter))",
                 "& es intersección. | unión, - diferencia. Muy útil en IDs de usuarios.",
                 expected_stdout="[3]"),
            find_err("u6-e6", "```python\nt = (1)\nprint(type(t).__name__)\n``` da int, no tuple. ¿Por qué?",
                     [("a", "Hace falta coma: (1,) — el paréntesis solo no crea tupla"),
                      ("b", "1 no puede ir en una tupla"), ("c", "Hay que usar tuple 1")],
                     "a", "La coma hace la tupla, no el paréntesis."),
            predict("u6-e7", "¿Salida?", "print(len({1, 2, 2, 2}))", "2", "Los duplicados colapsan."),
            mc("u6-e8", "Un set no puede contener…",
               [("a", "Una lista (no hashable)"), ("b", "Un int"), ("c", "Un string")],
               "a", "Los elementos deben ser hashables. Por eso las claves de dict tampoco pueden ser listas."),
        ])
    ])


def u7():
    return unit("u7", 7, "Diccionarios", "Pares clave-valor: el JSON de Python.", "book-key", [
        lesson("u7-l1", "Mapas mentales", "Nombre → valor. Así viajan casi todos los datos de APIs.", [
            mc("u7-e1", "`d['edad']` sobre `{'nombre': 'Ada', 'edad': 36}` devuelve…",
               [("a", "36"), ("b", "'edad'"), ("c", "Error siempre")],
               "a", "La clave va entre corchetes. Si no existe: KeyError. Evítalo con .get('edad')."),
            fill("u7-e2", "Añade una clave.", "d = {'n': 1}\nd[___] = 2", [{"accepted": ["'m'", '"m"']}],
                 "Asignar a una clave nueva la crea. Asignar a una existente la pisa."),
            predict("u7-e3", "¿Salida?", 'd = {"a": 1}\nprint(d.get("b", 0))', "0",
                    "get con default evita el KeyError. Patrón de contadores."),
            code("u7-e4",
                 "Crea `persona = {\"nombre\": \"Ada\", \"anio\": 1815}` e imprime `persona[\"nombre\"]`.",
                 "",
                 ["persona['nombre'] == 'Ada'", "persona['anio'] == 1815"],
                 'persona = {"nombre": "Ada", "anio": 1815}\nprint(persona["nombre"])',
                 "Un dict es el primer 'registro' antes de pandas.",
                 expected_stdout="Ada"),
            matching("u7-e5", "Empareja el método.",
                     [{"id": "l1", "text": ".keys()"}, {"id": "l2", "text": ".values()"}, {"id": "l3", "text": ".items()"}],
                     [{"id": "r1", "text": "Las claves"}, {"id": "r2", "text": "Los valores"},
                      {"id": "r3", "text": "Pares (clave, valor) para el for"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "for k, v in d.items() es el bucle idiomático."),
            find_err("u7-e6", "```python\nd = {['a']: 1}\n```",
                     [("a", "La clave es una lista: no es hashable. Usa un string o una tupla"),
                      ("b", "1 no es un valor válido"), ("c", "Falta print")],
                     "a", "Claves típicas: str, int, tuple de inmutables."),
            code("u7-e7",
                 "`notas = {'ana': 9, 'luis': 7}`. Guarda `media = sum(notas.values()) / len(notas)` e imprime `media`.",
                 "notas = {'ana': 9, 'luis': 7}\n",
                 ["abs(media - 8) < 1e-9"],
                 "notas = {'ana': 9, 'luis': 7}\nmedia = sum(notas.values()) / len(notas)\nprint(media)",
                 "values() se puede sumar como cualquier colección de números.",
                 expected_stdout="8.0"),
            mc("u7-e8", "En Python 3.7+ el dict…",
               [("a", "Conserva el orden de inserción"), ("b", "Está siempre ordenado alfabéticamente"),
                ("c", "No se puede iterar")],
               "a", "Puedes confiar en el orden de inserción, no en un sort automático."),
        ])
    ])


def u8():
    return unit("u8", 8, "if / elif / else", "Decisiones: el filtro antes de pandas.", "git-branch", [
        lesson("u8-l1", "Ramificar el flujo", "Una condición, un camino.", [
            mc("u8-e1", "En un `if/elif/else`, ¿cuántos bloques se ejecutan como máximo?",
               [("a", "Uno: el primero cuya condición es True, o el else"),
                ("b", "Todos los True"), ("c", "Siempre el else")],
               "a", "elif significa 'si no se cumplió lo anterior'. Ordenar de más específico a más general."),
            fill("u8-e2", "Condición de mayoría de edad.", "if edad ___ 18:\n    print('ok')", [{"accepted": [">=", ">"]}],
                 ">= 18 incluye exactamente 18. Un detalle legal que también sale en datos."),
            predict("u8-e3", "¿Salida?", "n = 0\nprint('pos' if n > 0 else 'no')", "no",
                    "Expresión ternaria: valor_si_true if cond else valor_si_false."),
            code("u8-e4",
                 "`temp = 32`. Guarda `estado = \"calor\"` si temp >= 30 si no `\"ok\"`. Imprime `estado`.",
                 "temp = 32\n",
                 ["estado == 'calor'"],
                 'temp = 32\nestado = "calor" if temp >= 30 else "ok"\nprint(estado)',
                 "Así etiquetas filas antes de conocer pandas.loc.",
                 expected_stdout="calor"),
            matching("u8-e5", "Operadores lógicos.",
                     [{"id": "l1", "text": "and"}, {"id": "l2", "text": "or"}, {"id": "l3", "text": "not"}],
                     [{"id": "r1", "text": "Las dos verdaderas"}, {"id": "r2", "text": "Basta una"},
                      {"id": "r3", "text": "Invierte"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "En pandas usarás & | ~ con paréntesis: el primo vectorizado."),
            find_err("u8-e6", "```python\nif x = 3:\n    print('sí')\n```",
                     [("a", "Comparar se hace con ==, no con ="), ("b", "if no existe"), ("c", "print está mal")],
                     "a", "SyntaxError clásico. = asigna."),
            predict("u8-e7", "¿Salida?", "x = 5\nif x > 10:\n    print('A')\nelif x > 3:\n    print('B')\nelse:\n    print('C')",
                    "B", "5 no es > 10, sí es > 3. El else no llega."),
            mc("u8-e8", "`bool([])` y `bool('')` son…",
               [("a", "False: colecciones vacías y strings vacíos son falsy"),
                ("b", "True"), ("c", "Error")],
               "a", "if xs: significa 'si hay algo'. Cuidado: if xs no distingue [0] (truthy) de []."),
        ])
    ])


def u9():
    return unit("u9", 9, "Bucles", "for, while, break, continue y range.", "repeat", [
        lesson("u9-l1", "Repetir sin copiar", "El for recorre; el while espera una condición.", [
            predict("u9-e1", "¿Salida?", "print(list(range(3)))", "[0, 1, 2]",
                    "range(n) es 0..n-1. range(1, 4) sería 1,2,3."),
            fill("u9-e2", "Recorre una lista.", "for x in ___:\n    print(x)", [{"accepted": ["xs", "lista", "[1, 2]"]}],
                 "for x in xs recorre valores, no índices. Si necesitas índice: enumerate."),
            code("u9-e3",
                 "Suma los números de `xs = [2, 4, 6]` en `total` con un for. Imprime `total`.",
                 "xs = [2, 4, 6]\ntotal = 0\n",
                 ["total == 12"],
                 "xs = [2, 4, 6]\ntotal = 0\nfor x in xs:\n    total += x\nprint(total)",
                 "Acumulador + bucle. Luego verás sum(xs) y array.sum().",
                 expected_stdout="12"),
            matching("u9-e4", "Empareja.",
                     [{"id": "l1", "text": "break"}, {"id": "l2", "text": "continue"}, {"id": "l3", "text": "enumerate(xs)"}],
                     [{"id": "r1", "text": "Sale del bucle"}, {"id": "r2", "text": "Salta a la siguiente iteración"},
                      {"id": "r3", "text": "Pares (índice, valor)"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "break corta búsquedas; continue filtra casos sucios."),
            find_err("u9-e5", "Un `while True:` sin break…",
                     [("a", "Bucle infinito: PyQuest lo corta a los 8 s"), ("b", "Es ilegal en Python"),
                      ("c", "Solo imprime una vez")],
                     "a", "Siempre ten una condición de salida o un break."),
            code("u9-e6",
                 "Usa `enumerate` sobre `['a','b']` y guarda `pares` como lista de (i, letra). Imprime `pares`.",
                 "letras = ['a', 'b']\n",
                 ["pares == [(0, 'a'), (1, 'b')]"],
                 "letras = ['a', 'b']\npares = list(enumerate(letras))\nprint(pares)",
                 "enumerate evita el anti-patrón for i in range(len(xs))."),
            predict("u9-e7", "¿Cuántas líneas imprime?", "for i in range(5):\n    if i == 2:\n        continue\n    if i == 4:\n        break\n    print(i)",
                    "0\n1\n3", "0 y 1 se imprimen, 2 se salta, 3 se imprime, 4 rompe."),
            mc("u9-e8", "¿Cuándo prefieres while frente a for?",
               [("a", "Cuando no sabes de antemano cuántas vueltas (esperar un evento, Newton, etc.)"),
                ("b", "Siempre, es más rápido"), ("c", "Nunca en datos")],
               "a", "Para recorrer una lista, for. Para 'hasta que converja', while."),
        ])
    ])


def u10():
    return unit("u10", 10, "Funciones", "def, return, defaults y *args.", "square-function", [
        lesson("u10-l1", "Empaquetar lógica", "Un nombre, unos parámetros, un resultado.", [
            mc("u10-e1", "¿Qué devuelve una función sin `return`?",
               [("a", "None"), ("b", "0"), ("c", "Error")],
               "a", "Si olvidas return, el caller recibe None y a veces 'funciona' hasta que no."),
            fill("u10-e2", "Define y devuelve el doble.", "def doble(n):\n    ___ n * 2", [{"accepted": ["return"]}],
                 "return entrega el valor. print solo lo muestra."),
            code("u10-e3",
                 "Escribe `media(xs)` que devuelva la media aritmética. `r = media([2, 4, 6])` e imprime `r`.",
                 "",
                 ["abs(r - 4) < 1e-9"],
                 "def media(xs):\n    return sum(xs) / len(xs)\nr = media([2, 4, 6])\nprint(r)",
                 "Una función de una línea es el primer paso hacia un módulo de análisis.",
                 expected_stdout="4.0"),
            matching("u10-e4", "Empareja la firma.",
                     [{"id": "l1", "text": "def f(x=0)"}, {"id": "l2", "text": "*args"}, {"id": "l3", "text": "**kwargs"}],
                     [{"id": "r1", "text": "Argumento por defecto"}, {"id": "r2", "text": "Sobra de posicionales en tupla"},
                      {"id": "r3", "text": "Sobra de nombrados en dict"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "pandas.read_csv usa un montón de kwargs. Ahora sabes leer la firma."),
            find_err("u10-e5", "```python\ndef f(a, b=1, c):\n    return a+b+c\n```",
                     [("a", "Los parámetros sin default no pueden ir detrás de los que sí tienen"),
                      ("b", "Falta print"), ("c", "c no existe")],
                     "a", "SyntaxError. Orden: posicionales, defaults, *args, kwargs."),
            predict("u10-e6", "¿Salida?", "def f(x, y=2):\n    return x * y\nprint(f(3))", "6",
                    "y toma el default 2. f(3, 4) sería 12."),
            code("u10-e7",
                 "Escribe `suma(*nums)` que sume todos los argumentos. `s = suma(1,2,3,4)` e imprime `s`.",
                 "",
                 ["s == 10"],
                 "def suma(*nums):\n    return sum(nums)\ns = suma(1, 2, 3, 4)\nprint(s)",
                 "*nums empaqueta en tupla. Es la idea detrás de np.sum sobre varios arrays… casi."),
            mc("u10-e8", "Una función pura…",
               [("a", "Dadas las mismas entradas, misma salida, sin tocar estado global"),
                ("b", "Siempre imprime"), ("c", "No puede tener return")],
               "a", "En datos, las funciones puras se testean con asserts. PyQuest hace exactamente eso."),
        ])
    ])


def u11():
    return unit("u11", 11, "Errores", "try/except/finally y leer un traceback.", "shield-alert", [
        lesson("u11-l1", "Cuando algo explota", "El error es un dato más: tipo, mensaje, dónde.", [
            mc("u11-e1", "`1/0` lanza…",
               [("a", "ZeroDivisionError"), ("b", "ValueError"), ("c", "KeyError")],
               "a", "Captura el tipo concreto. except Exception es la red ancha, no el primer recurso."),
            fill("u11-e2", "Atrapa la división por cero.", "try:\n    1/0\nexcept ___:\n    print('boom')",
                 [{"accepted": ["ZeroDivisionError"]}],
                 "El tipo va junto a except. Puedes `as err` para el mensaje."),
            predict("u11-e3", "¿Salida?", "try:\n    int('x')\nexcept ValueError:\n    print('no')\nelse:\n    print('sí')",
                    "no", "else del try corre solo si no hubo excepción. Aquí int('x') falla."),
            matching("u11-e4", "Empareja el error típico en datos.",
                     [{"id": "l1", "text": "KeyError"}, {"id": "l2", "text": "TypeError"}, {"id": "l3", "text": "FileNotFoundError"}],
                     [{"id": "r1", "text": "Clave ausente en dict / columna mal escrita"},
                      {"id": "r2", "text": "str + int, o None en una cuenta"},
                      {"id": "r3", "text": "La ruta del CSV no existe"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Leer el nombre de la excepción ya te dice qué mirar."),
            code("u11-e5",
                 "Define `seguro_int(s)` que devuelva int(s) o None si ValueError. Imprime `seguro_int('7')` y `seguro_int('x')` en dos prints.",
                 "",
                 [],
                 "def seguro_int(s):\n    try:\n        return int(s)\n    except ValueError:\n        return None\nprint(seguro_int('7'))\nprint(seguro_int('x'))",
                 "Limpiar columnas sucias empieza así. En pandas: to_numeric(..., errors='coerce').",
                 expected_stdout="7\nNone"),
            find_err("u11-e6", "`except:` desnudo (sin tipo)…",
                     [("a", "Atrapa hasta KeyboardInterrupt/SystemExit en versiones viejas: demasiado amplio"),
                      ("b", "Es la forma recomendada"), ("c", "No existe")],
                     "a", "Prefiere except ValueError o except (TypeError, ValueError)."),
            predict("u11-e7", "¿Se imprime finally?", "try:\n    1/0\nexcept ZeroDivisionError:\n    print('e')\nfinally:\n    print('f')",
                    "e\nf", "finally corre siempre: cerrar archivos, soltar locks."),
            mc("u11-e8", "El traceback se lee…",
               [("a", "De abajo hacia arriba: la última línea es la causa; arriba es la pila de llamadas"),
                ("b", "Solo la primera línea"), ("c", "No sirve en análisis de datos")],
               "a", "La última línea (tipo + mensaje) es el titular. El resto es el camino."),
        ])
    ])


def u12():
    return unit("u12", 12, "OOP", "Clases, __init__, atributos y herencia básica.", "boxes", [
        lesson("u12-l1", "Objetos con memoria", "Un modelo es un objeto: fit guarda coeficientes.", [
            mc("u12-e1", "`__init__` se llama cuando…",
               [("a", "Creas la instancia: Persona('Ada')"), ("b", "Imprimes el objeto"), ("c", "Importas el módulo")],
               "a", "Es el constructor. self es la instancia en construcción."),
            fill("u12-e2", "Guarda el nombre en la instancia.",
                 "class P:\n    def __init__(self, n):\n        self.___ = n",
                 [{"accepted": ["n"]}],
                 "self.n es un atributo de instancia. Cada objeto tiene el suyo."),
            code("u12-e3",
                 "Crea una clase `Punto` con `__init__(self, x, y)` y método `suma(self)` que devuelva x+y. `p = Punto(2, 3)` e imprime `p.suma()`.",
                 "",
                 ["p.x == 2", "p.y == 3"],
                 "class Punto:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def suma(self):\n        return self.x + self.y\np = Punto(2, 3)\nprint(p.suma())",
                 "Un método es una función con self. sklearn.LinearRegression() es esta idea, a lo grande.",
                 expected_stdout="5"),
            matching("u12-e4", "Vocabulario.",
                     [{"id": "l1", "text": "Clase"}, {"id": "l2", "text": "Instancia"}, {"id": "l3", "text": "Herencia"}],
                     [{"id": "r1", "text": "El plano"}, {"id": "r2", "text": "Un objeto concreto"},
                      {"id": "r3", "text": "Reutilizar y especializar una clase"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "class RandomForestClassifier(ForestClassifier): en el código de sklearn."),
            find_err("u12-e5", "```python\nclass A:\n    def f():\n        return 1\nA().f()\n```",
                     [("a", "Falta self en def f(self)"), ("b", "class no existe"), ("c", "Hay que usar new A")],
                     "a", "TypeError: f() takes 0 positional arguments but 1 was given — ese 1 es self."),
            predict("u12-e6", "¿Salida?", "class A:\n    x = 1\nprint(A().x)", "1",
                    "x es atributo de clase, compartido si no lo pisa la instancia."),
            code("u12-e7",
                 "Clase `Modelo` con `self.w = 0` y `def predecir(self, x): return self.w * x`. Instancia, asigna `m.w = 2`, imprime `m.predecir(4)`.",
                 "",
                 ["m.w == 2"],
                 "class Modelo:\n    def __init__(self):\n        self.w = 0\n    def predecir(self, x):\n        return self.w * x\nm = Modelo()\nm.w = 2\nprint(m.predecir(4))",
                 "fit() en sklearn escribe self.coef_. predict() los usa. Ya viste el patrón.",
                 expected_stdout="8"),
            mc("u12-e8", "`super().__init__(...)` sirve para…",
               [("a", "Llamar al constructor de la clase padre"), ("b", "Borrar la clase"), ("c", "Importar numpy")],
               "a", "En herencia, inicializas lo común arriba y lo específico abajo."),
        ])
    ])


def u13():
    return unit("u13", 13, "Módulos y pip", "import, venv y el ecosistema de datos.", "package", [
        lesson("u13-l1", "No reinventes", "La librería estándar + pip.", [
            mc("u13-e1", "`import math as m` permite…",
               [("a", "Usar m.sqrt en vez de math.sqrt"), ("b", "Instalar math"), ("c", "Borrar math")],
               "a", "El alias no cambia el paquete. np y pd son convención, no magia."),
            fill("u13-e2", "Importa una función suelta.", "from math import ___", [{"accepted": ["sqrt", "pi", "ceil"]}],
                 "from x import y mete y en el espacio de nombres actual. No abuses: luego no se sabe de dónde viene."),
            predict("u13-e3", "¿Salida (aprox. enteros)?", "import math\nprint(int(math.sqrt(9)))", "3",
                    "sqrt está en math. En arrays usarás np.sqrt, vectorizado."),
            matching("u13-e4", "Herramientas de entorno.",
                     [{"id": "l1", "text": "venv"}, {"id": "l2", "text": "pip install"}, {"id": "l3", "text": "requirements.txt"}],
                     [{"id": "r1", "text": "Aísla dependencias del proyecto"}, {"id": "r2", "text": "Instala un paquete"},
                      {"id": "r3", "text": "Lista pines de versiones"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "En PyQuest el 'venv' del alumno es Pyodide. En tu portátil, usa venv de verdad."),
            find_err("u13-e5", "`from pandas import *`",
                     [("a", "Ensucia el namespace y puede pisar open, sum, etc. — importa pandas as pd"),
                      ("b", "pandas no existe"), ("c", "El asterisco instala GPU")],
                     "a", "Estilo explícito: sabes de qué librería sale cada nombre."),
            code("u13-e6",
                 "Importa `statistics` y guarda `m = statistics.mean([1, 2, 3])`. Imprime `m`.",
                 "",
                 ["abs(m - 2) < 1e-9"],
                 "import statistics\nm = statistics.mean([1, 2, 3])\nprint(m)",
                 "La stdlib ya trae media. NumPy entra cuando hay arrays grandes.",
                 expected_stdout="2"),
            mc("u13-e7", "¿Para qué sirve `python -m pip install numpy` con `-m`?",
               [("a", "Usa el pip de ESE Python, no otro pip del PATH"),
                ("b", "Compila Python"), ("c", "Solo funciona en Windows")],
               "a", "Evita instalar paquetes en el intérprete equivocado."),
            predict("u13-e8", "Tras `import numpy as np`, `np.__name__` es…",
                    "import numpy as np\nprint(np.__name__)", "numpy",
                    "El alias es local. El módulo sigue llamándose numpy."),
        ])
    ])


def u17():
    return unit("u17", 17, "Funciones estadísticas", "mean, std, sum, argmax: resumir un array.", "sigma", [
        lesson("u17-l1", "Un número por eje", "axis=0 baja por filas; axis=1 recorre columnas.", [
            fill("u17-e1", "Media de un vector.", "import numpy as np\nnp.___([1, 3, 5])", [{"accepted": ["mean"]}],
                 "mean es la media. En arrays 2D, pasa axis."),
            predict("u17-e2", "¿Salida?", "import numpy as np\nprint(int(np.array([1, 8, 3]).argmax()))", "1",
                    "argmax es el ÍNDICE del máximo (8 está en 1), no el valor 8. argmin al revés."),
            code("u17-e3",
                 "`a = np.array([[1., 2.], [3., 4.]])`. Guarda `col_mean = a.mean(axis=0)`. Imprime `col_mean[0]`.",
                 "import numpy as np\na = np.array([[1., 2.], [3., 4.]])\n",
                 ["abs(float(col_mean[0]) - 2) < 1e-9", "abs(float(col_mean[1]) - 3) < 1e-9"],
                 "import numpy as np\na = np.array([[1., 2.], [3., 4.]])\ncol_mean = a.mean(axis=0)\nprint(col_mean[0])",
                 "axis=0 comprime las filas → una media por columna. Es el resumen de un dataset numérico.",
                 expected_stdout="2.0"),
            matching("u17-e4", "Empareja.",
                     [{"id": "l1", "text": "np.sum"}, {"id": "l2", "text": "np.std"}, {"id": "l3", "text": "np.percentile(a, 50)"}],
                     [{"id": "r1", "text": "Suma"}, {"id": "r2", "text": "Dispersión (ddof=0 por defecto)"},
                      {"id": "r3", "text": "Mediana si 50"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "pandas usa ddof=1 en std. Anótalo cuando compares."),
            find_err("u17-e5", "`np.mean([])`",
                     [("a", "Media de vacío: warning/NaN — no hay datos que promediar"),
                      ("b", "Devuelve 0 siempre"), ("c", "Instala seaborn")],
                     "a", "Antes de mean, comprueba size. Un filtro demasiado agresivo deja arrays vacíos."),
            code("u17-e6",
                 "`x = np.array([2., 4., 4., 4., 5., 5., 7., 9.])`. `s = x.sum()` e imprime `int(s)`.",
                 "import numpy as np\nx = np.array([2., 4., 4., 4., 5., 5., 7., 9.])\n",
                 ["float(s) == 40"],
                 "import numpy as np\nx = np.array([2., 4., 4., 4., 5., 5., 7., 9.])\ns = x.sum()\nprint(int(s))",
                 "sum es el ladrillo de mean (sum/n) y de muchas losses.",
                 expected_stdout="40"),
            mc("u17-e7", "`keepdims=True` en mean…",
               [("a", "Conserva ejes de tamaño 1 para broadcasting posterior"),
                ("b", "Redondea"), ("c", "Convierte a lista")],
               "a", "Restar la media por fila: a - a.mean(axis=1, keepdims=True)."),
            predict("u17-e8", "np.min de [3, -1, 5] es…", "import numpy as np\nprint(np.min([3, -1, 5]))", "-1",
                    "min/max son los extremos. Útiles para detectar sensores rotos (-999)."),
        ])
    ])


def u18():
    return unit("u18", 18, "Reshape y filtros", "Cambiar forma, concatenar y máscaras booleanas.", "layers", [
        lesson("u18-l1", "Reorganizar sin bucles", "Misma memoria, otra vista — o una copia.", [
            fill("u18-e1", "De 6 celdas a 2×3.", "import numpy as np\nnp.arange(6).reshape(2, ___)", [{"accepted": ["3"]}],
                 "El producto de las dimensiones debe coincidir con size."),
            predict("u18-e2", "¿shape de concatenate de dos (2,) en axis 0?",
                    "import numpy as np\nprint(np.concatenate([np.ones(2), np.zeros(2)]).shape)", "(4,)",
                    "concatenate pega por un eje. vstack/hstack son atajos."),
            code("u18-e3",
                 "`a = np.arange(6)`. `b = a.reshape(3, 2)` e imprime `b.shape`.",
                 "import numpy as np\na = np.arange(6)\n",
                 ["b.shape == (3, 2)"],
                 "import numpy as np\na = np.arange(6)\nb = a.reshape(3, 2)\nprint(b.shape)",
                 "reshape(-1, 2) deja que NumPy calcule la otra dimensión.",
                 expected_stdout="(3, 2)"),
            matching("u18-e4", "Empareja.",
                     [{"id": "l1", "text": "a[a > 0]"}, {"id": "l2", "text": "np.where(cond, x, y)"},
                      {"id": "l3", "text": "np.clip(a, 0, 1)"}],
                     [{"id": "r1", "text": "Filtra valores positivos"}, {"id": "r2", "text": "Elige x o y celda a celda"},
                      {"id": "r3", "text": "Corta extremos al rango"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "where y clip limpian outliers sin un for."),
            find_err("u18-e5", "`np.arange(5).reshape(2, 3)`",
                     [("a", "5 ≠ 2*3: ValueError"), ("b", "arange no existe"), ("c", "Hay que importar pandas")],
                     "a", "Cuenta celdas. El -1 en reshape es tu amigo."),
            code("u18-e6",
                 "`a = np.array([3, -1, 5, 0])`. `positivos = a[a > 0]` e imprime `positivos`.",
                 "import numpy as np\na = np.array([3, -1, 5, 0])\n",
                 ["np.array_equal(positivos, np.array([3, 5]))"],
                 "import numpy as np\na = np.array([3, -1, 5, 0])\npositivos = a[a > 0]\nprint(positivos)",
                 "La máscara booleana es el abuelo de df[df.col > 0]."),
            mc("u18-e7", "`np.ravel` / `flatten`…",
               [("a", "Pasan a 1D; flatten copia, ravel a menudo es vista"),
                ("b", "Transponen"), ("c", "Ordenan")],
               "a", "Si vas a mutar, flatten/copy evita pisar el original."),
            predict("u18-e8", "hstack de [1,2] y [3] longitud…",
                    "import numpy as np\nprint(len(np.hstack([np.array([1, 2]), np.array([3])])))", "3",
                    "hstack pega en horizontal en 1D: concatena."),
        ])
    ])


def u22():
    return unit("u22", 22, "Storytelling visual", "El gráfico es un argumento, no un adorno.", "message-square", [
        lesson("u22-l1", "Diseñar para que se entienda", "Título = hallazgo. Ejes = unidades. Color = dato.", [
            mc("u22-e1", "Un buen título de gráfico es…",
               [("a", "'Las ventas de mayo superan a abril en un 12%' — el hallazgo"),
                ("b", "'Figura 1'"), ("c", "'plot de matplotlib'")],
               "a", "El título no describe el método; afirma lo que hay que ver."),
            matching("u22-e2", "Elige el gráfico.",
                     [{"id": "l1", "text": "Evolución mensual"}, {"id": "l2", "text": "Comparar 4 categorías"},
                      {"id": "l3", "text": "Distribución de edades"}],
                     [{"id": "r1", "text": "Líneas"}, {"id": "r2", "text": "Barras"}, {"id": "r3", "text": "Histograma / violin"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Pie charts casi nunca: el ojo compara ángulos mal."),
            fill("u22-e3", "El hallazgo va al título.", "ax.___('El churn bajó 4 puntos')", [{"accepted": ["set_title"]}],
                 "set_title en el eje, no solo en el markdown del notebook."),
            find_err("u22-e4", "Un dual-axis con ventas en millones y temperatura en ºC, mismas líneas de color.",
                     [("a", "Dos escalas distintas sin leyenda clara mienten: etiqueta cada eje y cada serie"),
                      ("b", "Siempre es correcto"), ("c", "Hay que usar 3D")],
                     "a", "Dual axis es sospechoso. Si lo usas, titula cada lado."),
            code("u22-e5",
                 "Crea un bar de regiones Norte=10, Sur=6 con título 'Pedidos por región'. `done = True`.",
                 "import matplotlib.pyplot as plt\n",
                 ["done is True"],
                 "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.bar(['Norte', 'Sur'], [10, 6])\nax.set_title('Pedidos por región')\nax.set_ylabel('Pedidos')\ndone = True",
                 "Barras + unidades en Y. El lector no tiene que adivinar.",
                 capture_plots=True),
            mc("u22-e6", "El color rojo/verde…",
               [("a", "Falla para daltonismo: usa también forma, texto o una paleta colorblind"),
                ("b", "Es obligatorio"), ("c", "No se puede cambiar")],
               "a", "Seaborn tiene palettes colorblind. El contraste es accesibilidad."),
            predict("u22-e7", "Si recortas el eje Y de 95 a 100 en una barra de 96 vs 99, el efecto visual…",
                    "print('exagera la diferencia')", "exagera la diferencia",
                    "Empezar Y en 0 en barras. En líneas, recortar puede ser honesto si lo declaras."),
            matching("u22-e8", "Antes de publicar.",
                     [{"id": "l1", "text": "Fuente"}, {"id": "l2", "text": "Filtros"}, {"id": "l3", "text": "Incertidumbre"}],
                     [{"id": "r1", "text": "De dónde salen los datos"}, {"id": "r2", "text": "Qué filas se cayeron"},
                      {"id": "r3", "text": "n pequeño, IC, o 'aprox.'"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Un gráfico sin n ni fuente es marketing, no análisis."),
        ])
    ])


def u26():
    csv = "ciudad,mes,ventas\nMadrid,1,10\nMadrid,2,12\nSevilla,1,8\nSevilla,2,9\n"
    return unit("u26", 26, "Transformación", "apply, groupby, merge y pivot_table.", "combine", [
        lesson("u26-l1", "De filas a resúmenes", "groupby es el SQL GROUP BY de pandas.", [
            fill("u26-e1", "Media por grupo.", "df.group___('ciudad')['ventas'].mean()", [{"accepted": ["by"]}],
                 "groupby('col')['otra'].mean() es el patrón más usado del análisis tabular."),
            mc("u26-e2", "`merge` sirve para…",
               [("a", "Juntar tablas por una clave (como JOIN)"), ("b", "Borrar nulos"), ("c", "Entrenar un árbol")],
               "a", "how='left' conserva las filas de la izquierda. Valida siempre len antes/después."),
            code("u26-e3",
                 "Lee `ventas.csv`. `por_ciudad = df.groupby('ciudad')['ventas'].sum()`. Imprime `int(por_ciudad['Madrid'])`.",
                 "import pandas as pd\n",
                 ["int(por_ciudad['Madrid']) == 22"],
                 "import pandas as pd\ndf = pd.read_csv('ventas.csv')\npor_ciudad = df.groupby('ciudad')['ventas'].sum()\nprint(int(por_ciudad['Madrid']))",
                 "Madrid 10+12=22. groupby + sum comprime mes.",
                 expected_stdout="22", files={"ventas.csv": csv}, etype="data"),
            matching("u26-e4", "Empareja.",
                     [{"id": "l1", "text": "apply"}, {"id": "l2", "text": "pivot_table"}, {"id": "l3", "text": "map"}],
                     [{"id": "r1", "text": "Función a fila/columna"}, {"id": "r2", "text": "Tabla cruzada (índice × columnas)"},
                      {"id": "r3", "text": "Diccionario o función a una Series"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "pivot_table es groupby + unstack con relleno."),
            find_err("u26-e5", "Haces merge y pasas de 1000 a 1_000_000 filas.",
                     [("a", "Join many-to-many: claves duplicadas en ambos lados. Revisa uniqueness"),
                      ("b", "Es normal siempre"), ("c", "pandas está roto")],
                     "a", "validate='1:1' o 'm:1' en merge te salva."),
            code("u26-e6",
                 "Lee `ventas.csv`. Crea `df['doble'] = df['ventas'] * 2` e imprime `int(df['doble'].sum())`.",
                 "import pandas as pd\n",
                 ["int(df['doble'].sum()) == 78"],
                 "import pandas as pd\ndf = pd.read_csv('ventas.csv')\ndf['doble'] = df['ventas'] * 2\nprint(int(df['doble'].sum()))",
                 "Una columna nueva es una Series alineada. 39*2=78.",
                 expected_stdout="78", files={"ventas.csv": csv}, etype="data"),
            predict("u26-e7", "pivot_table index=ciudad, columns=mes, values=ventas, aggfunc=sum: Madrid-mes1 es…",
                    "print(10)", "10",
                    "Cada celda es un grupo (ciudad, mes). Madrid enero = 10."),
            mc("u26-e8", "`transform` frente a `agg`…",
               [("a", "transform devuelve una Series alineada al df original (misma longitud); agg comprime"),
                ("b", "Son idénticos"), ("c", "transform borra el df")],
               "a", "df['media_ciudad'] = df.groupby('ciudad')['ventas'].transform('mean') — feature clásica de ML."),
        ])
    ])


def u27():
    return unit("u27", 27, "Series temporales", "Fechas, índices datetime y resample mental.", "calendar", [
        lesson("u27-l1", "El tiempo es un eje", "parsear, ordenar, diferenciar.", [
            fill("u27-e1", "Convierte a datetime.", "pd.___(['2024-01-01'])", [{"accepted": ["to_datetime"]}],
                 "to_datetime es el portero. errors='coerce' vuelve NaT lo ilegible."),
            mc("u27-e2", "Un DatetimeIndex permite…",
               [("a", "resample, slicing por fechas y rolling"), ("b", "Entrenar GPT"), ("c", "Solo imprimir bonito")],
               "a", "df.set_index('fecha').sort_index() es el ritual."),
            predict("u27-e3", "¿Qué imprime el mes?",
                    "import pandas as pd\nprint(pd.Timestamp('2024-03-15').month)", "3",
                    "Atributos: year, month, day, dayofweek. También .dt en una Series."),
            matching("u27-e4", "Empareja.",
                     [{"id": "l1", "text": "resample('M').mean()"}, {"id": "l2", "text": "diff()"},
                      {"id": "l3", "text": "shift(1)"}],
                     [{"id": "r1", "text": "Agrega a frecuencia mensual"}, {"id": "r2", "text": "Incremento vs el periodo anterior"},
                      {"id": "r3", "text": "Retrasa una fila (lags para ML)"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Los lags son features: ventas de ayer para predecir hoy."),
            find_err("u27-e5", "Restas dos columnas de fechas que siguen siendo object (strings).",
                     [("a", "Convierte antes con to_datetime: si no, TypeError o concatenación loca"),
                      ("b", "Las fechas no se pueden restar nunca"), ("c", "Usa Excel")],
                     "a", "dtype datetime64[ns] es el que resta en Timedelta."),
            code("u27-e6",
                 "`s = pd.to_datetime(['2024-01-01', '2024-01-08'])`. `dias = (s[1]-s[0]).days` e imprime `dias`.",
                 "import pandas as pd\n",
                 ["int(dias) == 7"],
                 "import pandas as pd\ns = pd.to_datetime(['2024-01-01', '2024-01-08'])\ndias = (s[1] - s[0]).days\nprint(dias)",
                 "Una semana son 7 días. Timedelta.days es el entero.",
                 expected_stdout="7"),
            mc("u27-e7", "Zonas horarias (tz)…",
               [("a", "Localiza con tz_localize y convierte con tz_convert; no mezcles naive y aware"),
                ("b", "Python ignora la hora"), ("c", "Solo existen en Java")],
               "a", "UTC internamente, local al mostrar. Un clásico de logs y APIs."),
            code("u27-e8",
                 "`idx = pd.date_range('2024-01-01', periods=3, freq='D')`. Imprime `len(idx)`.",
                 "import pandas as pd\n",
                 ["len(idx) == 3"],
                 "import pandas as pd\nidx = pd.date_range('2024-01-01', periods=3, freq='D')\nprint(len(idx))",
                 "date_range fabrica el índice. freq='D' es diario, 'W' semanal, 'h' horario.",
                 expected_stdout="3"),
        ])
    ])


def u31():
    return unit("u31", 31, "Pruebas de hipótesis", "p-valores con cabeza: t-test y chi-cuadrado en idea.", "flask-conical", [
        lesson("u31-l1", "¿La diferencia es ruido?", "H0 vs H1, y lo que el p-valor no es.", [
            mc("u31-e1", "Un p-valor es…",
               [("a", "P(datos tan extremos o más | H0 cierta) — no P(H0 cierta | datos)"),
                ("b", "La probabilidad de que H0 sea verdadera"), ("c", "El accuracy")],
               "a", "p pequeño: los datos serían raros si H0 fuera cierta. No 'prueba' H1 al 1-p."),
            matching("u31-e2", "Empareja el test con el caso.",
                     [{"id": "l1", "text": "t-test de dos muestras"}, {"id": "l2", "text": "chi-cuadrado"},
                      {"id": "l3", "text": "α = 0.05"}],
                     [{"id": "r1", "text": "Comparar medias (aprox. normales / n grande)"},
                      {"id": "r2", "text": "Tablas de contingencia (conteos)"},
                      {"id": "r3", "text": "Umbral de significación que TÚ eliges"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "α no sale de los datos. 0.05 es costumbre, no magia."),
            fill("u31-e3", "Rechazar H0 clásico.", "if p ___ 0.05:\n    print('rechazar H0')", [{"accepted": ["<", "<="]}],
                 "p < α → rechazar H0. Reporta el p exacto, no solo 'significativo'."),
            find_err("u31-e4", "Haces 40 t-tests y publicas el único p=0.04.",
                     [("a", "p-hacking / comparaciones múltiples: la tasa de falsos positivos explota"),
                      ("b", "Está bien si el gráfico es bonito"), ("c", "40 es el n mágico")],
                     "a", "Corrige (Bonferroni, FDR) o pre-registra UNA hipótesis."),
            code("u31-e5",
                 "Simula dos grupos con la misma media: `rng = np.random.default_rng(0)`; `a = rng.normal(0, 1, 200)`; `b = rng.normal(0, 1, 200)`. `diff = abs(a.mean()-b.mean())`. Imprime `round(diff, 2)` (debe ser pequeño).",
                 "import numpy as np\nrng = np.random.default_rng(0)\n",
                 ["diff < 0.3"],
                 "import numpy as np\nrng = np.random.default_rng(0)\na = rng.normal(0, 1, 200)\nb = rng.normal(0, 1, 200)\ndiff = abs(a.mean() - b.mean())\nprint(round(diff, 2))",
                 "Si H0 es cierta (misma media), la diferencia muestral ronda 0. El t-test cuantifica si es grande vs el error estándar."),
            predict("u31-e6", "n=3 vs n=3000, misma diferencia de medias: el p del grande suele ser…",
                    "print('más pequeño')", "más pequeño",
                    "Más datos → más potencia. Una diferencia irrelevante de negocio puede ser 'significativa'."),
            mc("u31-e7", "Significativo estadísticamente ≠ importante…",
               [("a", "Reporta el tamaño del efecto (diferencia, d de Cohen), no solo p"),
                ("b", "El p ya es el efecto"), ("c", "Nunca reportes números")],
               "a", "Un A/B con p=0.01 y +0.01% de conversión puede no valer el cambio."),
            matching("u31-e8", "Errores clásicos.",
                     [{"id": "l1", "text": "Tipo I"}, {"id": "l2", "text": "Tipo II"}, {"id": "l3", "text": "Potencia"}],
                     [{"id": "r1", "text": "Rechazar H0 cuando era cierta (falso positivo)"},
                      {"id": "r2", "text": "No rechazar H0 cuando era falsa"},
                      {"id": "r3", "text": "P(detectar el efecto si existe)"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Bajar α reduce tipo I y sube tipo II. No hay almuerzo gratis."),
        ])
    ])


def u35():
    return unit("u35", 35, "Árboles y Random Forest", "Particiones, ensambles y la importancia de variables.", "tree-pine", [
        lesson("u35-l1", "Preguntas sí/no", "Un árbol parte el espacio; un bosque vota.", [
            mc("u35-e1", "Un árbol de decisión clasifica…",
               [("a", "Con cortes en features (if x[j] <= umbral) hasta una hoja"),
                ("b", "Con una sola sigmoide"), ("c", "Solo con clustering")],
               "a", "Cada hoja es una región con una predicción (clase mayoritaria o media)."),
            matching("u35-e2", "Empareja el hiperparámetro.",
                     [{"id": "l1", "text": "max_depth"}, {"id": "l2", "text": "min_samples_leaf"},
                      {"id": "l3", "text": "n_estimators (RF)"}],
                     [{"id": "r1", "text": "Qué tan profundo (overfitting si es enorme)"},
                      {"id": "r2", "text": "Mínimo de filas en una hoja"},
                      {"id": "r3", "text": "Cuántos árboles votan"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Un árbol profundo memoriza. El bosque promedia y suaviza."),
            fill("u35-e3", "Profundidad típica de juguete.", "print('max_depth =', ___)", [{"accepted": ["3", "4", "5"]}],
                 "Empieza poco profundo. Sube si el sesgo (underfit) es alto."),
            find_err("u35-e4", "Un único árbol de profundidad 40 en 200 filas con accuracy 100% en train y 51% en test.",
                     [("a", "Overfitting: limita depth, aumenta min_samples_leaf o usa un bosque"),
                      ("b", "Hay que borrar el test"), ("c", "Los árboles no overfittean")],
                     "a", "Los árboles puros se clavan en ruido. RF/GBT existen por eso."),
            code("u35-e5",
                 "Simula un árbol de 1 corte: `X=[1,2,10]`, pred = 0 si x<5 else 1. Imprime las preds.",
                 "X = [1, 2, 10]\n",
                 ["pred == [0, 0, 1]"],
                 "X = [1, 2, 10]\npred = [0 if x < 5 else 1 for x in X]\nprint(pred)",
                 "Eso es un stump. Random Forest es muchos stumps/árboles en subconjuntos.",
                 expected_stdout="[0, 0, 1]"),
            predict("u35-e6", "En RF, cada árbol ve un bootstrap del train y un subset de features. Eso busca…",
                    "print('diversidad')", "diversidad",
                    "Si todos los árboles fueran iguales, votar no ayudaría. Bagging + random features diversifica."),
            mc("u35-e7", "feature_importances_ en un bosque…",
               [("a", "Son heurísticas (impureza): útiles, no causales. Valida con permutación"),
                ("b", "Prueban causalidad"), ("c", "Solo existen en redes")],
               "a", "Una feature correlacionada puede 'robar' importancia a otra."),
            matching("u35-e8", "Árbol vs lineal.",
                     [{"id": "l1", "text": "Interacciones"}, {"id": "l2", "text": "Extrapolación"},
                      {"id": "l3", "text": "Escalado de X"}],
                     [{"id": "r1", "text": "El árbol las captura con cortes sucesivos"},
                      {"id": "r2", "text": "El árbol no interpola más allá de los rangos vistos"},
                      {"id": "r3", "text": "A un árbol le da igual (monótono en cada feature)"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Por eso RF no sustituye a un modelo lineal cuando hay que extrapolar precios."),
        ])
    ])


def u36():
    return unit("u36", 36, "KNN y SVM", "Vecinos y márgenes: geometría en el espacio de features.", "waypoints", [
        lesson("u36-l1", "Distancia y separación", "Escala las variables o la geometría miente.", [
            mc("u36-e1", "KNN clasifica un punto…",
               [("a", "Por votación de los k vecinos más cercanos (distancia)"),
                ("b", "Con una red de 100 capas"), ("c", "Solo si hay texto")],
               "a", "k pequeño = frontera rugosa; k grande = más suave. Impar para evitar empates binarios."),
            fill("u36-e2", "Vecinos típicos.", "print('k =', ___)", [{"accepted": ["5", "3", "7"]}],
                 "k=5 es un default razonable. Tú lo eliges con validación."),
            matching("u36-e3", "Empareja.",
                     [{"id": "l1", "text": "KNN"}, {"id": "l2", "text": "SVM lineal"}, {"id": "l3", "text": "kernel RBF"}],
                     [{"id": "r1", "text": "No entrena pesos: memoriza el train"},
                      {"id": "r2", "text": "Máximo margen entre clases (hiperplano)"},
                      {"id": "r3", "text": "Fronteras no lineales via kernel"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "SVM busca el canal más ancho. KNN pregunta a los vecinos."),
            find_err("u36-e4", "KNN con ingresos en € y edad en años, sin escalar.",
                     [("a", "La distancia la domina el ingreso: StandardScaler en el pipeline"),
                      ("b", "KNN ignora las magnitudes"), ("c", "Hay que borrar la edad")],
                     "a", "Toda distancia (euclídea) asume escalas comparables."),
            code("u36-e5",
                 "KNN k=1 a mano: train X=[0, 10], y=[0, 1], query=1. Predice la etiqueta del más cercano. Imprime 0 o 1.",
                 "X = [0, 10]\ny = [0, 1]\nq = 1\n",
                 [],
                 "X = [0, 10]\ny = [0, 1]\nq = 1\ndists = [abs(q - x) for x in X]\npred = y[dists.index(min(dists))]\nprint(pred)",
                 "1 está más cerca de 0 que de 10 → clase 0. Eso es KNN k=1.",
                 expected_stdout="0"),
            predict("u36-e6", "SVM lineal: los puntos que tocan el margen se llaman…",
                    "print('vectores de soporte')", "vectores de soporte",
                    "Solo ellos definen el hiperplano. De ahí el nombre."),
            mc("u36-e7", "C alto en SVM…",
               [("a", "Penaliza más los errores: margen más estrecho, riesgo de overfit"),
                ("b", "Borra features"), ("c", "Activa GPU")],
               "a", "C bajo tolera más errores y generaliza más (a veces). Se busca con grid search."),
            matching("u36-e8", "Coste en predicción.",
                     [{"id": "l1", "text": "KNN predict"}, {"id": "l2", "text": "SVM lineal predict"},
                      {"id": "l3", "text": "train KNN"}],
                     [{"id": "r1", "text": "Caro: mira (casi) todo el train"},
                      {"id": "r2", "text": "Barato: un producto punto"},
                      {"id": "r3", "text": "Casi no hay train, solo guardar X,y"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "KNN es lazy. En n grande, SVM o árboles predicen más rápido."),
        ])
    ])


def u37():
    return unit("u37", 37, "K-Means", "Clustering: agrupar sin etiquetas.", "circles", [
        lesson("u37-l1", "El algoritmo del centroide", "Asigna, promedia, repite.", [
            mc("u37-e1", "K-Means minimiza…",
               [("a", "La inercia: suma de distancias^2 al centroide del cluster"),
                ("b", "El log-loss"), ("c", "El accuracy")],
               "a", "No hay y. El 'éxito' es compactar nubes. Elige k con codo / silueta, y con negocio."),
            fill("u37-e2", "Número de grupos.", "print('k clusters =', ___)", [{"accepted": ["3", "2", "4", "5"]}],
                 "k lo eliges tú. El algoritmo no 'sabe' cuántas verdades hay."),
            matching("u37-e3", "Un paso de K-Means.",
                     [{"id": "l1", "text": "Asignación"}, {"id": "l2", "text": "Update"}, {"id": "l3", "text": "k-means++"}],
                     [{"id": "r1", "text": "Cada punto al centroide más cercano"},
                      {"id": "r2", "text": "El centroide es la media de sus puntos"},
                      {"id": "r3", "text": "Inicialización inteligente de centros"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Mala init → malos óptimos locales. n_init>1 y k-means++ ayudan."),
            find_err("u37-e4", "K-Means en una feature de ingresos y otra 0/1, sin escalar.",
                     [("a", "Otra vez las distancias: escala. Y ojo: K-Means asume blobs esféricos"),
                      ("b", "K-Means no usa distancia"), ("c", "Solo funciona con imágenes")],
                     "a", "Nubes alargadas o anillos: piensa GMM o DBSCAN."),
            code("u37-e5",
                 "Un paso de asignación: puntos [0, 1, 9], centros [0, 10]. `labels` = índice del centro más cercano. Imprime `labels`.",
                 "pts = [0, 1, 9]\ncentros = [0, 10]\n",
                 ["labels == [0, 0, 1]"],
                 "pts = [0, 1, 9]\ncentros = [0, 10]\nlabels = [min(range(len(centros)), key=lambda j: abs(x - centros[j])) for x in pts]\nprint(labels)",
                 "0 y 1 van al centro 0; 9 al centro 10. Eso es E-step de juguete.",
                 expected_stdout="[0, 0, 1]"),
            predict("u37-e6", "Tras asignar [0,1] al cluster 0, el nuevo centroide 1D es…",
                    "print(0.5)", "0.5", "La media de los puntos del cluster. M-step."),
            mc("u37-e7", "La silueta cerca de 1 significa…",
               [("a", "Puntos bien pegados a su cluster y lejos de los otros"),
                ("b", "Overfitting"), ("c", "Que k=1 es óptimo")],
               "a", "Silueta negativa: el punto estaría mejor en otro grupo. No es un score de negocio."),
            matching("u37-e8", "No supervisado vs supervisado.",
                     [{"id": "l1", "text": "K-Means"}, {"id": "l2", "text": "Regresión logística"},
                      {"id": "l3", "text": "Etiqueta humana"}],
                     [{"id": "r1", "text": "Sin y: descubre estructura"}, {"id": "r2", "text": "Con y: predice un target"},
                      {"id": "r3", "text": "Lo que K-Means no tiene y a veces quieres después"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Agrupar clientes y LUEGO nombrar los clusters es un trabajo de producto, no del algoritmo."),
        ])
    ])


def u38():
    return unit("u38", 38, "Evaluación", "accuracy, F1, overfitting y validación cruzada.", "target", [
        lesson("u38-l1", "Medir sin autoengañarte", "La métrica correcta depende del coste del error.", [
            mc("u38-e1", "Accuracy en un dataset 99% clase 0…",
               [("a", "Un modelo que siempre dice 0 tiene 99% y es inútil para la clase rara"),
                ("b", "Es la única métrica válida"), ("c", "No se puede calcular")],
               "a", "Desbalance: mira precision, recall, F1, PR-AUC, y la matriz de confusión."),
            fill("u38-e2", "F1 es la media armónica.", "f1 = 2*p*r/(p+___)", [{"accepted": ["r"]}],
                 "F1 penaliza si precision o recall son bajos. p y r en [0,1]."),
            matching("u38-e3", "Empareja.",
                     [{"id": "l1", "text": "Precision"}, {"id": "l2", "text": "Recall"}, {"id": "l3", "text": "Matriz de confusión"}],
                     [{"id": "r1", "text": "De los que predije positivos, ¿cuántos lo eran?"},
                      {"id": "r2", "text": "De los positivos reales, ¿cuántos pillé?"},
                      {"id": "r3", "text": "VP, FP, FN, VN en una tabla"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Spam: precision alta (no tirar mail bueno). Cáncer: recall alto (no perder casos)."),
            find_err("u38-e4", "Eliges el umbral 0.5 y el modelo en el conjunto de test 20 veces para 'el mejor F1'.",
                     [("a", "El test se volvió validación: reserva un holdout final o usa CV en train"),
                      ("b", "20 es el número correcto"), ("c", "F1 no necesita umbral")],
                     "a", "Toda decisión (k, umbral, features) se toma en val/CV, una sola vez en test."),
            code("u38-e5",
                 "`y=[0,0,1,1]`, `yhat=[0,1,1,1]`. Accuracy = media de aciertos. Imprime `acc`.",
                 "y = [0, 0, 1, 1]\nyhat = [0, 1, 1, 1]\n",
                 ["abs(acc - 0.75) < 1e-9"],
                 "y = [0, 0, 1, 1]\nyhat = [0, 1, 1, 1]\nacc = sum(a == b for a, b in zip(y, yhat)) / len(y)\nprint(acc)",
                 "3/4 = 0.75. El error es un FN? No: un FP en el segundo 0 predicho 1.",
                 expected_stdout="0.75"),
            predict("u38-e6", "Train 99%, val 70%, test 68% sugiere…",
                    "print('overfitting')", "overfitting",
                    "La brecha train vs val es la pista. Regulariza, simplifica, más datos."),
            mc("u38-e7", "Validación cruzada k-fold…",
               [("a", "Parte el train en k, rota el fold de validación, promedia la métrica"),
                ("b", "Entrena k modelos en el test"), ("c", "Solo sirve para imágenes")],
               "a", "k=5 o 10. En series temporales: splits que respetan el tiempo (no mezclar futuro)."),
            matching("u38-e8", "Under vs over.",
                     [{"id": "l1", "text": "Underfitting"}, {"id": "l2", "text": "Overfitting"}, {"id": "l3", "text": "Buen ajuste"}],
                     [{"id": "r1", "text": "Train y val malos: el modelo es demasiado simple"},
                      {"id": "r2", "text": "Train excelente, val pobre"},
                      {"id": "r3", "text": "Train y val cercanos y aceptables"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Diagnostica con las DOS curvas, no con un solo accuracy de Kaggle público."),
        ])
    ])


def u42():
    return unit("u42", 42, "Imágenes y MNIST", "Clasificar dígitos: de píxeles a logits.", "image", [
        lesson("u42-l1", "Una imagen es un tensor", "28×28 no es magia: es un array.", [
            mc("u42-e1", "Una imagen MNIST en escala de grises 28×28 es…",
               [("a", "Un array (28, 28) o aplanado (784,) de intensidades"),
                ("b", "Un DataFrame de pandas obligatorio"), ("c", "Un string")],
               "a", "Los modelos densos aplanan; las CNN respetan el grid 2D."),
            fill("u42-e2", "Tamaño clásico.", "print('28 x', ___)", [{"accepted": ["28"]}],
                 "28×28 = 784 features si aplanas. Por eso un MLP chico ya 'funciona' en MNIST."),
            matching("u42-e3", "Empareja.",
                     [{"id": "l1", "text": "Normalizar /255"}, {"id": "l2", "text": "Softmax"},
                      {"id": "l3", "text": "Convolución"}],
                     [{"id": "r1", "text": "Píxeles a [0,1]"}, {"id": "r2", "text": "10 scores → probabilidad de dígito"},
                      {"id": "r3", "text": "Filtros locales que detectan bordes/formas"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "CNN = pesos compartidos en el espacio. Menos parámetros que un Dense(784, 256)."),
            find_err("u42-e4", "Entrenas con imágenes 0–255 y evaluas con 0–1.",
                     [("a", "Distribución distinta: aplica la MISMA normalización en train y test"),
                      ("b", "Da igual la escala"), ("c", "Hay que usar strings")],
                     "a", "El preproceso es parte del modelo. Un pipeline lo fija."),
            code("u42-e5",
                 "`img = np.arange(16).reshape(4, 4)`. Aplana en `v = img.reshape(-1)` e imprime `v.size`.",
                 "import numpy as np\nimg = np.arange(16).reshape(4, 4)\n",
                 ["v.size == 16", "v.shape == (16,)"],
                 "import numpy as np\nimg = np.arange(16).reshape(4, 4)\nv = img.reshape(-1)\nprint(v.size)",
                 "reshape(-1) es flatten. Así entra un MLP. Una CNN haría conv sobre (4,4).",
                 expected_stdout="16"),
            predict("u42-e6", "10 clases (dígitos 0-9): la capa final tiene… neuronas.",
                    "print(10)", "10", "Una logit por clase. Argmax de softmax = dígito predicho."),
            mc("u42-e7", "Data augmentation (rotar, recortar)…",
               [("a", "Inventa variantes para que el modelo no se clave en la pose del train"),
                ("b", "Sustituye al test"), ("c", "Solo sirve en NLP")],
               "a", "En dígitos, rotar 90° puede convertir un 6 en otra cosa: augmenta con cabeza."),
            matching("u42-e8", "Métrica de clasificación de dígitos.",
                     [{"id": "l1", "text": "Accuracy"}, {"id": "l2", "text": "Matriz 10×10"},
                      {"id": "l3", "text": "Error de 4 vs 9"}],
                     [{"id": "r1", "text": "Porcentaje de bien clasificados (MNIST está balanceado-ish)"},
                      {"id": "r2", "text": "Dónde se confunde"},
                      {"id": "r3", "text": "Confusión típica: formas parecidas"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "Accuracy 99% en MNIST es el 'hola mundo'. El valor está en el pipeline, no en el récord."),
        ])
    ])


def u43():
    return unit("u43", 43, "NLP básico", "Tokens, embeddings y un modelo preentrenado en idea.", "languages", [
        lesson("u43-l1", "El texto también es números", "Primero partes, luego representas.", [
            mc("u43-e1", "Tokenizar es…",
               [("a", "Partir el texto en unidades (palabras, subwords) que el modelo sabe manejar"),
                ("b", "Traducir a latín"), ("c", "Comprimir con zip")],
               "a", "Hoy los LLM usan subwords (BPE). Ayer, split() por espacios."),
            fill("u43-e2", "Split ingenuo.", "tokens = 'hola mundo'.___()", [{"accepted": ["split"]}],
                 "split() es el tokenizador más pobre y el más claro para empezar."),
            matching("u43-e3", "Empareja.",
                     [{"id": "l1", "text": "Bag-of-words"}, {"id": "l2", "text": "Embedding"},
                      {"id": "l3", "text": "Modelo preentrenado"}],
                     [{"id": "r1", "text": "Conteo de palabras, ignora el orden"},
                      {"id": "r2", "text": "Vector denso que 'ubica' el token en un espacio"},
                      {"id": "r3", "text": "Ya vio mucho texto: lo adaptas (fine-tune) o lo consultas"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "BoW + logística sigue siendo un baseline honesto en clasificar tickets."),
            find_err("u43-e4", "Lowercase + quitar signos y luego te quejas de que 'No' y 'no' eran lo mismo…",
                     [("a", "La normalización borra señales (negación, mayúsculas). Mídela con un baseline"),
                      ("b", "Siempre hay que borrar todo"), ("c", "NLP no usa lowercase")],
                     "a", "Preprocesar es una hipótesis. Mídela en val."),
            code("u43-e5",
                 "`texto = \"hola hola mundo\"`. `tokens = texto.split()` y `n = len(set(tokens))`. Imprime `n`.",
                 'texto = "hola hola mundo"\n',
                 ["n == 2"],
                 'texto = "hola hola mundo"\ntokens = texto.split()\nn = len(set(tokens))\nprint(n)',
                 "Vocabulario único = 2. El bag-of-words tendría hola:2, mundo:1.",
                 expected_stdout="2"),
            predict("u43-e6", "Un embedding de dimensión 3 para 2 palabras es una matriz de forma…",
                    "print('(2, 3)')", "(2, 3)",
                    "Filas = tokens del vocabulario (o de la secuencia). Columnas = features latentes."),
            mc("u43-e7", "Usar un modelo preentrenado (sentiment, NER) sin GPU local…",
               [("a", "Es válido: APIs o ONNX/quantized. Entiende límites de privacidad y sesgo"),
                ("b", "Está prohibido"), ("c", "Solo funciona con MNIST")],
               "a", "PyQuest en el navegador no carga BERT entero. La idea: el vector ya viene 'cocinado'."),
            matching("u43-e8", "Pipeline mínimo de clasificar texto.",
                     [{"id": "l1", "text": "Limpiar"}, {"id": "l2", "text": "Vectorizar"}, {"id": "l3", "text": "Clasificar"}],
                     [{"id": "r1", "text": "Normaliza, recorta ruido"}, {"id": "r2", "text": "BoW/TF-IDF o embeddings"},
                      {"id": "r3", "text": "Logística, SVM o un transformer"}],
                     {"l1": "r1", "l2": "r2", "l3": "r3"},
                     "El mismo esqueleto que el resto de PyQuest: limpiar → representar → predecir → medir."),
        ])
    ])


def remaining_by_id():
    return {
        "u4": u4(), "u5": u5(), "u6": u6(), "u7": u7(), "u8": u8(), "u9": u9(),
        "u10": u10(), "u11": u11(), "u12": u12(), "u13": u13(),
        "u17": u17(), "u18": u18(), "u22": u22(), "u26": u26(), "u27": u27(),
        "u31": u31(), "u35": u35(), "u36": u36(), "u37": u37(), "u38": u38(),
        "u42": u42(), "u43": u43(),
    }
