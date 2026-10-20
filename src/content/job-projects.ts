import type { CodeTest } from "@/lib/types";

export type JobProject = {
  id: string;
  sectionId: string;
  title: string;
  company: string;
  salaryUsd: number;
  hintCostUsd: number;
  /** Typewriter line over the office scene. */
  officeLine: string;
  /** Personalized line over the laptop scene. */
  laptopLine: string;
  moduleName: string;
  deliverable: string;
  summary: string;
  starterCode: string;
  files?: Record<string, string>;
  tests: CodeTest[];
  expectedStdout?: string;
  packages?: string[];
  capturePlots?: boolean;
  requirePlot?: boolean;
  hints: string[];
};

export const JOB_PROJECTS: JobProject[] = [
  {
    id: "job-s0-caja",
    sectionId: "s0",
    title: "Cierre de caja · Café Nube",
    company: "Café Nube",
    salaryUsd: 180,
    hintCostUsd: 3,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El POS se cayó a las 18:58. El turno de la tarde quedó en una lista (producto, unidades). Cierre con IVA del 8%: subtotal, impuesto, total y cuántas unidades salieron. Sin Excel.",
    moduleName: "Fundamentos absolutos",
    deliverable: "el cierre de un turno real: precios por producto, cantidades y IVA del 8%",
    summary: "Un diccionario de precios, un turno con cantidades y el ticket con impuesto.",
    starterCode: `precios = {"latte": 4.5, "muffin": 2.0, "agua": 1.5, "cookie": 1.25}
# Lo que exportó la caja, turno 14:00–19:00: (producto, unidades)
lineas = [("latte", 18), ("muffin", 7), ("agua", 11), ("cookie", 4), ("latte", 3)]

subtotal = 0
iva = 0
total = 0
unidades = 0
`,
    tests: [
      { assert: "abs(subtotal - 130.0) < 1e-9", message: "subtotal es la suma de precio × unidades de cada línea (130)." },
      { assert: "unidades == 43", message: "unidades es la suma de las cantidades del turno (43)." },
      { assert: "abs(iva - 10.4) < 1e-9", message: "iva = subtotal * 0.08" },
      { assert: "abs(total - 140.4) < 1e-9", message: "total = subtotal + iva" },
    ],
    hints: [
      "Recorre lineas. Cada elemento es (producto, cantidad): suma precios[producto] * cantidad al subtotal y la cantidad a unidades.",
      "Después del bucle: iva = subtotal * 0.08 y total = subtotal + iva. No redondees.",
    ],
  },
  {
    id: "job-s0-triage",
    sectionId: "s0",
    title: "Triage de tickets · Mesa de ayuda",
    company: "Nimbus Support",
    salaryUsd: 220,
    hintCostUsd: 3,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Standup en 20 minutos y la cola de anoche sigue mezclada. Urgente solo si el asunto, en minúsculas, trae «caído», «down» o «500». El resto es normal. Quiero los dos conteos.",
    moduleName: "Fundamentos absolutos",
    deliverable: "el conteo de la cola real: incidentes de servicio frente a pedidos normales",
    summary: "Asuntos de soporte, minúsculas y una regla de prioridad.",
    starterCode: `tickets = [
    "Pagos: el servidor está CAÍDO desde las 18:12",
    "Web: cambiar el logo del footer a la versión 2026",
    "API down en producción, el checkout no responde",
    "Blog: la tipografía de los artículos se ve rara en el móvil",
    "Checkout: no carga, error 500 al pagar con tarjeta",
]

urgentes = 0
normales = 0
# Urgente si el texto en minúsculas contiene "caído", "down" o "500".
`,
    tests: [
      { assert: "urgentes == 3", message: "Hay 3 tickets urgentes (caído, down, 500)." },
      { assert: "normales == 2", message: "Los otros 2 son normales." },
    ],
    hints: [
      "Haz un for sobre tickets. Baja el texto con .lower() antes de buscar.",
      "Si cualquiera de las palabras clave está en el texto, suma 1 a urgentes; si no, a normales.",
    ],
  },
  {
    id: "job-s1-sensores",
    sectionId: "s1",
    title: "Alertas de frío · Almacén 4",
    company: "FríoAndes",
    salaryUsd: 320,
    hintCostUsd: 4,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El túnel 4 guarda vacunas entre 2 y 8 °C. Estas son las lecturas de hoy, una por hora. Calidad marca excursión todo lo que pase de media + 2 desviaciones. Pásame ese corte y las lecturas que se salen. Vectorizado.",
    moduleName: "NumPy",
    deliverable: "las lecturas del túnel que se salen de media + 2 desviaciones",
    summary: "Un día de sensor, media, desviación y una máscara.",
    starterCode: `import numpy as np

# °C, una lectura por hora. El túnel debería vivir cerca de 3 °C.
temps = np.array(
    [3.2, 3.0, 2.9, 3.1, 3.0, 2.8, 3.3, 12.4, 3.1, 2.9, 3.0, 2.7, 11.8, 3.2, 2.9, 3.0],
    dtype=float,
)

media = None
desv = None
umbral = None
anomalias = None  # array con las lecturas por encima del umbral
`,
    tests: [
      { assert: "abs(float(media) - float(temps.mean())) < 1e-9", message: "media debe ser temps.mean()." },
      { assert: "abs(float(desv) - float(temps.std())) < 1e-9", message: "desv debe ser temps.std()." },
      { assert: "abs(float(umbral) - float(media + 2 * desv)) < 1e-9", message: "umbral = media + 2 * desv." },
      { assert: "np.array_equal(anomalias, temps[temps > temps.mean() + 2 * temps.std()])", message: "Filtra temps > umbral. En este día se salen 12.4 y 11.8." },
    ],
    hints: [
      "media = temps.mean() y desv = temps.std(). El umbral es media + 2 * desv.",
      "Máscara: temps > umbral. Luego anomalias = temps[mascara].",
    ],
  },
  {
    id: "job-s1-embeddings",
    sectionId: "s1",
    title: "Normaliza embeddings · Search",
    company: "BuscaYa",
    salaryUsd: 360,
    hintCostUsd: 4,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El ranking mezcla tf-idf del título, tf-idf del cuerpo y una columna que el crawler dejó fija en 1. Z-score por columna. Si una columna no varía, déjala en 0: si no, el score se va a infinito.",
    moduleName: "NumPy",
    deliverable: "la matriz de búsqueda en z-score por columna, con la columna rota en ceros",
    summary: "Cuatro consultas, dos escalas reales y una columna que no varía.",
    starterCode: `import numpy as np

# Filas = consultas. Columnas = título, cuerpo, flag roto (siempre 1).
X = np.array([
    [10.0, 200.0, 1.0],
    [12.0, 180.0, 1.0],
    [11.0, 220.0, 1.0],
    [9.0, 190.0, 1.0],
], dtype=float)

# Z-score por columna. Si la desviación es 0, esa columna queda en 0.
Z = None
`,
    tests: [
      { assert: "Z.shape == X.shape", message: "Z debe tener la misma forma que X." },
      { assert: "np.allclose(Z.mean(axis=0), 0, atol=1e-8)", message: "La media de cada columna de Z debe ser ~0." },
      { assert: "np.allclose(Z[:, :2].std(axis=0), 1, atol=1e-8)", message: "Título y cuerpo deben quedar con desviación ~1." },
      { assert: "np.allclose(Z[:, 2], 0)", message: "La columna que no varía tiene que quedar en 0, no en NaN." },
      {
        assert: "np.allclose(Z, (X - X.mean(axis=0)) / np.where(X.std(axis=0) == 0, 1, X.std(axis=0)))",
        message: "Z es el z-score por columna. Donde la desviación es 0 no dividas: el resultado es 0.",
      },
    ],
    hints: [
      "medias = X.mean(axis=0) y desvs = X.std(axis=0). axis=0 es por columna.",
      "Divide solo donde desvs > 0. En la columna de unos, escribe 0. np.where(desvs == 0, 1, desvs) evita el infinito y, como la media también es 1, esa columna queda en 0.",
    ],
  },
  {
    id: "job-s2-ventas",
    sectionId: "s2",
    title: "Barras de ventas · Q3",
    company: "Mercado Lila",
    salaryUsd: 410,
    hintCostUsd: 5,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "La slide de las 10 es solo Q3: julio, agosto y septiembre, en pesos. Barras con título exacto «Ventas Q3» y el mes que más vendió, con su monto. Marketing no abre un notebook.",
    moduleName: "Visualización",
    deliverable: "la barra de Q3 y el mes pico, con el título que va en la slide",
    summary: "Tres meses reales, el máximo y un gráfico con título.",
    starterCode: `import matplotlib.pyplot as plt

meses = ["Jul", "Ago", "Sep"]
ventas = [18_420, 22_150, 19_680]

mes_pico = None
venta_pico = None

# plt.bar(meses, ventas) y título exacto "Ventas Q3".
`,
    tests: [
      { assert: "mes_pico == 'Ago'", message: "Agosto es el mes con más ventas." },
      { assert: "venta_pico == 22150", message: "El pico de agosto es 22150." },
      { assert: "plt.gca().get_title() == 'Ventas Q3'", message: "El gráfico tiene que llamarse exactamente Ventas Q3." },
    ],
    capturePlots: true,
    requirePlot: true,
    hints: [
      "venta_pico = max(ventas) y mes_pico = meses[ventas.index(venta_pico)].",
      "plt.bar(meses, ventas) y plt.title('Ventas Q3'). El runtime captura la figura.",
    ],
  },
  {
    id: "job-s2-campanas",
    sectionId: "s2",
    title: "Lift de campaña · Ads",
    company: "ClickSur",
    salaryUsd: 450,
    hintCostUsd: 5,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Finanzas no cree la campaña B. Son altas diarias de la semana pasada, control contra B. Quiero las dos curvas en la misma figura y el lift del promedio: cuánto por ciento sube B respecto al control.",
    moduleName: "Visualización",
    deliverable: "las dos curvas de la semana y el lift porcentual del promedio de B",
    summary: "Una semana de altas, dos líneas y el lift contra el control.",
    starterCode: `import matplotlib.pyplot as plt

# Altas por día, lunes a domingo.
control = [120, 118, 125, 130, 121, 119, 127]
campana_b = [140, 138, 150, 146, 142, 149, 144]

lift_pct = None  # ((media_b - media_control) / media_control) * 100

# plt.plot de las dos listas, en la misma figura.
`,
    tests: [
      {
        assert: "abs(float(lift_pct) - ((sum(campana_b)/len(campana_b) - sum(control)/len(control)) / (sum(control)/len(control)) * 100)) < 1e-6",
        message: "Usa las medias de esas listas. El lift es (media de B − media del control) / media del control × 100, sin redondear antes de calcular.",
      },
    ],
    capturePlots: true,
    requirePlot: true,
    hints: [
      "media_c = sum(control)/len(control) y lo mismo para campana_b.",
      "lift_pct = (media_b - media_c) / media_c * 100. Grafica las dos listas con plt.plot.",
      "plt.plot(control) y plt.plot(campana_b) en la misma figura. El runtime captura el gráfico.",
    ],
  },
  {
    id: "job-s3-leads",
    sectionId: "s3",
    title: "Limpieza de leads · CRM",
    company: "PipeNorth",
    salaryUsd: 520,
    hintCostUsd: 5,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Sales volcó la feria al CRM: hay filas sin correo y ciudades en blanco. Tira quien no tenga email y, si la ciudad viene vacía, pon Desconocida. El resto de columnas no se toca. Quiero cuántos leads quedan y el recuento por ciudad.",
    moduleName: "Pandas",
    deliverable: "la lista de la feria sin correos vacíos y con la ciudad rellena",
    summary: "Un CSV de verdad: tiras emails vacíos y marcas la ciudad que faltó.",
    starterCode: `import pandas as pd

leads = pd.read_csv("leads.csv")

# 1) Elimina filas sin email
# 2) Rellena ciudad vacía con "Desconocida"
# 3) n_validos = número de filas resultantes
n_validos = None
ciudades = None  # value_counts() de la columna ciudad
`,
    files: {
      "leads.csv": `nombre,email,ciudad,fuente
Ana,ana@nube.io,Lima,web
Bruno,,Bogotá,feria
Cata,cata@nube.io,,referido
Dani,dani@nube.io,Lima,web
Eva,,,instagram
Luis,luis@nube.io,Quito,web
`,
    },
    tests: [
      { assert: "int(n_validos) == 4", message: "Sin correo se van Bruno y Eva. Quedan 4 leads." },
      {
        assert: "int(ciudades.get('Desconocida', 0)) == 1",
        message: "Cata no tenía ciudad: debe contar como Desconocida.",
      },
    ],
    hints: [
      "leads = leads.dropna(subset=['email']) y luego fillna en ciudad.",
      "n_validos = len(leads) y ciudades = leads['ciudad'].value_counts().",
    ],
  },
  {
    id: "job-s3-pedidos",
    sectionId: "s3",
    title: "Top categoría · Tienda Sur",
    company: "Tienda Sur",
    salaryUsd: 580,
    hintCostUsd: 5,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Cierre de ayer a las 9. Hay una devolución de merch en negativo: no la borres, resta. Suma importe por categoría y dime cuál facturó más, con el monto.",
    moduleName: "Pandas",
    deliverable: "la categoría que más facturó ayer, devolución incluida",
    summary: "Pedidos del día, una devolución, y la categoría ganadora.",
    starterCode: `import pandas as pd

pedidos = pd.read_csv("pedidos.csv")

por_cat = None       # Series: suma de importe por categoria
categoria_top = None
importe_top = None
`,
    files: {
      "pedidos.csv": `pedido_id,categoria,importe
1041,cafe,12.0
1042,reposteria,8.5
1043,cafe,9.0
1044,merch,20.0
1045,cafe,7.5
1046,reposteria,6.0
1047,merch,-4.0
1048,cafe,6.0
`,
    },
    tests: [
      { assert: "categoria_top == 'cafe'", message: "Café suma 34.5 y queda arriba, aunque merch tenga un ticket de 20." },
      { assert: "abs(float(importe_top) - 34.5) < 1e-9", message: "El importe top es 34.5, con la devolución ya restada en merch." },
    ],
    hints: [
      "por_cat = pedidos.groupby('categoria')['importe'].sum()",
      "categoria_top = por_cat.idxmax() e importe_top = por_cat.max().",
    ],
  },
  {
    id: "job-s4-ab",
    sectionId: "s4",
    title: "A/B del checkout",
    company: "PagoFácil",
    salaryUsd: 640,
    hintCostUsd: 6,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Producto cambió el botón del checkout. Cada número es un pago: 1 convirtió, 0 no. Veinte sesiones por variante. Dime la tasa de cada una, la diferencia B − A, y quién va arriba. No le llames significativo: con esto solo comparamos medias.",
    moduleName: "Estadística aplicada",
    deliverable: "las tasas de conversión de A y B y cuál queda arriba",
    summary: "Veinte checkouts por botón. Solo las medias, sin disfrazarlo de prueba.",
    starterCode: `import numpy as np

# 1 = pagó, 0 = abandonó. Veinte sesiones por variante.
A = np.array([0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1], dtype=float)
B = np.array([1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0], dtype=float)

media_a = None
media_b = None
diff = None          # media_b - media_a
ganador = None       # "B" si media_b > media_a, si no "A"
`,
    tests: [
      { assert: "abs(float(media_a) - 0.4) < 1e-9", message: "media_a es 0.4." },
      { assert: "abs(float(media_b) - 0.7) < 1e-9", message: "media_b es 0.7." },
      { assert: "abs(float(diff) - 0.3) < 1e-9", message: "B gana por 0.3." },
      { assert: "ganador == 'B'", message: "El ganador es B." },
    ],
    hints: [
      "media_a = A.mean() y media_b = B.mean().",
      "diff = media_b - media_a. ganador = 'B' if media_b > media_a else 'A'.",
    ],
  },
  {
    id: "job-s4-churn",
    sectionId: "s4",
    title: "Correlación de churn",
    company: "StreamNorte",
    salaryUsd: 700,
    hintCostUsd: 6,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Retención dice que quien mira poco se da de baja. Son minutos vistos en el mes y si se fue (1) o se quedó (0). Quiero el Pearson entre las dos columnas, el número, no el discurso. Correlación no es causa: no me escribas una teoría.",
    moduleName: "Estadística aplicada",
    deliverable: "el Pearson entre minutos vistos y baja del mes",
    summary: "Uso real del mes contra si el cliente se fue.",
    starterCode: `import pandas as pd
import numpy as np

df = pd.read_csv("churn.csv")

corr = None  # correlación Pearson entre minutos y churn (float)
`,
    files: {
      "churn.csv": `minutos,churn
180,0
22,1
95,0
14,1
140,0
18,1
210,0
30,1
160,0
11,1
75,0
40,1
`,
    },
    tests: [
      {
        assert: "abs(float(corr) - float(np.corrcoef(df['minutos'], df['churn'])[0, 1])) < 1e-9",
        message: "Calcula Pearson con las dos columnas; no basta con poner un número negativo.",
      },
    ],
    hints: [
      "Usa df['minutos'] y df['churn']. np.corrcoef te da una matriz 2x2.",
      "corr = np.corrcoef(df['minutos'], df['churn'])[0, 1]",
      "El número tiene que ser negativo y fuerte (menos minutos, más churn). No redondees a 0.",
    ],
  },
  {
    id: "job-s5-mora",
    sectionId: "s5",
    title: "Score de mora · Créditos",
    company: "Banco Píxel",
    salaryUsd: 820,
    hintCostUsd: 7,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Riesgo ya cerró los pesos del score de hoy. Cada fila es una solicitud: la primera columna es el 1 del intercepto y la segunda es deuda sobre ingreso. Aplica la sigmoid a w·x, marca mora si la probabilidad llega a 0.5 y dime el accuracy contra la etiqueta que ya cobramos.",
    moduleName: "Machine Learning",
    deliverable: "el score del lote de hoy con los pesos de riesgo y su accuracy",
    summary: "Seis solicitudes, pesos ya fijados, umbral 0.5.",
    starterCode: `import numpy as np

# [intercepto, deuda/ingreso]. y = 1 si esa solicitud cayó en mora.
X = np.array([
    [1.0, 2.0],
    [1.0, 0.5],
    [1.0, 3.0],
    [1.0, 0.2],
    [1.0, 1.4],
    [1.0, 2.6],
], dtype=float)
y = np.array([1, 0, 1, 0, 1, 1])
w = np.array([-1.2, 0.9])

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

probs = None
preds = None   # 1 si p >= 0.5
accuracy = None
`,
    tests: [
      { assert: "probs.shape == (6,)", message: "probs es un vector de 6, una probabilidad por solicitud." },
      { assert: "np.allclose(probs, 1 / (1 + np.exp(-(X @ w))))", message: "Las probabilidades deben salir de sigmoid(X @ w)." },
      { assert: "list(preds.astype(int)) == [1, 0, 1, 0, 1, 1]", message: "Con el umbral 0.5 las marcas son 1, 0, 1, 0, 1, 1." },
      { assert: "abs(float(accuracy) - 1.0) < 1e-9", message: "Esas marcas coinciden con y: el accuracy es 1.0." },
    ],
    hints: [
      "z = X @ w (producto punto). probs = sigmoid(z).",
      "preds = (probs >= 0.5).astype(int) y accuracy = (preds == y).mean().",
    ],
  },
  {
    id: "job-s5-segmentos",
    sectionId: "s5",
    title: "Segmentos de clientes",
    company: "ClubDelta",
    salaryUsd: 900,
    hintCostUsd: 7,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Marketing ya fijó los tres centros del trimestre pasado: frecuentes y baratos, frecuentes y de ticket alto, y los que compran poco pero caro. No reentrenes. Asigna cada cliente de esta semana al centro más cercano y dime cuántos caen en cada uno.",
    moduleName: "Machine Learning",
    deliverable: "la asignación de esta semana a los tres centros que marketing ya fijó",
    summary: "Visitas y gasto. Cada cliente va al centro más cercano.",
    starterCode: `import numpy as np

# Cada fila es (visitas en el mes, gasto en miles).
X = np.array([
    [1.0, 1.0],
    [1.2, 0.8],
    [5.0, 5.1],
    [4.8, 5.2],
    [9.0, 1.0],
    [8.7, 1.3],
], dtype=float)

centros = np.array([
    [1.0, 1.0],
    [5.0, 5.0],
    [9.0, 1.0],
], dtype=float)

labels = None          # índice del centro más cercano, shape (6,)
tamanos = None         # array con el recuento de 0, 1 y 2
`,
    tests: [
      { assert: "list(labels.astype(int)) == [0, 0, 1, 1, 2, 2]", message: "Cada par cae en su centro." },
      { assert: "list(np.array(tamanos).astype(int)) == [2, 2, 2]", message: "Cada segmento tiene 2 clientes." },
    ],
    hints: [
      "Para cada fila, calcula ((X[i] - centros) ** 2).sum(axis=1) y quédate con argmin.",
      "O vectorizado: dist2 = ((X[:, None, :] - centros[None, :, :]) ** 2).sum(axis=2); labels = dist2.argmin(axis=1).",
    ],
  },
  {
    id: "job-s6-perceptron",
    sectionId: "s6",
    title: "Perceptrón anti-spam",
    company: "MailCorto",
    salaryUsd: 1100,
    hintCostUsd: 8,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El filtro no puede esperar un entrenamiento. Seguridad te dejó el perceptrón: cada correo es (exclamaciones, remitente conocido, cantidad de links) y el escalón es 1 si w·x >= 0. Clasifica estos tres y devuélveme 1 spam o 0 correo normal.",
    moduleName: "Deep Learning e IA",
    deliverable: "la marca spam/normal de tres correos con el perceptrón que ya está pesado",
    summary: "Tres correos, tres señales, un escalón.",
    starterCode: `import numpy as np

# w = [exclamaciones, remitente_conocido, links]
w = np.array([0.5, -0.4, 0.2])
X = np.array([
    [1.0, 0.0, 1.0],   # muchas exclamaciones y un link, remitente nuevo
    [0.0, 1.0, 0.0],   # un compañero, sin links
    [1.0, 0.0, 0.0],   # remitente nuevo y exclamaciones
], dtype=float)

def step(z):
    return (z >= 0).astype(int)

preds = None
`,
    tests: [
      { assert: "list(preds.astype(int)) == [1, 0, 1]", message: "El perceptrón debe devolver [1, 0, 1]." },
    ],
    hints: [
      "z = X @ w. El escalón es 1 si z >= 0.",
      "preds = step(X @ w)",
      "No hagas un for si puedes: step acepta el vector entero de z.",
    ],
  },
  {
    id: "job-s6-softmax",
    sectionId: "s6",
    title: "Softmax de 3 clases",
    company: "VisionLab",
    salaryUsd: 1200,
    hintCostUsd: 8,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El catálogo tiene tres clases: 0 camisa, 1 pantalón, 2 zapato. El modelo dejó logits, no probabilidades. Softmax estable por fila (resta el máximo antes del exp) y la clase ganadora de cada foto.",
    moduleName: "Deep Learning e IA",
    deliverable: "probabilidades de camisa, pantalón y zapato, y la clase de cada foto",
    summary: "Tres fotos, logits crudos, softmax estable y la clase ganadora.",
    starterCode: `import numpy as np

# Filas = fotos. Columnas = logit de camisa, pantalón, zapato.
logits = np.array([
    [2.0, 0.5, 0.1],
    [0.2, 3.0, 0.3],
    [0.0, 0.1, 2.5],
], dtype=float)

# Softmax estable: resta el máximo de la fila antes del exp.
probs = None
clases = None  # argmax por fila
`,
    tests: [
      { assert: "probs.shape == (3, 3)", message: "probs es 3x3." },
      { assert: "np.allclose(probs.sum(axis=1), 1.0)", message: "Cada fila de probs debe sumar 1." },
      { assert: "np.allclose(probs, np.exp(logits - logits.max(axis=1, keepdims=True)) / np.exp(logits - logits.max(axis=1, keepdims=True)).sum(axis=1, keepdims=True))", message: "Calcula softmax de los logits. Una matriz con unos en la diagonal no es la distribución pedida." },
      { assert: "list(clases.astype(int)) == [0, 1, 2]", message: "argmax por fila: 0, 1, 2." },
    ],
    hints: [
      "z = logits - logits.max(axis=1, keepdims=True). Luego exp y divide por la suma de la fila.",
      "clases = probs.argmax(axis=1)",
    ],
  },
  {
    id: "job-s7-kaggle",
    sectionId: "s7",
    title: "Mini-Kaggle · churn express",
    company: "Kaggle Night",
    salaryUsd: 1500,
    hintCostUsd: 10,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "Hackathon de la tarde. Retención ya usa un corte: si el mes tuvo menos de 40 minutos, marcan baja. No entrenes nada. Mide ese baseline contra la baja real, di cuántas bajas hay en el archivo y el accuracy. Eso es lo que entra al README.",
    moduleName: "Boss Level",
    deliverable: "el baseline de 40 minutos: marcas, cuántas bajas hay y el accuracy",
    summary: "La regla que retención ya usa, medida contra el mes real.",
    starterCode: `import pandas as pd

df = pd.read_csv("mini.csv")

# 1 si minutos < 40. Esa es la regla vigente, no un modelo nuevo.
preds = None
accuracy = None
n_churn = None  # bajas reales del archivo
`,
    files: {
      "mini.csv": `minutos,churn
120,0
18,1
90,0
22,1
55,0
12,1
80,0
35,1
44,0
9,1
`,
    },
    tests: [
      { assert: "list(preds.astype(int)) == list((df['minutos'] < 40).astype(int))", message: "Cada fila se marca con la regla vigente: minutos < 40." },
      { assert: "int(n_churn) == 5", message: "En el archivo hay 5 bajas reales." },
      { assert: "abs(float(accuracy) - 1.0) < 1e-9", message: "Con el corte de 40 minutos aciertas las 10 filas." },
    ],
    hints: [
      "preds = (df['minutos'] < 40).astype(int)",
      "accuracy = (preds == df['churn']).mean() y n_churn = int(df['churn'].sum())",
    ],
  },
  {
    id: "job-s7-kpis",
    sectionId: "s7",
    title: "KPIs del portafolio",
    company: "Studio Norte",
    salaryUsd: 1800,
    hintCostUsd: 10,
    officeLine: "Vas donde tu jefe y te dice…",
    laptopLine:
      "El deck del viernes lleva tres números de la semana y nada más: cuánto entró, el ticket medio y qué fracción de pedidos fue VIP. Una función que reciba el cuadro y devuelva ese dict. El viernes no se rehace a mano.",
    moduleName: "Boss Level",
    deliverable: "los tres KPIs de la semana: ingresos, ticket medio y fracción VIP",
    summary: "Ocho pedidos de la semana, resumidos en la función que pide el deck.",
    starterCode: `import pandas as pd

pedidos = pd.read_csv("kpis.csv")

def kpis(df):
    """Devuelve ingresos, ticket_medio y ratio_vip de la semana."""
    return {}

reporte = kpis(pedidos)
`,
    files: {
      "kpis.csv": `importe,vip
48,0
120,1
36,0
80,1
25,0
90,1
15,0
64,1
`,
    },
    tests: [
      { assert: "abs(float(reporte['ingresos']) - 478) < 1e-9", message: "ingresos es la suma de la semana: 478." },
      { assert: "abs(float(reporte['ticket_medio']) - 59.75) < 1e-9", message: "El ticket medio es 59.75." },
      { assert: "abs(float(reporte['ratio_vip']) - 0.5) < 1e-9", message: "La mitad de los pedidos de la semana son VIP." },
    ],
    hints: [
      "ingresos = df['importe'].sum(); ticket_medio = df['importe'].mean().",
      "ratio_vip = df['vip'].mean() (es 0/1). Devuelve las tres claves en un dict.",
    ],
  },
];
