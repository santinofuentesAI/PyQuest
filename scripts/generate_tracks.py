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
    """Agentes de IA: prompts, tokens, bucle, MCP, skills y evals. Sin Python."""
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
                    mc(
                        "ag1-prompt-e3",
                        "En este prompt, ¿qué línea es el rol?\n\nEres analista de inventario.\nResume el informe en 2 frases.\nCita n y la unidad.",
                        [
                            ("a", "Eres analista de inventario."),
                            ("b", "Resume el informe en 2 frases."),
                            ("c", "Cita n y la unidad."),
                        ],
                        "a",
                        "El rol dice desde qué oficio responde. La segunda línea es la tarea y la tercera es el formato.",
                    ),
                    fill(
                        "ag1-prompt-e4",
                        "Completa el rol al inicio del prompt.",
                        "Eres un ___. Resume en 2 frases y cita el n.",
                        [{"accepted": ["analista"]}],
                        "El rol le dice al modelo desde qué oficio debe responder.",
                        hint="El oficio de quien lee números y los explica.",
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
                    mc(
                        "ag1-tokens-e2",
                        "«Hola agente» son 2 palabras si partes por espacios. ¿Por qué eso no es la factura del modelo?",
                        [
                            ("a", "Un tokenizador real puede partir una palabra en más de un token"),
                            ("b", "Porque el modelo cobra por frases, nunca por piezas"),
                            ("c", "Porque los espacios no existen en un prompt"),
                        ],
                        "a",
                        "Contar palabras es un modelo mental. La factura usa el tokenizador del modelo, que no coincide siempre con los espacios.",
                        difficulty=2,
                    ),
                    mc(
                        "ag1-tokens-e3",
                        "Si el prompt más la respuesta no caben en la ventana de contexto…",
                        [
                            ("a", "El modelo no puede ver todo: se corta el principio o no entra la respuesta"),
                            ("b", "Se crean tokens gratis"),
                            ("c", "El archivo se ordena solo"),
                        ],
                        "a",
                        "La ventana es un presupuesto. Pasarse no añade memoria: se pierde texto.",
                        difficulty=2,
                    ),
                    matching(
                        "ag1-tokens-e4",
                        "Empareja cada pieza del presupuesto.",
                        [
                            {"id": "l1", "text": "Palabra"},
                            {"id": "l2", "text": "Token"},
                            {"id": "l3", "text": "Ventana de contexto"},
                        ],
                        [
                            {"id": "r1", "text": "Un corte humano, por espacios"},
                            {"id": "r2", "text": "La pieza que el modelo cuenta y cobra"},
                            {"id": "r3", "text": "Cuánto texto cabe entre prompt y respuesta"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Palabras, tokens y ventana no son lo mismo. Mezclarlos hace que el presupuesto mienta.",
                    ),
                ],
            ),
            lesson(
                "ag1-engineering",
                "Prompt engineering",
                "Afinar el prompt es elegir ejemplos, formato y una parada. No es pedir que haga magia.",
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
                        "Le pides «arregla el informe» y no pegas el informe. ¿Qué falta?",
                        [
                            ("a", "La evidencia: el texto que salió mal o el dato que no cuadra"),
                            ("b", "Más adjetivos"),
                            ("c", "Un token de más en la palabra arregla"),
                        ],
                        "a",
                        "El modelo no ve tu pantalla. Si el fallo no está en el prompt, inventa un arreglo.",
                        difficulty=2,
                    ),
                    reorder(
                        "ag1-engineering-e4",
                        "Ordena un prompt que se puede revisar.",
                        [
                            {"id": "a", "code": "Rol: eres analista"},
                            {"id": "b", "code": "Tarea: resume el informe"},
                            {"id": "c", "code": "Formato: 2 frases, con n y la unidad"},
                            {"id": "d", "code": "Parada: termina al cerrar esas 2 frases"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero el oficio, después la tarea, después cómo se ve, y al final cuándo parar.",
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
                    mc(
                        "ag1-l1-e3",
                        "La herramienta buscar, con argumento «ventas», devuelve «encontrado:ventas». ¿Qué es eso para el agente?",
                        [
                            ("a", "La nueva observación: el resultado de haber actuado"),
                            ("b", "El peso del modelo"),
                            ("c", "Un prompt que el usuario todavía no escribió"),
                        ],
                        "a",
                        "Actuar es llamar la herramienta con un argumento. Lo que devuelve es lo siguiente que el agente mira.",
                    ),
                    reorder(
                        "ag1-l1-e4",
                        "Ordena un paso del agente.",
                        [
                            {"id": "a", "code": "Leer la tarea: busca precios"},
                            {"id": "b", "code": "Elegir la herramienta buscar con argumento precios"},
                            {"id": "c", "code": "Ejecutar la herramienta"},
                            {"id": "d", "code": "Leer lo que devolvió"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero la tarea, después la decisión, después actuar, después mirar.",
                    ),
                    mc(
                        "ag1-l1-e5",
                        "El contrato solo acepta la herramienta buscar. El agente llama a eco. ¿Qué debe pasar?",
                        [
                            ("a", "La llamada se rechaza: el nombre no está en el contrato"),
                            ("b", "eco se crea en el momento"),
                            ("c", "buscar corre igual, con el argumento de eco"),
                        ],
                        "a",
                        "La herramienta solo acierta si el nombre y el argumento coinciden con el contrato.",
                        difficulty=2,
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
                        "El modelo inventa borrar_disco pero esa herramienta no existe. ¿Qué debe hacer el harness?",
                        [
                            ("a", "Rechazar la llamada y devolver un error observable"),
                            ("b", "Ejecutarla igual por si acaso"),
                            ("c", "Reiniciar el computador"),
                        ],
                        "a",
                        "El contrato es cerrado: solo corren herramientas registradas. El error entra al siguiente observar.",
                    ),
                    mc(
                        "ag1-l2-e2",
                        "El inventario dice: eco devuelve el texto tal cual, y hora devuelve «10:00». Llamas a eco con «hola». ¿Qué observas?",
                        [
                            ("a", "hola, y hora sí está en el inventario"),
                            ("b", "10:00, porque hora es la primera"),
                            ("c", "Un error, porque eco no puede recibir texto"),
                        ],
                        "a",
                        "eco('hola') devuelve hola. hora está registrada aunque no la llames en este paso.",
                        difficulty=2,
                    ),
                    mc(
                        "ag1-l2-e3",
                        "El inventario solo tiene eco. El agente llama a buscar con «x». ¿Qué falla?",
                        [
                            ("a", "buscar no está registrada: la llamada no tiene a quién ir"),
                            ("b", "Las herramientas no pueden devolver texto"),
                            ("c", "eco y buscar son la misma herramienta"),
                        ],
                        "a",
                        "Antes de llamar, el nombre tiene que estar en el inventario.",
                        difficulty=2,
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
                    mc(
                        "ag1-l2-e5",
                        "Hay dos herramientas: eco y hora. Llamas a eco con «mcp». ¿Qué es cierto?",
                        [
                            ("a", "El inventario tiene 2 tools y eco devuelve mcp"),
                            ("b", "hora desaparece al llamar a eco"),
                            ("c", "mcp se convierte en la hora 10:00"),
                        ],
                        "a",
                        "Dos tools registradas. eco devuelve el argumento sin tocarlo.",
                        difficulty=2,
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
                            {"id": "a", "code": "Tarea: busca precios"},
                            {"id": "b", "code": "Decisión: herramienta buscar, argumento precios"},
                            {"id": "c", "code": "Acción: ejecutar buscar"},
                            {"id": "d", "code": "Observación: leer lo que devolvió"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero la tarea, después la decisión (nombre y args), después actuar, después mirar.",
                    ),
                    mc(
                        "ag1-l3-e2",
                        "La observación es «ok:precios» y la regla dice: para si empieza por ok. ¿Qué sigue?",
                        [
                            ("a", "Para, y el dato útil que queda es precios"),
                            ("b", "Sigue llamando herramientas porque ok no cuenta"),
                            ("c", "Borra la observación y empieza de cero"),
                        ],
                        "a",
                        "La condición de parada se evalúa sobre la observación. ok dice que la tarea de este paso ya respondió.",
                        difficulty=2,
                    ),
                    mc(
                        "ag1-l3-e3",
                        "¿Cuándo debe parar un agente bien diseñado?",
                        [
                            ("a", "Cuando la tarea está hecha, el usuario lo pide, o se acaba el presupuesto de pasos"),
                            ("b", "Solo cuando se queda sin memoria"),
                            ("c", "Nunca: un agente útil es infinito"),
                        ],
                        "a",
                        "Un harness serio tiene condiciones de parada. Sin ellas, el bucle se come tiempo y herramientas.",
                    ),
                    fill(
                        "ag1-l3-e4",
                        "Completa la condición de parada por presupuesto.",
                        "El agente para si la tarea está hecha o si los pasos llegan a ___.",
                        [{"accepted": ["max_pasos", "el máximo", "el maximo"]}],
                        "Llegar al máximo corta el bucle aunque la tarea no haya terminado.",
                        hint="El nombre del tope de pasos.",
                    ),
                    mc(
                        "ag1-l3-e5",
                        "Van 2 pasos de un máximo de 4 y la tarea no está hecha. ¿Para?",
                        [
                            ("a", "No: todavía cabe otro paso"),
                            ("b", "Sí: 2 ya es más que 4"),
                            ("c", "Sí: si no está hecha, siempre para"),
                        ],
                        "a",
                        "2 es menor que 4 y la tarea sigue abierta, así que el bucle puede dar otro paso.",
                        difficulty=2,
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
                            ("c", "El usuario, escribiendo el contrato a mano cada vez"),
                        ],
                        "a",
                        "El servidor declara tools, resources y prompts. El host conecta al modelo con ese cliente.",
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
                        "Un host puede tener varios clients, cada uno de un server distinto: documentos, calendario, base de datos.",
                    ),
                    mc(
                        "ag2-l1-e3",
                        "Un servidor se anuncia así: name = docs, tools = buscar y leer. ¿Qué puede llamar el modelo?",
                        [
                            ("a", "Solo buscar y leer, en el servidor docs"),
                            ("b", "Cualquier herramienta que se le ocurra"),
                            ("c", "Solo el name, porque tools es decoración"),
                        ],
                        "a",
                        "El servidor se presenta con un nombre y una lista cerrada. Fuera de esa lista no hay llamada.",
                    ),
                    fill(
                        "ag2-l1-e4",
                        "Completa la clave del inventario.",
                        '{\n  "name": "fs",\n  "___": ["listar"]\n}',
                        [{"accepted": ["tools"]}],
                        "La clave tools es el inventario. El host no adivina nombres que no estén ahí.",
                        hint="El nombre de la lista de herramientas.",
                    ),
                    mc(
                        "ag2-l1-e5",
                        "Un servidor se llama ventas y ofrece buscar y leer. ¿Qué anuncio es el correcto?",
                        [
                            ("a", "name ventas y 2 tools"),
                            ("b", "name buscar y 2 servidores"),
                            ("c", "sin name, porque el modelo ya lo sabe"),
                        ],
                        "a",
                        "El anuncio es un nombre estable y las tools contadas. Aquí son dos.",
                        difficulty=2,
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
                        "¿Qué primitiva MCP usarías para un PDF que el modelo puede leer pero no debería ejecutar?",
                        [
                            ("a", "Resource (dato legible, con URI)"),
                            ("b", "Tool (acción con efectos)"),
                            ("c", "Prompt (plantilla de instrucciones)"),
                        ],
                        "a",
                        "Resources son datos. Tools hacen cosas. Prompts son plantillas reutilizables.",
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
                            {"id": "r3", "text": "Plantilla «explica este cambio»"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "Si algo tiene efectos, es tool. Si solo se consulta, resource. Si es texto de sistema reutilizable, prompt.",
                    ),
                    mc(
                        "ag2-l2-e3",
                        "Una tool se llama leer_archivo y su schema exige el argumento path. ¿Qué llamada es válida?",
                        [
                            ("a", "leer_archivo con path"),
                            ("b", "leer_archivo con archivo, que es «casi» path"),
                            ("c", "leer_archivo sin argumentos"),
                        ],
                        "a",
                        "required obliga a enviar esa clave con ese nombre. Sin path, el server debe rechazar.",
                        difficulty=2,
                    ),
                    mc(
                        "ag2-l2-e4",
                        "El schema exige path. La llamada manda archivo = notas.md. ¿Qué pasa?",
                        [
                            ("a", "El contrato no se cumple: archivo no es path"),
                            ("b", "El server adivina que archivo quería decir path"),
                            ("c", "Las tools no tienen argumentos, así que da igual"),
                        ],
                        "a",
                        "El modelo debe copiar los nombres del schema. archivo no satisface required path.",
                        difficulty=2,
                    ),
                    fill(
                        "ag2-l2-e5",
                        "Completa el argumento obligatorio.",
                        '{\n  "name": "leer_archivo",\n  "inputSchema": { "required": ["___"] }\n}',
                        [{"accepted": ["path"]}],
                        "El schema es el contrato. El required de esta tool es path.",
                        hint="El nombre del archivo que hay que leer.",
                    ),
                ],
                level=2,
            ),
            lesson(
                "ag2-l3",
                "Practica: un servidor mínimo",
                "Valida argumentos y despacha dos tools.",
                [
                    mc(
                        "ag2-l3-e1",
                        "El servidor tiene eco (devuelve el texto) y sumar (devuelve a + b). Llega sumar con a=2 y b=3, y luego una tool llamada otra. ¿Qué observas?",
                        [
                            ("a", "5, y después error:tool"),
                            ("b", "2 y 3 por separado"),
                            ("c", "otra se inventa y también devuelve 5"),
                        ],
                        "a",
                        "sumar conoce a y b. otra no está registrada y el servidor responde error, no improvisa.",
                        difficulty=2,
                    ),
                    mc(
                        "ag2-l3-e2",
                        "¿Por qué MCP es más sostenible que un plugin distinto en cada app?",
                        [
                            ("a", "El mismo servidor puede conectarse a varios hosts que hablen el protocolo"),
                            ("b", "Elimina la necesidad de schemas"),
                            ("c", "Obliga a entrenar un modelo nuevo por herramienta"),
                        ],
                        "a",
                        "Un server de documentos se reutiliza. El protocolo es el enchufe; el host es el aparato.",
                    ),
                    fill(
                        "ag2-l3-e3",
                        "Completa el error de una tool que no está en el inventario.",
                        "Tool desconocida → error:___",
                        [{"accepted": ["tool"]}],
                        "error:tool es la observación que el agente verá en el siguiente giro.",
                        hint="La palabra que nombra la primitiva que faltó.",
                    ),
                    mc(
                        "ag2-l3-e4",
                        "sumar recibe a=10 y b=5. ¿Qué devuelve si el contrato es devolver la suma?",
                        [
                            ("a", "15"),
                            ("b", "105"),
                            ("c", "error:tool"),
                        ],
                        "a",
                        "10 + 5 = 15. Un server MCP real hace lo mismo tras validar el JSON contra el schema.",
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
                        "Errores observables enseñan al agente a corregir. Un silencio no.",
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
                            ("c", "Un atajo de teclado del editor"),
                        ],
                        "a",
                        "La skill no entrena al modelo: le da un playbook estable para una clase de tareas.",
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
                        "Sin when, el agente no sabe cuándo abrirla. Sin steps, improvisa.",
                    ),
                    mc(
                        "ag3-l1-e3",
                        "La skill resumir-csv dice: úsala si piden un resumen de tabla. Pasos: leer, limpiar, resumir, citar n. ¿Qué obliga el último paso?",
                        [
                            ("a", "A citar n: cuántas filas sostienen el resumen"),
                            ("b", "A borrar la tabla al terminar"),
                            ("c", "A entrenar un modelo con esas filas"),
                        ],
                        "a",
                        "Cuatro pasos y el último cita n. Eso es diseño de skill, no un prompt suelto.",
                    ),
                    fill(
                        "ag3-l1-e4",
                        "Completa cuántos pasos tiene este playbook.",
                        "Pasos: leer, limpiar, resumir. El playbook tiene ___ pasos.",
                        [{"accepted": ["3", "tres"]}],
                        "Contar los pasos deja el procedimiento medible. Un playbook de un solo paso no es un playbook.",
                        hint="Cuenta los verbos.",
                    ),
                    reorder(
                        "ag3-l1-e5",
                        "Ordena la skill resumir-csv.",
                        [
                            {"id": "a", "code": "Leer la tabla"},
                            {"id": "b", "code": "Limpiar lo que no se puede usar"},
                            {"id": "c", "code": "Resumir la pregunta"},
                            {"id": "d", "code": "Citar n"},
                        ],
                        ["a", "b", "c", "d"],
                        "El último paso cita n: la skill enseña el hábito, no solo el cálculo.",
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
                        "El modelo propone; el harness ejecuta con reglas. Sin harness, una skill es un documento.",
                    ),
                    mc(
                        "ag3-l2-e2",
                        "Las permitidas son solo leer. El modelo pide borrar. ¿Qué decide el harness?",
                        [
                            ("a", "Niega borrar y deja pasar leer"),
                            ("b", "Borra, porque el modelo lo pidió"),
                            ("c", "Amplía la skill para incluir borrar"),
                        ],
                        "a",
                        "El harness niega borrar aunque el modelo lo pida. La skill no amplía permisos por sí sola.",
                        difficulty=2,
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
                    mc(
                        "ag3-l2-e4",
                        "La skill es resumir una tabla, pero las permitidas incluyen leer, borrar y pagar. El modelo pide pagar. ¿Qué riesgo hay?",
                        [
                            ("a", "pagar está permitida sin necesidad: el harness es demasiado amplio"),
                            ("b", "Leer no sirve para un resumen"),
                            ("c", "Las tools no tienen nombres"),
                        ],
                        "a",
                        "Una skill de resumir no necesita pagar. El harness aplica el mínimo privilegio.",
                        difficulty=2,
                    ),
                    mc(
                        "ag3-l2-e5",
                        "Permitidas: leer y resumir. ¿borrar está permitida?",
                        [
                            ("a", "No"),
                            ("b", "Sí, porque resumir implica borrar"),
                            ("c", "Sí, si el usuario no está mirando"),
                        ],
                        "a",
                        "borrar no está en la lista. El harness de esta skill no deja borrar.",
                    ),
                ],
                level=2,
            ),
            lesson(
                "ag3-l3",
                "Practica: evaluar al agente",
                "Una tarea con resultado esperado pesa más que «se sintió inteligente».",
                [
                    mc(
                        "ag3-l3-e1",
                        "¿Cómo evalúas un agente de forma seria?",
                        [
                            ("a", "Con tareas fijas, un resultado esperado y límites de pasos y tools"),
                            ("b", "Solo con un like del usuario"),
                            ("c", "Midiendo cuántos tokens usa, sin mirar si acertó"),
                        ],
                        "a",
                        "Una eval tiene entrada, salida esperada y presupuesto. El like ayuda, pero no sustituye el caso.",
                    ),
                    mc(
                        "ag3-l3-e2",
                        "Esperado: «n=3; total=12». Obtenido: lo mismo. Pasos: 2, máximo 4. ¿Cómo sale la eval?",
                        [
                            ("a", "Acertó el texto y respetó el presupuesto"),
                            ("b", "Falló, porque 2 pasos es demasiado poco"),
                            ("c", "Solo cuenta el texto; el presupuesto no se mira"),
                        ],
                        "a",
                        "Acertó el texto y respetó el presupuesto. Las dos condiciones importan.",
                        difficulty=2,
                    ),
                    fill(
                        "ag3-l3-e3",
                        "Completa la comparación de la eval.",
                        "La eval pasa el contenido cuando lo obtenido ___ lo esperado.",
                        [{"accepted": ["coincide con", "es igual a", "iguala"]}],
                        "La eval compara el artefacto. Para un informe, igualdad o un checker; el like no alcanza.",
                        hint="El verbo de comparar dos textos.",
                    ),
                    mc(
                        "ag3-l3-e4",
                        "Esperado y obtenido son «n=3». Van 5 pasos y el máximo es 4. ¿Qué parte aprueba?",
                        [
                            ("a", "El contenido sí; el presupuesto no"),
                            ("b", "Las dos, porque el texto coincidió"),
                            ("c", "Ninguna, porque n=3 es muy corto"),
                        ],
                        "a",
                        "Acertó el contenido pero gastó 5 pasos de 4: la eval no es un aprobado limpio.",
                        difficulty=2,
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
                            {"id": "r2", "text": "Mejorar la skill (paso «citar n»)"},
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
                "subtitle": "Prompts, MCP, skills y harness, de cero a un eval",
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
