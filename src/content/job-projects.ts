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
      "El POS se colgó a las 6:58. Antes de abrir, necesito el ticket de cierre: subtotal, IVA 8% y total. No me vengas con un Excel.",
    moduleName: "Fundamentos absolutos",
    deliverable: "un cierre de caja en Python que recorra pedidos, calcule IVA y imprima el total",
    summary: "Diccionario de precios, bucle sobre pedidos y un ticket con impuestos.",
    starterCode: `precios = {"latte": 4.5, "muffin": 2.0, "agua": 1.5}
pedidos = ["latte", "latte", "muffin", "agua", "latte"]

# Recorre pedidos, suma el subtotal, aplica IVA del 8%
# y deja estas variables listas:
subtotal = 0
iva = 0
total = 0
`,
    tests: [
      { assert: "abs(subtotal - 17.0) < 1e-9", message: "subtotal debe ser la suma de los precios de cada pedido." },
      { assert: "abs(iva - 1.36) < 1e-9", message: "iva = subtotal * 0.08" },
      { assert: "abs(total - 18.36) < 1e-9", message: "total = subtotal + iva" },
    ],
    hints: [
      "Recorre la lista pedidos y ve sumando precios[item] en subtotal.",
      "Después del bucle: iva = subtotal * 0.08 y total = subtotal + iva. No redondees todavía.",
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
      "Hay 5 tickets sin clasificar y el standup es en 20 minutos. Separa urgentes de normales y dime cuántos van a cada cubo.",
    moduleName: "Fundamentos absolutos",
    deliverable: "un clasificador de tickets que cuente urgentes y normales según palabras clave",
    summary: "Listas, condicionales y un contador por prioridad.",
    starterCode: `tickets = [
    "El servidor de pagos está caído",
    "¿Pueden cambiar el logo del footer?",
    "API down en producción",
    "Tipografía del blog se ve rara",
    "No carga el checkout, error 500",
]

urgentes = 0
normales = 0
# Un ticket es urgente si el texto (en minúsculas) contiene
# "caído", "down" o "500".
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
      "El sensor del túnel 4 está loco. Quiero los picos: todo lo que se salga de media + 2 desviaciones. NumPy, no un for de 400 líneas.",
    moduleName: "NumPy",
    deliverable: "un detector de anomalías sobre un array de temperaturas",
    summary: "Media, desviación y una máscara booleana vectorizada.",
    starterCode: `import numpy as np

temps = np.array([3.1, 2.8, 3.0, 2.9, 12.4, 3.2, 2.7, 11.8, 3.0, 2.9], dtype=float)

media = None
desv = None
umbral = None
anomalias = None  # array con las temperaturas anómalas
`,
    tests: [
      { assert: "abs(float(media) - float(temps.mean())) < 1e-9", message: "media debe ser temps.mean()." },
      { assert: "abs(float(desv) - float(temps.std())) < 1e-9", message: "desv debe ser temps.std()." },
      { assert: "abs(float(umbral) - float(media + 2 * desv)) < 1e-9", message: "umbral = media + 2 * desv." },
      { assert: "np.array_equal(anomalias, temps[temps > temps.mean() + 2 * temps.std()])", message: "Filtra temps > umbral. Con estos datos, solo 12.4 supera media + 2 desviaciones." },
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
      "Los vectores de búsqueda están en escalas distintas y el ranking se cae. Z-score por columna y déjame la matriz lista.",
    moduleName: "NumPy",
    deliverable: "una matriz de embeddings estandarizada por columna (z-score)",
    summary: "Broadcasting: restar media y dividir por std del eje 0.",
    starterCode: `import numpy as np

X = np.array([
    [10.0, 200.0],
    [12.0, 180.0],
    [11.0, 220.0],
    [9.0, 190.0],
], dtype=float)

# Z-score por columna. Si std == 0, deja 0.
Z = None
`,
    tests: [
      { assert: "Z.shape == X.shape", message: "Z debe tener la misma forma que X." },
      { assert: "np.allclose(Z.mean(axis=0), 0, atol=1e-8)", message: "La media de cada columna de Z debe ser ~0." },
      {
        assert: "np.allclose(Z.std(axis=0), 1, atol=1e-8)",
        message: "La desviación de cada columna de Z debe ser ~1.",
      },
      { assert: "np.allclose(Z, (X - X.mean(axis=0)) / X.std(axis=0))", message: "Cada valor de Z debe corresponder al z-score de su dato original." },
    ],
    hints: [
      "medias = X.mean(axis=0) y desvs = X.std(axis=0). Cuidado con el broadcasting.",
      "Z = (X - medias) / desvs. Con axis=0 operas por columna.",
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
      "Marketing quiere la slide de Q3 para las 10. Gráfico de barras de ventas por mes y dime cuál fue el pico.",
    moduleName: "Visualización",
    deliverable: "un gráfico de barras de ventas mensuales y el mes con más venta",
    summary: "Matplotlib: barras, título y un máximo.",
    starterCode: `import matplotlib.pyplot as plt

meses = ["Jul", "Ago", "Sep"]
ventas = [12_400, 15_800, 14_100]

mes_pico = None
venta_pico = None

# Dibuja un gráfico de barras (plt.bar) con título "Ventas Q3".
`,
    tests: [
      { assert: "mes_pico == 'Ago'", message: "Agosto es el mes con más ventas." },
      { assert: "venta_pico == 15800", message: "El pico es 15800." },
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
      "Finanzas duda de la campaña B. Grafica control vs B y calcula el lift porcentual del promedio.",
    moduleName: "Visualización",
    deliverable: "un gráfico de dos series y el lift porcentual de la campaña B",
    summary: "Dos líneas y una métrica de negocio.",
    starterCode: `import matplotlib.pyplot as plt

control = [20, 22, 21, 23, 22]
campana_b = [24, 26, 25, 28, 27]

lift_pct = None  # ((media_b - media_control) / media_control) * 100

# Grafica ambas series con plt.plot.
`,
    tests: [
      {
        assert: "abs(float(lift_pct) - ((sum(campana_b)/len(campana_b) - sum(control)/len(control)) / (sum(control)/len(control)) * 100)) < 1e-6",
        message: "Usa las medias: control = 21.6, B = 26. El lift es aproximadamente 20.37037%, sin redondear antes de calcular.",
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
      "Sales pegó un CSV sucio al CRM. Tira las filas sin email y rellena ciudad vacía con 'Desconocida'. Quiero el recuento final.",
    moduleName: "Pandas",
    deliverable: "un DataFrame de leads limpio y el número de filas válidas",
    summary: "dropna, fillna y un conteo.",
    starterCode: `import pandas as pd

leads = pd.read_csv("leads.csv")

# 1) Elimina filas sin email
# 2) Rellena ciudad vacía con "Desconocida"
# 3) n_validos = número de filas resultantes
n_validos = None
ciudades = None  # value_counts() de la columna ciudad
`,
    files: {
      "leads.csv": `nombre,email,ciudad
Ana,ana@nube.io,Lima
Bruno,,Bogotá
Cata,cata@nube.io,
Dani,dani@nube.io,Lima
Eva,,
`,
    },
    tests: [
      { assert: "int(n_validos) == 3", message: "Tras tirar emails vacíos quedan 3 leads." },
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
      "El informe de las 9 necesita la categoría que más facturó ayer. GroupBy, suma de importe, y el nombre del ganador.",
    moduleName: "Pandas",
    deliverable: "un groupby de pedidos que identifique la categoría top por importe",
    summary: "groupby, sum y idxmax.",
    starterCode: `import pandas as pd

pedidos = pd.read_csv("pedidos.csv")

por_cat = None       # Series: suma de importe por categoria
categoria_top = None
importe_top = None
`,
    files: {
      "pedidos.csv": `pedido_id,categoria,importe
1,cafe,12.0
2,reposteria,8.5
3,cafe,9.0
4,merch,20.0
5,cafe,7.5
6,reposteria,6.0
`,
    },
    tests: [
      { assert: "categoria_top == 'cafe'", message: "Café suma 28.5, es el top." },
      { assert: "abs(float(importe_top) - 28.5) < 1e-9", message: "El importe top es 28.5." },
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
      "Producto cambió el botón. Dime si B convierte más que A (media) y por cuánto. Nada de PowerPoint, números.",
    moduleName: "Estadística aplicada",
    deliverable: "una comparación de medias A/B y el ganador",
    summary: "Medias, diferencia y una decisión simple.",
    starterCode: `import numpy as np

A = np.array([0, 1, 0, 0, 1, 0, 1, 0, 0, 1], dtype=float)
B = np.array([1, 1, 0, 1, 1, 1, 0, 1, 1, 0], dtype=float)

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
      "Customer Success jura que quien usa poco se va. Calcula la correlación entre minutos y churn. Quiero el número, no un feeling.",
    moduleName: "Estadística aplicada",
    deliverable: "la correlación de Pearson entre uso y churn",
    summary: "corrcoef sobre dos columnas.",
    starterCode: `import pandas as pd
import numpy as np

df = pd.read_csv("churn.csv")

corr = None  # correlación Pearson entre minutos y churn (float)
`,
    files: {
      "churn.csv": `minutos,churn
120,0
30,1
90,0
15,1
80,0
10,1
100,0
25,1
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
      "Riesgo quiere un score mínimo para hoy. Sigmoid con los pesos que te pasé y clasifica mora si p >= 0.5. Accuracy contra la etiqueta.",
    moduleName: "Machine Learning",
    deliverable: "un clasificador logístico mínimo (sigmoid + umbral) y su accuracy",
    summary: "Producto punto, sigmoid y un umbral 0.5.",
    starterCode: `import numpy as np

X = np.array([
    [1.0, 2.0],
    [1.0, 0.5],
    [1.0, 3.0],
    [1.0, 0.2],
], dtype=float)
y = np.array([1, 0, 1, 0])
w = np.array([-1.2, 0.9])  # bias en x0=1

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

probs = None
preds = None   # 1 si p >= 0.5
accuracy = None
`,
    tests: [
      { assert: "probs.shape == (4,)", message: "probs es un vector de 4." },
      { assert: "np.allclose(probs, 1 / (1 + np.exp(-(X @ w))))", message: "Las probabilidades deben salir de sigmoid(X @ w)." },
      { assert: "list(preds.astype(int)) == [1, 0, 1, 0]", message: "Las predicciones deben coincidir con y." },
      { assert: "abs(float(accuracy) - 1.0) < 1e-9", message: "Con estos pesos el accuracy es 1.0." },
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
      "CRM pide 3 tribus para el mail de septiembre. Asigna cada cliente al centroide más cercano (un paso de K-Means) y cuenta el tamaño de cada cluster.",
    moduleName: "Machine Learning",
    deliverable: "asignación a 3 centroides y el tamaño de cada segmento",
    summary: "Distancia euclídea y argmin por fila.",
    starterCode: `import numpy as np

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
      "El filtro de spam no puede esperar a Keras. Perceptrón: step(w·x). Clasifica estos 3 vectores y listo.",
    moduleName: "Deep Learning e IA",
    deliverable: "un perceptrón (función umbral) que clasifique tres correos",
    summary: "Producto punto y función escalón.",
    starterCode: `import numpy as np

w = np.array([0.5, -0.4, 0.2])
X = np.array([
    [1.0, 0.0, 1.0],   # spam esperado
    [0.0, 1.0, 0.0],   # ham esperado
    [1.0, 0.0, 0.0],   # spam esperado
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
      "El intern dejó logits crudos. Aplica softmax estable y dime la clase ganadora de cada fila.",
    moduleName: "Deep Learning e IA",
    deliverable: "softmax por fila y las clases predichas (argmax)",
    summary: "Restar el máximo, exp, normalizar.",
    starterCode: `import numpy as np

logits = np.array([
    [2.0, 0.5, 0.1],
    [0.2, 3.0, 0.3],
    [0.0, 0.1, 2.5],
], dtype=float)

# Softmax estable: resta el max por fila antes del exp.
probs = None
clases = None
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
      "Hackathon interno. Umbral simple: si minutos < 40, predice churn=1. Accuracy y los dos o tres números que irían al README.",
    moduleName: "Boss Level",
    deliverable: "un baseline de churn con umbral sobre minutos y su accuracy",
    summary: "Pandas + una regla de negocio medible.",
    starterCode: `import pandas as pd

df = pd.read_csv("mini.csv")

# Predice 1 si minutos < 40
preds = None
accuracy = None
n_churn = None
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
`,
    },
    tests: [
      { assert: "list(preds.astype(int)) == list((df['minutos'] < 40).astype(int))", message: "Las predicciones deben usar minutos < 40 en cada fila." },
      { assert: "int(n_churn) == 4", message: "Hay 4 churn reales en el CSV." },
      { assert: "abs(float(accuracy) - 1.0) < 1e-9", message: "Con el umbral 40 aciertas las 8 filas." },
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
      "El deck del viernes necesita tres KPIs: ingresos, ticket medio y % de pedidos VIP. Una función que devuelva un dict. Sin drama.",
    moduleName: "Boss Level",
    deliverable: "una función de KPIs (ingresos, ticket medio, ratio VIP) sobre pedidos",
    summary: "Función que resume un DataFrame en un dict de negocio.",
    starterCode: `import pandas as pd

pedidos = pd.read_csv("kpis.csv")

def kpis(df):
    """Devuelve dict con ingresos, ticket_medio y ratio_vip."""
    return {}

reporte = kpis(pedidos)
`,
    files: {
      "kpis.csv": `importe,vip
10,0
40,1
20,0
30,1
`,
    },
    tests: [
      { assert: "abs(float(reporte['ingresos']) - 100) < 1e-9", message: "ingresos = suma de importe (100)." },
      { assert: "abs(float(reporte['ticket_medio']) - 25) < 1e-9", message: "ticket medio = 25." },
      { assert: "abs(float(reporte['ratio_vip']) - 0.5) < 1e-9", message: "La mitad de los pedidos son VIP." },
    ],
    hints: [
      "ingresos = df['importe'].sum(); ticket_medio = df['importe'].mean().",
      "ratio_vip = df['vip'].mean() (es 0/1). Devuelve las tres claves en un dict.",
    ],
  },
];
