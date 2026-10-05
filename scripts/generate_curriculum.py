#!/usr/bin/env python3
"""Generate src/content/curriculum.json for PyQuest."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from remaining_units import remaining_by_id, split_prompt_code

OUT = Path(__file__).resolve().parents[1] / "src" / "content" / "curriculum.json"


def _clean(d):
    return {k: v for k, v in d.items() if v is not None}


def mc(eid, prompt, choices, correct, explanation, xp=10, difficulty=1, hint=None, solution=None):
    opts = [{"id": c[0], "text": c[1]} for c in choices]
    return {
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


def predict(eid, prompt, code, accepted, explanation, xp=10, difficulty=1, hint=None):
    acc = accepted if isinstance(accepted, list) else [accepted]
    return {
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


def fill(eid, prompt, template, blanks, explanation, xp=12, difficulty=1, hint=None, solution=None):
    filled = template
    for b in blanks:
        filled = filled.replace("___", b["accepted"][0], 1)
    return {
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


def code(
    eid,
    prompt,
    starter,
    tests,
    solution,
    explanation,
    xp=18,
    difficulty=2,
    hint=None,
    expected_stdout=None,
    files=None,
    packages=None,
    capture_plots=False,
    etype="code",
):
    ex = {
        "id": eid,
        "type": etype,
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": solution,
        "starterCode": starter,
        "tests": [{"assert": t} if isinstance(t, str) else t for t in tests],
    }
    if expected_stdout is not None:
        ex["expectedStdout"] = expected_stdout
    if files:
        ex["files"] = files
    if packages:
        ex["packages"] = packages
    if capture_plots:
        ex["capturePlots"] = True
    return ex


def reorder(eid, prompt, blocks, order, explanation, xp=14, difficulty=2, hint=None):
    sol = "\n".join(next(b["code"] for b in blocks if b["id"] == i) for i in order)
    return {
        "id": eid,
        "type": "reorder",
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": sol,
        "blocks": blocks,
        "correctOrder": order,
    }


def matching(eid, prompt, left, right, pairs, explanation, xp=12, difficulty=2, hint=None):
    return {
        "id": eid,
        "type": "matching",
        "prompt": prompt,
        "difficulty": difficulty,
        "xp": xp,
        "hint": hint,
        "explanation": explanation,
        "solution": json.dumps(pairs, ensure_ascii=False),
        "left": left,
        "right": right,
        "pairs": pairs,
    }


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


def unit(uid, index, title, description, icon, lessons, is_project=False, is_template=False):
    return {
        "id": uid,
        "index": index,
        "title": title,
        "description": description,
        "icon": icon,
        "isProject": is_project,
        "isTemplate": is_template,
        "lessons": lessons,
    }


def template_unit(uid, index, title, description, icon, snippet, answer, is_project=False):
    """Reusable 5-exercise lesson so later units are playable before full authoring."""
    topic = description
    exercises = [
        mc(
            f"{uid}-q1",
            f"¿Cuál describe mejor este tema: {topic}?",
            [("a", "Una librería de videojuegos"), ("b", topic), ("c", "Un sistema operativo")],
            "b",
            f"Esta unidad cubre: {topic}.",
            xp=8,
        ),
        fill(
            f"{uid}-q2",
            "Completa el código de ejemplo de esta unidad.",
            snippet,
            [{"accepted": [answer]}],
            "Así se escribe el patrón que practicarás en esta unidad.",
            xp=12,
        ),
        predict(
            f"{uid}-q3",
            "¿Qué imprime este fragmento?",
            "print(2 + 2)",
            "4",
            "2 + 2 es 4. Un calentamiento antes de los ejercicios avanzados.",
            xp=8,
        ),
        code(
            f"{uid}-q4",
            f"Escribe un comentario `# {title}` y luego `print('ok')`.",
            "",
            [],
            f"# {title}\nprint('ok')",
            "Los comentarios documentan tu intención; print confirma que el script corre.",
            expected_stdout="ok",
            xp=14,
        ),
        matching(
            f"{uid}-q5",
            "Empareja el hábito con su beneficio.",
            [
                {"id": "l1", "text": "Ejecutar el código a menudo"},
                {"id": "l2", "text": "Nombrar variables con claridad"},
                {"id": "l3", "text": "Revisar errores con calma"},
            ],
            [
                {"id": "r1", "text": "Detectas fallos al momento"},
                {"id": "r2", "text": "Tu yo del futuro te lo agradece"},
                {"id": "r3", "text": "El traceback te enseña"},
            ],
            {"l1": "r1", "l2": "r2", "l3": "r3"},
            "Pequeños hábitos convierten lecciones cortas en dominio real.",
        ),
    ]
    return unit(
        uid,
        index,
        title,
        description,
        icon,
        [lesson(f"{uid}-l1", title, description, exercises)],
        is_project=is_project,
        is_template=True,
    )


def s0_u1():
    return unit(
        "u1",
        1,
        "¿Qué es programar?",
        "Instrucciones, print() y comentarios: tu primer contacto con Python.",
        "sparkles",
        [
            lesson(
                "u1-l1",
                "Tu primer print",
                "Habla con Python y mira cómo responde.",
                [
                    mc(
                        "u1-l1-e1",
                        "¿Qué es un programa?",
                        [
                            ("a", "Una receta de instrucciones que el computador ejecuta en orden"),
                            ("b", "Un archivo de Excel con macros"),
                            ("c", "Solo un modelo de machine learning"),
                        ],
                        "a",
                        "Programar es escribir instrucciones precisas. Python las ejecuta de arriba hacia abajo.",
                        hint="Piensa en una receta de cocina muy estricta.",
                    ),
                    predict(
                        "u1-l1-e2",
                        "¿Qué imprime este código?",
                        'print("Hola, PyQuest")',
                        "Hola, PyQuest",
                        "print() muestra exactamente el texto entre comillas (sin las comillas).",
                    ),
                    fill(
                        "u1-l1-e3",
                        "Completa el código para saludar.",
                        '___("Hola")',
                        [{"accepted": ["print"]}],
                        "La función print envía texto a la consola.",
                        hint="Es la función que ya usamos para mostrar mensajes.",
                    ),
                    code(
                        "u1-l1-e4",
                        "Imprime exactamente `Aprendiendo Python`.",
                        "",
                        [],
                        'print("Aprendiendo Python")',
                        "Las comillas delimitan un string; print lo muestra.",
                        expected_stdout="Aprendiendo Python",
                        hint="Usa print y comillas dobles o simples.",
                    ),
                    reorder(
                        "u1-l1-e5",
                        "Ordena el script: primero un comentario, luego el print.",
                        [
                            {"id": "b", "code": 'print("listo")'},
                            {"id": "a", "code": "# primer programa"},
                        ],
                        ["a", "b"],
                        "El comentario no se ejecuta; print sí. El orden del archivo sigue siendo de arriba a abajo.",
                    ),
                    matching(
                        "u1-l1-e6",
                        "Empareja cada símbolo con su rol.",
                        [
                            {"id": "l1", "text": "print()"},
                            {"id": "l2", "text": "# comentario"},
                            {"id": "l3", "text": '"texto"'},
                        ],
                        [
                            {"id": "r1", "text": "Muestra un valor en consola"},
                            {"id": "r2", "text": "Nota para humanos, Python la ignora"},
                            {"id": "r3", "text": "Cadena de caracteres"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Distinguir qué es para Python y qué es para ti acelera el aprendizaje.",
                    ),
                    find_err(
                        "u1-l1-e7",
                        "Este código falla. ¿Cuál es el error?\n\n```python\nprint(Hola)\n```",
                        [
                            ("a", "Hola debería ir entre comillas: es un texto, no una variable"),
                            ("b", "print no existe en Python"),
                            ("c", "Falta un punto y coma al final"),
                        ],
                        "a",
                        "Sin comillas, Python busca una variable llamada Hola. Un string va entre comillas.",
                        starter="print(Hola)",
                    ),
                    mc(
                        "u1-l1-e8",
                        "¿Para qué sirven los comentarios `#` en análisis de datos?",
                        [
                            ("a", "Para documentar qué hace un cálculo cuando vuelvas en una semana"),
                            ("b", "Para que Python corra más rápido"),
                            ("c", "Para importar pandas automáticamente"),
                        ],
                        "a",
                        "En ciencia de datos, el 'por qué' de una limpieza o un gráfico se olvida. Coméntalo.",
                    ),
                ],
            )
        ],
    )


def s0_u2():
    return unit(
        "u2",
        2,
        "Variables y tipos",
        "int, float, str, bool: las cajas donde guardas datos.",
        "box",
        [
            lesson(
                "u2-l1",
                "Cajas con nombre",
                "Guarda valores y pregunta su tipo.",
                [
                    mc(
                        "u2-l1-e1",
                        "¿Qué hace `edad = 28`?",
                        [
                            ("a", "Crea una variable llamada edad y le asigna el entero 28"),
                            ("b", "Compara edad con 28"),
                            ("c", "Imprime 28"),
                        ],
                        "a",
                        "`=` asigna. No es el igual matemático; para comparar usarás `==`.",
                    ),
                    predict(
                        "u2-l1-e2",
                        "¿Qué imprime este código?",
                        "n = 3\nn = n + 1\nprint(n)",
                        "4",
                        "Se lee el valor actual de n (3), se suma 1 y se vuelve a guardar.",
                    ),
                    fill(
                        "u2-l1-e3",
                        "Declara una variable `ciudad` con el texto Madrid.",
                        'ciudad = ___',
                        [{"accepted": ['"Madrid"', "'Madrid'"]}],
                        "Los textos van entre comillas. Sin ellas, Python buscaría una variable Madrid.",
                    ),
                    matching(
                        "u2-l1-e4",
                        "Empareja el valor con su tipo.",
                        [
                            {"id": "l1", "text": "42"},
                            {"id": "l2", "text": "3.14"},
                            {"id": "l3", "text": '"42"'},
                            {"id": "l4", "text": "True"},
                        ],
                        [
                            {"id": "r1", "text": "int"},
                            {"id": "r2", "text": "float"},
                            {"id": "r3", "text": "str"},
                            {"id": "r4", "text": "bool"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "El tipo decide qué operaciones puedes hacer: no sumas un string como si fuera número sin convertirlo.",
                    ),
                    code(
                        "u2-l1-e5",
                        "Crea `precio = 9.99` (float) y `unidades = 4` (int). Guarda en `total` el producto e imprímelo.",
                        "precio = 9.99\nunidades = 4\n# total = ...\n",
                        ["isinstance(total, float)", "abs(total - 39.96) < 1e-9"],
                        "precio = 9.99\nunidades = 4\ntotal = precio * unidades\nprint(total)",
                        "int y float se mezclan: el resultado de una multiplicación con decimal es float.",
                        hint="Multiplica las dos variables.",
                    ),
                    predict(
                        "u2-l1-e6",
                        "¿Qué imprime `type()`?",
                        'print(type(3.0).__name__)',
                        "float",
                        "3.0 es float aunque represente un entero. El punto decimal cambia el tipo.",
                    ),
                    find_err(
                        "u2-l1-e7",
                        "¿Por qué falla este código?\n\n```python\nedad = 30\nprint(\"Tengo \" + edad)\n```",
                        [
                            ("a", "No se puede concatenar str + int: convierte con str(edad) o usa un f-string"),
                            ("b", "edad no está definida"),
                            ("c", "print solo acepta un argumento"),
                        ],
                        "a",
                        "Python no mezcla string y número con +. Usa f\"Tengo {edad}\" o str(edad).",
                        starter='edad = 30\nprint("Tengo " + edad)',
                    ),
                    code(
                        "u2-l1-e8",
                        "Crea `activo = True` y `nombre = \"Ana\"`. Imprime el tipo de `activo` usando `type(activo).__name__`.",
                        "",
                        ["activo is True", "nombre == 'Ana'"],
                        'activo = True\nnombre = "Ana"\nprint(type(activo).__name__)',
                        "True/False son booleanos. Ojo: la T y la F van en mayúscula.",
                        expected_stdout="bool",
                    ),
                ],
            )
        ],
    )


def s0_u3():
    return unit(
        "u3",
        3,
        "Operadores",
        "Aritmética, comparación y lógica: el lenguaje de las condiciones.",
        "calculator",
        [
            lesson(
                "u3-l1",
                "Cálculos y comparaciones",
                "De % a and/or/not, con ejemplos de datos.",
                [
                    mc(
                        "u3-l1-e1",
                        "¿Qué devuelve `17 % 5`?",
                        [("a", "3"), ("b", "2"), ("c", "3.4")],
                        "b",
                        "`%` es el resto de la división entera: 5*3=15, sobran 2. Útil para pares/impares.",
                    ),
                    predict(
                        "u3-l1-e2",
                        "¿Qué imprime este código?",
                        "print(2 ** 3)",
                        "8",
                        "`**` es la potencia: 2³ = 8. No confundir con `^` (eso es XOR).",
                    ),
                    fill(
                        "u3-l1-e3",
                        "Completa para saber si n es par.",
                        "n = 10\nes_par = n % 2 ___ 0\nprint(es_par)",
                        [{"accepted": ["=="]}],
                        "La comparación `==` devuelve True o False. Un solo `=` asignaría.",
                    ),
                    matching(
                        "u3-l1-e4",
                        "Empareja el operador con su significado.",
                        [
                            {"id": "l1", "text": "//"},
                            {"id": "l2", "text": "!="},
                            {"id": "l3", "text": "and"},
                            {"id": "l4", "text": "not"},
                        ],
                        [
                            {"id": "r1", "text": "División entera"},
                            {"id": "r2", "text": "Distinto de"},
                            {"id": "r3", "text": "Ambas condiciones ciertas"},
                            {"id": "r4", "text": "Invierte un booleano"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "En filtros de pandas usarás estos mismos operadores lógicos (con & y |).",
                    ),
                    predict(
                        "u3-l1-e5",
                        "¿Qué imprime este código?",
                        "print(True and False)\nprint(True or False)",
                        "False\nTrue",
                        "`and` exige las dos; `or` se conforma con una.",
                    ),
                    code(
                        "u3-l1-e6",
                        "Tienes `ingresos = 3200` y `gastos = 2100`. Guarda `ahorro` (resta) y `holgado` (True si ahorro > 1000). Imprime `ahorro`.",
                        "ingresos = 3200\ngastos = 2100\n",
                        ["ahorro == 1100", "holgado is True"],
                        "ingresos = 3200\ngastos = 2100\nahorro = ingresos - gastos\nholgado = ahorro > 1000\nprint(ahorro)",
                        "Las comparaciones producen booleanos que luego usas en if o en filtros.",
                        expected_stdout="1100",
                    ),
                    find_err(
                        "u3-l1-e7",
                        "¿Qué está mal?\n\n```python\nx = 5\nif x = 5:\n    print(\"sí\")\n```",
                        [
                            ("a", "En el if debe usarse == para comparar, no ="),
                            ("b", "if no existe en Python"),
                            ("c", "x no es comparable"),
                        ],
                        "a",
                        "`=` asigna y no es una expresión válida en if. Compara con `==`.",
                        starter="x = 5\nif x = 5:\n    print('sí')",
                    ),
                    mc(
                        "u3-l1-e8",
                        "`not (edad >= 18)` es equivalente a…",
                        [("a", "edad < 18"), ("b", "edad > 18"), ("c", "edad == 18")],
                        "a",
                        "Negar 'mayor o igual que 18' es 'estrictamente menor que 18'. Útil al filtrar menores.",
                    ),
                ],
            )
        ],
    )


def s1_u14():
    return unit(
        "u14",
        14,
        "Arrays de NumPy",
        "ndarray, dtype y por qué las listas no bastan para datos.",
        "grid",
        [
            lesson(
                "u14-l1",
                "De lista a array",
                "Crea arrays y mira su forma y tipo.",
                [
                    mc(
                        "u14-l1-e1",
                        "¿Por qué NumPy es más adecuado que una lista de Python para 1 millón de temperaturas?",
                        [
                            ("a", "Guarda datos homogéneos en memoria compacta y opera en bloque (vectorizado)"),
                            ("b", "Porque las listas no pueden guardar números"),
                            ("c", "Porque NumPy imprime más bonito"),
                        ],
                        "a",
                        "Un ndarray tiene un dtype único y las operaciones evitan bucles Python lentos.",
                    ),
                    fill(
                        "u14-l1-e2",
                        "Crea un array a partir de una lista.",
                        "import numpy as np\na = np.___([1, 2, 3])",
                        [{"accepted": ["array"]}],
                        "np.array convierte una lista en ndarray.",
                    ),
                    code(
                        "u14-l1-e3",
                        "Importa numpy como np. Crea `temps` con los valores 18, 21, 19, 23. Guarda `n` = número de elementos (usa `.size` o `len`) e imprime `n`.",
                        "import numpy as np\n",
                        ["temps.shape == (4,)", "int(temps.size) == 4"],
                        "import numpy as np\ntemps = np.array([18, 21, 19, 23])\nn = temps.size\nprint(n)",
                        "shape (4,) es un vector de 4 posiciones. size es el total de celdas.",
                        expected_stdout="4",
                    ),
                    predict(
                        "u14-l1-e4",
                        "¿Qué imprime este código?",
                        "import numpy as np\na = np.array([1, 2, 3])\nprint(a.dtype)",
                        "int64",
                        "NumPy infiere int64 (o int32 según plataforma). Puedes forzar dtype=float64.",
                        hint="Enteros sin punto decimal.",
                    ),
                    matching(
                        "u14-l1-e5",
                        "Empareja la función con lo que crea.",
                        [
                            {"id": "l1", "text": "np.zeros(3)"},
                            {"id": "l2", "text": "np.ones((2, 2))"},
                            {"id": "l3", "text": "np.arange(0, 5)"},
                            {"id": "l4", "text": "np.linspace(0, 1, 5)"},
                        ],
                        [
                            {"id": "r1", "text": "Tres ceros"},
                            {"id": "r2", "text": "Matriz 2×2 de unos"},
                            {"id": "r3", "text": "0,1,2,3,4"},
                            {"id": "r4", "text": "5 valores equiespaciados de 0 a 1"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "Estas fábricas evitan escribir listas a mano cuando simulas datos.",
                    ),
                    code(
                        "u14-l1-e6",
                        "Crea `m = np.arange(6)` y luego `matriz` con `.reshape(2, 3)`. Imprime `matriz.shape`.",
                        "import numpy as np\n",
                        ["matriz.shape == (2, 3)", "matriz.size == 6"],
                        "import numpy as np\nm = np.arange(6)\nmatriz = m.reshape(2, 3)\nprint(matriz.shape)",
                        "reshape no copia datos si puede: cambia la vista de la misma memoria.",
                        expected_stdout="(2, 3)",
                    ),
                    find_err(
                        "u14-l1-e7",
                        "¿Qué falla?\n\n```python\nimport numpy as np\na = np.array([1, 2, 'tres'])\nprint(a.dtype)\n```",
                        [
                            ("a", "El array se vuelve de strings (dtype unicode): ya no podrás sumar como números"),
                            ("b", "NumPy no admite listas"),
                            ("c", "Hay que importar array en vez de numpy"),
                        ],
                        "a",
                        "Un ndarray es homogéneo. Si mezclas int y str, todo se convierte a texto. Limpia tipos antes.",
                    ),
                    code(
                        "u14-l1-e8",
                        "Crea `x = np.array([1, 2, 3], dtype=float)` y guarda `s` como la suma (`x.sum()`). Imprime `s`.",
                        "import numpy as np\n",
                        ["float(s) == 6.0", "x.dtype == float"],
                        "import numpy as np\nx = np.array([1, 2, 3], dtype=float)\ns = x.sum()\nprint(s)",
                        "dtype=float convierte 1,2,3 en 1.0,2.0,3.0. sum() es un método vectorizado.",
                        expected_stdout="6.0",
                    ),
                ],
            )
        ],
    )


def s1_u15():
    return unit(
        "u15",
        15,
        "Indexado y slicing",
        "Una dimensión, varias, y vistas vs copias.",
        "layers",
        [
            lesson(
                "u15-l1",
                "Seleccionar celdas",
                "Índices, slices y arrays 2D.",
                [
                    predict(
                        "u15-l1-e1",
                        "¿Qué imprime este código?",
                        "import numpy as np\na = np.array([10, 20, 30, 40])\nprint(a[1:3])",
                        "[20 30]",
                        "El slice [1:3] incluye el índice 1 y excluye el 3. Igual que en las listas.",
                    ),
                    fill(
                        "u15-l1-e2",
                        "Selecciona el último elemento con índice negativo.",
                        "import numpy as np\na = np.array([4, 5, 6])\nultimo = a[___]",
                        [{"accepted": ["-1"]}],
                        "-1 es el último, -2 el penúltimo. Muy útil en series temporales.",
                    ),
                    code(
                        "u15-l1-e3",
                        "Dado `m` 2×3 con `np.arange(6).reshape(2, 3)`, guarda en `celda` el valor de la fila 1, columna 2 (0-indexado) e imprímelo.",
                        "import numpy as np\nm = np.arange(6).reshape(2, 3)\n",
                        ["int(celda) == 5"],
                        "import numpy as np\nm = np.arange(6).reshape(2, 3)\ncelda = m[1, 2]\nprint(celda)",
                        "En 2D usas [fila, col]. m[1, 2] es la esquina inferior derecha de un 2×3 (valores 0..5).",
                        expected_stdout="5",
                    ),
                    mc(
                        "u15-l1-e4",
                        "`m[:, 0]` en una matriz 2D significa…",
                        [
                            ("a", "Todas las filas, solo la columna 0"),
                            ("b", "Solo la fila 0"),
                            ("c", "Transponer la matriz"),
                        ],
                        "a",
                        "`:` es 'todo este eje'. Extraer una columna es el día a día en tablas numéricas.",
                    ),
                    matching(
                        "u15-l1-e5",
                        "Empareja la expresión con el resultado sobre `a = np.arange(5)` → [0,1,2,3,4].",
                        [
                            {"id": "l1", "text": "a[::2]"},
                            {"id": "l2", "text": "a[::-1]"},
                            {"id": "l3", "text": "a[-2:]"},
                        ],
                        [
                            {"id": "r1", "text": "[0, 2, 4]"},
                            {"id": "r2", "text": "[4, 3, 2, 1, 0]"},
                            {"id": "r3", "text": "[3, 4]"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "El tercer número del slice es el paso. -1 invierte.",
                    ),
                    find_err(
                        "u15-l1-e6",
                        "```python\nimport numpy as np\na = np.array([1, 2, 3])\nprint(a[3])\n```",
                        [
                            ("a", "Índice 3 está fuera de rango: solo hay 0, 1 y 2"),
                            ("b", "Hay que usar a(3)"),
                            ("c", "NumPy no admite indexado"),
                        ],
                        "a",
                        "IndexError: siempre cuenta desde 0. len(a) es 3, el último índice es 2.",
                    ),
                    code(
                        "u15-l1-e7",
                        "Con `a = np.arange(10)`, crea `b` con los elementos del 3 al 7 inclusive (valores 3..7) e imprime `b`.",
                        "import numpy as np\na = np.arange(10)\n",
                        ["np.array_equal(b, np.arange(3, 8))"],
                        "import numpy as np\na = np.arange(10)\nb = a[3:8]\nprint(b)",
                        "Para incluir el valor 7 (índice 7) el final del slice es 8.",
                    ),
                    mc(
                        "u15-l1-e8",
                        "Si `b = a[1:4]` y modificas `b[0] = 99`, ¿qué ocurre con `a` en NumPy (vista típica)?",
                        [
                            ("a", "a también cambia: muchos slices son vistas, no copias"),
                            ("b", "a nunca cambia"),
                            ("c", "Python lanza un error"),
                        ],
                        "a",
                        "Usa `.copy()` si no quieres efecto colateral. Este detalle rompe más de un análisis.",
                    ),
                ],
            )
        ],
    )


def s1_u16():
    return unit(
        "u16",
        16,
        "Vectorización y broadcasting",
        "Olvida el for: opera arrays contra arrays.",
        "zap",
        [
            lesson(
                "u16-l1",
                "Operar sin bucles",
                "Suma, producto y broadcasting.",
                [
                    mc(
                        "u16-l1-e1",
                        "¿Qué es una operación vectorizada?",
                        [
                            ("a", "Una operación aplicada a todo el array de una vez, implementada en código compilado"),
                            ("b", "Usar muchos for anidados"),
                            ("c", "Convertir el array a lista"),
                        ],
                        "a",
                        "a * 2 multiplica cada celda sin que escribas un bucle. Más rápido y más claro.",
                    ),
                    predict(
                        "u16-l1-e2",
                        "¿Qué imprime este código?",
                        "import numpy as np\nprint(np.array([1, 2, 3]) * 10)",
                        "[10 20 30]",
                        "El escalar 10 se 'estira' a cada elemento: broadcasting básico.",
                    ),
                    code(
                        "u16-l1-e3",
                        "Tienes `celsius = np.array([0, 10, 20, 30])`. Crea `fahrenheit = celsius * 9/5 + 32` e imprime el segundo valor (índice 1).",
                        "import numpy as np\ncelsius = np.array([0., 10., 20., 30.])\n",
                        ["abs(float(fahrenheit[0]) - 32) < 1e-8", "abs(float(fahrenheit[1]) - 50) < 1e-8"],
                        "import numpy as np\ncelsius = np.array([0., 10., 20., 30.])\nfahrenheit = celsius * 9/5 + 32\nprint(fahrenheit[1])",
                        "Toda la fórmula se aplica elemento a elemento. Así conviertes columnas enteras.",
                        expected_stdout="50.0",
                    ),
                    fill(
                        "u16-l1-e4",
                        "Suma dos arrays de igual forma.",
                        "import numpy as np\na = np.array([1, 2, 3])\nb = np.array([10, 10, 10])\nc = a ___ b",
                        [{"accepted": ["+"]}],
                        "Arrays de la misma forma se alinean celda a celda.",
                    ),
                    matching(
                        "u16-l1-e5",
                        "Broadcasting: `m` es (3, 1) y `v` es (1, 4). ¿Cuál es la forma del resultado de `m + v`?",
                        [
                            {"id": "l1", "text": "Forma resultado"},
                            {"id": "l2", "text": "Si no son compatibles"},
                        ],
                        [
                            {"id": "r1", "text": "(3, 4)"},
                            {"id": "r2", "text": "ValueError"},
                        ],
                        {"l1": "r1", "l2": "r2"},
                        "Las dimensiones de tamaño 1 se estiran. Si chocan (3 vs 4 sin 1), error.",
                    ),
                    code(
                        "u16-l1-e6",
                        "Crea `a = np.array([2, 4, 6])` y `mask = a > 3`. Guarda `filtrado = a[mask]` e imprime `filtrado`.",
                        "import numpy as np\n",
                        ["np.array_equal(filtrado, np.array([4, 6]))"],
                        "import numpy as np\na = np.array([2, 4, 6])\nmask = a > 3\nfiltrado = a[mask]\nprint(filtrado)",
                        "Una máscara booleana selecciona celdas. Es el primo de df[df.col > 3] en pandas.",
                    ),
                    find_err(
                        "u16-l1-e7",
                        "```python\nimport numpy as np\nnp.array([1, 2, 3]) + np.array([1, 2])\n```",
                        [
                            ("a", "Formas (3,) y (2,) incompatibles para broadcasting"),
                            ("b", "Hay que usar el operador ++"),
                            ("c", "NumPy no suma arrays"),
                        ],
                        "a",
                        "Alinea las formas o recorta. No es como zip que se detiene en el más corto.",
                    ),
                    mc(
                        "u16-l1-e8",
                        "Para restar a cada fila de una matriz (n, 3) la media de sus 3 columnas, ¿qué forma debería tener el vector de medias?",
                        [
                            ("a", "(n, 1) para que se reste por fila"),
                            ("b", "(3, n)"),
                            ("c", "Un int suelto siempre"),
                        ],
                        "a",
                        "mean(axis=1, keepdims=True) produce (n, 1) y transmite a lo largo de las columnas.",
                    ),
                ],
            )
        ],
    )


def s2_u19():
    return unit(
        "u19",
        19,
        "Matplotlib básico",
        "plot, scatter, bar e hist: el vocabulario visual.",
        "line-chart",
        [
            lesson(
                "u19-l1",
                "Cuatro gráficos esenciales",
                "Elige el gráfico según la pregunta.",
                [
                    matching(
                        "u19-l1-e1",
                        "Empareja el gráfico con la pregunta que responde.",
                        [
                            {"id": "l1", "text": "plot (líneas)"},
                            {"id": "l2", "text": "scatter"},
                            {"id": "l3", "text": "bar"},
                            {"id": "l4", "text": "hist"},
                        ],
                        [
                            {"id": "r1", "text": "¿Cómo evoluciona una serie en el tiempo?"},
                            {"id": "r2", "text": "¿Hay relación entre dos variables numéricas?"},
                            {"id": "r3", "text": "¿Cómo se comparan categorías?"},
                            {"id": "r4", "text": "¿Cómo se distribuye una variable?"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "Elegir mal el gráfico oculta el hallazgo. Empieza por la pregunta.",
                    ),
                    fill(
                        "u19-l1-e2",
                        "Completa para crear una figura de líneas.",
                        "import matplotlib.pyplot as plt\nplt.___([1, 2, 3], [3, 1, 2])",
                        [{"accepted": ["plot"]}],
                        "plt.plot(x, y) une los puntos en el orden dado.",
                    ),
                    code(
                        "u19-l1-e3",
                        "Usa matplotlib. Crea `fig, ax = plt.subplots()`, dibuja `ax.plot([0, 1, 2], [0, 1, 4])` y asigna `ok = True`.",
                        "import matplotlib.pyplot as plt\n",
                        ["ok is True"],
                        "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([0, 1, 2], [0, 1, 4])\nok = True",
                        "El patrón fig, ax = plt.subplots() es el estilo orientado a objetos, más limpio para varios ejes.",
                        capture_plots=True,
                    ),
                    mc(
                        "u19-l1-e4",
                        "Un histograma sirve para…",
                        [
                            ("a", "Ver la distribución de una variable numérica (frecuencias por bins)"),
                            ("b", "Comparar dos categorías de texto"),
                            ("c", "Entrenar un modelo"),
                        ],
                        "a",
                        "hist agrupa valores en intervalos. Cambia `bins` si se ve demasiado grueso o fino.",
                    ),
                    predict(
                        "u19-l1-e5",
                        "Si ejecutas `plt.bar(['A','B'], [10, 3])`, ¿qué barra será más alta?",
                        "print('A')",
                        "A",
                        "La categoría A tiene valor 10 frente a 3. El código de abajo solo documenta la respuesta.",
                    ),
                    code(
                        "u19-l1-e6",
                        "Crea un scatter de x = [1,2,3,4] e y = [2,1,4,3] con `ax.scatter`. Guarda `n_puntos = 4`.",
                        "import matplotlib.pyplot as plt\n",
                        ["n_puntos == 4"],
                        "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.scatter([1, 2, 3, 4], [2, 1, 4, 3])\nn_puntos = 4",
                        "scatter no une puntos: muestra cada observación. Ideal para detectar nubes y outliers.",
                        capture_plots=True,
                    ),
                    find_err(
                        "u19-l1-e7",
                        "Quieres un histograma de una lista `datos` pero escribes `plt.plot(datos)`. ¿Cuál es el problema?",
                        [
                            ("a", "plot asume una serie ordenada; para distribución usa hist"),
                            ("b", "plot no existe"),
                            ("c", "datos debe ser un string"),
                        ],
                        "a",
                        "Un plot de una lista desordenada parece ruido. hist responde 'cómo se reparte'.",
                    ),
                    mc(
                        "u19-l1-e8",
                        "En PyQuest, Matplotlib usa el backend Agg. ¿Qué implica?",
                        [
                            ("a", "El gráfico se renderiza a imagen (PNG) en vez de una ventana interactiva"),
                            ("b", "No se pueden hacer histogramas"),
                            ("c", "Solo funciona en GPU"),
                        ],
                        "a",
                        "Agg es no interactivo: perfecto para el navegador. Guardamos la figura y la mostramos como imagen.",
                    ),
                ],
            )
        ],
    )


def s2_u20():
    return unit(
        "u20",
        20,
        "Personalización",
        "Títulos, leyendas, colores y subplots que se entienden solos.",
        "palette",
        [
            lesson(
                "u20-l1",
                "Que el gráfico hable",
                "Etiquetas y varios ejes.",
                [
                    mc(
                        "u20-l1-e1",
                        "¿Qué elemento es imprescindible para que un gráfico sea interpretable fuera de tu cabeza?",
                        [
                            ("a", "Título y etiquetas de ejes con unidades"),
                            ("b", "El mayor número posible de colores"),
                            ("c", "Un fondo 3D"),
                        ],
                        "a",
                        "Sin unidades, 'temperatura 15' puede ser ºC o ºF. El título resume el hallazgo, no el método.",
                    ),
                    fill(
                        "u20-l1-e2",
                        "Pon etiqueta al eje X.",
                        "ax.___('Mes')",
                        [{"accepted": ["set_xlabel"]}],
                        "set_xlabel nombra el eje X. Hay set_ylabel y set_title.",
                    ),
                    code(
                        "u20-l1-e3",
                        "Crea un subplot, dibuja `ax.plot([1,2,3],[1,4,9], label='cuadrados')`, llama `ax.legend()` y `ax.set_title('Crecimiento')`. `done = True`.",
                        "import matplotlib.pyplot as plt\n",
                        ["done is True"],
                        "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [1, 4, 9], label='cuadrados')\nax.legend()\nax.set_title('Crecimiento')\ndone = True",
                        "label + legend distingue series. El título va en el eje, no solo en el markdown del notebook.",
                        capture_plots=True,
                    ),
                    matching(
                        "u20-l1-e4",
                        "Empareja el método con su efecto.",
                        [
                            {"id": "l1", "text": "plt.subplots(1, 2)"},
                            {"id": "l2", "text": "ax.set_xlim(0, 10)"},
                            {"id": "l3", "text": "ax.grid(True)"},
                        ],
                        [
                            {"id": "r1", "text": "Dos paneles lado a lado"},
                            {"id": "r2", "text": "Recorta el eje X"},
                            {"id": "r3", "text": "Añade una grilla de lectura"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "subplots comparan; xlim evita que un outlier aplaste el resto; grid ayuda a leer valores.",
                    ),
                    predict(
                        "u20-l1-e5",
                        "Si `fig, axes = plt.subplots(2, 1)`, ¿qué tipo de índice usas para el segundo panel?",
                        "print('axes[1]')",
                        "axes[1]",
                        "Con 2 filas y 1 columna, axes es un array 1D de 2 ejes. El segundo es axes[1].",
                    ),
                    find_err(
                        "u20-l1-e6",
                        "Un gráfico de ventas no tiene leyenda y hay 4 líneas del mismo color. ¿Cuál es el problema principal?",
                        [
                            ("a", "El lector no puede distinguir series: usa label, colores y leyenda"),
                            ("b", "Falta un modelo de ML"),
                            ("c", "Hay que usar Excel"),
                        ],
                        "a",
                        "El color es un canal de datos. Si todo es azul, el canal está desperdiciado.",
                    ),
                    code(
                        "u20-l1-e7",
                        "Crea `fig, axes = plt.subplots(1, 2)` y dibuja un histograma de `[1,1,2,2,2,3]` en `axes[0]` y un bar de categorías A,B en `axes[1]`. `done = True`.",
                        "import matplotlib.pyplot as plt\n",
                        ["done is True"],
                        "import matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2)\naxes[0].hist([1, 1, 2, 2, 2, 3])\naxes[1].bar(['A', 'B'], [4, 7])\ndone = True",
                        "Un dashboard estático empieza por 2-3 paneles que responden preguntas distintas.",
                        capture_plots=True,
                    ),
                    mc(
                        "u20-l1-e8",
                        "¿Cuándo conviene `figsize=(10, 4)`?",
                        [
                            ("a", "Cuando hay muchas categorías en X y se cortan las etiquetas"),
                            ("b", "Siempre, da igual"),
                            ("c", "Nunca en análisis de datos"),
                        ],
                        "a",
                        "El tamaño es parte del diseño. Estirar X evita etiquetas ilegibles.",
                    ),
                ],
            )
        ],
    )


def s2_u21():
    return unit(
        "u21",
        21,
        "Seaborn",
        "box, heatmap y pairplot: gráficos estadísticos con poco código.",
        "bar-chart-3",
        [
            lesson(
                "u21-l1",
                "Gramática estadística",
                "De DataFrame a insight visual.",
                [
                    mc(
                        "u21-l1-e1",
                        "¿Qué ventaja típica tiene Seaborn sobre Matplotlib 'crudo'?",
                        [
                            ("a", "API pensada para DataFrames y gráficos estadísticos (box, violin, heatmaps) con defaults decentes"),
                            ("b", "Reemplaza a pandas"),
                            ("c", "Entrena redes neuronales"),
                        ],
                        "a",
                        "Seaborn se apoya en Matplotlib. No es un backend distinto: es una capa de alto nivel.",
                    ),
                    matching(
                        "u21-l1-e2",
                        "Empareja el gráfico Seaborn con su uso.",
                        [
                            {"id": "l1", "text": "boxplot"},
                            {"id": "l2", "text": "heatmap"},
                            {"id": "l3", "text": "pairplot"},
                        ],
                        [
                            {"id": "r1", "text": "Mediana, cuartiles y outliers por grupo"},
                            {"id": "r2", "text": "Matriz de correlaciones o confusión"},
                            {"id": "r3", "text": "Relaciones pairwise entre varias columnas"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Elige box para comparar distribuciones, heatmap para matrices, pairplot para exploración inicial.",
                    ),
                    fill(
                        "u21-l1-e3",
                        "Import típico.",
                        "import seaborn as ___",
                        [{"accepted": ["sns"]}],
                        "La convención de la comunidad es `import seaborn as sns`.",
                    ),
                    code(
                        "u21-l1-e4",
                        "Sin seaborn (a veces tarda en cargar), replica un boxplot simple con matplotlib: `ax.boxplot([1,2,2,3,10])`. `done = True`.",
                        "import matplotlib.pyplot as plt\n",
                        ["done is True"],
                        "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.boxplot([1, 2, 2, 3, 10])\ndone = True",
                        "El 10 aparece como outlier. Boxplot cuenta la historia de la dispersión mejor que la sola media.",
                        capture_plots=True,
                    ),
                    mc(
                        "u21-l1-e5",
                        "Un heatmap de correlaciones con valores entre -1 y 1 suele usar…",
                        [
                            ("a", "Una escala divergente centrada en 0 (p. ej. coolwarm)"),
                            ("b", "Solo color negro"),
                            ("c", "Un gráfico de tarta"),
                        ],
                        "a",
                        "Rojo-azul (o similar) deja claro qué va junto y qué va al revés. vmin=-1, vmax=1.",
                    ),
                    predict(
                        "u21-l1-e6",
                        "Si dos variables tienen correlación 0 en el heatmap, ¿significa que no hay ninguna relación?",
                        "print('no necesariamente')",
                        "no necesariamente",
                        "La correlación de Pearson captura relaciones lineales. Un U-shape puede tener r≈0 y ser importantísimo.",
                    ),
                    find_err(
                        "u21-l1-e7",
                        "Haces pairplot de 40 columnas numéricas. ¿Cuál es el riesgo?",
                        [
                            ("a", "Una explosión de paneles ilegible: selecciona 4-8 variables clave primero"),
                            ("b", "Seaborn no acepta números"),
                            ("c", "pairplot solo funciona con texto"),
                        ],
                        "a",
                        "Más tinta no es más insight. Filtra por dominio o por correlación previa.",
                    ),
                    code(
                        "u21-l1-e8",
                        "Simula un heatmap: crea `corr = np.array([[1, 0.8], [0.8, 1]])` y `ax.imshow(corr)`. `done = True`.",
                        "import numpy as np\nimport matplotlib.pyplot as plt\n",
                        ["corr.shape == (2, 2)", "done is True"],
                        "import numpy as np\nimport matplotlib.pyplot as plt\ncorr = np.array([[1.0, 0.8], [0.8, 1.0]])\nfig, ax = plt.subplots()\nax.imshow(corr)\ndone = True",
                        "imshow es el primo de heatmap. En Seaborn añadirías annot=True para ver los números.",
                        capture_plots=True,
                    ),
                ],
            )
        ],
    )


def s3_u23():
    csv = "nombre,edad,ciudad\nAna,28,Madrid\nLuis,34,Sevilla\nMarta,28,Madrid\n"
    return unit(
        "u23",
        23,
        "Series y DataFrames",
        "La tabla como objeto: lectura CSV y primeras inspecciones.",
        "table",
        [
            lesson(
                "u23-l1",
                "Tu primera tabla",
                "Series, DataFrame y read_csv.",
                [
                    mc(
                        "u23-l1-e1",
                        "¿Cuál es la diferencia clave entre Series y DataFrame?",
                        [
                            ("a", "Series es 1D (una columna con índice); DataFrame es 2D (tabla de columnas)"),
                            ("b", "Series solo guarda texto"),
                            ("c", "DataFrame no tiene índice"),
                        ],
                        "a",
                        "Un DataFrame es un conjunto de Series alineadas por el mismo índice.",
                    ),
                    fill(
                        "u23-l1-e2",
                        "Lee un CSV con pandas.",
                        "import pandas as pd\ndf = pd.___('datos.csv')",
                        [{"accepted": ["read_csv"]}],
                        "read_csv es la puerta de entrada a casi cualquier análisis tabular.",
                    ),
                    code(
                        "u23-l1-e3",
                        "El archivo `personas.csv` ya está en el entorno. Léelo en `df` e imprime `len(df)`.",
                        "import pandas as pd\n",
                        ["len(df) == 3", "list(df.columns) == ['nombre', 'edad', 'ciudad']"],
                        "import pandas as pd\ndf = pd.read_csv('personas.csv')\nprint(len(df))",
                        "len(df) es el número de filas. shape sería (3, 3).",
                        expected_stdout="3",
                        files={"personas.csv": csv},
                        etype="data",
                    ),
                    predict(
                        "u23-l1-e4",
                        "¿Qué imprime `df.shape` para 3 filas y 3 columnas?",
                        "print((3, 3))",
                        "(3, 3)",
                        "shape siempre es (filas, columnas). No lo confundas con size (filas*columnas).",
                    ),
                    matching(
                        "u23-l1-e5",
                        "Empareja el método de inspección con lo que muestra.",
                        [
                            {"id": "l1", "text": "head()"},
                            {"id": "l2", "text": "info()"},
                            {"id": "l3", "text": "describe()"},
                        ],
                        [
                            {"id": "r1", "text": "Primeras filas"},
                            {"id": "r2", "text": "Tipos y nulos"},
                            {"id": "r3", "text": "Estadísticos de columnas numéricas"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Este trío es el ritual de los primeros 2 minutos con un dataset nuevo.",
                    ),
                    code(
                        "u23-l1-e6",
                        "Lee `personas.csv`. Guarda `edades` como la columna edad (Series) y `media` como su media. Imprime `int(media)`.",
                        "import pandas as pd\n",
                        ["int(round(media)) == 30"],
                        "import pandas as pd\ndf = pd.read_csv('personas.csv')\nedades = df['edad']\nmedia = edades.mean()\nprint(int(media))",
                        "df['edad'] devuelve una Series. mean() ignora NaN por defecto.",
                        expected_stdout="30",
                        files={"personas.csv": csv},
                        etype="data",
                    ),
                    find_err(
                        "u23-l1-e7",
                        "Una columna se llama `mean`. ¿Por qué `df.mean` es peligroso frente a `df['mean']`?",
                        [
                            ("a", "df.mean chocaría con el método .mean(): prefiere df['mean']"),
                            ("b", "Nunca funciona el corchete"),
                            ("c", "Son idénticos siempre, incluso con nombres de métodos"),
                        ],
                        "a",
                        "El acceso por atributo es azúcar. Con columnas raras o espacios, usa corchetes.",
                    ),
                    code(
                        "u23-l1-e8",
                        "Crea un DataFrame a mano: `df = pd.DataFrame({'x': [1, 2], 'y': [3, 4]})` e imprime `df['x'].sum()`.",
                        "import pandas as pd\n",
                        ["int(df['x'].sum()) == 3"],
                        "import pandas as pd\ndf = pd.DataFrame({'x': [1, 2], 'y': [3, 4]})\nprint(df['x'].sum())",
                        "Puedes construir tablas desde diccionarios: útil para tests y datos diminutos.",
                        expected_stdout="3",
                    ),
                ],
            )
        ],
    )


def s3_u24():
    csv = "id,producto,precio,stock\n1,manzana,0.4,30\n2,pera,0.5,0\n3,kiwi,0.8,12\n4,manzana,0.45,8\n"
    return unit(
        "u24",
        24,
        "Selección e indexado",
        "loc, iloc y filtros condicionales: extrae el trozo que importa.",
        "filter",
        [
            lesson(
                "u24-l1",
                "Filtrar filas",
                "El corazón de cualquier EDA.",
                [
                    mc(
                        "u24-l1-e1",
                        "`loc` selecciona por… mientras `iloc` selecciona por…",
                        [
                            ("a", "etiquetas (índice/columnas) vs posiciones enteras"),
                            ("b", "filas vs columnas solamente"),
                            ("c", "CSV vs Excel"),
                        ],
                        "a",
                        "df.loc[0, 'edad'] usa la etiqueta 0. df.iloc[0, 1] usa la posición de columna 1.",
                    ),
                    fill(
                        "u24-l1-e2",
                        "Filtro condicional clásico.",
                        "baratos = df[df['precio'] ___ 0.5]",
                        [{"accepted": ["<", "<="]}],
                        "La condición produce una Series booleana del mismo índice. df[mask] filtra filas.",
                    ),
                    code(
                        "u24-l1-e3",
                        "Lee `tienda.csv`. Guarda en `n` cuántos productos tienen stock > 0. Imprime `n`.",
                        "import pandas as pd\n",
                        ["int(n) == 3"],
                        "import pandas as pd\ndf = pd.read_csv('tienda.csv')\nn = (df['stock'] > 0).sum()\nprint(int(n))",
                        "La máscara df['stock'] > 0 es True/False; sum() cuenta True como 1.",
                        expected_stdout="3",
                        files={"tienda.csv": csv},
                        etype="data",
                    ),
                    predict(
                        "u24-l1-e4",
                        "Para `df.iloc[:2]`, ¿cuántas filas obtienes?",
                        "print(2)",
                        "2",
                        "El final en iloc se excluye, igual que en las listas: [:2] → filas 0 y 1.",
                    ),
                    matching(
                        "u24-l1-e5",
                        "Empareja la expresión (concepto) con su intención.",
                        [
                            {"id": "l1", "text": "df.loc[df.precio > 1, 'producto']"},
                            {"id": "l2", "text": "df.iloc[0, 0]"},
                            {"id": "l3", "text": "df[['producto','precio']]"},
                        ],
                        [
                            {"id": "r1", "text": "Nombres de productos caros"},
                            {"id": "r2", "text": "Celda esquina superior"},
                            {"id": "r3", "text": "Subtabla de dos columnas"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Lista de columnas en doble corchete: sigue siendo DataFrame, no Series.",
                    ),
                    find_err(
                        "u24-l1-e6",
                        "```python\ndf[df.precio > 0.4 and df.stock > 0]\n```",
                        [
                            ("a", "Usa & y paréntesis: (df.precio > 0.4) & (df.stock > 0). and no es element-wise"),
                            ("b", "Falta un for"),
                            ("c", "precio debería ser un string"),
                        ],
                        "a",
                        "and/or de Python no saben alinear Series. En pandas: &, |, ~ con paréntesis.",
                    ),
                    code(
                        "u24-l1-e7",
                        "Lee `tienda.csv`. Selecciona las filas de producto manzana y guarda `media` como la media de su precio. Imprime `round(media, 2)`.",
                        "import pandas as pd\n",
                        ["abs(float(media) - 0.425) < 1e-9"],
                        "import pandas as pd\ndf = pd.read_csv('tienda.csv')\nmedia = df.loc[df['producto'] == 'manzana', 'precio'].mean()\nprint(round(media, 2))",
                        "loc acepta una máscara y una columna a la vez: filtra y selecciona en un paso.",
                        expected_stdout="0.43",
                        files={"tienda.csv": csv},
                        etype="data",
                    ),
                    mc(
                        "u24-l1-e8",
                        "¿Por qué `df[0]` suele fallar en un DataFrame con columnas nombradas?",
                        [
                            ("a", "El corchete simple busca una columna llamada 0, no la primera fila"),
                            ("b", "Los DataFrames no se pueden indexar"),
                            ("c", "Hay que reiniciar el kernel"),
                        ],
                        "a",
                        "Para la primera fila: iloc[0] o loc[etiqueta]. Para la primera columna: iloc[:, 0].",
                    ),
                ],
            )
        ],
    )


def s3_u25():
    csv = "id,edad,ciudad\n1,29,Madrid\n2,,Madrid\n3,29,Madrid\n2,,Madrid\n4,41,Valencia\n"
    return unit(
        "u25",
        25,
        "Limpieza de datos",
        "Nulos, duplicados y tipos: el 80% del trabajo real.",
        "sparkle",
        [
            lesson(
                "u25-l1",
                "Datos sucios, decisiones claras",
                "Detecta, no borres a ciegas.",
                [
                    mc(
                        "u25-l1-e1",
                        "Antes de borrar nulos, ¿qué deberías hacer?",
                        [
                            ("a", "Medir cuántos hay por columna y preguntarte si el nulo es informativo"),
                            ("b", "Rellenar siempre con 0"),
                            ("c", "Borrar el dataset"),
                        ],
                        "a",
                        "Un nulo en 'salario' no es lo mismo que en 'segundo apellido'. isna().mean() es tu aliado.",
                    ),
                    fill(
                        "u25-l1-e2",
                        "Cuenta nulos por columna.",
                        "df.___().sum()",
                        [{"accepted": ["isna", "isnull"]}],
                        "isna() produce booleanos; sum() cuenta True por columna.",
                    ),
                    code(
                        "u25-l1-e3",
                        "Lee `sucio.csv`. Guarda `nulos_edad` como el número de nulos en edad. Imprime ese número.",
                        "import pandas as pd\n",
                        ["int(nulos_edad) == 2"],
                        "import pandas as pd\ndf = pd.read_csv('sucio.csv')\nnulos_edad = df['edad'].isna().sum()\nprint(int(nulos_edad))",
                        "Dos filas sin edad. El CSV vacío entre comas se lee como NaN.",
                        expected_stdout="2",
                        files={"sucio.csv": csv},
                        etype="data",
                    ),
                    matching(
                        "u25-l1-e4",
                        "Empareja la técnica con el caso.",
                        [
                            {"id": "l1", "text": "dropna()"},
                            {"id": "l2", "text": "fillna(mediana)"},
                            {"id": "l3", "text": "drop_duplicates()"},
                        ],
                        [
                            {"id": "r1", "text": "Pocas filas rotas e inrecuperables"},
                            {"id": "r2", "text": "Nulos en numérico y no quieres perder filas"},
                            {"id": "r3", "text": "La misma fila se pegó dos veces"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "No hay receta única: documenta la decisión en un comentario o README del análisis.",
                    ),
                    code(
                        "u25-l1-e5",
                        "Lee `sucio.csv`. Elimina duplicados con `drop_duplicates()` en `limpio` e imprime `len(limpio)`.",
                        "import pandas as pd\n",
                        ["len(limpio) == 4"],
                        "import pandas as pd\ndf = pd.read_csv('sucio.csv')\nlimpio = df.drop_duplicates()\nprint(len(limpio))",
                        "Había 5 filas y una estaba repetida. Por defecto se conserva la primera.",
                        expected_stdout="4",
                        files={"sucio.csv": csv},
                        etype="data",
                    ),
                    find_err(
                        "u25-l1-e6",
                        "Haces `df.dropna()` y no cambia `df`. ¿Por qué?",
                        [
                            ("a", "La mayoría de métodos de pandas devuelven una copia: asigna df = df.dropna() o usa inplace con cuidado"),
                            ("b", "dropna no existe"),
                            ("c", "Los nulos no se pueden borrar en Python"),
                        ],
                        "a",
                        "El patrón funcional (asignar el resultado) evita sorpresas. inplace está en desuso en varios métodos.",
                    ),
                    predict(
                        "u25-l1-e7",
                        "Si conviertes una columna de IDs `'001'` con `astype(int)`, ¿qué riesgo hay?",
                        "print('pierdes ceros a la izquierda')",
                        "pierdes ceros a la izquierda",
                        "001 se vuelve 1. Los identificadores suelen ser strings, no enteros.",
                    ),
                    code(
                        "u25-l1-e8",
                        "Lee `sucio.csv`. Rellena edad nula con la mediana de edad y guarda el resultado en `df2`. `ok = df2['edad'].isna().sum() == 0`.",
                        "import pandas as pd\n",
                        ["bool(ok) is True", "df2['edad'].isna().sum() == 0"],
                        "import pandas as pd\ndf = pd.read_csv('sucio.csv')\nmed = df['edad'].median()\ndf2 = df.copy()\ndf2['edad'] = df2['edad'].fillna(med)\nok = df2['edad'].isna().sum() == 0",
                        "La mediana es robusta a outliers. No uses la media a ciegas en salarios o precios.",
                        files={"sucio.csv": csv},
                        etype="data",
                    ),
                ],
            )
        ],
    )


def s4_u28():
    return unit(
        "u28",
        28,
        "Estadística descriptiva",
        "Media, mediana, moda, varianza y desviación: resumir sin mentir.",
        "sigma",
        [
            lesson(
                "u28-l1",
                "Resumir una columna",
                "Un número nunca cuenta toda la historia.",
                [
                    mc(
                        "u28-l1-e1",
                        "Tienes salarios [20, 22, 21, 19, 400]. ¿Qué medida de centro se distorsiona más?",
                        [
                            ("a", "La media"),
                            ("b", "La mediana"),
                            ("c", "La moda"),
                        ],
                        "a",
                        "La media siente el 400. La mediana se queda cerca de 21. En datos sesgados, reporta ambas.",
                    ),
                    fill(
                        "u28-l1-e2",
                        "Mediana con NumPy.",
                        "import numpy as np\nnp.___([1, 3, 2])",
                        [{"accepted": ["median"]}],
                        "median ordena y toma el valor central (o la media de los dos centrales).",
                    ),
                    code(
                        "u28-l1-e3",
                        "Con `x = np.array([2, 4, 4, 4, 5, 5, 7, 9])`, guarda `media` y `std` (poblacional, `ddof=0`) e imprime `round(media, 1)`.",
                        "import numpy as np\nx = np.array([2, 4, 4, 4, 5, 5, 7, 9], dtype=float)\n",
                        ["abs(float(media) - 5) < 1e-8"],
                        "import numpy as np\nx = np.array([2, 4, 4, 4, 5, 5, 7, 9], dtype=float)\nmedia = x.mean()\nstd = x.std(ddof=0)\nprint(round(media, 1))",
                        "Esta serie clásica tiene media 5. std mide el spreed alrededor de esa media.",
                        expected_stdout="5.0",
                    ),
                    matching(
                        "u28-l1-e4",
                        "Empareja el estadístico con su idea.",
                        [
                            {"id": "l1", "text": "Varianza"},
                            {"id": "l2", "text": "Desviación estándar"},
                            {"id": "l3", "text": "Moda"},
                        ],
                        [
                            {"id": "r1", "text": "Promedio de (x - media)²"},
                            {"id": "r2", "text": "Dispersión en las mismas unidades que x"},
                            {"id": "r3", "text": "Valor más frecuente"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "La std es la raíz de la varianza: más interpretable ('±3 años').",
                    ),
                    predict(
                        "u28-l1-e5",
                        "¿Qué imprime `np.median([1, 2, 100])`?",
                        "import numpy as np\nprint(np.median([1, 2, 100]))",
                        "2.0",
                        "El valor central tras ordenar 1,2,100 es 2. La media sería ~34.",
                    ),
                    find_err(
                        "u28-l1-e6",
                        "Reportas solo la media de tiempo de sesión en una app. ¿Qué te estás dejando?",
                        [
                            ("a", "Dispersión y forma: una media de 5 min puede esconder muchos 30s y unos pocos 1h"),
                            ("b", "El color del gráfico"),
                            ("c", "El nombre del archivo"),
                        ],
                        "a",
                        "Siempre acompaña media con std o IQR, y mira un histograma.",
                    ),
                    code(
                        "u28-l1-e7",
                        "Calcula el rango (`max - min`) de `x = np.array([3, 10, 5])` en `rango` e imprímelo.",
                        "import numpy as np\nx = np.array([3, 10, 5])\n",
                        ["int(rango) == 7"],
                        "import numpy as np\nx = np.array([3, 10, 5])\nrango = x.max() - x.min()\nprint(rango)",
                        "El rango es simple y sensible a outliers. El IQR (p75-p25) es más robusto.",
                        expected_stdout="7",
                    ),
                    mc(
                        "u28-l1-e8",
                        "`ddof=1` en `std` estima la desviación…",
                        [
                            ("a", "muestral (divide por n-1)"),
                            ("b", "de toda la población siempre"),
                            ("c", "en grados Fahrenheit"),
                        ],
                        "a",
                        "pandas.Series.std usa ddof=1 por defecto; numpy.std usa ddof=0. ¡Ojo al mezclarlos!",
                    ),
                ],
            )
        ],
    )


def s4_u29():
    return unit(
        "u29",
        29,
        "Distribuciones",
        "Normal, binomial e intuición con scipy.stats (o numpy).",
        "bell",
        [
            lesson(
                "u29-l1",
                "Modelos de azar útiles",
                "No memorizas fórmulas: interpretas parámetros.",
                [
                    mc(
                        "u29-l1-e1",
                        "Una normal se describe con…",
                        [
                            ("a", "media (μ) y desviación (σ)"),
                            ("b", "solo la moda"),
                            ("c", "un DataFrame"),
                        ],
                        "a",
                        "μ centra la campana; σ la ensancha. El 95% aprox. cae en μ ± 2σ.",
                    ),
                    matching(
                        "u29-l1-e2",
                        "Empareja la distribución con un ejemplo.",
                        [
                            {"id": "l1", "text": "Normal"},
                            {"id": "l2", "text": "Binomial"},
                            {"id": "l3", "text": "Uniforme"},
                        ],
                        [
                            {"id": "r1", "text": "Errores de medición simétricos"},
                            {"id": "r2", "text": "Número de clics en 10 impresiones (éxito/fracaso)"},
                            {"id": "r3", "text": "Generador aleatorio entre 0 y 1"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Elige el modelo que respeta el proceso que genera los datos.",
                    ),
                    code(
                        "u29-l1-e3",
                        "Usa `np.random.default_rng(0)` para generar `muestra` de 1000 normales(0,1). Guarda `media` = mean e imprime `round(media, 1)`.",
                        "import numpy as np\nrng = np.random.default_rng(0)\n",
                        ["muestra.shape == (1000,)", "abs(float(media)) < 0.2"],
                        "import numpy as np\nrng = np.random.default_rng(0)\nmuestra = rng.normal(0, 1, 1000)\nmedia = muestra.mean()\nprint(round(media, 1))",
                        "Con n grande, la media muestral se acerca a 0. La semilla 0 hace el ejercicio reproducible.",
                    ),
                    fill(
                        "u29-l1-e4",
                        "Binomial: n ensayos, probabilidad p.",
                        "rng.binomial(n=10, p=0.___, size=5)",
                        [{"accepted": ["5", "50"]}],
                        "p=0.5 es una moneda justa. size es cuántas veces simulas el experimento.",
                    ),
                    predict(
                        "u29-l1-e5",
                        "En una binomial(n=1, p=0.3), los valores posibles son…",
                        "print('0 o 1')",
                        "0 o 1",
                        "n=1 es un ensayo de Bernoulli: fracaso o éxito.",
                    ),
                    find_err(
                        "u29-l1-e6",
                        "Simulas 10 números y declaras 'está demostrado que la media poblacional es 5'. ¿Cuál es el error?",
                        [
                            ("a", "Confundes una muestra pequeña con la población: necesitas incertidumbre (EE, IC)"),
                            ("b", "Hay que usar Excel"),
                            ("c", "La media no existe en Python"),
                        ],
                        "a",
                        "La estadística inferencial nace precisamente de ese salto temerario.",
                    ),
                    code(
                        "u29-l1-e7",
                        "Crea `exitos = rng.binomial(10, 0.5, 200)` con seed 1 y guarda `promedio` = mean. Debe estar cerca de 5.",
                        "import numpy as np\nrng = np.random.default_rng(1)\n",
                        ["abs(float(promedio) - 5) < 0.5"],
                        "import numpy as np\nrng = np.random.default_rng(1)\nexitos = rng.binomial(10, 0.5, 200)\npromedio = exitos.mean()",
                        "El valor esperado de Binomial(10, 0.5) es n*p = 5. La simulación lo rodea.",
                    ),
                    mc(
                        "u29-l1-e8",
                        "¿Para qué sirve `scipy.stats.norm.cdf(1.96)` ≈ 0.975?",
                        [
                            ("a", "Probabilidad acumulada hasta 1.96 en N(0,1): base de intervalos al 95%"),
                            ("b", "Entrena un random forest"),
                            ("c", "Lee un CSV"),
                        ],
                        "a",
                        "La CDF responde P(X ≤ x). 1.96 es el clásico de los IC al 95% en la normal estándar.",
                    ),
                ],
            )
        ],
    )


def s4_u30():
    return unit(
        "u30",
        30,
        "Correlación y covarianza",
        "Cuándo dos variables se mueven juntas — y cuándo no significa causa.",
        "git-compare",
        [
            lesson(
                "u30-l1",
                "Moverse juntos",
                "r de Pearson, covarianza y trampas.",
                [
                    mc(
                        "u30-l1-e1",
                        "La correlación de Pearson está entre…",
                        [("a", "-1 y 1"), ("b", "0 y 100"), ("c", "0 y infinito")],
                        "a",
                        "1 es relación lineal perfecta positiva; -1 inversa; 0 ausencia de relación lineal.",
                    ),
                    fill(
                        "u30-l1-e2",
                        "Correlación con NumPy.",
                        "np.corr___((x, y))[0, 1]",
                        [{"accepted": ["coef"]}],
                        "corrcoef devuelve una matriz 2×2; la celda [0,1] es r entre x e y.",
                    ),
                    code(
                        "u30-l1-e3",
                        "Con `x = np.array([1.,2.,3.,4.])` y `y = 2*x`, guarda `r = np.corrcoef(x, y)[0,1]` e imprime `int(r)`.",
                        "import numpy as np\nx = np.array([1., 2., 3., 4.])\ny = 2 * x\n",
                        ["abs(float(r) - 1) < 1e-9"],
                        "import numpy as np\nx = np.array([1., 2., 3., 4.])\ny = 2 * x\nr = np.corrcoef(x, y)[0, 1]\nprint(int(r))",
                        "y es un múltiplo exacto de x: r = 1.",
                        expected_stdout="1",
                    ),
                    matching(
                        "u30-l1-e4",
                        "Empareja el concepto con la frase honesta.",
                        [
                            {"id": "l1", "text": "Correlación"},
                            {"id": "l2", "text": "Causalidad"},
                            {"id": "l3", "text": "Covarianza"},
                        ],
                        [
                            {"id": "r1", "text": "Asociación lineal (escala libre)"},
                            {"id": "r2", "text": "Requiere diseño, no solo r"},
                            {"id": "r3", "text": "Asociación en unidades originales"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Helados y ahogos correlacionan en verano: la causa es el calor, no el helado.",
                    ),
                    predict(
                        "u30-l1-e5",
                        "Si y = -x, r es…",
                        "print(-1.0)",
                        "-1.0",
                        "Relación lineal perfecta inversa.",
                    ),
                    find_err(
                        "u30-l1-e6",
                        "Calculas corrcoef incluyendo una columna constante (todos 7). ¿Qué pasa?",
                        [
                            ("a", "La varianza es 0: la correlación no está definida (NaN o warning)"),
                            ("b", "r vale 7"),
                            ("c", "r vale 1 siempre"),
                        ],
                        "a",
                        "Sin variación no hay 'moverse juntos'. Quita constantes antes de la matriz de correlaciones.",
                    ),
                    code(
                        "u30-l1-e7",
                        "`x = [1,2,3,4,5]`, `y = [2,1,2,1,2]`. Calcula `r` con corrcoef. Debe ser cercano a 0. Imprime `round(r, 1)`.",
                        "import numpy as np\nx = np.array([1., 2., 3., 4., 5.])\ny = np.array([2., 1., 2., 1., 2.])\n",
                        ["abs(float(r)) < 0.3"],
                        "import numpy as np\nx = np.array([1., 2., 3., 4., 5.])\ny = np.array([2., 1., 2., 1., 2.])\nr = np.corrcoef(x, y)[0, 1]\nprint(round(r, 1))",
                        "y oscila sin tendencia respecto a x: r cerca de 0.",
                    ),
                    mc(
                        "u30-l1-e8",
                        "Un outlier extremo en un scatter de 20 puntos…",
                        [
                            ("a", "Puede inflar o invertir r: siempre mira el gráfico"),
                            ("b", "Nunca afecta a Pearson"),
                            ("c", "Solo afecta a la moda"),
                        ],
                        "a",
                        "Pearson es sensible a extremos. Spearman (rangos) es una alternativa robusta.",
                    ),
                ],
            )
        ],
    )


def s5_u32():
    return unit(
        "u32",
        32,
        "¿Qué es Machine Learning?",
        "Supervisado vs no supervisado: el mapa antes del código.",
        "brain",
        [
            lesson(
                "u32-l1",
                "Aprender de ejemplos",
                "El modelo memoriza patrones, no magia.",
                [
                    mc(
                        "u32-l1-e1",
                        "En aprendizaje supervisado, los datos de entrenamiento incluyen…",
                        [
                            ("a", "Entradas X y la etiqueta o valor objetivo y"),
                            ("b", "Solo X, nunca y"),
                            ("c", "Únicamente imágenes de gatos"),
                        ],
                        "a",
                        "Supervisado = hay un 'profesor' (la etiqueta). Predecir precio o spam son clásicos.",
                    ),
                    matching(
                        "u32-l1-e2",
                        "Empareja el problema con el tipo.",
                        [
                            {"id": "l1", "text": "Predecir si un cliente se da de baja"},
                            {"id": "l2", "text": "Estimar el precio de un piso"},
                            {"id": "l3", "text": "Agrupar clientes por comportamiento sin etiqueta"},
                        ],
                        [
                            {"id": "r1", "text": "Clasificación supervisada"},
                            {"id": "r2", "text": "Regresión supervisada"},
                            {"id": "r3", "text": "No supervisado (clustering)"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Si y es categoría → clasificación; si y es número continuo → regresión; si no hay y → no supervisado.",
                    ),
                    fill(
                        "u32-l1-e3",
                        "Completa el import del split de sklearn.",
                        "from sklearn.model_selection import ___",
                        [{"accepted": ["train_test_split"]}],
                        "Nunca evalúes el modelo con los mismos datos con los que aprendió: mentiría hacia arriba.",
                    ),
                    predict(
                        "u32-l1-e4",
                        "Si un modelo acierta el 99% en train y el 55% en test, sospechas…",
                        "print('overfitting')",
                        "overfitting",
                        "Memorizó el ruido del entrenamiento y no generaliza.",
                    ),
                    code(
                        "u32-l1-e5",
                        "Sin sklearn: implementa un clasificador trivial `predice(x)` que devuelva 1 si x >= 0 else 0. Prueba con x=2 y x=-1 e imprime ambas predicciones separadas por espacio.",
                        "",
                        [],
                        "def predice(x):\n    return 1 if x >= 0 else 0\nprint(predice(2), predice(-1))",
                        "Un umbral es un modelo. sklearn solo empaqueta ideas como esta (y otras más ricas).",
                        expected_stdout="1 0",
                    ),
                    find_err(
                        "u32-l1-e6",
                        "Entrenar y reportar accuracy sobre todo el dataset, sin split. ¿Cuál es el pecado?",
                        [
                            ("a", "No tienes estimación honesta de generalización"),
                            ("b", "Accuracy no existe"),
                            ("c", "Falta un heatmap"),
                        ],
                        "a",
                        "El test (o validación cruzada) es el contrato científico del modelo.",
                    ),
                    mc(
                        "u32-l1-e7",
                        "¿Qué es un feature?",
                        [
                            ("a", "Una variable de entrada que el modelo usa para predecir"),
                            ("b", "Siempre una imagen"),
                            ("c", "El accuracy"),
                        ],
                        "a",
                        "Edad, ingresos, píxeles: todo puede ser feature. La ingeniería de features suele importar más que el algoritmo.",
                    ),
                    code(
                        "u32-l1-e8",
                        "Crea listas `X = [[1],[2],[3],[10]]` y `y = [0,0,0,1]` (un outlier). El modelo `y_hat = [0 if v[0] < 5 else 1 for v in X]`. Imprime `y_hat`.",
                        "X = [[1], [2], [3], [10]]\ny = [0, 0, 0, 1]\n",
                        ["y_hat == [0, 0, 0, 1]"],
                        "X = [[1], [2], [3], [10]]\ny = [0, 0, 0, 1]\ny_hat = [0 if v[0] < 5 else 1 for v in X]\nprint(y_hat)",
                        "Un umbral en 5 separa el 10. Así de visual es un árbol de un solo corte.",
                        expected_stdout="[0, 0, 0, 1]",
                    ),
                ],
            )
        ],
    )


def s5_u33():
    return unit(
        "u33",
        33,
        "Preprocesamiento",
        "Escalado, one-hot y train/test split: el pipeline honesto.",
        "scissors",
        [
            lesson(
                "u33-l1",
                "Preparar X",
                "Lo que el modelo ve es lo que el modelo aprende.",
                [
                    mc(
                        "u33-l1-e1",
                        "¿Por qué escalar features (StandardScaler) en KNN o SVM?",
                        [
                            ("a", "Porque la distancia se domina por variables con rangos grandes"),
                            ("b", "Porque si no, Python no corre"),
                            ("c", "Solo por estética"),
                        ],
                        "a",
                        "Ingresos en euros aplastan una variable 0/1. Media 0 y std 1 igualan el terreno.",
                    ),
                    matching(
                        "u33-l1-e2",
                        "Empareja la técnica con el tipo de columna.",
                        [
                            {"id": "l1", "text": "StandardScaler"},
                            {"id": "l2", "text": "One-hot encoding"},
                            {"id": "l3", "text": "train_test_split"},
                        ],
                        [
                            {"id": "r1", "text": "Numérica continua"},
                            {"id": "r2", "text": "Categórica (color, ciudad)"},
                            {"id": "r3", "text": "Separar aprendizaje y evaluación"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Nunca hagas fit del scaler con el test: es filtrar información del futuro (leakage).",
                    ),
                    fill(
                        "u33-l1-e3",
                        "Split clásico.",
                        "from sklearn.model_selection import ___",
                        [{"accepted": ["train_test_split"]}],
                        "train_test_split baraja y corta. Fija random_state para reproducir.",
                    ),
                    code(
                        "u33-l1-e4",
                        "Escala a mano: `x = np.array([10., 20., 30.])`, `z = (x - x.mean()) / x.std()`. Imprime `z.mean().round(0)`.",
                        "import numpy as np\nx = np.array([10., 20., 30.])\n",
                        ["abs(float(z.mean())) < 1e-8"],
                        "import numpy as np\nx = np.array([10., 20., 30.])\nz = (x - x.mean()) / x.std()\nprint(z.mean().round(0))",
                        "Eso es z-score. StandardScaler hace exactamente esto (con ddof=0).",
                        expected_stdout="0.0",
                    ),
                    predict(
                        "u33-l1-e5",
                        "Ciudad = Madrid/Sevilla/Valencia en one-hot produce…",
                        "print('3 columnas binarias')",
                        "3 columnas binarias",
                        "Cada categoría una columna 0/1. drop_first=True evita colinealidad en regresiones.",
                    ),
                    find_err(
                        "u33-l1-e6",
                        "Haces scaler.fit(X_test). ¿Cuál es el problema?",
                        [
                            ("a", "Data leakage: el test influye en la transformación"),
                            ("b", "fit no existe"),
                            ("c", "Hay que usar Excel"),
                        ],
                        "a",
                        "fit solo con train; transform en train y test. En sklearn, un Pipeline lo impide olvidar.",
                    ),
                    code(
                        "u33-l1-e7",
                        "Implementa un split naive: `X = [1,2,3,4]`, train = primeros 3, test = último. Imprime el test.",
                        "X = [1, 2, 3, 4]\n",
                        ["train == [1, 2, 3]", "test == [4]"],
                        "X = [1, 2, 3, 4]\ntrain = X[:3]\ntest = X[3:]\nprint(test)",
                        "Un split temporal (si los datos están ordenados en el tiempo) es más honesto que uno aleatorio.",
                        expected_stdout="[4]",
                    ),
                    mc(
                        "u33-l1-e8",
                        "¿Qué es target leakage?",
                        [
                            ("a", "Usar una feature que ya contiene información del objetivo (p. ej. 'días hasta baja' para predecir baja)"),
                            ("b", "Olvidar el CSV"),
                            ("c", "Usar demasiados colores"),
                        ],
                        "a",
                        "El modelo 'adivina' porque le soplaste la respuesta. Revisa fechas y cómo se genera cada columna.",
                    ),
                ],
            )
        ],
    )


def s5_u34():
    return unit(
        "u34",
        34,
        "Regresión lineal y logística",
        "La recta que predice números y la sigmoide que predice clases.",
        "trending-up",
        [
            lesson(
                "u34-l1",
                "Rectas y probabilidades",
                "Dos modelos, una idea: combinación lineal de features.",
                [
                    mc(
                        "u34-l1-e1",
                        "La regresión lineal modela y como…",
                        [
                            ("a", "w·x + b (combinación lineal más sesgo)"),
                            ("b", "Un árbol de 100 ramas siempre"),
                            ("c", "Un clustering"),
                        ],
                        "a",
                        "Los pesos w se estiman para minimizar el error cuadrático (OLS).",
                    ),
                    fill(
                        "u34-l1-e2",
                        "Predicción lineal simple.",
                        "y_hat = w * x + ___",
                        [{"accepted": ["b", "bias", "intercept"]}],
                        "b es el intercepto: el valor cuando x=0 (si tiene sentido).",
                    ),
                    code(
                        "u34-l1-e3",
                        "Con w=2, b=1, x=np.array([0,1,2]), calcula `y_hat = w*x + b` e imprime `y_hat[1]`.",
                        "import numpy as np\nw, b = 2, 1\nx = np.array([0, 1, 2])\n",
                        ["np.array_equal(y_hat, np.array([1, 3, 5]))"],
                        "import numpy as np\nw, b = 2, 1\nx = np.array([0, 1, 2])\ny_hat = w * x + b\nprint(y_hat[1])",
                        "Para x=1, 2*1+1=3. Vectorizar evita el for.",
                        expected_stdout="3",
                    ),
                    matching(
                        "u34-l1-e4",
                        "Empareja modelo y salida.",
                        [
                            {"id": "l1", "text": "Regresión lineal"},
                            {"id": "l2", "text": "Regresión logística"},
                            {"id": "l3", "text": "Sigmoide"},
                        ],
                        [
                            {"id": "r1", "text": "Número continuo"},
                            {"id": "r2", "text": "Probabilidad de clase / decisión 0-1"},
                            {"id": "r3", "text": "Aplasta cualquier real a (0, 1)"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Logística = lineal + sigmoide. No es una 'regresión de logs' de negocio; es clasificación.",
                    ),
                    predict(
                        "u34-l1-e5",
                        "sigmoide(0) vale…",
                        "import math\nprint(round(1 / (1 + math.exp(0)), 1))",
                        "0.5",
                        "e^0=1 → 1/(1+1)=0.5. El umbral 0.5 corresponde a score lineal 0.",
                    ),
                    find_err(
                        "u34-l1-e6",
                        "Usas regresión lineal para predecir 'sí/no' y obtienes -0.3 y 1.7. ¿Qué problema hay?",
                        [
                            ("a", "Las predicciones no son probabilidades: usa logística u otro clasificador"),
                            ("b", "Hay que multiplicar por 100"),
                            ("c", "Es correcto siempre"),
                        ],
                        "a",
                        "Lineal no está acotada. Logística garantiza (0,1) y una pérdida adecuada (log loss).",
                    ),
                    code(
                        "u34-l1-e7",
                        "Implementa `sigmoid(z)` = 1/(1+np.exp(-z)) y calcula `p = sigmoid(np.array([0., 2., -2.]))`. Imprime `round(p[0], 1)`.",
                        "import numpy as np\n",
                        ["abs(float(p[0]) - 0.5) < 1e-8"],
                        "import numpy as np\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\np = sigmoid(np.array([0., 2., -2.]))\nprint(round(p[0], 1))",
                        "z alto → p cerca de 1; z bajo → cerca de 0. El 0.5 es el punto medio.",
                        expected_stdout="0.5",
                    ),
                    mc(
                        "u34-l1-e8",
                        "En sklearn, `LinearRegression().fit(X, y)` estima…",
                        [
                            ("a", "coef_ (pesos) e intercept_"),
                            ("b", "Un k de K-Means"),
                            ("c", "Embeddings de texto"),
                        ],
                        "a",
                        "Después, predict(X_test) aplica esos pesos. Mira coef_ para interpretar (con features escaladas).",
                    ),
                ],
            )
        ],
    )


def s6_u39():
    return unit(
        "u39",
        39,
        "Redes neuronales",
        "Perceptrón, capas y funciones de activación: el ladrillo del deep learning.",
        "network",
        [
            lesson(
                "u39-l1",
                "Neuronas de juguete",
                "Suma ponderada + no linealidad.",
                [
                    mc(
                        "u39-l1-e1",
                        "Una neurona artificial calcula…",
                        [
                            ("a", "activación(w·x + b)"),
                            ("b", "Siempre un árbol aleatorio"),
                            ("c", "Un JOIN de SQL"),
                        ],
                        "a",
                        "Es una regresión logística (si la activación es sigmoide) o ReLU, tanh, etc.",
                    ),
                    matching(
                        "u39-l1-e2",
                        "Empareja la activación con su rasgo.",
                        [
                            {"id": "l1", "text": "ReLU"},
                            {"id": "l2", "text": "Sigmoide"},
                            {"id": "l3", "text": "Softmax"},
                        ],
                        [
                            {"id": "r1", "text": "max(0, z): simple y efectiva en capas ocultas"},
                            {"id": "r2", "text": "Sale entre 0 y 1 (un problema binario)"},
                            {"id": "r3", "text": "Convierte scores en una distribución de clases"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "ReLU evitó muchos vanishings de las sigmoides profundas. Softmax va al final de clasificación.",
                    ),
                    fill(
                        "u39-l1-e3",
                        "ReLU a mano.",
                        "relu = np.maximum(___, z)",
                        [{"accepted": ["0", "0.0"]}],
                        "Todo lo negativo se corta a 0. Es una no linealidad barata.",
                    ),
                    code(
                        "u39-l1-e4",
                        "Implementa una neurona: `z = w*x + b` con w=0.5, b=-1, x=6, `y = max(0, z)`. Imprime `y`.",
                        "w, b, x = 0.5, -1, 6\n",
                        ["float(y) == 2.0"],
                        "w, b, x = 0.5, -1, 6\nz = w * x + b\ny = max(0, z)\nprint(y)",
                        "0.5*6 - 1 = 2, ReLU lo deja igual. Si z fuera negativo, saldría 0.",
                        expected_stdout="2",
                    ),
                    predict(
                        "u39-l1-e5",
                        "Una red con solo capas lineales apiladas (sin activación) es equivalente a…",
                        "print('una sola capa lineal')",
                        "una sola capa lineal",
                        "Componer funciones lineales sigue siendo lineal. La magia está en las no linealidades.",
                    ),
                    find_err(
                        "u39-l1-e6",
                        "Pones softmax en cada capa oculta de una red profunda. ¿Por qué suele ser mala idea?",
                        [
                            ("a", "Comprime fuerte y satura; softmax se reserva para la salida de clasificación"),
                            ("b", "Softmax no existe"),
                            ("c", "Obliga a usar CPU"),
                        ],
                        "a",
                        "Las hidden modernas usan ReLU/GELU. Softmax en medio destruye la señal.",
                    ),
                    code(
                        "u39-l1-e7",
                        "Capa densa mini: `W = np.array([[1., 2.], [0., -1.]])`, `x = np.array([1., 1.])`, `h = np.maximum(0, W @ x)`. Imprime `h[0]`.",
                        "import numpy as np\nW = np.array([[1., 2.], [0., -1.]])\nx = np.array([1., 1.])\n",
                        ["abs(float(h[0]) - 3) < 1e-8"],
                        "import numpy as np\nW = np.array([[1., 2.], [0., -1.]])\nx = np.array([1., 1.])\nh = np.maximum(0, W @ x)\nprint(h[0])",
                        "W @ x es (3, -1); ReLU → (3, 0). Una capa oculta de 2 neuronas.",
                        expected_stdout="3.0",
                    ),
                    mc(
                        "u39-l1-e8",
                        "El perceptrón clásico de Rosenblatt…",
                        [
                            ("a", "Es un clasificador lineal binario con umbral"),
                            ("b", "Es un LLM"),
                            ("c", "Es un tipo de heatmap"),
                        ],
                        "a",
                        "Las redes profundas apilan muchos perceptrones (con activaciones) y se entrenan con backprop.",
                    ),
                ],
            )
        ],
    )


def s6_u40():
    return unit(
        "u40",
        40,
        "Keras / PyTorch intro",
        "El bucle: tensores, un modelo sequential y un paso forward.",
        "boxes",
        [
            lesson(
                "u40-l1",
                "Un modelo en papel",
                "Pyodide no trae TensorFlow; construimos la idea con NumPy (el mismo álgebra).",
                [
                    mc(
                        "u40-l1-e1",
                        "En Keras, `Sequential([Dense(8, activation='relu'), Dense(1, activation='sigmoid')])` es…",
                        [
                            ("a", "Una red de una capa oculta de 8 neuronas y una salida binaria"),
                            ("b", "Un random forest"),
                            ("c", "Un DataFrame"),
                        ],
                        "a",
                        "Sequential apila capas. Dense = totalmente conectada. En PyTorch sería nn.Linear.",
                    ),
                    matching(
                        "u40-l1-e2",
                        "Empareja el concepto de framework con NumPy.",
                        [
                            {"id": "l1", "text": "tensor"},
                            {"id": "l2", "text": "forward"},
                            {"id": "l3", "text": "loss"},
                        ],
                        [
                            {"id": "r1", "text": "ndarray con autograd en DL"},
                            {"id": "r2", "text": "Calcular y_hat = modelo(x)"},
                            {"id": "r3", "text": "Número que mide el error a minimizar"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "El framework guarda el grafo para derivar. El álgebra es la misma que ya usas.",
                    ),
                    fill(
                        "u40-l1-e3",
                        "Producto matricial de una capa.",
                        "h = X ___ W + b",
                        [{"accepted": ["@", "."]}],
                        "@ es matmul. X es (batch, features), W (features, unidades).",
                    ),
                    code(
                        "u40-l1-e4",
                        "Forward mini-batch: `X` shape (2, 3) de unos, `W` (3, 1) de 0.5, `b=0`. `y_hat = X @ W + b`. Imprime `y_hat[0,0]`.",
                        "import numpy as np\nX = np.ones((2, 3))\nW = np.full((3, 1), 0.5)\nb = 0.0\n",
                        ["abs(float(y_hat[0, 0]) - 1.5) < 1e-8"],
                        "import numpy as np\nX = np.ones((2, 3))\nW = np.full((3, 1), 0.5)\nb = 0.0\ny_hat = X @ W + b\nprint(y_hat[0, 0])",
                        "Tres features a 1 × 0.5 = 1.5. El batch de 2 filas recibe el mismo cálculo.",
                        expected_stdout="1.5",
                    ),
                    predict(
                        "u40-l1-e5",
                        "Si el batch_size es 32, la primera dimensión de X en el forward suele ser…",
                        "print(32)",
                        "32",
                        "Se procesan 32 ejemplos a la vez: más estable y más rápido en GPU/CPU vectorizada.",
                    ),
                    find_err(
                        "u40-l1-e6",
                        "W tiene forma (4, 8) y X (32, 3). ¿Por qué el forward falla?",
                        [
                            ("a", "features de X (3) ≠ filas de W (4): las formas no alinean"),
                            ("b", "32 no es potencia de 2"),
                            ("c", "b siempre debe ser un string"),
                        ],
                        "a",
                        "X @ W exige X.shape[-1] == W.shape[0]. Lee los ValueError de matmul: son un mapa.",
                    ),
                    code(
                        "u40-l1-e7",
                        "MSE a mano: `y = np.array([1., 2.])`, `y_hat = np.array([1., 4.])`, `mse = ((y-y_hat)**2).mean()`. Imprime `mse`.",
                        "import numpy as np\ny = np.array([1., 2.])\ny_hat = np.array([1., 4.])\n",
                        ["abs(float(mse) - 2) < 1e-8"],
                        "import numpy as np\ny = np.array([1., 2.])\ny_hat = np.array([1., 4.])\nmse = ((y - y_hat) ** 2).mean()\nprint(mse)",
                        "Errores 0 y 2; cuadrados 0 y 4; media 2. MSE es la loss clásica de regresión.",
                        expected_stdout="2.0",
                    ),
                    mc(
                        "u40-l1-e8",
                        "En este entorno usamos NumPy porque TensorFlow/PyTorch…",
                        [
                            ("a", "No corren bien (o no caben) en Pyodide; el álgebra se aprende igual"),
                            ("b", "Están prohibidos por ley"),
                            ("c", "No sirven para clasificación"),
                        ],
                        "a",
                        "El modo Docker opcional permite TF más adelante. Dominar tensores con NumPy es el prerrequisito.",
                    ),
                ],
            )
        ],
    )


def s6_u41():
    return unit(
        "u41",
        41,
        "Entrenamiento",
        "Épocas, batch, loss y descenso de gradiente: el gimnasio del modelo.",
        "dumbbell",
        [
            lesson(
                "u41-l1",
                "Bajar la loss",
                "Un paso de gradiente que sí puedes ver.",
                [
                    mc(
                        "u41-l1-e1",
                        "Una época es…",
                        [
                            ("a", "Una pasada completa por el dataset de entrenamiento"),
                            ("b", "Un único ejemplo"),
                            ("c", "El accuracy en test"),
                        ],
                        "a",
                        "Con 1000 filas y batch 100, una época son 10 updates (pasos).",
                    ),
                    matching(
                        "u41-l1-e2",
                        "Empareja el hiperparámetro con su efecto.",
                        [
                            {"id": "l1", "text": "learning rate alto"},
                            {"id": "l2", "text": "learning rate minúsculo"},
                            {"id": "l3", "text": "batch size 1"},
                        ],
                        [
                            {"id": "r1", "text": "Puede divergir (la loss salta)"},
                            {"id": "r2", "text": "Aprende muy despacio"},
                            {"id": "r3", "text": "Gradiente ruidoso (SGD puro)"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Adam adapta tasas; igual debes vigilar la curva de loss.",
                    ),
                    fill(
                        "u41-l1-e3",
                        "Actualización de un peso.",
                        "w = w - lr * ___",
                        [{"accepted": ["grad", "gradient", "dw", "g"]}],
                        "Restamos el gradiente: bajamos por la pendiente de la loss.",
                    ),
                    code(
                        "u41-l1-e4",
                        "Un paso: `w=0.0`, `x=2`, `y=4` (queremos w*x ≈ y), `pred=w*x`, `g = 2*(pred-y)*x`, `w = w - 0.1*g`. Imprime `round(w, 2)`.",
                        "w, x, y, lr = 0.0, 2.0, 4.0, 0.1\n",
                        ["abs(float(w) - 1.6) < 1e-8"],
                        "w, x, y, lr = 0.0, 2.0, 4.0, 0.1\npred = w * x\ng = 2 * (pred - y) * x\nw = w - lr * g\nprint(round(w, 2))",
                        "pred=0, g=2*(0-4)*2=-16, w=0-0.1*(-16)=1.6. Hacia el 2 verdadero.",
                        expected_stdout="1.6",
                    ),
                    predict(
                        "u41-l1-e5",
                        "Si la loss de train baja y la de validación sube, es señal de…",
                        "print('overfitting')",
                        "overfitting",
                        "El modelo se especializa en train. Early stopping corta en el mejor val.",
                    ),
                    find_err(
                        "u41-l1-e6",
                        "Optimizas la loss de test en un bucle para 'elegir la mejor época'. ¿Qué rompiste?",
                        [
                            ("a", "El test dejó de ser test: conviértelo en validación y reserva un holdout final"),
                            ("b", "Las épocas no existen"),
                            ("c", "Hay que usar más colores"),
                        ],
                        "a",
                        "Tres conjuntos: train / val (decisiones) / test (reporte único al final).",
                    ),
                    code(
                        "u41-l1-e7",
                        "Simula 5 épocas del mismo paso de e4 en un bucle y deja `w` final. Imprime `round(w, 2)`.",
                        "w, x, y, lr = 0.0, 2.0, 4.0, 0.1\n",
                        ["abs(float(w) - 2) < 0.15"],
                        "w, x, y, lr = 0.0, 2.0, 4.0, 0.1\nfor _ in range(5):\n    pred = w * x\n    g = 2 * (pred - y) * x\n    w = w - lr * g\nprint(round(w, 2))",
                        "Con varios pasos, w se acerca a 2. Eso es entrenar.",
                    ),
                    mc(
                        "u41-l1-e8",
                        "Adam, SGD y RMSprop son…",
                        [
                            ("a", "Optimizadores: reglas para aplicar el gradiente a los pesos"),
                            ("b", "Funciones de activación"),
                            ("c", "Datasets de Kaggle"),
                        ],
                        "a",
                        "El optimizador no cambia la arquitectura; cambia cómo caminas por el paisaje de la loss.",
                    ),
                ],
            )
        ],
    )


def project_unit(uid, index, title, description, icon, prompt, solution, tests, files=None):
    exercises = [
        mc(
            f"{uid}-q1",
            f"Este proyecto ({title}) se evalúa sobre todo por…",
            [
                ("a", "Un checklist: el código corre, el resultado numérico cuadra y documentas la decisión"),
                ("b", "La longitud del notebook"),
                ("c", "Usar la librería más de moda"),
            ],
            "a",
            "Los proyectos de portafolio ganan por claridad reproducible, no por pila infinita.",
        ),
        code(
            f"{uid}-q2",
            prompt,
            "",
            tests,
            solution,
            "Si pasa los asserts, cumples el núcleo cuantitativo del proyecto. En un portafolio real, añade un párrafo de conclusiones.",
            files=files,
            etype="data" if files else "code",
            xp=30,
            difficulty=4,
        ),
        matching(
            f"{uid}-q3",
            "Checklist de calidad de un proyecto de datos.",
            [
                {"id": "l1", "text": "Reproducibilidad"},
                {"id": "l2", "text": "Validación"},
                {"id": "l3", "text": "Comunicación"},
            ],
            [
                {"id": "r1", "text": "Semilla, entorno y datos versionados"},
                {"id": "r2", "text": "Métrica en un conjunto no usado para entrenar"},
                {"id": "r3", "text": "Gráfico y párrafo que un no técnico entiende"},
            ],
            {"l1": "r1", "l2": "r2", "l3": "r3"},
            "Ese trío es el 'boss level': no basta con que el modelo compile.",
        ),
    ]
    return unit(
        uid,
        index,
        title,
        description,
        icon,
        [lesson(f"{uid}-l1", title, description, exercises)],
        is_project=True,
    )


def placement_unit():
    exercises = [
        mc(
            "pl-1",
            "¿Qué imprime `print(type(3.0).__name__)`?",
            [("a", "float"), ("b", "int"), ("c", "str")],
            "a",
            "3.0 es float.",
            xp=8,
        ),
        predict(
            "pl-2",
            "¿Salida?",
            "print('py' * 2)",
            "pypy",
            "El operador * en strings repite.",
            xp=8,
        ),
        mc(
            "pl-3",
            "`xs[-1]` en `xs = [10, 20, 30]` vale…",
            [("a", "30"), ("b", "10"), ("c", "20")],
            "a",
            "Índice negativo: último elemento.",
            xp=8,
        ),
        fill(
            "pl-4",
            "Completa el f-string.",
            'n = 3\nprint(f"hay {___} gatos")',
            [{"accepted": ["n"]}],
            "Las llaves interpolan la variable.",
            xp=8,
        ),
        mc(
            "pl-5",
            "¿Qué estructura usa pares clave-valor?",
            [("a", "dict"), ("b", "list"), ("c", "tuple")],
            "a",
            "Los diccionarios mapean claves a valores.",
            xp=8,
        ),
        predict(
            "pl-6",
            "¿Salida?",
            "print(sum([1, 2, 3]))",
            "6",
            "sum recorre e incorpora.",
            xp=8,
        ),
        mc(
            "pl-7",
            "`np.array([1,2,3]) * 2` produce…",
            [("a", "array([2, 4, 6])"), ("b", "array([1, 2, 3, 1, 2, 3])"), ("c", "error")],
            "a",
            "Multiplicar un ndarray por un escalar es vectorizado.",
            xp=10,
        ),
        fill(
            "pl-8",
            "Media de un array.",
            "import numpy as np\nnp.___([1, 3, 5])",
            [{"accepted": ["mean"]}],
            "mean es la media aritmética.",
            xp=10,
        ),
        mc(
            "pl-9",
            "`df.loc[df.edad > 18, 'nombre']` selecciona…",
            [
                ("a", "Los nombres de las filas con edad > 18"),
                ("b", "Todas las columnas de menores"),
                ("c", "Un heatmap"),
            ],
            "a",
            "Máscara de filas + una columna.",
            xp=12,
        ),
        predict(
            "pl-10",
            "¿Salida?",
            "print(list(range(3)))",
            "[0, 1, 2]",
            "range(3) es 0,1,2.",
            xp=8,
        ),
        mc(
            "pl-11",
            "train_test_split sirve para…",
            [
                ("a", "Separar datos de aprendizaje y de evaluación"),
                ("b", "Limpiar nulos"),
                ("c", "Dibujar un boxplot"),
            ],
            "a",
            "Evita evaluar con lo que ya se memorizó.",
            xp=12,
        ),
        matching(
            "pl-12",
            "Empareja librería y uso.",
            [
                {"id": "l1", "text": "pandas"},
                {"id": "l2", "text": "matplotlib"},
                {"id": "l3", "text": "scikit-learn"},
            ],
            [
                {"id": "r1", "text": "Tablas y limpieza"},
                {"id": "r2", "text": "Gráficos"},
                {"id": "r3", "text": "Modelos clásicos de ML"},
            ],
            {"l1": "r1", "l2": "r2", "l3": "r3"},
            "El stack clásico de análisis en Python.",
            xp=12,
        ),
    ]
    return unit(
        "placement",
        0,
        "Test de nivel",
        "12 preguntas de dificultad creciente para colocarte en el árbol.",
        "compass",
        [lesson("placement-l1", "Test de nivel", "Responde con calma. No pierdes corazones.", exercises)],
    )


def build():
    R = remaining_by_id()
    temps = "dia,temp\n1,12.0\n2,15.5\n3,14.0\n4,18.2\n5,17.0\n"
    titanic_mini = "survived,pclass,sex,age\n1,1,female,38\n0,3,male,22\n1,3,female,26\n0,1,male,54\n"
    sections = [
        {
            "id": "s0",
            "index": 0,
            "title": "Fundamentos absolutos",
            "subtitle": "De cero a pensar como programa",
            "color": "#7c3aed",
            "accent": "#c4b5fd",
            "units": [
                s0_u1(),
                s0_u2(),
                s0_u3(),
                R["u4"], R["u5"], R["u6"], R["u7"], R["u8"], R["u9"],
                R["u10"], R["u11"], R["u12"], R["u13"],
                project_unit(
                    "p0",
                    13.5,
                    "Proyecto: stats de bolsillo",
                    "Calculadora de media y máximo de una lista.",
                    "trophy",
                    "Escribe `resumen(xs)` que devuelva un dict con claves media y maximo. Llama `r = resumen([2, 4, 6])` e imprime `r['media']`.",
                    "def resumen(xs):\n    return {'media': sum(xs)/len(xs), 'maximo': max(xs)}\nr = resumen([2, 4, 6])\nprint(r['media'])",
                    ["abs(r['media'] - 4) < 1e-9", "r['maximo'] == 6"],
                ),
            ],
        },
        {
            "id": "s1",
            "index": 1,
            "title": "NumPy",
            "subtitle": "El motor numérico",
            "color": "#0891b2",
            "accent": "#67e8f9",
            "units": [
                s1_u14(),
                s1_u15(),
                s1_u16(),
                R["u17"], R["u18"],
                project_unit(
                    "p1",
                    18.5,
                    "Proyecto: temperaturas",
                    "Análisis numérico de una serie corta.",
                    "thermometer",
                    "Lee `temps.csv` (columnas dia,temp). Guarda `media` como la media de temp e imprime `round(media, 1)`.",
                    "import pandas as pd\ndf = pd.read_csv('temps.csv')\nmedia = df['temp'].mean()\nprint(round(media, 1))",
                    ["abs(float(media) - 15.34) < 0.05"],
                    files={"temps.csv": temps},
                ),
            ],
        },
        {
            "id": "s2",
            "index": 2,
            "title": "Visualización",
            "subtitle": "Matplotlib y Seaborn",
            "color": "#db2777",
            "accent": "#f9a8d4",
            "units": [
                s2_u19(),
                s2_u20(),
                s2_u21(),
                R["u22"],
                project_unit(
                    "p2",
                    22.5,
                    "Proyecto: dashboard estático",
                    "Dos paneles: histograma y barras.",
                    "layout-dashboard",
                    "Con matplotlib, crea 2 subplots: hist de [1,2,2,3] y bar A=3,B=5. `done = True`.",
                    "import matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2)\naxes[0].hist([1, 2, 2, 3])\naxes[1].bar(['A', 'B'], [3, 5])\ndone = True",
                    ["done is True"],
                ),
            ],
        },
        {
            "id": "s3",
            "index": 3,
            "title": "Pandas",
            "subtitle": "Manipulación de tablas",
            "color": "#4f46e5",
            "accent": "#a5b4fc",
            "units": [
                s3_u23(),
                s3_u24(),
                s3_u25(),
                R["u26"], R["u27"],
                project_unit(
                    "p3",
                    27.5,
                    "Proyecto: EDA mini-Titanic",
                    "Supervivencia media por clase (toy).",
                    "ship",
                    "Lee `titanic_mini.csv`. Guarda `tasa` = mean de survived e imprime `round(tasa, 2)`.",
                    "import pandas as pd\ndf = pd.read_csv('titanic_mini.csv')\ntasa = df['survived'].mean()\nprint(round(tasa, 2))",
                    ["abs(float(tasa) - 0.5) < 1e-9"],
                    files={"titanic_mini.csv": titanic_mini},
                ),
            ],
        },
        {
            "id": "s4",
            "index": 4,
            "title": "Estadística aplicada",
            "subtitle": "Descriptiva, distribuciones e inferencia",
            "color": "#ca8a04",
            "accent": "#fde047",
            "units": [
                s4_u28(),
                s4_u29(),
                s4_u30(),
                R["u31"],
                project_unit(
                    "p4",
                    31.5,
                    "Proyecto: informe estadístico",
                    "Media, mediana y un hallazgo.",
                    "file-bar-chart",
                    "`x = np.array([2, 3, 9, 10, 11])`. Guarda `mediana` y `media`. Imprime `int(mediana)`.",
                    "import numpy as np\nx = np.array([2, 3, 9, 10, 11])\nmediana = np.median(x)\nmedia = x.mean()\nprint(int(mediana))",
                    ["float(mediana) == 9", "abs(float(media) - 7) < 1e-8"],
                ),
            ],
        },
        {
            "id": "s5",
            "index": 5,
            "title": "Machine Learning",
            "subtitle": "Scikit-learn de principio a fin",
            "color": "#16a34a",
            "accent": "#86efac",
            "units": [
                s5_u32(),
                s5_u33(),
                s5_u34(),
                R["u35"], R["u36"], R["u37"], R["u38"],
                project_unit(
                    "p5",
                    38.5,
                    "Proyecto: modelo predictivo",
                    "Umbral como modelo baseline.",
                    "sparkles",
                    "X=[1,2,10], y=[0,0,1]. `pred = [0 if v < 5 else 1 for v in X]`. Accuracy exacta: imprime el entero 0-100%.",
                    "X = [1, 2, 10]\ny = [0, 0, 1]\npred = [0 if v < 5 else 1 for v in X]\nacc = sum(p == t for p, t in zip(pred, y)) / len(y)\nprint(int(acc * 100))",
                    ["pred == [0, 0, 1]"],
                ),
            ],
        },
        {
            "id": "s6",
            "index": 6,
            "title": "Deep Learning e IA",
            "subtitle": "De la neurona al entrenamiento (álgebra real)",
            "color": "#ea580c",
            "accent": "#fdba74",
            "units": [
                s6_u39(),
                s6_u40(),
                s6_u41(),
                R["u42"], R["u43"],
                project_unit(
                    "p6",
                    43.5,
                    "Proyecto final: clasificador toy",
                    "Un perceptrón a mano sobre 4 puntos.",
                    "award",
                    "Separa [0,0],[0,1] → 0 y [1,0],[1,1] → 1 con `pred = 1 if x+y >= 1 else 0`. Evalúa los 4 e imprime aciertos (0-4).",
                    "pts = [(0,0,0),(0,1,0),(1,0,1),(1,1,1)]\naciertos = 0\nfor x, y, t in pts:\n    pred = 1 if x + y >= 1 else 0\n    aciertos += int(pred == t)\nprint(aciertos)",
                    ["aciertos == 3 or aciertos == 4"],
                ),
            ],
        },
        {
            "id": "s7",
            "index": 7,
            "title": "Boss Level",
            "subtitle": "Proyectos integradores tipo Kaggle",
            "color": "#111827",
            "accent": "#fbbf24",
            "units": [
                project_unit(
                    "boss1",
                    44,
                    "Boss: EDA + insight",
                    "Limpia, resume y afirma algo cierto sobre un CSV.",
                    "swords",
                    "CSV `ventas.csv` con mes,unidades. Guarda `total` = suma de unidades e imprime total.",
                    "import pandas as pd\ndf = pd.read_csv('ventas.csv')\ntotal = int(df['unidades'].sum())\nprint(total)",
                    ["int(total) == 26"],
                    files={"ventas.csv": "mes,unidades\n1,10\n2,7\n3,9\n"},
                ),
                project_unit(
                    "boss2",
                    45,
                    "Boss: visualiza y modela",
                    "Baseline numérico + un gráfico mental.",
                    "crown",
                    "`y_true = np.array([0,0,1,1])`, `y_pred = np.array([0,1,1,1])`. Accuracy en `acc` e imprime `acc`.",
                    "import numpy as np\ny_true = np.array([0, 0, 1, 1])\ny_pred = np.array([0, 1, 1, 1])\nacc = (y_true == y_pred).mean()\nprint(acc)",
                    ["abs(float(acc) - 0.75) < 1e-9"],
                ),
                project_unit(
                    "boss3",
                    46,
                    "Boss: portafolio",
                    "Documenta un pipeline de 4 pasos en variables.",
                    "scroll",
                    "Crea `pasos = ['limpiar', 'explorar', 'modelar', 'comunicar']` e imprime `len(pasos)`.",
                    "pasos = ['limpiar', 'explorar', 'modelar', 'comunicar']\nprint(len(pasos))",
                    ["pasos == ['limpiar', 'explorar', 'modelar', 'comunicar']"],
                ),
            ],
        },
    ]

    # Fix p0 index: keep numeric order. Convert 13.5 etc to float is ok but
    # progress uses integer comparison with previous index. Let's use integers only.
    # I'll remap indices after flatten.

    badges = [
        {"id": "first-steps", "title": "Primeros pasos", "description": "Completaste el test de nivel o el onboarding.", "icon": "footprints", "check": "placement", "value": 1},
        {"id": "hello-python", "title": "Hola, Python", "description": "Terminaste la unidad 1.", "icon": "hand", "check": "unit", "value": "u1"},
        {"id": "numpy-ninja", "title": "Ninja de NumPy", "description": "Dominaste arrays.", "icon": "zap", "check": "unit", "value": "u14"},
        {"id": "viz-storyteller", "title": "Narrador visual", "description": "Completaste Matplotlib básico.", "icon": "line-chart", "check": "unit", "value": "u19"},
        {"id": "pandas-master", "title": "Maestro de Pandas", "description": "Tablas bajo control.", "icon": "table", "check": "unit", "value": "u23"},
        {"id": "stats-sage", "title": "Sabio estadístico", "description": "Descriptiva superada.", "icon": "sigma", "check": "unit", "value": "u28"},
        {"id": "ml-tamer", "title": "Domador de modelos", "description": "Entiendes qué es ML.", "icon": "brain", "check": "unit", "value": "u32"},
        {"id": "neural-spark", "title": "Chispa neuronal", "description": "Fundamentos de redes.", "icon": "network", "check": "unit", "value": "u39"},
        {"id": "streak-3", "title": "Racha ×3", "description": "Tres días seguidos.", "icon": "flame", "check": "streak", "value": 3},
        {"id": "streak-7", "title": "Semana legendaria", "description": "Siete días de racha.", "icon": "flame", "check": "streak", "value": 7},
        {"id": "streak-30", "title": "Hábito de hierro", "description": "30 días.", "icon": "flame", "check": "streak", "value": 30},
        {"id": "xp-500", "title": "500 XP", "description": "Tu primer medio millar.", "icon": "star", "check": "xp", "value": 500},
        {"id": "xp-2000", "title": "2000 XP", "description": "Ya no eres principiante.", "icon": "stars", "check": "xp", "value": 2000},
        {"id": "perfect-lesson", "title": "Lección perfecta", "description": "Cero errores en una lección.", "icon": "gem", "check": "perfect", "value": 1},
    ]

    # Reindex units 1..n skipping placement
    from extra_levels import attach_extra_levels

    attach_extra_levels(
        sections,
        lesson=lesson,
        mc=mc,
        fill=fill,
        predict=predict,
        code=code,
        matching=matching,
        find_err=find_err,
        reorder=reorder,
    )

    from interactive_exercises import enrich_curriculum

    enrich_curriculum(sections)

    n = 1
    for sec in sections:
        for u in sec["units"]:
            u["index"] = n
            n += 1

    placement = placement_unit()
    placement["index"] = 0

    curriculum = {
        "sections": sections,
        "badges": badges,
        "placementLessonId": "placement-l1",
        "placementUnit": placement,
    }
    def strip_nulls(obj):
        if isinstance(obj, dict):
            return {k: strip_nulls(v) for k, v in obj.items() if v is not None}
        if isinstance(obj, list):
            return [strip_nulls(x) for x in obj]
        return obj

    curriculum = strip_nulls(curriculum)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(curriculum, ensure_ascii=False, indent=2), encoding="utf-8")
    n_ex = sum(len(e) for s in sections for u in s["units"] for l in u["lessons"] for e in [l["exercises"]])
    n_units = sum(len(s["units"]) for s in sections)
    print(f"Wrote {OUT} — {n_units} units, {n_ex} exercises")


if __name__ == "__main__":
    build()
