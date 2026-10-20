#!/usr/bin/env python3
"""Generate the first three units of the Data Analysis and AI Agents courses."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from remaining_units import code, fill, find_err, lesson, matching, mc, predict, reorder, unit

ROOT = Path(__file__).resolve().parents[1] / "src" / "content"


def dump(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n_ex = sum(len(l["exercises"]) for s in payload["sections"] for u in s["units"] for l in u["lessons"])
    n_u = sum(len(s["units"]) for s in payload["sections"])
    print(f"Wrote {path.name} — {n_u} units, {n_ex} exercises")


def datos_course() -> dict:
    ventas = "semana,canal,unidades,precio\n1,web,4,10\n1,tienda,2,10\n2,web,6,12\n2,tienda,,12\n"
    da1 = unit(
        "da1",
        1,
        "Preguntas que un dato puede responder",
        "Antes de abrir Python: una pregunta, una tabla y una métrica con denominador.",
        "compass",
        [
            lesson(
                "da1-l1",
                "Una pregunta, una métrica",
                "Un análisis empieza por lo que quieres saber, no por el gráfico.",
                [
                    mc(
                        "da1-l1-e1",
                        "¿Cuál es una pregunta de análisis (no solo curiosidad)?",
                        [
                            ("a", "¿Qué canal vendió más unidades la semana 1, y con cuántas filas lo sabemos?"),
                            ("b", "¿El dashboard se ve moderno?"),
                            ("c", "¿Puedo usar diez colores en el gráfico?"),
                        ],
                        "a",
                        "Una pregunta de análisis nombra el recorte (semana 1), la métrica (unidades) y pide evidencia (n).",
                        hint="Busca recorte + métrica + evidencia.",
                    ),
                    matching(
                        "da1-l1-e2",
                        "Empareja cada pieza de una tabla con su rol.",
                        [
                            {"id": "l1", "text": "Fila"},
                            {"id": "l2", "text": "Columna"},
                            {"id": "l3", "text": "Métrica"},
                        ],
                        [
                            {"id": "r1", "text": "Una observación (un día, un pedido)"},
                            {"id": "r2", "text": "Una variable con el mismo significado en cada fila"},
                            {"id": "r3", "text": "El número que resume la pregunta"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Si mezclas el rol de fila y de métrica, el promedio deja de significar lo que crees.",
                    ),
                    predict(
                        "da1-l1-e3",
                        "Hay 4 pedidos. ¿Qué imprime este recuento?",
                        "pedidos = [4, 2, 6, 2]\nn = len(pedidos)\nprint(n)\nprint(sum(pedidos) / n)",
                        "4\n3.5",
                        "n=4 es el denominador. La media 14/4 = 3.5 solo tiene sentido junto a ese n.",
                    ),
                    fill(
                        "da1-l1-e4",
                        "Completa el denominador de la media.",
                        "valores = [10, 20, 30]\nmedia = sum(valores) / ___(valores)\nprint(media)",
                        [{"accepted": ["len"]}],
                        "Sin len, no hay media: estarías dividiendo por un número que no es el tamaño de la muestra.",
                    ),
                    code(
                        "da1-l1-e5",
                        "Con `ventas = [4, 2, 6]`, guarda `n` y `total`. Imprime `n` y, en la línea siguiente, `total`.",
                        "ventas = [4, 2, 6]\n",
                        ["n == 3", "total == 12"],
                        "ventas = [4, 2, 6]\nn = len(ventas)\ntotal = sum(ventas)\nprint(n)\nprint(total)",
                        "Primero cuentas, después sumas. El KPI se arma con ambas cifras.",
                        expected_stdout="3\n12",
                        hint="len cuenta filas; sum agrega la métrica.",
                    ),
                ],
            ),
            lesson(
                "da1-l2",
                "Afianza: recorte y evidencia",
                "El mismo número miente si cambias el recorte o escondes el n.",
                [
                    mc(
                        "da1-l2-e1",
                        "La web vendió 4 y la tienda 2. ¿Qué afirmación es honesta?",
                        [
                            ("a", "La web vendió el doble de unidades que la tienda en esas dos filas"),
                            ("b", "La web siempre vende el doble"),
                            ("c", "La tienda no existe"),
                        ],
                        "a",
                        "Limita la frase a los datos que viste. 'Siempre' es una generalización que esos dos números no prueban.",
                    ),
                    predict(
                        "da1-l2-e2",
                        "Filtramos la semana 1. ¿Qué imprime?",
                        "filas = [('1', 4), ('1', 2), ('2', 6)]\nsemana1 = [u for s, u in filas if s == '1']\nprint(len(semana1))\nprint(sum(semana1))",
                        "2\n6",
                        "El recorte deja 2 filas (4 y 2). El total 6 no se puede comparar con la semana 2 sin decir que n cambió.",
                    ),
                    find_err(
                        "da1-l2-e3",
                        "¿Qué está mal si quieres la media de unidades?\n\n```python\nvalores = []\nmedia = sum(valores) / len(valores)\n```",
                        [
                            ("a", "La lista está vacía: len es 0 y la división falla"),
                            ("b", "sum no existe en Python"),
                            ("c", "Las medias solo se calculan con pandas"),
                        ],
                        "a",
                        "Antes de dividir, comprueba n. Una muestra vacía no tiene media.",
                        starter="valores = []\nmedia = sum(valores) / len(valores)",
                    ),
                    matching(
                        "da1-l2-e4",
                        "Empareja el error con su consecuencia.",
                        [
                            {"id": "l1", "text": "Olvidar n"},
                            {"id": "l2", "text": "Mezclar semanas"},
                            {"id": "l3", "text": "Usar el máximo como si fuera la media"},
                        ],
                        [
                            {"id": "r1", "text": "No sabes si el porcentaje sale de 3 o de 300 filas"},
                            {"id": "r2", "text": "Un pico de un día se hace pasar por el mes entero"},
                            {"id": "r3", "text": "El extremo se presenta como lo habitual"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "El analista nombra recorte, n y si el número es centro o extremo.",
                    ),
                    code(
                        "da1-l2-e5",
                        "De `filas = [('web', 4), ('tienda', 2), ('web', 6)]`, guarda `web` con las unidades del canal web e imprime `sum(web)`.",
                        "filas = [('web', 4), ('tienda', 2), ('web', 6)]\n",
                        ["web == [4, 6]"],
                        "filas = [('web', 4), ('tienda', 2), ('web', 6)]\nweb = [u for canal, u in filas if canal == 'web']\nprint(sum(web))",
                        "El filtro es el recorte. Aquí web suma 10 con n=2.",
                        expected_stdout="10",
                    ),
                ],
                level=2,
            ),
            lesson(
                "da1-l3",
                "Practica: tu primer KPI",
                "Calcula n, total y media y escríbelos juntos.",
                [
                    reorder(
                        "da1-l3-e1",
                        "Ordena el análisis: datos, recuento, métrica, mensaje.",
                        [
                            {"id": "a", "code": "ventas = [4, 2, 6]"},
                            {"id": "b", "code": "n = len(ventas)"},
                            {"id": "c", "code": "media = sum(ventas) / n"},
                            {"id": "d", "code": "print(n, media)"},
                        ],
                        ["a", "b", "c", "d"],
                        "Si imprimieras antes de calcular n, no tendrías denominador.",
                    ),
                    predict(
                        "da1-l3-e2",
                        "¿Qué imprime el informe mínimo?",
                        "n = 3\ntotal = 12\nprint(f'n={n}; total={total}')",
                        "n=3; total=12",
                        "El f-string conserva ambas cifras. Un 12 suelto no dice de cuántas filas sale.",
                    ),
                    mc(
                        "da1-l3-e3",
                        "Un colega dice: 'las ventas son 12'. ¿Qué falta para que sea un KPI usable?",
                        [
                            ("a", "El recorte (qué periodo, qué canal) y el n"),
                            ("b", "Un modelo de deep learning"),
                            ("c", "Que el 12 sea un entero, no un float"),
                        ],
                        "a",
                        "12 unidades ¿de un día o de un año? El número sin recorte no se puede comparar.",
                    ),
                    fill(
                        "da1-l3-e4",
                        "Completa el informe con n y total.",
                        "ventas = [4, 2, 6]\nn = len(ventas)\ntotal = ___(ventas)\nprint(f'n={n}; total={total}')",
                        [{"accepted": ["sum"]}],
                        "sum agrega la métrica; len ya había contado las observaciones.",
                    ),
                    code(
                        "da1-l3-e5",
                        "Con `ventas = [4, 2, 6, 8]`, guarda `n`, `total` y `media`. Imprime `int(media)` (la parte entera).",
                        "ventas = [4, 2, 6, 8]\n",
                        ["n == 4", "total == 20", "abs(float(media) - 5) < 1e-9"],
                        "ventas = [4, 2, 6, 8]\nn = len(ventas)\ntotal = sum(ventas)\nmedia = total / n\nprint(int(media))",
                        "20/4 = 5. int(media) muestra 5; la media real sigue siendo 5.0.",
                        expected_stdout="5",
                    ),
                ],
                level=3,
            ),
        ],
    )

    da2 = unit(
        "da2",
        2,
        "Limpiar sin esconder el sucio",
        "Nulos, tipos y agrupaciones: documenta lo que cambias antes de resumir.",
        "filter",
        [
            lesson(
                "da2-l1",
                "Nulos a la vista",
                "Un hueco en la tabla no es un cero hasta que tú lo decidas.",
                [
                    mc(
                        "da2-l1-e1",
                        "En una columna de unidades, un valor ausente (NaN) significa…",
                        [
                            ("a", "Que no hay dato: no es lo mismo que cero ventas"),
                            ("b", "Que se vendió exactamente 0"),
                            ("c", "Que la fila se puede borrar siempre"),
                        ],
                        "a",
                        "Cero es una medición. NaN es 'no sé'. Convertir uno en el otro cambia el total.",
                    ),
                    predict(
                        "da2-l1-e2",
                        "Pandas omite el nulo al calcular la media. ¿Qué imprime?",
                        "import pandas as pd\ns = pd.Series([4.0, None, 6.0])\nprint(int(s.isna().sum()))\nprint(s.mean())",
                        "1\n5.0",
                        "Hay 1 nulo. La media usa 4 y 6 (n efectivo = 2), no tres filas.",
                    ),
                    find_err(
                        "da2-l1-e3",
                        "¿Qué problema tiene este resumen?\n\n```python\nimport pandas as pd\ns = pd.Series([4.0, None, 6.0])\nprint(s.fillna(0).mean())\n```",
                        [
                            ("a", "Rellena el nulo con 0 y baja la media a 3.33 sin avisarlo"),
                            ("b", "fillna no existe"),
                            ("c", "None no se puede guardar en una Series"),
                        ],
                        "a",
                        "fillna(0) convierte 'no sé' en cero ventas. Si lo haces, dilo y reporta cuántos valores tocaste.",
                        starter="import pandas as pd\ns = pd.Series([4.0, None, 6.0])\nprint(s.fillna(0).mean())",
                    ),
                    fill(
                        "da2-l1-e4",
                        "Cuenta cuántos nulos hay en la serie.",
                        "import pandas as pd\ns = pd.Series([4.0, None, 6.0])\nnulos = int(s.___().sum())\nprint(nulos)",
                        [{"accepted": ["isna"]}],
                        "isna() marca True donde falta el valor. sum() cuenta esos True.",
                    ),
                    code(
                        "da2-l1-e5",
                        "Lee `ventas.csv`. Guarda `nulos` = número de unidades ausentes e imprime `nulos`.",
                        "import pandas as pd\n",
                        ["int(nulos) == 1"],
                        "import pandas as pd\ndf = pd.read_csv('ventas.csv')\nnulos = int(df['unidades'].isna().sum())\nprint(nulos)",
                        "Solo la fila de tienda en semana 2 tiene unidades vacías.",
                        expected_stdout="1",
                        files={"ventas.csv": ventas},
                        etype="data",
                    ),
                ],
            ),
            lesson(
                "da2-l2",
                "Afianza: agrupar con el tamaño a cuestas",
                "Un 100% de un grupo de 1 fila no es una ley.",
                [
                    predict(
                        "da2-l2-e1",
                        "¿Qué imprime este groupby?",
                        "import pandas as pd\ndf = pd.DataFrame({'canal': ['web', 'web', 'tienda'], 'unidades': [4, 6, 2]})\nprint(df.groupby('canal')['unidades'].sum().to_dict())",
                        "{'tienda': 2, 'web': 10}",
                        "web junta 4+6=10; tienda queda en 2. pandas ordena las claves alfabéticamente en el dict.",
                    ),
                    mc(
                        "da2-l2-e2",
                        "La tienda tiene 1 fila y la web 2. Comparas la media de cada canal. ¿Qué debes reportar?",
                        [
                            ("a", "La media y el n de cada grupo"),
                            ("b", "Solo la media más alta"),
                            ("c", "Nada: groupby no sirve con n distinto"),
                        ],
                        "a",
                        "n=1 hace frágil cualquier media. El hallazgo incluye el tamaño.",
                    ),
                    matching(
                        "da2-l2-e3",
                        "Empareja la agregación con lo que cuenta.",
                        [
                            {"id": "l1", "text": "sum"},
                            {"id": "l2", "text": "mean"},
                            {"id": "l3", "text": "size / count"},
                        ],
                        [
                            {"id": "r1", "text": "Total de la métrica"},
                            {"id": "r2", "text": "Centro, sensible al n y a extremos"},
                            {"id": "r3", "text": "Cuántas filas hay en el grupo"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "size responde '¿con cuántas filas hablo?'; mean responde '¿qué es típico?'.",
                    ),
                    fill(
                        "da2-l2-e4",
                        "Agrupa por canal y suma unidades.",
                        "import pandas as pd\ndf = pd.DataFrame({'canal': ['web', 'tienda'], 'unidades': [4, 2]})\nprint(df.___('canal')['unidades'].sum().to_dict())",
                        [{"accepted": ["groupby"]}],
                        "groupby separa; después eliges la columna y la agregación.",
                    ),
                    code(
                        "da2-l2-e5",
                        "Con el DataFrame de `filas`, guarda `por_canal` = suma de unidades por canal (dict) e imprime `por_canal['web']`.",
                        "import pandas as pd\nfilas = pd.DataFrame({'canal': ['web', 'tienda', 'web'], 'unidades': [4, 2, 6]})\n",
                        ["por_canal['web'] == 10", "por_canal['tienda'] == 2"],
                        "import pandas as pd\nfilas = pd.DataFrame({'canal': ['web', 'tienda', 'web'], 'unidades': [4, 2, 6]})\npor_canal = filas.groupby('canal')['unidades'].sum().to_dict()\nprint(por_canal['web'])",
                        "El dict permite consultar un grupo por nombre. web = 10.",
                        expected_stdout="10",
                    ),
                ],
                level=2,
            ),
            lesson(
                "da2-l3",
                "Practica: limpieza de un CSV",
                "Cuenta nulos, decide un recorte y resume lo válido.",
                [
                    mc(
                        "da2-l3-e1",
                        "Tienes 1 nulo en 4 filas de unidades. ¿Qué haces primero?",
                        [
                            ("a", "Contarlo y decidir si excluyes esa fila o la imputas, dejándolo escrito"),
                            ("b", "Borrar todas las filas porque el archivo está sucio"),
                            ("c", "Rellenar con 1 000 000 para que no moleste"),
                        ],
                        "a",
                        "La limpieza es una decisión. El informe debe poder repetirse.",
                    ),
                    predict(
                        "da2-l3-e2",
                        "Excluimos filas sin unidades. ¿Cuántas quedan y cuál es el total?",
                        "import pandas as pd\ndf = pd.DataFrame({'unidades': [4.0, 2.0, 6.0, None]})\nlimpio = df.dropna(subset=['unidades'])\nprint(len(limpio))\nprint(int(limpio['unidades'].sum()))",
                        "3\n12",
                        "Cae la fila nula. Quedan 4+2+6 = 12 unidades en 3 filas.",
                    ),
                    find_err(
                        "da2-l3-e3",
                        "¿Qué falla al convertir precio si hay texto basura?\n\n```python\nimport pandas as pd\ns = pd.Series(['10', 'doce', '12'])\nprint(s.astype(int).mean())\n```",
                        [
                            ("a", "astype(int) no perdona 'doce': hay que to_numeric con errors='coerce'"),
                            ("b", "mean no funciona con números"),
                            ("c", "Las Series no aceptan texto"),
                        ],
                        "a",
                        "to_numeric(..., errors='coerce') convierte basura en NaN. Después decides qué hacer con esos NaN.",
                        starter="import pandas as pd\ns = pd.Series(['10', 'doce', '12'])\nprint(s.astype(int).mean())",
                    ),
                    code(
                        "da2-l3-e4",
                        "Lee `ventas.csv`, descarta filas sin unidades, guarda `n` y `total` (suma de unidades). Imprime `n` y `int(total)`.",
                        "import pandas as pd\n",
                        ["int(n) == 3", "int(total) == 12"],
                        "import pandas as pd\ndf = pd.read_csv('ventas.csv')\nlimpio = df.dropna(subset=['unidades'])\nn = len(limpio)\ntotal = limpio['unidades'].sum()\nprint(n)\nprint(int(total))",
                        "Documentar n=3 y total=12 deja visible que una fila no entró al KPI.",
                        expected_stdout="3\n12",
                        files={"ventas.csv": ventas},
                        etype="data",
                    ),
                    matching(
                        "da2-l3-e5",
                        "Empareja la herramienta con el momento.",
                        [
                            {"id": "l1", "text": "isna().sum()"},
                            {"id": "l2", "text": "to_numeric(errors='coerce')"},
                            {"id": "l3", "text": "dropna(subset=['unidades'])"},
                        ],
                        [
                            {"id": "r1", "text": "Contar huecos antes de decidir"},
                            {"id": "r2", "text": "Convertir texto no numérico en NaN"},
                            {"id": "r3", "text": "Excluir filas sin la métrica"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "El orden importa: contar, convertir, y solo entonces recortar.",
                    ),
                ],
                level=3,
            ),
        ],
    )

    da3 = unit(
        "da3",
        3,
        "Contar el hallazgo",
        "Un gráfico y una frase que se pueden verificar: título, unidades y denominador.",
        "bar-chart-3",
        [
            lesson(
                "da3-l1",
                "El gráfico responde la pregunta",
                "Barras comparan categorías; la línea sigue un orden temporal.",
                [
                    mc(
                        "da3-l1-e1",
                        "¿Qué gráfico encaja para comparar unidades de web vs tienda?",
                        [
                            ("a", "Barras: una categoría, una altura"),
                            ("b", "Un mapa 3D rotatorio"),
                            ("c", "Un gráfico de pastel con 40 rebanadas"),
                        ],
                        "a",
                        "Dos canales son categorías. Las barras hacen visible 10 vs 2 sin teatro.",
                    ),
                    predict(
                        "da3-l1-e2",
                        "El título debe decir el hallazgo. ¿Qué imprime este chequeo?",
                        "web, tienda = 10, 2\nprint('La web vendió', web - tienda, 'unidades más')",
                        "La web vendió 8 unidades más",
                        "El título o la frase cuantifican. 'Ventas' como título no dice quién gana ni por cuánto.",
                    ),
                    matching(
                        "da3-l1-e3",
                        "Empareja el elemento visual con su trabajo.",
                        [
                            {"id": "l1", "text": "Título"},
                            {"id": "l2", "text": "Etiqueta del eje Y"},
                            {"id": "l3", "text": "Leyenda"},
                        ],
                        [
                            {"id": "r1", "text": "El hallazgo en una frase"},
                            {"id": "r2", "text": "La unidad (unidades, USD, %)"},
                            {"id": "r3", "text": "Quién es cada serie si hay más de una"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Sin unidad, una barra de 10 no se sabe si son pedidos o millones.",
                    ),
                    fill(
                        "da3-l1-e4",
                        "Completa la llamada de barras: categorías y alturas, en ese orden.",
                        "import matplotlib.pyplot as plt\nplt.___(['web', 'tienda'], [10, 2])",
                        [{"accepted": ["bar"]}],
                        "plt.bar(x, altura). El primer argumento nombra; el segundo mide.",
                    ),
                    code(
                        "da3-l1-e5",
                        "Con `canales = ['web', 'tienda']` y `unidades = [10, 2]`, guarda `lider` = el canal con más unidades e imprime `lider`.",
                        "canales = ['web', 'tienda']\nunidades = [10, 2]\n",
                        ["lider == 'web'"],
                        "canales = ['web', 'tienda']\nunidades = [10, 2]\nlider = canales[unidades.index(max(unidades))]\nprint(lider)",
                        "index(max(...)) recupera la categoría del extremo. El gráfico debería decir lo mismo.",
                        expected_stdout="web",
                    ),
                ],
            ),
            lesson(
                "da3-l2",
                "Afianza: unidades y denominadores",
                "Un 25% sin total es un número huérfano.",
                [
                    predict(
                        "da3-l2-e1",
                        "¿Qué imprime el porcentaje bien presentado?",
                        "casos, total = 3, 12\npct = casos / total * 100\nprint(f'{casos} de {total}: {pct:.0f}%')",
                        "3 de 12: 25%",
                        "El 25% se sostiene porque se ve el 3 y el 12.",
                    ),
                    mc(
                        "da3-l2-e2",
                        "Un eje Y que empieza en 9.8 en vez de 0, con valores 10 y 10.2, suele…",
                        [
                            ("a", "Exagerar una diferencia pequeña"),
                            ("b", "Hacer el análisis más científico"),
                            ("c", "Ser obligatorio en barras"),
                        ],
                        "a",
                        "En barras, el cero ancla la altura. Truncar el eje convierte un empate casi total en un abismo.",
                    ),
                    find_err(
                        "da3-l2-e3",
                        "¿Qué problema tiene este porcentaje?\n\n```python\ncasos = 3\nprint(f'{casos}%')\n```",
                        [
                            ("a", "No hay denominador: 3% de qué total"),
                            ("b", "Las f-strings no aceptan números"),
                            ("c", "El símbolo % está prohibido"),
                        ],
                        "a",
                        "3% podría ser 3 de 100 o 3 de 3. Sin total, no es un KPI.",
                        starter="casos = 3\nprint(f'{casos}%')",
                    ),
                    fill(
                        "da3-l2-e4",
                        "Calcula el porcentaje con denominador.",
                        "casos, total = 3, 12\npct = casos / ___ * 100\nprint(int(pct))",
                        [{"accepted": ["total"]}],
                        "Dividir por total (12) produce 25.",
                    ),
                    code(
                        "da3-l2-e5",
                        "`casos = 6` y `total = 24`. Guarda `pct` (0-100) e imprime `int(pct)`.",
                        "casos = 6\ntotal = 24\n",
                        ["abs(float(pct) - 25) < 1e-9"],
                        "casos = 6\ntotal = 24\npct = casos / total * 100\nprint(int(pct))",
                        "6/24 = 0.25 → 25%. El entero 25 se puede verificar a mano.",
                        expected_stdout="25",
                    ),
                ],
                level=2,
            ),
            lesson(
                "da3-l3",
                "Demuestra: insight de dos semanas",
                "Cierra el ciclo: limpiar, comparar, decir el hallazgo con n.",
                [
                    predict(
                        "da3-l3-e1",
                        "Tras dropear el nulo, ¿qué imprime el total por semana?",
                        "import pandas as pd\ndf = pd.DataFrame({'semana': [1, 1, 2, 2], 'unidades': [4.0, 2.0, 6.0, None]}).dropna(subset=['unidades'])\nprint(df.groupby('semana')['unidades'].sum().to_dict())",
                        "{1: 6.0, 2: 6.0}",
                        "Semana 1: 4+2=6. Semana 2: solo queda 6 (la otra fila era NaN). El empate 6-6 esconde un nulo.",
                    ),
                    mc(
                        "da3-l3-e2",
                        "Las dos semanas suman 6 unidades, pero la 2 tiene una fila menos. ¿Qué dices?",
                        [
                            ("a", "El total empató, pero la semana 2 se calculó con n menor por un nulo en tienda"),
                            ("b", "Las semanas son idénticas en todo"),
                            ("c", "Hay que multiplicar la semana 2 por 2"),
                        ],
                        "a",
                        "Igualar totales no iguala la evidencia. El nulo es parte del hallazgo.",
                    ),
                    code(
                        "da3-l3-e3",
                        "Lee `ventas.csv`, descarta nulos de unidades, guarda `por_semana` (suma por semana como dict) e imprime `int(por_semana[1])`.",
                        "import pandas as pd\n",
                        ["int(por_semana[1]) == 6", "int(por_semana[2]) == 6"],
                        "import pandas as pd\ndf = pd.read_csv('ventas.csv').dropna(subset=['unidades'])\npor_semana = df.groupby('semana')['unidades'].sum().to_dict()\nprint(int(por_semana[1]))",
                        "El dict {1: 6, 2: 6} es correcto y todavía necesita la nota del nulo.",
                        expected_stdout="6",
                        files={"ventas.csv": ventas},
                        etype="data",
                    ),
                    matching(
                        "da3-l3-e4",
                        "Arma la frase del informe.",
                        [
                            {"id": "l1", "text": "Hallazgo"},
                            {"id": "l2", "text": "Evidencia"},
                            {"id": "l3", "text": "Límite"},
                        ],
                        [
                            {"id": "r1", "text": "Los totales semanales empatan en 6 unidades"},
                            {"id": "r2", "text": "n válido = 3 filas tras un NaN"},
                            {"id": "r3", "text": "No afirma qué pasará la semana 3"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Hallazgo + n + límite: el formato de un insight que se puede auditar.",
                    ),
                    fill(
                        "da3-l3-e5",
                        "Completa el agrupado del insight.",
                        "import pandas as pd\ndf = pd.read_csv('ventas.csv').dropna(subset=['unidades'])\nprint(df.___('semana')['unidades'].sum().to_dict())",
                        [{"accepted": ["groupby"]}],
                        "groupby('semana') es el recorte temporal del hallazgo.",
                    ),
                ],
                level=3,
            ),
        ],
    )

    return {
        "courseId": "python-datos",
        "sections": [
            {
                "id": "sda",
                "index": 0,
                "title": "Análisis de datos",
                "subtitle": "De la pregunta al insight verificable",
                "color": "#0f766e",
                "accent": "#5eead4",
                "units": [da1, da2, da3],
            }
        ],
    }


def agentes_course() -> dict:
    ag1 = unit(
        "ag1",
        1,
        "Prompts, tokens y agentes",
        "Un prompt es el texto que entra al modelo. Los tokens son las piezas. Un agente usa esa lectura para actuar.",
        "bot",
        [
            lesson(
                "ag1-prompt",
                "Qué es un prompt",
                "El prompt es la instrucción: rol, tarea, formato y límites, no un deseo vago.",
                [
                    mc(
                        "ag1-prompt-e1",
                        "¿Qué es un prompt?",
                        [
                            ("a", "El texto que le das al modelo: la tarea y el contexto para responder"),
                            ("b", "El peso del modelo en disco"),
                            ("c", "Un botón de enviar sin contenido"),
                        ],
                        "a",
                        "Sin prompt no hay tarea. El modelo completa a partir de ese texto.",
                    ),
                    mc(
                        "ag1-prompt-e2",
                        "¿Qué prompt pide un resultado que se puede revisar?",
                        [
                            ("a", "Resume en 2 frases. Incluye n y la unidad (kg)."),
                            ("b", "Hazlo bonito e inteligente."),
                            ("c", "Escribe algo de ventas."),
                        ],
                        "a",
                        "Rol, recorte y formato convierten una frase vaga en una instrucción auditable.",
                        difficulty=2,
                    ),
                    predict(
                        "ag1-prompt-e3",
                        "¿Qué imprime esta plantilla de prompt?",
                        "tarea = 'cita n'\nprint('Tarea: ' + tarea)",
                        "Tarea: cita n",
                        "El prompt se arma como texto. Aquí la tarea queda explícita en la frase.",
                    ),
                    fill(
                        "ag1-prompt-e4",
                        "Completa el rol al inicio del prompt.",
                        'rol = "analista"\nprompt = "Eres un " + ___',
                        [{"accepted": ["rol"]}],
                        "El rol le dice al modelo desde qué oficio debe responder.",
                    ),
                ],
            ),
            lesson(
                "ag1-tokens",
                "Tokens",
                "El modelo no lee letras sueltas: parte el texto en tokens y gasta un presupuesto.",
                [
                    mc(
                        "ag1-tokens-e1",
                        "¿Qué es un token?",
                        [
                            ("a", "Una pieza de texto (a veces una palabra, a veces un trozo) que el modelo cuenta"),
                            ("b", "Una contraseña del usuario"),
                            ("c", "Una fila de un CSV"),
                        ],
                        "a",
                        "El presupuesto del modelo se mide en tokens, no en páginas.",
                    ),
                    predict(
                        "ag1-tokens-e2",
                        "Un tokenizador de juguete parte por espacios. ¿Qué imprime?",
                        "texto = 'Hola agente'\nprint(len(texto.split()))",
                        "2",
                        "split() cuenta palabras. Un tokenizador real a veces parte una palabra en varios tokens.",
                    ),
                    mc(
                        "ag1-tokens-e3",
                        "Si el prompt más la respuesta no caben en la ventana de contexto…",
                        [
                            ("a", "El modelo no puede ver todo: se corta el principio o no entra la respuesta"),
                            ("b", "Se crean tokens gratis"),
                            ("c", "El CSV se ordena solo"),
                        ],
                        "a",
                        "La ventana es un presupuesto. Pasarse no 'añade memoria': se pierde texto.",
                        difficulty=2,
                    ),
                    code(
                        "ag1-tokens-e4",
                        "Con `texto = 'lee el n'`, guarda `n_piezas = len(texto.split())` e imprime `n_piezas`.",
                        "texto = 'lee el n'\n",
                        ["n_piezas == 3"],
                        "texto = 'lee el n'\nn_piezas = len(texto.split())\nprint(n_piezas)",
                        "Este conteo es un modelo mental. No es el tokenizador del modelo, pero muestra que el texto se parte.",
                        expected_stdout="3",
                    ),
                ],
            ),
            lesson(
                "ag1-engineering",
                "Prompt engineering",
                "Afinar el prompt es elegir ejemplos, formato y una parada. No es pedir 'haz magia'.",
                [
                    mc(
                        "ag1-engineering-e1",
                        "¿Qué cambia un buen prompt, no un prompt más largo?",
                        [
                            ("a", "La tarea, el formato de salida y un ejemplo de lo que cuenta como bien"),
                            ("b", "Repetir la misma frase cincuenta veces"),
                            ("c", "Quitar todos los sustantivos"),
                        ],
                        "a",
                        "Ingeniería de prompts es diseño: criterio, formato y un ejemplo. La longitud sola no ayuda.",
                    ),
                    matching(
                        "ag1-engineering-e2",
                        "Empareja cada pieza de un prompt.",
                        [
                            {"id": "l1", "text": "Rol"},
                            {"id": "l2", "text": "Formato"},
                            {"id": "l3", "text": "Criterio de parada"},
                        ],
                        [
                            {"id": "r1", "text": "Desde qué oficio responde"},
                            {"id": "r2", "text": "Cómo debe verse la respuesta"},
                            {"id": "r3", "text": "Cuándo dejar de escribir"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Sin formato ni parada, el modelo sigue generando texto que no puedes evaluar.",
                    ),
                    mc(
                        "ag1-engineering-e3",
                        "Le pides 'arregla el código' y no pegas el error. ¿Qué falta?",
                        [
                            ("a", "La evidencia: el traceback o el resultado que salió mal"),
                            ("b", "Más adjetivos"),
                            ("c", "Un token de más en la palabra arregla"),
                        ],
                        "a",
                        "El modelo no ve tu pantalla. Si el fallo no está en el prompt, inventa un arreglo.",
                        difficulty=2,
                    ),
                    predict(
                        "ag1-engineering-e4",
                        "¿Qué imprime esta regla de parada del prompt?",
                        "pasos = 3\nmax_pasos = 3\nprint(pasos >= max_pasos)",
                        "True",
                        "El prompt puede exigir parar al llegar al presupuesto. Aquí ya se cumplió.",
                    ),
                ],
            ),
            lesson(
                "ag1-l1",
                "Qué es un agente",
                "El bucle observar → decidir → actuar → observar otra vez.",
                [
                    mc(
                        "ag1-l1-e1",
                        "¿Qué distingue a un agente de un chat que solo completa texto?",
                        [
                            ("a", "Puede usar herramientas, ver el resultado y decidir el siguiente paso"),
                            ("b", "Siempre tiene más parámetros"),
                            ("c", "Nunca se detiene"),
                        ],
                        "a",
                        "El agente entra en un bucle con el mundo (archivos, APIs, el usuario). El chat sin herramientas solo escribe.",
                        hint="Piensa en un ciclo, no en un solo mensaje.",
                    ),
                    matching(
                        "ag1-l1-e2",
                        "Empareja cada paso del bucle.",
                        [
                            {"id": "l1", "text": "Observar"},
                            {"id": "l2", "text": "Decidir"},
                            {"id": "l3", "text": "Actuar"},
                        ],
                        [
                            {"id": "r1", "text": "Leer la tarea, el error o la salida de una herramienta"},
                            {"id": "r2", "text": "Elegir una herramienta, una pregunta o parar"},
                            {"id": "r3", "text": "Ejecutar la herramienta con argumentos concretos"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Sin observar el resultado, el siguiente paso es adivinar.",
                    ),
                    predict(
                        "ag1-l1-e3",
                        "Una herramienta `buscar` devuelve texto. ¿Qué imprime el agente?",
                        "def ejecutar(nombre, argumento):\n    if nombre == 'buscar':\n        return f'encontrado:{argumento}'\n    return 'desconocido'\n\nprint(ejecutar('buscar', 'ventas'))",
                        "encontrado:ventas",
                        "Actuar es llamar la herramienta con un argumento. El valor devuelto es la nueva observación.",
                    ),
                    fill(
                        "ag1-l1-e4",
                        "Completa la llamada a la herramienta.",
                        "def ejecutar(nombre, argumento):\n    return argumento.upper()\n\nobs = ___( 'eco', 'mcp' )\nprint(obs)",
                        [{"accepted": ["ejecutar"]}],
                        "El agente no 'piensa' el resultado de la herramienta: la ejecuta y lee lo que devolvió.",
                    ),
                    code(
                        "ag1-l1-e5",
                        "Define `ejecutar(nombre, argumento)` que, si nombre es `buscar`, devuelva `ok:` más el argumento. Llama `obs = ejecutar('buscar', 'precios')` e imprime `obs`.",
                        "",
                        ["obs == 'ok:precios'"],
                        "def ejecutar(nombre, argumento):\n    if nombre == 'buscar':\n        return 'ok:' + argumento\n    return 'desconocido'\n\nobs = ejecutar('buscar', 'precios')\nprint(obs)",
                        "La herramienta es una función. El agente solo acierta si el nombre y el argumento coinciden con el contrato.",
                        expected_stdout="ok:precios",
                    ),
                ],
            ),
            lesson(
                "ag1-l2",
                "Afianza: herramientas y contratos",
                "Una herramienta tiene nombre, argumentos y un resultado predecible.",
                [
                    mc(
                        "ag1-l2-e1",
                        "El modelo inventa `borrar_disco` pero esa herramienta no existe. ¿Qué debe hacer el harness?",
                        [
                            ("a", "Rechazar la llamada y devolver un error observable"),
                            ("b", "Ejecutarla igual por si acaso"),
                            ("c", "Reiniciar el computador"),
                        ],
                        "a",
                        "El contrato es cerrado: solo corren herramientas registradas. El error entra al siguiente observar.",
                    ),
                    predict(
                        "ag1-l2-e2",
                        "¿Qué imprime este despacho?",
                        "herramientas = {'hora': lambda: '10:00', 'eco': lambda t: t}\nprint(herramientas['eco']('hola'))\nprint('hora' in herramientas)",
                        "hola\nTrue",
                        "Un diccionario de nombre → función es un inventario mínimo de tools.",
                    ),
                    find_err(
                        "ag1-l2-e3",
                        "¿Qué falla aquí?\n\n```python\nherramientas = {'eco': lambda t: t}\nprint(herramientas['buscar']('x'))\n```",
                        [
                            ("a", "buscar no está registrada: KeyError"),
                            ("b", "lambda no existe en Python"),
                            ("c", "Las herramientas no pueden devolver texto"),
                        ],
                        "a",
                        "El agente debe comprobar `nombre in herramientas` antes de llamar.",
                        starter="herramientas = {'eco': lambda t: t}\nprint(herramientas['buscar']('x'))",
                    ),
                    matching(
                        "ag1-l2-e4",
                        "Empareja el campo del contrato con su propósito.",
                        [
                            {"id": "l1", "text": "name"},
                            {"id": "l2", "text": "description"},
                            {"id": "l3", "text": "inputSchema"},
                        ],
                        [
                            {"id": "r1", "text": "Identificador estable que el modelo debe copiar tal cual"},
                            {"id": "r2", "text": "Cuándo usarla, en lenguaje humano"},
                            {"id": "r3", "text": "Qué argumentos son obligatorios y de qué tipo"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Si el nombre cambia, el modelo llama a un fantasma. Si el schema falta, inventa argumentos.",
                    ),
                    code(
                        "ag1-l2-e5",
                        "Crea `herramientas = {'eco': lambda t: t, 'hora': lambda: '10:00'}`. Guarda `n = len(herramientas)` e imprime `n` y el resultado de `herramientas['eco']('mcp')`.",
                        "",
                        ["n == 2", "herramientas['eco']('mcp') == 'mcp'"],
                        "herramientas = {'eco': lambda t: t, 'hora': lambda: '10:00'}\nn = len(herramientas)\nprint(n)\nprint(herramientas['eco']('mcp'))",
                        "Dos tools registradas. eco('mcp') devuelve el argumento sin tocarlo.",
                        expected_stdout="2\nmcp",
                    ),
                ],
                level=2,
            ),
            lesson(
                "ag1-l3",
                "Practica: un paso de agente",
                "Observación → elección de herramienta → nueva observación.",
                [
                    reorder(
                        "ag1-l3-e1",
                        "Ordena un paso del agente.",
                        [
                            {"id": "a", "code": "tarea = 'busca precios'"},
                            {"id": "b", "code": "nombre, argumento = 'buscar', 'precios'"},
                            {"id": "c", "code": "obs = ejecutar(nombre, argumento)"},
                            {"id": "d", "code": "print(obs)"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero la tarea, después la decisión (nombre y args), después actuar, después mirar.",
                    ),
                    predict(
                        "ag1-l3-e2",
                        "El agente para si la observación empieza por ok. ¿Qué imprime?",
                        "obs = 'ok:precios'\nparar = obs.startswith('ok')\nprint(parar)\nprint(obs.split(':', 1)[1])",
                        "True\nprecios",
                        "La condición de parada se evalúa sobre la observación, no 'de oídas'.",
                    ),
                    mc(
                        "ag1-l3-e3",
                        "¿Cuándo debe parar un agente bien diseñado?",
                        [
                            ("a", "Cuando la tarea está hecha, el usuario lo pide, o se acaba el presupuesto de pasos"),
                            ("b", "Solo cuando se queda sin RAM"),
                            ("c", "Nunca: un agente útil es infinito"),
                        ],
                        "a",
                        "Un harness serio tiene stop conditions. Sin ellas, el bucle se come tiempo y herramientas.",
                    ),
                    fill(
                        "ag1-l3-e4",
                        "Completa la condición de parada por presupuesto.",
                        "pasos, max_pasos = 3, 3\nparar = pasos >= ___\nprint(parar)",
                        [{"accepted": ["max_pasos"]}],
                        "pasos >= max_pasos corta el bucle aunque la tarea no haya terminado.",
                    ),
                    code(
                        "ag1-l3-e5",
                        "Con `pasos = 2`, `max_pasos = 4` y `hecho = False`, guarda `parar` = True si ya terminó o se acabó el presupuesto. Imprime `parar`.",
                        "pasos = 2\nmax_pasos = 4\nhecho = False\n",
                        ["parar is False"],
                        "pasos = 2\nmax_pasos = 4\nhecho = False\nparar = hecho or pasos >= max_pasos\nprint(parar)",
                        "2 < 4 y hecho es False, así que el bucle puede dar otro paso.",
                        expected_stdout="False",
                    ),
                ],
                level=3,
            ),
        ],
    )

    ag2 = unit(
        "ag2",
        2,
        "MCP: herramientas con contrato",
        "Model Context Protocol: servidores que exponen tools, resources y prompts con un esquema.",
        "plug",
        [
            lesson(
                "ag2-l1",
                "Host, cliente y servidor",
                "MCP separa quién habla con el modelo de quién toca el mundo.",
                [
                    mc(
                        "ag2-l1-e1",
                        "En MCP, ¿quién expone las herramientas (por ejemplo, leer un archivo)?",
                        [
                            ("a", "El servidor MCP"),
                            ("b", "Solo el peso del modelo"),
                            ("c", "El usuario, escribiendo JSON a mano cada vez"),
                        ],
                        "a",
                        "El servidor declara tools/resources/prompts. El host (Cursor, Claude Desktop, tu app) conecta al modelo con ese cliente.",
                    ),
                    matching(
                        "ag2-l1-e2",
                        "Empareja el rol MCP.",
                        [
                            {"id": "l1", "text": "Host"},
                            {"id": "l2", "text": "Client"},
                            {"id": "l3", "text": "Server"},
                        ],
                        [
                            {"id": "r1", "text": "La app donde vive el modelo (IDE, chat, agente)"},
                            {"id": "r2", "text": "El conector que habla el protocolo con un servidor"},
                            {"id": "r3", "text": "El proceso que ofrece tools, resources o prompts"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Un host puede tener varios clients, cada uno de un server distinto: git, docs, base de datos.",
                    ),
                    predict(
                        "ag2-l1-e3",
                        "Un inventario mínimo. ¿Qué imprime?",
                        "server = {'name': 'docs', 'tools': ['buscar', 'leer']}\nprint(server['name'])\nprint(len(server['tools']))",
                        "docs\n2",
                        "El servidor se presenta con un nombre y una lista de tools. El modelo solo puede llamar esas.",
                    ),
                    fill(
                        "ag2-l1-e4",
                        "Completa el acceso a la lista de tools.",
                        "server = {'name': 'fs', 'tools': ['listar']}\nprint(server[___])",
                        [{"accepted": ["'tools'", '"tools"']}],
                        "La clave 'tools' es el inventario. El host no adivina nombres que no estén ahí.",
                    ),
                    code(
                        "ag2-l1-e5",
                        "Crea `server = {'name': 'ventas', 'tools': ['buscar', 'leer']}`. Guarda `n_tools = len(server['tools'])` e imprime `server['name']` y `n_tools`.",
                        "",
                        ["server['name'] == 'ventas'", "n_tools == 2"],
                        "server = {'name': 'ventas', 'tools': ['buscar', 'leer']}\nn_tools = len(server['tools'])\nprint(server['name'])\nprint(n_tools)",
                        "Así se 'anuncia' un servidor: nombre estable y tools contadas.",
                        expected_stdout="ventas\n2",
                    ),
                ],
            ),
            lesson(
                "ag2-l2",
                "Afianza: tools, resources y prompts",
                "Tres primitivas, tres trabajos distintos.",
                [
                    mc(
                        "ag2-l2-e1",
                        "¿Qué primitiva MCP usarías para un PDF que el modelo puede leer pero no debería 'ejecutar'?",
                        [
                            ("a", "Resource (dato legible, con URI)"),
                            ("b", "Tool (acción con efectos)"),
                            ("c", "Prompt (plantilla de instrucciones)"),
                        ],
                        "a",
                        "Resources son datos. Tools hacen cosas (escribir, llamar APIs). Prompts son plantillas reutilizables.",
                    ),
                    matching(
                        "ag2-l2-e2",
                        "Empareja la primitiva con un ejemplo.",
                        [
                            {"id": "l1", "text": "Tool"},
                            {"id": "l2", "text": "Resource"},
                            {"id": "l3", "text": "Prompt"},
                        ],
                        [
                            {"id": "r1", "text": "crear_issue(titulo, cuerpo)"},
                            {"id": "r2", "text": "file:///reporte.csv"},
                            {"id": "r3", "text": "Plantilla 'explica este diff'"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Si algo tiene efectos, es tool. Si solo se consulta, resource. Si es texto de sistema reutilizable, prompt.",
                    ),
                    predict(
                        "ag2-l2-e3",
                        "Schema de una tool. ¿Qué imprime?",
                        "schema = {\n    'name': 'leer_archivo',\n    'inputSchema': {\n        'type': 'object',\n        'properties': {'path': {'type': 'string'}},\n        'required': ['path'],\n    },\n}\nprint(schema['name'])\nprint(schema['inputSchema']['required'])",
                        "leer_archivo\n['path']",
                        "required=['path'] obliga al modelo a enviar esa clave. Sin path, el server debe rechazar.",
                    ),
                    find_err(
                        "ag2-l2-e4",
                        "¿Qué incumplimiento hay en esta llamada?\n\n```python\nschema_required = ['path']\nargs = {'archivo': 'notas.md'}\nprint(all(k in args for k in schema_required))\n```",
                        [
                            ("a", "El argumento se llama path, no archivo: el contrato no se cumple"),
                            ("b", "JSON no admite listas"),
                            ("c", "Las tools no tienen argumentos"),
                        ],
                        "a",
                        "El modelo debe copiar los nombres del schema. 'archivo' no satisface required=['path'].",
                        starter="schema_required = ['path']\nargs = {'archivo': 'notas.md'}\nprint(all(k in args for k in schema_required))",
                    ),
                    code(
                        "ag2-l2-e5",
                        "Crea `tool` con `name='leer_archivo'` y `required=['path']` (dentro de inputSchema). Imprime `tool['name']` y el primer required.",
                        "",
                        ["tool['name'] == 'leer_archivo'", "tool['inputSchema']['required'] == ['path']"],
                        "tool = {'name': 'leer_archivo', 'inputSchema': {'type': 'object', 'properties': {'path': {'type': 'string'}}, 'required': ['path']}}\nprint(tool['name'])\nprint(tool['inputSchema']['required'][0])",
                        "El schema es el contrato. required[0] es path.",
                        expected_stdout="leer_archivo\npath",
                    ),
                ],
                level=2,
            ),
            lesson(
                "ag2-l3",
                "Practica: un servidor mínimo",
                "Valida argumentos y despacha dos tools.",
                [
                    predict(
                        "ag2-l3-e1",
                        "¿Qué imprime este servidor de juguete?",
                        "def despachar(nombre, args):\n    if nombre == 'eco':\n        return args['texto']\n    if nombre == 'sumar':\n        return str(args['a'] + args['b'])\n    return 'error:tool'\n\nprint(despachar('sumar', {'a': 2, 'b': 3}))\nprint(despachar('otra', {}))",
                        "5\nerror:tool",
                        "sumar conoce a y b. otra no está registrada y el servidor responde error, no improvisa.",
                    ),
                    mc(
                        "ag2-l3-e2",
                        "¿Por qué MCP es más sostenible que un plugin ad hoc por cada app?",
                        [
                            ("a", "El mismo servidor puede conectarse a varios hosts que hablen el protocolo"),
                            ("b", "Elimina la necesidad de schemas"),
                            ("c", "Obliga a entrenar un modelo nuevo por herramienta"),
                        ],
                        "a",
                        "Un server de git o de docs se reutiliza. El protocolo es el enchufe; el host es el aparato.",
                    ),
                    fill(
                        "ag2-l3-e3",
                        "Rechaza una tool desconocida.",
                        "def despachar(nombre, args):\n    if nombre not in {'eco', 'sumar'}:\n        return 'error:___'\n    return 'ok'\nprint(despachar('borrar', {}))",
                        [{"accepted": ["tool"]}],
                        "El string error:tool es la observación que el agente verá en el siguiente giro.",
                    ),
                    code(
                        "ag2-l3-e4",
                        "Escribe `despachar(nombre, args)` con tools `eco` (devuelve args['texto']) y `sumar` (devuelve a+b como int). Guarda `r = despachar('sumar', {'a': 10, 'b': 5})` e imprime `r`.",
                        "",
                        ["r == 15"],
                        "def despachar(nombre, args):\n    if nombre == 'eco':\n        return args['texto']\n    if nombre == 'sumar':\n        return args['a'] + args['b']\n    return 'error:tool'\n\nr = despachar('sumar', {'a': 10, 'b': 5})\nprint(r)",
                        "10+5=15. Un server MCP real haría lo mismo tras validar el JSON contra el schema.",
                        expected_stdout="15",
                    ),
                    matching(
                        "ag2-l3-e5",
                        "Empareja el mensaje de error con la causa.",
                        [
                            {"id": "l1", "text": "error:tool"},
                            {"id": "l2", "text": "error:args"},
                            {"id": "l3", "text": "ok"},
                        ],
                        [
                            {"id": "r1", "text": "El nombre no está en el inventario"},
                            {"id": "r2", "text": "Falta una clave required del schema"},
                            {"id": "r3", "text": "La tool corrió con argumentos válidos"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Errores observables enseñan al agente a corregir. Un silencio o un crash no.",
                    ),
                ],
                level=3,
            ),
        ],
    )

    ag3 = unit(
        "ag3",
        3,
        "Skills y harness",
        "Una skill es un procedimiento reutilizable; el harness es el runtime que lo ejecuta con límites.",
        "wrench",
        [
            lesson(
                "ag3-l1",
                "Qué es una skill",
                "Instrucciones, cuándo usarla y qué herramientas toca.",
                [
                    mc(
                        "ag3-l1-e1",
                        "¿Qué es una skill en un agente?",
                        [
                            ("a", "Un procedimiento empaquetado: cuándo usarlo, pasos y herramientas permitidas"),
                            ("b", "Un peso extra del modelo"),
                            ("c", "Un atajo de teclado del IDE"),
                        ],
                        "a",
                        "La skill no 'entrena' al modelo: le da un playbook estable (como un SKILL.md) para una clase de tareas.",
                    ),
                    matching(
                        "ag3-l1-e2",
                        "Empareja el campo de una skill.",
                        [
                            {"id": "l1", "text": "name"},
                            {"id": "l2", "text": "when / description"},
                            {"id": "l3", "text": "steps"},
                        ],
                        [
                            {"id": "r1", "text": "Identificador para activarla"},
                            {"id": "r2", "text": "Señales de que esta tarea le corresponde"},
                            {"id": "r3", "text": "El procedimiento en orden"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Sin 'when', el agente no sabe cuándo abrirla. Sin steps, improvisa.",
                    ),
                    predict(
                        "ag3-l1-e3",
                        "¿Qué imprime esta skill?",
                        "skill = {\n    'name': 'resumir-csv',\n    'when': 'pidan un resumen de tabla',\n    'steps': ['leer', 'limpiar', 'resumir', 'citar n'],\n}\nprint(skill['name'])\nprint(len(skill['steps']))",
                        "resumir-csv\n4",
                        "Cuatro pasos obligan a citar n. Eso es diseño de skill, no un prompt suelto.",
                    ),
                    fill(
                        "ag3-l1-e4",
                        "Completa el recuento de pasos.",
                        "skill = {'steps': ['leer', 'limpiar', 'resumir']}\nprint(___(skill['steps']))",
                        [{"accepted": ["len"]}],
                        "len deja medible el procedimiento. Un playbook de 1 paso no es un playbook.",
                    ),
                    code(
                        "ag3-l1-e5",
                        "Crea `skill` con name `resumir-csv` y steps `['leer', 'limpiar', 'resumir', 'citar n']`. Imprime el name y `len(skill['steps'])`.",
                        "",
                        ["skill['name'] == 'resumir-csv'", "skill['steps'][-1] == 'citar n'"],
                        "skill = {'name': 'resumir-csv', 'steps': ['leer', 'limpiar', 'resumir', 'citar n']}\nprint(skill['name'])\nprint(len(skill['steps']))",
                        "El último paso cita n: la skill enseña el hábito, no solo el cálculo.",
                        expected_stdout="resumir-csv\n4",
                    ),
                ],
            ),
            lesson(
                "ag3-l2",
                "Afianza: el harness",
                "Permisos, reintentos, memoria y parada: el runtime del agente.",
                [
                    mc(
                        "ag3-l2-e1",
                        "El harness de un agente es…",
                        [
                            ("a", "El runtime: bucle, herramientas permitidas, reintentos, memoria y condiciones de parada"),
                            ("b", "El dataset de preentrenamiento"),
                            ("c", "Un cable USB"),
                        ],
                        "a",
                        "El modelo propone; el harness ejecuta con reglas. Sin harness, una skill es un PDF.",
                    ),
                    predict(
                        "ag3-l2-e2",
                        "Permisos: solo 'leer'. ¿Qué imprime?",
                        "permitidas = {'leer'}\npedida = 'borrar'\nprint(pedida in permitidas)\nprint('leer' in permitidas)",
                        "False\nTrue",
                        "El harness niega borrar aunque el modelo lo pida. La skill no amplía permisos por sí sola.",
                    ),
                    matching(
                        "ag3-l2-e3",
                        "Empareja la palanca del harness.",
                        [
                            {"id": "l1", "text": "Permisos"},
                            {"id": "l2", "text": "Reintentos"},
                            {"id": "l3", "text": "Memoria / contexto"},
                        ],
                        [
                            {"id": "r1", "text": "Qué tools puede tocar esta sesión"},
                            {"id": "r2", "text": "Cuántas veces se reintenta un fallo recuperable"},
                            {"id": "r3", "text": "Qué observaciones se conservan entre pasos"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Un harness flojo deja al modelo con todas las tools y sin recorte de contexto.",
                    ),
                    find_err(
                        "ag3-l2-e4",
                        "¿Qué riesgo hay aquí?\n\n```python\npermitidas = {'leer', 'borrar', 'pagar'}\npedida = 'pagar'\nprint(pedida in permitidas)\n```",
                        [
                            ("a", "pagar está permitida sin necesidad: el harness es demasiado amplio para la skill"),
                            ("b", "in no funciona con sets"),
                            ("c", "Las tools no tienen nombres"),
                        ],
                        "a",
                        "Una skill de resumir CSV no necesita pagar. El harness aplica el mínimo privilegio.",
                        starter="permitidas = {'leer', 'borrar', 'pagar'}\npedida = 'pagar'\nprint(pedida in permitidas)",
                    ),
                    code(
                        "ag3-l2-e5",
                        "`permitidas = {'leer', 'resumir'}`. Guarda `ok` = si `'borrar'` está permitida e imprime `ok`.",
                        "permitidas = {'leer', 'resumir'}\n",
                        ["ok is False"],
                        "permitidas = {'leer', 'resumir'}\nok = 'borrar' in permitidas\nprint(ok)",
                        "False: el harness de esta skill no deja borrar.",
                        expected_stdout="False",
                    ),
                ],
                level=2,
            ),
            lesson(
                "ag3-l3",
                "Practica: evaluar al agente",
                "Una tarea con resultado esperado late más que 'se sintió inteligente'.",
                [
                    mc(
                        "ag3-l3-e1",
                        "¿Cómo evalúas un agente de forma seria?",
                        [
                            ("a", "Con tareas fijas, un resultado esperado y límites de pasos/tools"),
                            ("b", "Solo con un like del usuario"),
                            ("c", "Midiendo cuántos tokens usa, sin mirar si acertó"),
                        ],
                        "a",
                        "Evals: input, output esperado, presupuesto. El like ayuda, pero no sustituye el caso de prueba.",
                    ),
                    predict(
                        "ag3-l3-e2",
                        "Eval de juguete. ¿Qué imprime?",
                        "esperado = 'n=3; total=12'\nobtenido = 'n=3; total=12'\npasos = 2\nprint(obtenido == esperado)\nprint(pasos <= 4)",
                        "True\nTrue",
                        "Acertó el texto y respetó el presupuesto. Las dos condiciones importan.",
                    ),
                    fill(
                        "ag3-l3-e3",
                        "Completa la eval: ¿el resultado coincide?",
                        "esperado, obtenido = 'ok', 'ok'\nprint(obtenido ___ esperado)",
                        [{"accepted": ["=="]}],
                        "== compara el artefacto. Para números, a veces usas un margen; para texto de informe, igualdad o un checker.",
                    ),
                    code(
                        "ag3-l3-e4",
                        "Con `esperado = 'n=3'`, `obtenido = 'n=3'` y `pasos = 5` con `max_pasos = 4`, guarda `paso` = si acertó y `presupuesto` = si no se pasó de pasos. Imprime `paso` y `presupuesto`.",
                        "esperado = 'n=3'\nobtenido = 'n=3'\npasos = 5\nmax_pasos = 4\n",
                        ["paso is True", "presupuesto is False"],
                        "esperado = 'n=3'\nobtenido = 'n=3'\npasos = 5\nmax_pasos = 4\npaso = obtenido == esperado\npresupuesto = pasos <= max_pasos\nprint(paso)\nprint(presupuesto)",
                        "Acertó el contenido pero gastó 5>4 pasos: la eval no es un aprobado limpio.",
                        expected_stdout="True\nFalse",
                    ),
                    matching(
                        "ag3-l3-e5",
                        "Empareja el síntoma con el ajuste.",
                        [
                            {"id": "l1", "text": "Acertó pero usó tools prohibidas"},
                            {"id": "l2", "text": "Falló el formato (faltó n)"},
                            {"id": "l3", "text": "Se quedó sin pasos a mitad de tarea"},
                        ],
                        [
                            {"id": "r1", "text": "Apretar permisos del harness"},
                            {"id": "r2", "text": "Mejorar la skill (paso 'citar n')"},
                            {"id": "r3", "text": "Subir presupuesto o partir la tarea"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "La eval te dice qué palanca tocar: skill, harness o diseño de la tarea.",
                    ),
                ],
                level=3,
            ),
        ],
    )

    return {
        "courseId": "agentes-ia",
        "sections": [
            {
                "id": "sag",
                "index": 0,
                "title": "Agentes de IA",
                "subtitle": "MCP, skills y harness, de cero a un eval",
                "color": "#c2410c",
                "accent": "#fdba74",
                "units": [ag1, ag2, ag3],
            }
        ],
    }


def main() -> None:
    dump(ROOT / "datos-curriculum.json", datos_course())
    dump(ROOT / "agentes-curriculum.json", agentes_course())


if __name__ == "__main__":
    main()
