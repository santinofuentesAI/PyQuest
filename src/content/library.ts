import { FROM_ZERO } from "./library-from-zero";
import { REASONING_GUIDES } from "./library-guides";

export type LibraryBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "code"; code: string; caption?: string }
  | { type: "callout"; tone: "tip" | "warn" | "idea" | "zero"; text: string }
  | { type: "list"; items: string[] }
  | { type: "glossary"; items: { term: string; def: string }[] };

export type LibraryArticle = {
  id: string;
  unitId: string;
  title: string;
  kicker: string;
  minutes: number;
  blocks: LibraryBlock[];
};

function a(
  id: string,
  title: string,
  kicker: string,
  minutes: number,
  blocks: LibraryBlock[]
): LibraryArticle {
  return { id, unitId: id, title, kicker, minutes, blocks };
}

export const LIBRARY: LibraryArticle[] = [
  a("u1", "¿Qué es programar?", "Fundamentos", 6, [
    { type: "p", text: "Programar es escribir instrucciones precisas para que un computador haga un trabajo. Python las lee de arriba abajo, línea a línea. Si una línea falla, las siguientes no se ejecutan." },
    { type: "h", text: "print y el laboratorio" },
    { type: "p", text: "print() manda texto a la salida. En PyQuest esa salida aparece debajo del ejercicio: es tu primer canal de comunicación con el programa." },
    { type: "code", code: 'print("Hola, PyQuest")\nprint(2 + 3)', caption: "Dos líneas, dos mensajes." },
    { type: "h", text: "Errores no son fracaso" },
    { type: "p", text: "Un SyntaxError significa que Python no entendió la gramática. Un NameError, que usaste un nombre que no existe. Lee el final del mensaje: suele decir la línea." },
    { type: "callout", tone: "tip", text: "Comenta con #: Python ignora el resto de la línea. Úsalo para dejar una nota a tu yo del futuro." },
    { type: "list", items: ["Programa = receta ejecutable", "El orden importa", "La indentación en Python no es decoración: es sintaxis"] },
  ]),
  a("u2", "Variables y tipos", "Fundamentos", 7, [
    { type: "p", text: "Una variable es una etiqueta pegada a un valor. No 'guarda una caja vacía': nombra un objeto que ya existe en memoria." },
    { type: "code", code: "edad = 28\nnombre = \"Mara\"\npi = 3.14\nlisto = True", caption: "int, str, float, bool." },
    { type: "h", text: "Tipos que verás todo el rato" },
    { type: "list", items: ["int: enteros (3, -1)", "float: decimales (3.0 también es float)", "str: texto entre comillas", "bool: True o False", "None: 'no hay valor'"] },
    { type: "p", text: "type(x) te dice el tipo. En datos, mezclar int y str ('3' + 1) explota: conviertes con int(), float() o str()." },
    { type: "callout", tone: "warn", text: "Usa nombres descriptivos, como temp_celsius. class y for son palabras reservadas y no pueden ser variables. list es una función incorporada: puedes sobrescribirla, pero perderías acceso a list() con ese nombre." },
    { type: "code", code: 'n = int("42")\nprint(n + 1)  # 43' },
  ]),
  a("u3", "Operadores", "Fundamentos", 6, [
    { type: "p", text: "Los operadores combinan valores. En análisis de datos los usarás en filtros (df[df.edad > 18]) tanto como en aritmética." },
    { type: "h", text: "Aritmética" },
    { type: "code", code: "print(7 / 2)   # 3.5  división real\nprint(7 // 2)  # 3    división entera\nprint(7 % 2)   # 1    resto\nprint(2 ** 10) # 1024 potencia" },
    { type: "h", text: "Comparar y combinar" },
    { type: "p", text: "== es igualdad; = es asignación. and, or, not combinan booleanos. is compara identidad (mismo objeto), no valor: para None usa `x is None`." },
    { type: "callout", tone: "tip", text: "Encadena: 18 <= edad < 65 es válido y se lee como en matemáticas." },
    { type: "list", items: ["Prioridad: ** antes que * / antes que + -", "Paréntesis cuando dudes", "Cuidado al comparar floats: usa un margen (abs(a-b) < 1e-9)"] },
  ]),
  a("u4", "Strings", "Fundamentos", 8, [
    { type: "p", text: "Un str es una secuencia inmutable de caracteres Unicode. No puedes hacer s[0] = 'A': construyes otro string." },
    { type: "code", code: 's = "PyQuest"\nprint(s[0], s[-1], s[1:4])  # P t yQu\nprint(s.upper(), s.lower())\nprint(f"Hola, {s}")' },
    { type: "h", text: "Métodos del día a día" },
    { type: "list", items: [".split(',') parte CSV a mano", ".strip() quita espacios de los bordes", ".replace('a','b')", ".join(lista) pega con un separador", "len(s) cuenta caracteres, no bytes"] },
    { type: "callout", tone: "idea", text: "Los f-strings son la forma moderna de interpolar. Evita 'Hola ' + nombre salvo que sea un caso mínimo." },
    { type: "p", text: "Slicing [inicio:fin] incluye inicio y excluye fin. [::-1] invierte. 'ML' * 3 es 'MLMLML'." },
  ]),
  a("u5", "Listas", "Fundamentos", 8, [
    { type: "p", text: "La lista es la colección mutable y ordenada. En datos crudos (antes de NumPy/Pandas) vivirás en listas de números o de dicts." },
    { type: "code", code: "xs = [3, 1, 4]\nxs.append(1)\nxs.sort()\nprint(xs[0], xs[-1], len(xs))\nprint([x * 2 for x in xs if x > 1])" },
    { type: "h", text: "Mutar vs copiar" },
    { type: "p", text: "b = a no copia: ambas etiquetas apuntan a la misma lista. Copia superficial: list(a) o a[:]. Para anidadas, copy.deepcopy." },
    { type: "callout", tone: "warn", text: "No borres elementos de una lista mientras la recorres con for. Recorre una copia o usa comprensión." },
    { type: "list", items: [".append / .extend / .pop / .remove", "in comprueba pertenencia (lineal, O(n))", "listas por comprensión: [f(x) for x in xs if cond]"] },
  ]),
  a("u6", "Tuplas y sets", "Fundamentos", 6, [
    { type: "p", text: "Tupla: secuencia inmutable. Útil como registro (lat, lon) o clave de diccionario. Set: conjunto sin duplicados y sin orden, búsqueda O(1)." },
    { type: "code", code: "punto = (4.2, -3.1)\nx, y = punto\nunicos = set([1, 1, 2, 3])\nprint(unicos)  # {1, 2, 3}\nprint({1, 2} | {2, 3})  # unión" },
    { type: "callout", tone: "tip", text: "Devolver varios valores en una función es devolver una tupla: return media, n" },
    { type: "list", items: ["set: | unión, & intersección, - diferencia", "Los elementos de un set deben ser hashables (no listas)", "tuple('ab') es ('a','b'), no ('ab',)"] },
  ]),
  a("u7", "Diccionarios", "Fundamentos", 7, [
    { type: "p", text: "Un dict mapea clave → valor. Es el JSON de Python y el esqueleto de muchas APIs. Las claves deben ser inmutables." },
    { type: "code", code: 'persona = {"nombre": "Mara", "xp": 120}\nprint(persona["nombre"])\nprint(persona.get("liga", "bronce"))\nfor k, v in persona.items():\n    print(k, v)' },
    { type: "h", text: "Patrones" },
    { type: "list", items: [".get(k, default) evita KeyError", ".keys / .values / .items", "conteo: d[k] = d.get(k, 0) + 1", "dict comprehension: {k: f(v) for k, v in d.items()}"] },
    { type: "callout", tone: "warn", text: "persona['liga'] explota si no existe. En limpieza de datos prefiere .get o 'k' in d." },
  ]),
  a("u8", "if / elif / else", "Fundamentos", 6, [
    { type: "p", text: "Las ramas deciden qué bloque corre. Python usa indentación (4 espacios) en lugar de llaves. elif es 'else if'." },
    { type: "code", code: "n = 7\nif n > 10:\n    etiqueta = \"alto\"\nelif n > 5:\n    etiqueta = \"medio\"\nelse:\n    etiqueta = \"bajo\"" },
    { type: "p", text: "Cualquier valor tiene un boolean implícito: 0, '', [], {}, None son falsy. El resto es truthy. Por eso `if xs:` pregunta si la lista tiene algo." },
    { type: "callout", tone: "idea", text: "Expresión condicional: etiqueta = 'alto' if n > 10 else 'otro'. Úsala cuando quepa en una línea clara." },
  ]),
  a("u9", "Bucles", "Fundamentos", 7, [
    { type: "p", text: "for recorre un iterable. while se repite mientras una condición sea verdadera. range(n) produce 0..n-1." },
    { type: "code", code: "for i, nombre in enumerate(['Ana', 'Luis'], start=1):\n    print(i, nombre)\n\nfor a, b in zip([1, 2], ['x', 'y']):\n    print(a, b)" },
    { type: "list", items: ["break sale del bucle", "continue salta a la siguiente vuelta", "for/else: el else corre si no hubo break", "Nunca while True sin una salida"] },
    { type: "callout", tone: "warn", text: "En datos masivos, un for de Python puro es lento. Ahí entra NumPy (vectorizar) o Pandas (operaciones de columna)." },
  ]),
  a("u10", "Funciones", "Fundamentos", 8, [
    { type: "p", text: "Una función empaqueta un cálculo con nombre, parámetros y un return. Si omites return, Python devuelve None." },
    { type: "code", code: "def media(xs):\n    \"\"\"Promedio de una lista no vacía.\"\"\"\n    return sum(xs) / len(xs)\n\nprint(media([2, 4, 6]))" },
    { type: "h", text: "Argumentos" },
    { type: "list", items: ["Posicionales: media(xs)", "Por nombre: media(xs=[1, 2])", "Default: def f(n=3)", "*args y **kwargs recogen el resto", "Nunca uses una lista mutable como default (def f(xs=[]))"] },
    { type: "callout", tone: "tip", text: "Una función debe hacer una cosa. Si necesitas un comentario de tres líneas para explicarla, divídela." },
  ]),
  a("u11", "Errores", "Fundamentos", 6, [
    { type: "p", text: "Las excepciones interrumpen el flujo. try/except las atrapa. Evita except Exception vacío: tragarte errores esconde bugs." },
    { type: "code", code: "try:\n    n = int(texto)\nexcept ValueError:\n    n = None  # no era un entero" },
    { type: "list", items: ["ValueError: valor con el tipo correcto pero contenido inválido", "TypeError: operación entre tipos incompatibles", "KeyError / IndexError: clave o índice inexistente", "FileNotFoundError: ruta mal"] },
    { type: "callout", tone: "idea", text: "raise ValueError('edad negativa') documenta un contrato. En datos, decide: ¿imputas, descartas o abortas?" },
  ]),
  a("u12", "OOP", "Fundamentos", 7, [
    { type: "p", text: "Una clase describe un tipo; un objeto es una instancia con estado (__init__) y comportamiento (métodos). self es esa instancia." },
    { type: "code", code: "class Contador:\n    def __init__(self, n=0):\n        self.n = n\n    def tick(self):\n        self.n += 1\n\nc = Contador()\nc.tick()\nprint(c.n)" },
    { type: "p", text: "En análisis no hace falta una jerarquía enorme. Un dataclass o un dict suele bastar. OOP brilla cuando el estado y las reglas viajan juntos (un modelo con .fit / .predict)." },
    { type: "callout", tone: "tip", text: "__repr__ hace que print(obj) sea útil al depurar." },
  ]),
  a("u13", "Módulos y pip", "Fundamentos", 6, [
    { type: "p", text: "import trae código de otro archivo o librería. El ecosistema de datos (numpy, pandas, matplotlib, sklearn) se instala con pip; en PyQuest, Pyodide ya trae los tres primeros." },
    { type: "code", code: "import math\nfrom math import sqrt\nimport numpy as np  # convención" },
    { type: "list", items: ["import x: usa x.nombre", "from x import y: usa y", "as crea un alias", "No hagas from numpy import *: ensucia el espacio de nombres"] },
    { type: "callout", tone: "warn", text: "Nunca ejecutes pip a ciegas en producción. Fija versiones (requirements.txt) cuando salgas del navegador." },
  ]),
  a("p0", "Proyecto: stats de bolsillo", "Fundamentos", 5, [
    { type: "p", text: "Un proyecto cierra el bloque: juntas variables, listas y funciones en algo que podrías enseñar. Aquí: un resumen numérico (media y máximo)." },
    { type: "code", code: "def resumen(xs):\n    return {'media': sum(xs) / len(xs), 'maximo': max(xs)}" },
    { type: "callout", tone: "idea", text: "Documenta la entrada (lista no vacía de números) y un ejemplo. Eso ya es portafolio." },
    { type: "list", items: ["Prueba con [2, 4, 6]", "¿Qué pasa con una lista de un elemento?", "¿Y si llega vacía? (decidir: error o None)"] },
  ]),
  a("u14", "Arrays de NumPy", "NumPy", 8, [
    { type: "p", text: "np.array guarda datos homogéneos en un bloque contiguo. Por eso las operaciones son rápidas: ocurren en C, no en un for de Python." },
    { type: "code", code: "import numpy as np\na = np.array([1, 2, 3])\nprint(a.shape, a.dtype, a.ndim)\nprint(a * 2)" },
    { type: "h", text: "Crear arrays" },
    { type: "list", items: ["np.zeros(n), np.ones((f, c))", "np.arange(0, 1, 0.1)", "np.linspace(0, 1, 5)", "np.random.default_rng(0).normal(size=100)"] },
    { type: "callout", tone: "warn", text: "Una lista de listas no es un array. El dtype se infiere: mezcla int y float y todo se vuelve float." },
  ]),
  a("u15", "Indexado y slicing", "NumPy", 7, [
    { type: "p", text: "En 1D, el slicing se parece al de listas. En 2D usas [fila, columna]. Un boolean mask selecciona con una condición." },
    { type: "code", code: "import numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m[0, 1])      # 2\nprint(m[:, 1])      # columna 1\nprint(m[m > 3])     # [4 5 6]" },
    { type: "callout", tone: "tip", text: "m[0] es la primera fila. m[:, 0] es la primera columna. El ':' significa 'todas'." },
    { type: "p", text: "Cuidado: un slice de NumPy suele ser una vista, no una copia. Cambiar la vista cambia el original. .copy() cuando necesites independencia." },
  ]),
  a("u16", "Vectorización y broadcasting", "NumPy", 8, [
    { type: "p", text: "Vectorizar es operar sobre todo el array de una vez. Broadcasting alinea formas distintas: un vector de 3 se suma a cada fila de 2×3." },
    { type: "code", code: "import numpy as np\nx = np.array([1.0, 2.0, 3.0])\nprint(np.sqrt(x))\nprint(x[:, None] + np.array([10, 20]))  # 3×2" },
    { type: "callout", tone: "idea", text: "Si escribiste un for sobre i in range(len(x)), pregúntate si hay una ufunc (np.exp, np.where, np.clip)." },
    { type: "list", items: ["Formas compatibles: de atrás hacia adelante, 1 o igual", "np.newaxis o None añade un eje", "Errores de broadcasting: lee las shapes en el mensaje"] },
  ]),
  a("u17", "Funciones estadísticas", "NumPy", 6, [
    { type: "p", text: "mean, std, median, percentile, min, max, argmax. El argumento axis elige el eje: 0 baja por filas (resumen de columnas)." },
    { type: "code", code: "import numpy as np\nx = np.array([[1, 2], [3, 4]], dtype=float)\nprint(x.mean())       # global\nprint(x.mean(axis=0))  # por columna\nprint(np.percentile(x, 50))" },
    { type: "callout", tone: "warn", text: "std en NumPy divide por n, no por n-1. Para la muestral: np.std(x, ddof=1)." },
  ]),
  a("u18", "Reshape y filtros", "NumPy", 6, [
    { type: "p", text: "reshape cambia la forma sin copiar datos si puede. -1 deja que NumPy calcule ese eje. Los filtros booleanos y np.where construyen selecciones." },
    { type: "code", code: "import numpy as np\na = np.arange(6).reshape(2, 3)\nprint(a.ravel())  # 1D\nprint(np.where(a > 2, a, 0))" },
    { type: "list", items: ["reshape(3, 2) exige 6 celdas", "transpose / .T intercambia ejes", "clip(min, max) recorta valores locos (outliers a mano)"] },
  ]),
  a("p1", "Proyecto: temperaturas", "NumPy", 5, [
    { type: "p", text: "Lees un CSV pequeño, pasas la columna a números y reportas una media. El hábito: archivo → array/tabla → un número que puedes defender." },
    { type: "callout", tone: "idea", text: "Redondea al presentar (round(media, 1)) pero calcula con toda la precisión." },
    { type: "list", items: ["¿Hay nulos?", "¿Unidades °C?", "Un histograma mental: ¿un outlier 999?"] },
  ]),
  a("u19", "Matplotlib básico", "Visualización", 8, [
    { type: "p", text: "Un gráfico es un argumento. Matplotlib dibuja sobre una Figure y uno o más Axes. Las cuatro familias: línea, barras, histograma, scatter." },
    { type: "code", code: "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [1, 4, 2], marker='o')\nax.set_title('Serie')\nax.set_xlabel('t')\nax.set_ylabel('valor')" },
    { type: "callout", tone: "tip", text: "En PyQuest, plt se captura a PNG. En un notebook local, plt.show() abre una ventana." },
    { type: "list", items: ["plot: evolución", "bar: categorías", "hist: distribución", "scatter: dos variables continuas"] },
  ]),
  a("u20", "Personalización", "Visualización", 6, [
    { type: "p", text: "Título, etiquetas, leyenda, límites, color y tamaño de fuente no son adorno: son accesibilidad. Un eje sin unidades miente." },
    { type: "code", code: "ax.set_xlim(0, 10)\nax.legend()\nax.grid(True, alpha=0.3)\nfig.tight_layout()" },
    { type: "callout", tone: "warn", text: "Elige paletas distinguibles en escala de grises. Evita arcoíris para datos ordenados." },
  ]),
  a("u21", "Seaborn", "Visualización", 6, [
    { type: "p", text: "Seaborn se apoya en Matplotlib y entiende DataFrames: sns.histplot, boxplot, heatmap, relplot. Menos código para gráficos estadísticos." },
    { type: "p", text: "La gramática: data=df, x='col', y='col', hue='grupo'. El hue colorea por categoría y hace el gráfico comparativo." },
    { type: "callout", tone: "idea", text: "Empieza en Seaborn; baja a ax.* de Matplotlib cuando necesites un detalle fino." },
    { type: "list", items: ["histplot / kdeplot: forma de una variable", "boxplot / violin: comparaciones", "heatmap: matrices (correlación)"] },
  ]),
  a("u22", "Storytelling visual", "Visualización", 6, [
    { type: "p", text: "Antes de dibujar, escribe la frase que el gráfico debe demostrar. 'Las ventas suben' no es un insight; 'las ventas de Q3 duplican Q1 en el canal web' sí." },
    { type: "list", items: ["Un mensaje por gráfico", "Ordena barras por valor, no por alfabeto (salvo que el orden sea ordinal)", "Anota el número clave encima de la barra", "Quita tinta de adorno: bordes, 3D, fondos"] },
    { type: "callout", tone: "tip", text: "El título puede ser la conclusión, no el nombre de la variable." },
  ]),
  a("p2", "Proyecto: dashboard estático", "Visualización", 5, [
    { type: "p", text: "Dos paneles en una figura (subplots) cuentan más que uno suelto: distribución + comparación. Es el embrión de un informe." },
    { type: "code", code: "fig, axes = plt.subplots(1, 2, figsize=(8, 3))\naxes[0].hist(x)\naxes[1].bar(cats, vals)" },
  ]),
  a("u23", "Series y DataFrames", "Pandas", 8, [
    { type: "p", text: "Una Series es una columna con índice. Un DataFrame es un conjunto de Series alineadas. Es la mesa de trabajo del analista." },
    { type: "code", code: "import pandas as pd\ns = pd.Series([10, 12, 9], name='temp')\ndf = pd.DataFrame({'temp': s, 'ciudad': ['A', 'A', 'B']})\nprint(df.head(), df.shape, df.dtypes)" },
    { type: "callout", tone: "tip", text: "Siempre mira .head(), .info() y .describe() al abrir un CSV. Es tu ritual anti-sorpresa." },
  ]),
  a("u24", "Selección e indexado", "Pandas", 7, [
    { type: "p", text: "df['col'] → Series. df[['col']] → DataFrame. loc selecciona por etiqueta; iloc por posición. Los filtros booleanos son el WHERE de SQL." },
    { type: "code", code: "df.loc[df.temp > 10, ['ciudad', 'temp']]\ndf.iloc[0:3, 0]" },
    { type: "callout", tone: "warn", text: "Encadenar df[df.x>1]['y'] = 0 puede no escribir (SettingWithCopy). Usa .loc[filas, col] = valor." },
  ]),
  a("u25", "Limpieza de datos", "Pandas", 8, [
    { type: "p", text: "Los datos reales llegan sucios: nulos, duplicados, tipos mal inferidos, categorías con espacios. Limpiar es una decisión, no un botón mágico." },
    { type: "list", items: ["isna / dropna / fillna", "drop_duplicates", "astype", "str.strip().str.lower() en columnas de texto", "clip o winsorize para outliers — o investiga antes de borrar"] },
    { type: "callout", tone: "idea", text: "Anota lo que hiciste. Un nulo imputado con la mediana cambia el relato: dilo en el informe." },
  ]),
  a("u26", "Transformación", "Pandas", 7, [
    { type: "p", text: "groupby + agg resume. merge/join combina tablas. pivot_table reordena. assign / eval crean columnas nuevas." },
    { type: "code", code: "df.groupby('ciudad')['temp'].mean()\ndf.merge(otras, on='id', how='left')" },
    { type: "list", items: ["how='left' conserva la tabla base", "validate en merge detecta claves duplicadas", "agg({'temp': ['mean', 'std']}) varias métricas"] },
  ]),
  a("u27", "Series temporales", "Pandas", 6, [
    { type: "p", text: "Cuando el índice es un DatetimeIndex, puedes resamplear (D, W, M), desplazar (shift) y calcular rolling means." },
    { type: "code", code: "df['fecha'] = pd.to_datetime(df['fecha'])\ns = df.set_index('fecha')['ventas']\nprint(s.resample('M').sum())\nprint(s.rolling(7).mean())" },
    { type: "callout", tone: "warn", text: "Zonas horarias y formatos día/mes se comen horas. Especifica format= o dayfirst= con conciencia." },
  ]),
  a("p3", "Proyecto: EDA mini-Titanic", "Pandas", 5, [
    { type: "p", text: "EDA = exploratory data analysis: preguntas, tablas, un gráfico, una frase. Supervivencia media por clase es un clásico porque mezcla categoría y tasa." },
    { type: "list", items: ["¿Cuántas filas? ¿Nulos en edad?", "Tasa global vs por pclass / sex", "Una hipótesis: 'viajar en 1ª correlaciona con sobrevivir' — y el número que la sostiene"] },
  ]),
  a("u28", "Estadística descriptiva", "Estadística", 7, [
    { type: "p", text: "Media, mediana, moda, rango, IQR, varianza. La media se deja arrastrar por extremos; la mediana no. Por eso cuentas ambas." },
    { type: "code", code: "import numpy as np\nx = np.array([2, 3, 9, 10, 11])\nprint(x.mean(), np.median(x), np.percentile(x, [25, 75]))" },
    { type: "callout", tone: "tip", text: "Un boxplot es el IQR dibujado. Si no sabes explicarlo, no lo pongas en la slide." },
  ]),
  a("u29", "Distribuciones", "Estadística", 7, [
    { type: "p", text: "Una distribución es un modelo de azar. Normal (campana), Bernoulli (0/1), binomial, uniforme. No 'los datos son normales': a veces se parecen, a veces no." },
    { type: "list", items: ["Histograma + densidad para ver forma", "Asimetría a la derecha: media > mediana (ingresos)", "La normal no es obligatoria para todo; el TLC habla de medias, no de cada observación"] },
    { type: "callout", tone: "idea", text: "Simula: rng.normal(0, 1, 1000) y míralo. La intuición nace de ver muchos dibujos." },
  ]),
  a("u30", "Correlación y covarianza", "Estadística", 6, [
    { type: "p", text: "La correlación de Pearson mide asociación lineal entre -1 y 1. No implica causalidad. Un scatter lo verifica: a veces el r es alto por un outlier." },
    { type: "code", code: "np.corrcoef(x, y)[0, 1]\ndf[['a', 'b', 'c']].corr()" },
    { type: "callout", tone: "warn", text: "Pearson es sensible a extremos. Spearman (rangos) es más robusto a relaciones monótonas no lineales." },
  ]),
  a("u31", "Pruebas de hipótesis", "Estadística", 8, [
    { type: "p", text: "H0 es el 'no pasa nada'. Un p-valor pequeño dice: si H0 fuera cierta, este resultado sería raro. No dice P(H0 es cierta)." },
    { type: "list", items: ["Elige el test según el diseño (t de dos grupos, chi-cuadrado, etc.)", "Fija α (0.05 es costumbre, no magia)", "Intervalo de confianza acompaña al p: tamaño del efecto", "Múltiples tests inflan falsos positivos"] },
    { type: "callout", tone: "idea", text: "Reporta la diferencia y su intervalo, no solo 'es significativo'." },
  ]),
  a("p4", "Proyecto: informe estadístico", "Estadística", 5, [
    { type: "p", text: "Un informe corto: pregunta, números (media/mediana), un gráfico, una limitación. La limitación es lo que te hace creíble." },
  ]),
  a("u32", "¿Qué es Machine Learning?", "Machine Learning", 8, [
    { type: "p", text: "ML aprende una función a partir de ejemplos. Supervisado: tienes y (etiqueta). No supervisado: solo X (grupos, reducción). El modelo no 'entiende': ajusta parámetros para bajar un error." },
    { type: "list", items: ["Train: aprende", "Validación: elige hiperparámetros", "Test: un número honesto al final, una sola vez", "Baseline primero: media, modelo lineal, regla a mano"] },
    { type: "callout", tone: "warn", text: "Si el test se usa para decidir el modelo, dejó de ser test. Eso se llama filtrar información." },
  ]),
  a("u33", "Preprocesamiento", "Machine Learning", 7, [
    { type: "p", text: "Escala (StandardScaler), one-hot de categorías, imputar nulos, recortar texto. El preproceso se ajusta en train y se aplica a val/test (fit vs transform)." },
    { type: "code", code: "from sklearn.preprocessing import StandardScaler\nsc = StandardScaler()\nXtr = sc.fit_transform(X_train)\nXte = sc.transform(X_test)  # sin volver a fit" },
    { type: "callout", tone: "tip", text: "Pipeline de sklearn encadena pasos y evita fugas. Úsalo apenas salgas del juguete." },
  ]),
  a("u34", "Regresión lineal y logística", "Machine Learning", 8, [
    { type: "p", text: "Lineal: predice un número como combinaciones ponderadas de X. Logística: la misma receta, pasada por una sigmoide, para una probabilidad de clase." },
    { type: "code", code: "p = 1 / (1 + np.exp(-(w * x + b)))  # sigmoide" },
    { type: "list", items: ["MSE para regresión", "Log-loss para logística", "Los coeficientes se interpretan (con escalas comparables)", "No lineal: añade features (x²) o cambia de modelo"] },
  ]),
  a("u35", "Árboles y Random Forest", "Machine Learning", 7, [
    { type: "p", text: "Un árbol parte el espacio con preguntas sí/no. Fácil de dibujar, fácil de sobreajustar. Un bosque (Random Forest) vota muchos árboles en subconjuntos y suele generalizar mejor." },
    { type: "callout", tone: "idea", text: "max_depth pequeño es un regularizador. feature_importances_ es una pista, no una causalidad." },
  ]),
  a("u36", "KNN y SVM", "Machine Learning", 7, [
    { type: "p", text: "KNN clasifica por los k vecinos más cercanos: simple, perezoso (no 'entrena' casi), sensible a la escala. SVM busca el hiperplano con mayor margen; con kernel RBF captura no linealidades." },
    { type: "callout", tone: "warn", text: "Sin estandarizar, KNN y SVM se dejan llevar por la variable con más rango (ingresos vs edad)." },
  ]),
  a("u37", "K-Means", "Machine Learning", 6, [
    { type: "p", text: "No supervisado: reparte puntos en k grupos minimizando distancia a centroides. k lo eliges tú (codo, silueta). Los grupos no tienen etiqueta semántica: tú las interpretas." },
    { type: "list", items: ["Escala antes", "Varias inicializaciones (n_init)", "k-means asume blobs más o menos esféricos"] },
  ]),
  a("u38", "Evaluación", "Machine Learning", 8, [
    { type: "p", text: "Accuracy miente con clases desbalanceadas (99% 'no fraude'). Mira precision, recall, F1, ROC-AUC, matriz de confusión. En regresión: RMSE, MAE, R²." },
    { type: "code", code: "acc = (y_pred == y_true).mean()\n# mejor: classification_report, confusion_matrix" },
    { type: "callout", tone: "tip", text: "Elige la métrica según el coste del error: ¿es peor un falso negativo (enfermedad) o un falso positivo?" },
  ]),
  a("p5", "Proyecto: modelo predictivo", "Machine Learning", 5, [
    { type: "p", text: "Empieza por un baseline (umbral, media). Mide. Luego un modelo. Si no ganas al baseline, no hay victoria. Documenta X, y, split y la métrica." },
  ]),
  a("u39", "Redes neuronales", "Deep Learning", 8, [
    { type: "p", text: "Una neurona: producto punto + sesgo + no linealidad (ReLU, sigmoide). Una capa apila neuronas. La red compone funciones; por eso aproxima cosas raras que una recta no puede." },
    { type: "code", code: "import numpy as np\nz = X @ W + b\nh = np.maximum(z, 0)  # ReLU" },
    { type: "callout", tone: "idea", text: "En PyQuest practicamos el álgebra con NumPy: es el mismo forward que Keras esconde en model.fit." },
  ]),
  a("u40", "Keras / PyTorch intro", "Deep Learning", 6, [
    { type: "p", text: "Keras (tf.keras) es un API de alto nivel: Sequential, Dense, compile, fit. PyTorch es más explícito (tensores, autograd, bucles de train). Las ideas son las mismas: forward, loss, backward, update." },
    { type: "list", items: ["Capa Dense = neuronas totalmente conectadas", "compile: optimizer + loss + metrics", "fit: épocas sobre batches", "En el navegador no cargamos TF; el mapa conceptual sí"] },
  ]),
  a("u41", "Entrenamiento", "Deep Learning", 7, [
    { type: "p", text: "La loss mide el error. El gradiente dice hacia dónde bajar. El learning rate es el tamaño del paso. Demasiado grande: diverges. Demasiado chico: tardas una eternidad." },
    { type: "code", code: "w = w - lr * grad  # descenso por gradiente" },
    { type: "list", items: ["Batch: compromiso entre ruido y velocidad", "Época: una pasada por el train", "Overfitting: train baja, val sube — early stopping, dropout, más datos"] },
  ]),
  a("u42", "Imágenes y MNIST", "Deep Learning", 6, [
    { type: "p", text: "Una imagen en escala de grises 28×28 es un tensor (28, 28) o un vector de 784. MNIST son dígitos escritos a mano: el 'hola mundo' de visión. Las CNN (convoluciones) respetan la geometría local; un Dense aplanado también funciona, peor." },
    { type: "callout", tone: "tip", text: "Normaliza píxeles a [0, 1] o estandariza. Los enteros 0–255 confunden al optimizador." },
  ]),
  a("u43", "NLP básico", "Deep Learning", 7, [
    { type: "p", text: "El texto se vuelve números: tokens (split, subwords), bag-of-words / TF-IDF, o embeddings densos. Un modelo preentrenado ya vio mucho lenguaje; tú lo adaptas o lo consultas." },
    { type: "code", code: 'texto = "hola hola mundo"\ntokens = texto.split()\nvocab = set(tokens)  # 2 tipos' },
    { type: "callout", tone: "warn", text: "Lowercase y quitar signos borra señales (¡No! vs no). Mide el preproceso como una hipótesis más." },
  ]),
  a("p6", "Proyecto final: clasificador toy", "Deep Learning", 5, [
    { type: "p", text: "Un perceptrón a mano sobre 4 puntos. Si puedes escribir pred = 1 if x + y >= 1 else 0 y contar aciertos, entendiste la idea: frontera + evaluación." },
  ]),
  a("boss1", "Boss: EDA + insight", "Boss Level", 5, [
    { type: "p", text: "Nivel jefe: un CSV, una pregunta, un número verdadero y una frase que no sobrevenda. Limpia, resume, afirma solo lo que los datos sostienen." },
    { type: "list", items: ["Chequea totales (sumas que cierran)", "Una tabla y un gráfico bastan", "Escribe la limitación (muestra chica, sin causalidad)"] },
  ]),
  a("boss2", "Boss: visualiza y modela", "Boss Level", 5, [
    { type: "p", text: "Une un baseline numérico (accuracy, RMSE) con la imagen mental del error. Un 75% de acierto no es 'el modelo es bueno' hasta que comparas con el azar o la clase mayoritaria." },
  ]),
  a("boss3", "Boss: portafolio", "Boss Level", 5, [
    { type: "p", text: "El pipeline de siempre: limpiar → explorar → modelar → comunicar. Si puedes nombrar los cuatro pasos con un ejemplo tuyo, ya no eres principiante: eres alguien que cierra el ciclo." },
    { type: "code", code: "pasos = ['limpiar', 'explorar', 'modelar', 'comunicar']" },
  ]),
];

export const LIBRARY_BY_ID = new Map(LIBRARY.map((x) => [x.id, x]));

export function getLibraryArticle(id: string) {
  const article = LIBRARY_BY_ID.get(id);
  if (!article) return undefined;
  const extra = FROM_ZERO[id];
  return {
    ...article,
    minutes: Math.min(18, article.minutes + 6),
    blocks: [...(extra ?? []), { type: "h" as const, text: "Un poco más de detalle" }, ...article.blocks, ...(REASONING_GUIDES[id] ?? [])],
  };
}
