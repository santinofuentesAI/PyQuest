import type { LibraryBlock } from "./library";

const z = (text: string): LibraryBlock => ({ type: "callout", tone: "zero", text });
const p = (text: string): LibraryBlock => ({ type: "p", text });
const h = (text: string): LibraryBlock => ({ type: "h", text });
const c = (code: string, caption?: string): LibraryBlock => ({ type: "code", code, caption });
const list = (items: string[]): LibraryBlock => ({ type: "list", items });
const g = (items: { term: string; def: string }[]): LibraryBlock => ({ type: "glossary", items });

/** Intros that assume the reader has never seen the topic. Prepended to each article. */
export const FROM_ZERO: Record<string, LibraryBlock[]> = {
  u1: [
    z("No hace falta saber programar. Un computador no adivina: hay que escribirle instrucciones en un idioma. Python es uno de esos idiomas, muy usado para datos e inteligencia artificial. PyQuest te lo enseña haciendo ejercicios, no memorizando un libro."),
    h("¿Qué es un programa?"),
    p("Piensa en una receta: 'corta la cebolla' va antes de 'fríela'. Python lee igual, de arriba abajo, una línea cada vez. Si una línea está mal, se detiene y lo de abajo no se ejecuta."),
    p("La orden más simple es print: significa 'enséñame esto en pantalla'. En PyQuest esa pantalla es la cajita debajo del ejercicio."),
    c('print("Hola")\nprint(2 + 3)', "Texto entre comillas. Números sin comillas. Verás Hola y luego 5."),
    h("¿Por qué hay comillas?"),
    p("Sin comillas, Python cree que Hola es el nombre de algo que guardaste. Con comillas es un texto literal, como una frase. 2 + 3 no lleva comillas porque es una cuenta, no una palabra."),
    g([
      { term: "print()", def: "Orden para mostrar un valor. Los paréntesis son obligatorios: ahí va lo que quieres ver." },
      { term: "string / str", def: "Texto. Siempre entre comillas simples o dobles." },
      { term: "error", def: "Python no pudo seguir. Lee la última línea del mensaje: suele decir el tipo y el número de línea." },
      { term: "comentario #", def: "Nota para ti. Python ignora todo lo que hay después de # en esa línea." },
    ]),
  ],
  u2: [
    z("Una variable no es un cajón misterioso. Es un nombre que le pegas a un valor para no repetirlo. Como ponerle una etiqueta a una caja: la etiqueta es el nombre, lo de dentro es el valor."),
    h("Guardar para reutilizar"),
    p("Si escribes edad = 28, Python crea el número 28 y le pone el mote edad. Cuando más tarde escribes print(edad), enseña 28. Si luego haces edad = 29, la etiqueta ahora apunta al 29. El 28 viejo se olvida."),
    c('nombre = "Mara"\nedad = 28\nprint(nombre, edad)', "A la izquierda el nombre. A la derecha el valor. El = no es 'igual que en mates': es 'guarda esto en'."),
    h("Tipos: no todo es lo mismo"),
    p("Python distingue números enteros (28), decimales (3.14), texto (\"Mara\") y sí/no (True / False). Mezclarlos a ciegas suele fallar: no puedes hacer \"tengo\" + 28 porque uno es frase y el otro número. Primero conviertes: str(28) o un f-string."),
    g([
      { term: "int", def: "Entero: 3, -1, 0. Sin punto decimal." },
      { term: "float", def: "Decimal: 3.14, 3.0. El punto convierte 3 en float." },
      { term: "str", def: "Texto entre comillas." },
      { term: "bool", def: "Solo dos valores: True o False (con mayúscula)." },
      { term: "None", def: "Significa 'aquí no hay valor'. No es cero ni un texto vacío." },
      { term: "type(x)", def: "Te dice de qué tipo es x. Útil cuando un ejercicio te pregunta 'qué imprime type'." },
    ]),
  ],
  u3: [
    z("Un operador es un símbolo que combina valores: + suma, - resta, * multiplica, / divide. En datos los usarás tanto para cuentas como para preguntar '¿esta fila es mayor de 18?'."),
    h("Cuentas que Python ya sabe"),
    c("print(7 / 2)   # 3.5  división con decimales\nprint(7 // 2)  # 3    se queda con la parte entera\nprint(7 % 2)   # 1    el resto (lo que sobra)\nprint(2 ** 3)  # 8    2 elevado a 3", "Memoriza sobre todo / y **. El resto % sirve para '¿es par?': n % 2 == 0."),
    h("Comparar no es asignar"),
    p("Un solo = guarda. Dos == preguntan '¿son iguales?'. Es el error número uno al empezar: if x = 5 está mal; if x == 5 está bien. Mayor y menor: >, <, >=, <=. Distinto: !=."),
    p("and significa 'las dos cosas a la vez'. or significa 'al menos una'. not le da la vuelta a un sí/no."),
    g([
      { term: "==", def: "¿Igual? No guarda nada." },
      { term: "=", def: "Guarda el valor de la derecha en el nombre de la izquierda." },
      { term: "and / or / not", def: "Combinan respuestas sí/no. Se llaman operadores lógicos." },
    ]),
  ],
  u4: [
    z("Un string es una cadena de letras, números y símbolos: una frase. Python la trata como una fila de casillas. La primera casilla es la 0, no la 1. Eso se llama indexar desde cero."),
    h("Cortar texto (slicing)"),
    p("s[0] es el primer carácter. s[-1] es el último (el menos uno cuenta desde el final). s[1:4] es 'desde el 1 hasta antes del 4': incluye el inicio y deja fuera el final. No hace falta entender la palabra slicing: es cortar un trozo."),
    c('s = "PyQuest"\nprint(s[0])     # P\nprint(s[1:4])   # yQu\nprint(s.upper())  # PYQUEST', "upper() no cambia s: fabrica otro string en mayúsculas. Los strings no se editan por dentro; se construye uno nuevo."),
    h("f-strings: meter un valor dentro de un texto"),
    p("Pon una f delante de las comillas y usa llaves: f\"Hola, {nombre}\". Es la forma moderna. Evita 'Hola ' + nombre salvo que sea un caso mínimo."),
    g([
      { term: "índice", def: "La posición de un carácter. Empieza en 0." },
      { term: "inmutable", def: "No puedes hacer s[0] = 'A'. Tienes que crear otro string." },
      { term: ".split(',')", def: "Parte el texto por comas y te da una lista." },
      { term: ".strip()", def: "Quita espacios (y saltos) de los bordes, no del medio." },
    ]),
  ],
  u5: [
    z("Una lista es una fila numerada de cosas entre corchetes: [3, 1, 4]. Puede guardar números, textos o mezclas. Es la mochila del día a día antes de llegar a tablas grandes (Pandas)."),
    h("Ordenada y cambiable"),
    p("Ordenada significa que [1, 2] no es lo mismo que [2, 1]: el sitio importa. Cambiable (mutable) significa que puedes añadir o quitar sin crear otra lista: xs.append(5) mete un 5 al final de la misma lista."),
    c("xs = [10, 20, 30]\nprint(xs[0])    # 10, el primero\nprint(xs[-1])   # 30, el último\nxs.append(40)   # ahora hay 4 elementos", "append modifica xs. Si escribes ys = xs, no copias: las dos etiquetas apuntan a la misma lista."),
    h("Recorrer sin marearte"),
    p("for x in xs: print(x) visita cada elemento. Una comprensión [x * 2 for x in xs] es un atajo: 'hazme una lista nueva con el doble de cada x'."),
    g([
      { term: "mutable", def: "Se puede cambiar por dentro (listas sí, strings no)." },
      { term: "append", def: "Añade al final. No devuelve la lista: la cambia." },
      { term: "len(xs)", def: "Cuántos elementos hay. No el último valor." },
    ]),
  ],
  u6: [
    z("A veces no quieres una lista. Una tupla es una fila que no se puede cambiar, como unas coordenadas (lat, lon). Un set es un saco sin duplicados y sin orden: útil para 'valores únicos'."),
    h("Tupla: un pack fijo"),
    p("Se escribe con paréntesis: punto = (4.2, -3.1). Puedes desempaquetar: x, y = punto. No hay append. Por eso sirve como clave de diccionario (una lista no puede ser clave)."),
    h("Set: lo único"),
    p("set([1, 1, 2, 3]) queda {1, 2, 3}. Buscar si algo está dentro es rapidísimo. Los elementos tienen que ser 'hashables': números y texto sí, listas no."),
    c("a = {1, 2, 3}\nb = {3, 4}\nprint(a | b)  # unión {1,2,3,4}\nprint(a & b)  # intersección {3}", "| y & no son 'o' y 'y' de if: en sets significan unión e intersección."),
    g([
      { term: "tupla", def: "Secuencia inmutable. Paréntesis. Buena para records cortos." },
      { term: "set", def: "Conjunto: sin repetidos, sin orden garantizado." },
      { term: "hashable", def: "Valor que Python puede usar como clave o en un set. Inmutables suelen serlo." },
    ]),
  ],
  u7: [
    z("Un diccionario es una tabla de dos columnas: clave y valor. Como la agenda del teléfono: el nombre es la clave, el número es el valor. Se escribe con llaves: {\"nombre\": \"Mara\", \"xp\": 120}."),
    h("Buscar por nombre, no por sitio"),
    p("En una lista preguntas por posición (el tercero). En un dict preguntas por clave: persona[\"nombre\"]. Si la clave no existe, persona[\"liga\"] explota. persona.get(\"liga\", \"bronce\") devuelve bronce si no está."),
    c('persona = {"nombre": "Mara", "xp": 120}\nprint(persona["nombre"])\nprint(persona.get("liga", "bronce"))', "Corchetes = 'dame esta clave'. get = 'dame esta clave o un valor por defecto'."),
    p("Las claves tienen que ser inmutables (texto, números, tuplas). Una lista no puede ser clave. Recorrer: for k, v in persona.items()."),
    g([
      { term: "clave", def: "El identificador único. Como el encabezado de una columna, pero para una fila suelta." },
      { term: "valor", def: "Lo que hay guardado detrás de esa clave." },
      { term: "KeyError", def: "Pediste una clave que no está. Usa .get o pregunta `'liga' in persona`." },
    ]),
  ],
  u8: [
    z("Un if es una pregunta. Si la respuesta es sí, Python entra al bloque indentado (las líneas que van más a la derecha). Si no, se salta esas líneas. elif es 'si no se cumplió lo de arriba, prueba esto'. else es 'si no fue nada de lo anterior'."),
    h("La indentación no es decoración"),
    p("Otros lenguajes usan llaves { }. Python usa espacios. Lo habitual son 4 espacios. Si mezclas tabs y espacios, se queja. Todo lo que 'pertenece' al if va un nivel más adentro."),
    c('n = 7\nif n > 10:\n    etiqueta = "alto"\nelif n > 5:\n    etiqueta = "medio"\nelse:\n    etiqueta = "bajo"', "7 no es > 10, así que no entra al primer bloque. Sí es > 5, así que etiqueta = medio. El else no se ejecuta."),
    p("Python considera 'vacío' como no: 0, \"\", [], {}, None. Por eso if xs: significa 'si la lista tiene algo'."),
    g([
      { term: "condición", def: "Una expresión que acaba en True o False." },
      { term: "elif", def: "Encadena otra pregunta. Se lee 'else if'." },
      { term: "truthy / falsy", def: "Valores que Python trata como sí o no aunque no sean bool. No hace falta la palabra: recuerda la lista de vacíos." },
    ]),
  ],
  u9: [
    z("Un bucle repite trabajo. for recorre una colección (cada alumno de una lista). while se repite mientras una pregunta siga siendo sí ('mientras queden vidas'). Si te olvidas de cambiar la condición, while no termina nunca."),
    h("for es el que más usarás"),
    c("for nombre in ['Ana', 'Luis']:\n    print(nombre)\n\nfor i in range(3):\n    print(i)  # 0, 1, 2", "range(3) produce 0, 1, 2: tres vueltas, empezando en cero. range(1, 4) sería 1, 2, 3."),
    p("enumerate te da el número de vuelta y el valor. zip recorre dos listas a la vez, emparejadas. break sale del bucle. continue salta a la siguiente vuelta sin hacer el resto."),
    g([
      { term: "iterable", def: "Cualquier cosa que se puede recorrer: lista, string, range, archivo…" },
      { term: "range(n)", def: "Números desde 0 hasta n-1. No incluye n." },
      { term: "break / continue", def: "Salir del todo / saltar esta vuelta." },
    ]),
  ],
  u10: [
    z("Una función es un mini-programa con nombre. Le das ingredientes (parámetros), hace un trabajo y te devuelve un resultado con return. Sirve para no copiar el mismo código diez veces."),
    h("Definir y llamar"),
    p("def media(xs): abre la receta. Los dos puntos y la indentación marcan el cuerpo. return sale de la función y entrega un valor. Luego la llamas: media([2, 4, 6]). Si no pones return, Python entrega None (nada)."),
    c('def media(xs):\n    """Promedio de una lista no vacía."""\n    return sum(xs) / len(xs)\n\nprint(media([2, 4, 6]))  # 4.0', "sum suma. len cuenta. Dividir da el promedio. El texto entre comillas triples es la documentación, no se ejecuta."),
    p("Un valor por defecto: def f(n=3). Nunca uses una lista vacía como default (def f(xs=[])): esa lista se comparte entre llamadas y es un clásico bug."),
    g([
      { term: "parámetro", def: "El nombre en la definición (xs)." },
      { term: "argumento", def: "El valor que pasas al llamar ([2, 4, 6])." },
      { term: "return", def: "Entrega un resultado y termina la función." },
    ]),
  ],
  u11: [
    z("Cuando algo sale mal, Python lanza una excepción: un aviso con nombre (ValueError, ZeroDivisionError…). Si no lo atrapas, el programa se para. try/except es 'intenta esto; si peta de esta forma, haz plan B'."),
    h("Atrapar sin esconder el polvo"),
    c("texto = 'hola'\ntry:\n    n = int(texto)\nexcept ValueError:\n    n = None", "int('hola') no puede convertirse a número. ValueError es exactamente ese caso. n queda en None en vez de tumbar todo el programa."),
    p("No hagas except Exception: y seguir como si nada: te tragas bugs. Atrapa el error concreto. raise ValueError('edad negativa') sirve para avisar tú cuando un dato no tiene sentido."),
    g([
      { term: "excepción", def: "Un error con tipo. Interrumpe el flujo salvo que haya except." },
      { term: "ValueError", def: "El tipo era el esperado pero el contenido no (int('hola'))." },
      { term: "TypeError", def: "Operación entre tipos que no pegan ('a' + 1)." },
    ]),
  ],
  u12: [
    z("Hasta ahora los datos iban por un lado y las funciones por otro. Una clase junta las dos cosas: el estado (números que recuerda) y las acciones (métodos). Un objeto es un ejemplar concreto de esa clase. No hace falta OOP para analizar datos; sí para entender .fit() de un modelo."),
    h("El molde y el objeto"),
    p("class Contador: es el molde. Contador() fabrica un objeto. __init__ se ejecuta al crearlo: ahí se guardan los datos iniciales. self es 'este objeto concreto'. Dentro de la clase escribes self.n = 0 para guardar n en ese objeto."),
    c("class Contador:\n    def __init__(self, n=0):\n        self.n = n\n    def tick(self):\n        self.n += 1\n\nc = Contador()\nc.tick()\nprint(c.n)  # 1", "tick no es una función suelta: se llama sobre c. Por eso c.tick(), con punto."),
    g([
      { term: "clase", def: "El plano. Describe qué datos y qué acciones tendrá cada ejemplar." },
      { term: "objeto / instancia", def: "Un ejemplar real. Puede haber muchos de la misma clase." },
      { term: "método", def: "Función definida dentro de la clase. El primer argumento es self." },
      { term: "self", def: "Este objeto. No lo pasas tú al llamar: Python lo pone." },
    ]),
  ],
  u13: [
    z("No hace falta escribirlo todo. Un módulo es un archivo de Python con funciones ya hechas. import lo trae a tu programa. pip es la tienda de módulos en tu ordenador. En PyQuest, el navegador ya trae NumPy, Pandas y Matplotlib: no hace falta instalarlos aquí."),
    h("Tres formas de importar"),
    c("import math\nprint(math.sqrt(9))     # 3.0, usas math.nombre\n\nfrom math import sqrt\nprint(sqrt(9))          # 3.0, usas el nombre directo\n\nimport numpy as np      # alias: np es el mote corto", "as no cambia la librería: solo el nombre corto. np es la convención de todo el mundo en datos."),
    p("from numpy import * mete cientos de nombres en tu espacio y es una mala idea: no sabes de dónde salió mean. Mejor import numpy as np y escribe np.mean."),
    g([
      { term: "módulo", def: "Un archivo .py (o un paquete) con código reutilizable." },
      { term: "pip", def: "El instalador de paquetes de Python en tu máquina. En el navegador de PyQuest no lo necesitas." },
      { term: "alias as", def: "Un mote. import pandas as pd es la convención." },
    ]),
  ],
  p0: [
    z("Un proyecto no es un examen nuevo: es juntar lo que ya viste (variables, listas, funciones) en algo que podrías enseñar. Aquí: un resumen numérico. La idea es el hábito 'entrada → cálculo → un número que puedes defender'."),
    p("Te van a pedir una función que reciba una lista de números y devuelva, por ejemplo, la media y el máximo. Eso ya es un mini-informe. Piensa también en los bordes: ¿y si la lista tiene un solo número? ¿y si llega vacía?"),
    list([
      "Escribe primero la función con un ejemplo que conozcas: [2, 4, 6] → media 4.",
      "Imprime o devuelve un diccionario {'media': ..., 'maximo': ...} para que se lea solo.",
      "Decide qué hacer con la lista vacía: error claro o None, no un crash misterioso.",
    ]),
  ],
  u14: [
    z("Hasta ahora tus números vivían en listas de Python. Eso vale para 10 valores. Para 100 000, un for de Python es lento. NumPy guarda muchos números del mismo tipo en un bloque compacto llamado array, y opera sobre todos a la vez."),
    h("¿Qué es un array?"),
    p("Un array es una tabla de números (o una fila). Todos del mismo tipo: si metes un decimal, todos se vuelven decimales. shape dice la forma: (3,) es una fila de 3; (2, 3) es 2 filas y 3 columnas. dtype es el tipo de cada celda (int64, float64…)."),
    c("import numpy as np\na = np.array([1, 2, 3])\nprint(a * 2)        # [2 4 6] de un golpe, sin for\nprint(a.shape, a.dtype)", "np es el mote de NumPy. array convierte la lista. * 2 multiplica cada celda."),
    g([
      { term: "NumPy", def: "Librería de arrays numéricos. Base de Pandas, de gráficos y de mucho machine learning." },
      { term: "array", def: "Bloque de datos homogéneos. No es una lista: tiene forma y tipo." },
      { term: "shape", def: "Cuántas celdas hay en cada dimensión. (filas, columnas) en 2D." },
      { term: "dtype", def: "Tipo de cada número dentro del array." },
    ]),
  ],
  u15: [
    z("Indexar es 'señalar una celda o un trozo'. En una fila, a[0] es el primero, igual que en listas. En una tabla 2D usas dos números: [fila, columna]. Un filtro con True/False (máscara) elige las celdas que cumplen una condición."),
    c("import numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m[0, 1])   # fila 0, columna 1 → 2\nprint(m[:, 1])   # todas las filas, columna 1 → [2 5]\nprint(m[m > 3])  # [4 5 6]", "Los dos puntos : significan 'todas'. m[m > 3] se lee 'las celdas de m donde m es mayor que 3'."),
    p("Ojo: un trozo de NumPy suele ser una vista, no una fotocopia. Si cambias el trozo, cambia el original. Cuando quieras independencia, .copy()."),
    g([
      { term: "slicing", def: "Cortar un rango con inicio:fin, igual que en strings y listas." },
      { term: "máscara booleana", def: "Array de True/False del mismo tamaño, para filtrar." },
      { term: "vista", def: "Una ventana al mismo dato, no una copia." },
    ]),
  ],
  u16: [
    z("Vectorizar significa: no escribas un for celda a celda. Di 'aplica esto a todo el array'. Python se lo pasa a código rápido en C. Broadcasting es el truco para sumar cosas de distinto tamaño: un vector de 3 se puede sumar a cada fila de una tabla 2×3."),
    p("Una ufunc (universal function) es una función de NumPy que opera elemento a elemento: np.sqrt, np.exp, np.where. Si escribiste for i in range(len(x)), pregúntate si hay una ufunc."),
    c("import numpy as np\nx = np.array([1.0, 4.0, 9.0])\nprint(np.sqrt(x))  # [1. 2. 3.]", "Un solo sqrt para los tres números. El for equivalente sería más lento y más largo."),
    g([
      { term: "vectorizar", def: "Operar sobre todo el array de una vez, sin bucle Python." },
      { term: "broadcasting", def: "Estirar mentalmente un array pequeño para que encaje con uno grande, sin copiar datos." },
      { term: "ufunc", def: "Función NumPy elemento a elemento (sqrt, exp, clip…)." },
    ]),
  ],
  u17: [
    z("Una estadística resume muchos números en uno: la media es 'el centro aritmético', el máximo es el más grande, percentil 50 es la mediana (el del medio si ordenas). NumPy las calcula en una línea. axis elige la dirección: ¿resumen de cada columna o de cada fila?"),
    p("axis=0 baja por las filas: te queda un número por columna. axis=1 recorre cada fila. Sin axis, resume todo el array en un solo número. No memorices el número 0 o 1: dibuja la tabla y pregunta '¿quiero un resumen por columna o por fila?'."),
    c("import numpy as np\nx = np.array([[1., 2.], [3., 4.]])\nprint(x.mean())        # 2.5, todo\nprint(x.mean(axis=0))  # [2. 3.] media de cada columna", "La primera columna es 1 y 3 → media 2. La segunda es 2 y 4 → media 3."),
    g([
      { term: "media", def: "Suma dividido entre cuántos hay." },
      { term: "mediana", def: "El valor del centro si ordenas. Menos sensible a un 999 colado." },
      { term: "axis", def: "Dirección del resumen. 0 = por columnas (baja). 1 = por filas (a lo ancho)." },
      { term: "std", def: "Dispersión (desviación típica). En NumPy, por defecto divide por n, no por n-1." },
    ]),
  ],
  u18: [
    z("Reshape es 'cambia el recorte de la misma plastilina': 6 números pueden ser 2×3 o 3×2. No inventa datos. -1 significa 'tú calcula este lado'. Un filtro pone a cero (u otro valor) lo que no cumple una condición."),
    c("import numpy as np\na = np.arange(6).reshape(2, 3)\nprint(a)\nprint(np.where(a > 2, a, 0))", "arange(6) es 0..5. reshape(2,3) los pone en 2 filas. where: si a>2 deja a, si no pone 0."),
    g([
      { term: "reshape", def: "Cambia la forma. El número total de celdas tiene que cuadrar." },
      { term: "ravel / flatten", def: "Pasa a 1D (una sola fila de números)." },
      { term: "clip", def: "Recorta valores por debajo de un mínimo o por encima de un máximo." },
    ]),
  ],
  p1: [
    z("Este proyecto es el gesto de analista: archivo → números → un dato que puedes decir en voz alta ('la media de temperatura es…'). No hace falta un dashboard. Hace falta no creerte el primer número sin mirar si hay un 999 colado."),
    list([
      "Lee el CSV o el array que te den.",
      "Convierte a números. Pregunta: ¿hay nulos? ¿unidades?",
      "Calcula la media. Redondea al presentar, calcula con todos los decimales.",
    ]),
  ],
  u19: [
    z("Un gráfico es un dibujo de números para que un humano vea un patrón. Matplotlib es la librería clásica en Python. Imagina un lienzo (Figure) y uno o más ejes (Axes): el recuadro con X e Y donde se pintan las líneas."),
    p("Las cuatro familias que usarás: línea (cómo evoluciona algo), barras (comparar categorías), histograma (cómo se reparte una variable: muchos bajos, pocos altos…), scatter (puntos sueltos, dos medidas a la vez)."),
    c("import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [1, 4, 2], marker='o')\nax.set_title('Serie')\nax.set_xlabel('tiempo')\nax.set_ylabel('valor')", "plt.subplots() te da el lienzo y el eje. plot pinta. set_* pone títulos. En PyQuest el dibujo aparece como imagen."),
    g([
      { term: "Figure", def: "Toda la imagen, el lienzo." },
      { term: "Axes", def: "Un recuadro con ejes X e Y dentro de la figura. Puedes tener varios (subplots)." },
      { term: "pyplot / plt", def: "El módulo de Matplotlib que usamos casi siempre." },
    ]),
  ],
  u20: [
    z("Personalizar no es 'bonito de más'. Un eje sin unidades miente. Un color que no se distingue en blanco y negro excluye. Título, etiquetas, leyenda y límites son parte del mensaje, no adorno."),
    p("set_xlim / set_ylim recortan lo que se ve (útil, y también peligroso: un zoom puede exagerar una diferencia). legend nombra cada serie. grid ayuda a leer. tight_layout evita que los títulos se corten."),
    g([
      { term: "leyenda", def: "La cajita que dice qué color es qué serie." },
      { term: "límites del eje", def: "Desde dónde hasta dónde se dibuja. Cámbialos con intención, no para dramatizar." },
    ]),
  ],
  u21: [
    z("Seaborn es una capa encima de Matplotlib que entiende tablas (DataFrames). En vez de pasar listas sueltas, dices data=df, x='columna', y='otra'. hue colorea por grupo ('hombres / mujeres') y el gráfico se vuelve comparativo."),
    p("Si aún no has llegado a Pandas: un DataFrame es una tabla con nombres de columna. Seaborn brilla cuando ya tienes esa tabla. Si no, Matplotlib a palo seco vale."),
    g([
      { term: "DataFrame", def: "Tabla de Pandas: filas y columnas con nombre." },
      { term: "hue", def: "Color según una categoría. No es un tinte decorativo: es un agrupador." },
      { term: "histplot / boxplot / heatmap", def: "Forma de una variable / comparación de grupos / matriz de colores (p. ej. correlaciones)." },
    ]),
  ],
  u22: [
    z("Storytelling visual no es marketing. Es: antes de dibujar, escribe la frase que el gráfico debe demostrar. 'Las ventas suben' no dice nada. 'En el canal web, Q3 duplica a Q1' sí. Un gráfico, un mensaje."),
    list([
      "Ordena las barras por valor, no por alfabeto (salvo meses o un orden natural).",
      "Anota el número clave encima de la barra más importante.",
      "Quita 3D, sombras y fondos que no informan.",
      "El título puede ser la conclusión, no el nombre de la variable.",
    ]),
  ],
  p2: [
    z("Un dashboard estático es una figura con dos o más paneles. No es una web interactiva. Es 'distribución a la izquierda, comparación a la derecha': un informe de una página. subplots(1, 2) es exactamente eso: 1 fila, 2 columnas de gráficos."),
    c("fig, axes = plt.subplots(1, 2, figsize=(8, 3))\naxes[0].hist(x)\naxes[1].bar(cats, vals)", "axes[0] es el de la izquierda. axes[1] el de la derecha. figsize es el tamaño en pulgadas."),
  ],
  u23: [
    z("Pandas es la librería de tablas en Python. Una Series es una sola columna con etiqueta en cada fila (índice). Un DataFrame es varias Series alineadas: lo que en Excel sería una hoja con encabezados. pd es el mote, como np en NumPy."),
    p("Al abrir datos, el ritual es siempre el mismo: .head() (primeras filas), .shape (cuántas filas y columnas), .dtypes (qué tipo tiene cada columna), .describe() (resumen numérico). Si te saltas eso, los ejercicios te pillan con un nulo o un texto donde esperabas un número."),
    c("import pandas as pd\ndf = pd.DataFrame({'temp': [10, 12, 9], 'ciudad': ['A', 'A', 'B']})\nprint(df.head())\nprint(df.shape)  # (3, 2) → 3 filas, 2 columnas", "Las claves del diccionario se vuelven nombres de columna. Cada lista es el contenido de esa columna."),
    g([
      { term: "Series", def: "Una columna con índice." },
      { term: "DataFrame", def: "Tabla. df es el nombre que casi todo el mundo usa." },
      { term: "índice", def: "La etiqueta de cada fila. Por defecto 0, 1, 2… Puede ser una fecha." },
    ]),
  ],
  u24: [
    z("Seleccionar es 'quéame esta columna' o 'quéame estas filas que cumplen algo'. En Excel filtras. En Pandas: df['temp'] es una Series (una columna). df[['temp']] es un DataFrame de una columna (doble corchete). loc elige por nombre; iloc por posición (la fila 0, la 1…)."),
    c("df.loc[df.temp > 10, ['ciudad', 'temp']]\ndf.iloc[0:3, 0]", "La primera: filas donde temp > 10, solo esas dos columnas. La segunda: las tres primeras filas, primera columna, por posición."),
    p("El error clásico: df[df.x > 1]['y'] = 0 a veces no escribe (SettingWithCopy). La forma segura: df.loc[filas, 'y'] = 0."),
    g([
      { term: "loc", def: "Selección por etiquetas y por condiciones." },
      { term: "iloc", def: "Selección por número de fila/columna, como coordenadas." },
      { term: "filtro booleano", def: "Una columna de True/False. df[df.temp > 10] se queda con las filas True." },
    ]),
  ],
  u25: [
    z("Los datos reales llegan sucios: celdas vacías (nulos), filas repetidas, 'Madrid ' con un espacio, números guardados como texto. Limpiar no es un botón mágico: cada decisión (¿borro? ¿relleno con la mediana?) cambia el relato. Anótala."),
    list([
      "isna: ¿dónde faltan datos? dropna los tira. fillna los rellena.",
      "drop_duplicates quita filas iguales.",
      "astype intenta cambiar el tipo (texto → número). Si hay una letra, fallará: límpiala antes.",
      "str.strip().str.lower() unifica categorías de texto.",
    ]),
    g([
      { term: "nulo / NA / NaN", def: "Celda sin valor. No es cero. Cero es un número; nulo es 'no lo sabemos'." },
      { term: "imputar", def: "Rellenar nulos con un valor elegido (media, mediana, un 0…). Diluirá o sesgará: dilo en el informe." },
    ]),
  ],
  u26: [
    z("Transformar es pasar de la tabla cruda a la tabla que responde la pregunta. groupby agrupa filas que comparten un valor ('todas las de Madrid') y luego resume (media, suma). merge pega dos tablas por una columna común, como un BUSCARV de Excel. pivot_table reordena: filas, columnas, valores."),
    c("df.groupby('ciudad')['temp'].mean()\ndf.merge(otras, on='id', how='left')", "groupby: un número por ciudad. merge how='left' conserva todas las filas de la tabla de la izquierda aunque la otra no tenga pareja."),
    g([
      { term: "groupby", def: "Parte la tabla en grupos y calcula un resumen por grupo." },
      { term: "merge / join", def: "Combina tablas por clave. how dice qué filas sobreviven." },
      { term: "agg", def: "Aplicar varias métricas a la vez: media y desviación, por ejemplo." },
    ]),
  ],
  u27: [
    z("Una serie temporal es una medida que avanza en el tiempo: ventas cada día, temperatura cada hora. En Pandas, si el índice son fechas, puedes agrupar por mes (resample), mirar 'el valor de ayer' (shift) o una media de los últimos 7 días (rolling)."),
    p("Lo más importante al empezar: convertir el texto '2024-03-15' a fecha de verdad con pd.to_datetime. Si no, Python las ordena como palabras y '10' va antes que '2' porque el carácter 1 es menor que 2… o al revés, según el formato. Especifica el formato si hay duda día/mes."),
    g([
      { term: "DatetimeIndex", def: "Índice hecho de fechas reales, no de texto." },
      { term: "resample", def: "Agrupar por frecuencia: 'D' día, 'W' semana, 'M' mes." },
      { term: "rolling", def: "Ventana móvil. rolling(7).mean() es la media de los últimos 7 puntos." },
    ]),
  ],
  p3: [
    z("EDA significa análisis exploratorio: no es un modelo todavía. Es mirar, preguntar y escribir una frase con un número. El Titanic es el ejemplo clásico porque mezcla una categoría (clase del billete) con una tasa (qué porcentaje sobrevivió)."),
    list([
      "¿Cuántas filas? ¿Nulos en edad?",
      "Tasa global vs por clase o por sexo.",
      "Una hipótesis en una frase y el número que la sostiene. Sin causalidad mágica.",
    ]),
  ],
  u28: [
    z("La estadística descriptiva resume un montón de números sin predecir el futuro. Media: súmalo todo y divide. Mediana: ordena y quédate con el del medio. Si hay un millonario en la sala, la media de ingresos se dispara y la mediana casi no. Por eso cuentas las dos."),
    p("El rango es máximo menos mínimo. El IQR (rango intercuartílico) es 'el ancho de la mitad central': entre el percentil 25 y el 75. Un boxplot es ese IQR dibujado. La varianza / desviación típica miden cuánto se esparcen los puntos alrededor de la media."),
    g([
      { term: "percentil 25 / 75", def: "El valor por debajo del cual está el 25% (o el 75%) de los datos, si ordenas." },
      { term: "IQR", def: "P75 menos P25. Caja del boxplot." },
      { term: "outlier", def: "Un valor raro, muy lejos del resto. A veces es un error (999); a veces es real." },
    ]),
  ],
  u29: [
    z("Una distribución es un modelo de 'cómo salen los números si el azar interviene'. No es que tus datos 'sean' la campana: a veces se parecen, a veces no. La normal (campana) es famosa. Bernoulli es una moneda (0 o 1). Uniforme es 'todos igual de posibles' en un intervalo."),
    p("Un histograma cuenta cuántos valores caen en cada tramo. Si la cola derecha es larga (ingresos), la media queda a la derecha de la mediana. El teorema central del límite habla de medias de muestras, no de que cada observación sea normal."),
    g([
      { term: "histograma", def: "Barras con el recuento por intervalos. Muestra la forma." },
      { term: "asimetría", def: "La campana torcida a un lado. Ingresos suelen ser asimétricos a la derecha." },
      { term: "simular", def: "Inventar datos con un generador de azar (rng.normal) para pillar intuición." },
    ]),
  ],
  u30: [
    z("Correlación pregunta: cuando una cosa sube, ¿la otra tiende a subir o a bajar? Sale un número entre -1 y 1. 1 es 'suben juntas en línea recta'. -1 es 'una sube y la otra baja'. 0 es 'no veo recta'. No significa que una cause la otra: el helado y los ahogados suben juntos en verano porque hace calor, no porque el helado ahogue."),
    p("Pearson mide asociación lineal y se deja engañar por un outlier. Spearman usa rangos (quién es el 1º, 2º…) y aguanta mejor curvas monótonas. Un scatter (nube de puntos) es obligatorio: el número sin dibujo miente."),
    g([
      { term: "Pearson r", def: "Correlación lineal, -1 a 1." },
      { term: "causalidad", def: "A provoca B. La correlación no la demuestra." },
      { term: "covarianza", def: "Prima de la correlación, en unidades crudas. Difícil de leer; por eso se normaliza a r." },
    ]),
  ],
  u31: [
    z("Una prueba de hipótesis es un ritual para no emocionarnos con un resultado que también saldría por chiripa. H0 (hipótesis nula) es el 'no pasa nada' (las dos medias son iguales, la moneda es justa…). El p-valor responde: si H0 fuera cierta, ¿qué tan raro sería ver algo tan extremo como lo que vi? Un p pequeño = sería raro. No es 'la probabilidad de que H0 sea verdad'."),
    p("α = 0.05 es una costumbre, no magia: aceptamos equivocarnos 5 de cada 100 veces si H0 era cierta. Un intervalo de confianza dice 'el efecto razonable está entre aquí y aquí'. Reporta la diferencia, no solo 'es significativo'."),
    g([
      { term: "H0", def: "La hipótesis aburrida. Lo que intentamos ver si los datos hacen raro." },
      { term: "p-valor", def: "Rareza de los datos si H0 fuera cierta. No es P(H0)." },
      { term: "α", def: "Umbral de rareza (a menudo 0.05)." },
      { term: "tamaño del efecto", def: "Cuánto cambia la cosa, no solo si el p es chico." },
    ]),
  ],
  p4: [
    z("Un informe estadístico corto cabe en una página: pregunta, dos números (media y mediana), un gráfico, una limitación. La limitación ('muestra chica', 'no hay causalidad') es lo que te hace creíble. Sin ella, pareces un anuncio."),
  ],
  u32: [
    z("Machine learning (aprendizaje automático) es: en vez de escribir a mano la regla 'si ingresos > X, aprueba el crédito', le das ejemplos y el programa busca una regla que acierte. No 'entiende'. Ajusta números (parámetros) para bajar un error. Supervisado: tienes la respuesta correcta (y) en el pasado. No supervisado: solo tienes X, buscas grupos."),
    p("Se parte el dataset: train (aprende), validación (elige detalles como 'qué tan profundo el árbol'), test (un número honesto al final, una sola vez). Si usas el test para decidir el modelo, dejó de ser test: se filtró información. Empieza siempre por un baseline tonto (predecir la media, o la clase más frecuente). Si tu modelo no gana a eso, no hay victoria."),
    g([
      { term: "X", def: "Las columnas de entrada (edad, ingresos…)." },
      { term: "y", def: "Lo que quieres predecir (precio, sí/no)." },
      { term: "parámetros", def: "Números que el modelo ajusta (pendiente de una recta, umbrales de un árbol…)." },
      { term: "baseline", def: "El modelo más tonto que aún es honesto. Hay que ganarlo." },
    ]),
  ],
  u33: [
    z("Preprocesar es dejar los datos en la forma que el modelo digiere: números a la misma escala, categorías convertidas a 0/1, nulos rellenados. El truco de oro: se aprende el preproceso solo con train (fit) y luego se aplica a val/test (transform) sin volver a aprender. Si escalas con la media de todo el dataset incluido el test, el test ya no es ciego."),
    c("from sklearn.preprocessing import StandardScaler\nsc = StandardScaler()\nXtr = sc.fit_transform(X_train)\nXte = sc.transform(X_test)  # sin fit otra vez", "fit_transform en train. transform en test. StandardScaler resta la media y divide por la desviación: deja cada columna en una escala comparable."),
    g([
      { term: "escalar", def: "Poner columnas en rangos comparables. Edad (0–100) vs ingresos (0–100 000) si no, gana ingresos." },
      { term: "one-hot", def: "Una columna por categoría, 0 o 1. 'Madrid/Valencia/Sevilla' → 3 columnas binarias." },
      { term: "fuga", def: "Usar información del test (o del futuro) al entrenar. El número queda optimista y falso." },
    ]),
  ],
  u34: [
    z("Una recta es el modelo más honesto: predice un número como 'pendiente × x + intercepto'. Eso es regresión lineal. Si lo que quieres es un sí/no (¿spam?), pasas esa receta por una curva en S (sigmoide) que aplasta el resultado a una probabilidad entre 0 y 1: regresión logística. El nombre engaña: logística clasifica, no es 'la lineal de los logs' en la cabeza de nadie al empezar."),
    c("import numpy as np\np = 1 / (1 + np.exp(-(0.5 * x + 0)))  # sigmoide", "Si el interior es 0, p = 0.5. Si es muy positivo, p se acerca a 1. Muy negativo, a 0."),
    g([
      { term: "regresión", def: "Predecir un número continuo (precio, temperatura)." },
      { term: "clasificación", def: "Predecir una etiqueta (spam / no, enfermo / sano)." },
      { term: "sigmoide", def: "Curva en S que convierte cualquier número en una probabilidad 0–1." },
      { term: "MSE / log-loss", def: "Cómo se mide el error: cuadrados en regresión; log-pérdida en logística." },
    ]),
  ],
  u35: [
    z("Un árbol de decisión hace preguntas sí/no: '¿edad > 40?', '¿ingresos > 30k?'. Fácil de dibujar en una servilleta y fácil de memorizar el ruido del train (sobreajustar). Un bosque (Random Forest) es muchos árboles votando, cada uno viendo un subconjunto: suele generalizar mejor."),
    p("max_depth pequeño es un freno: el árbol no puede hacer mil preguntas. feature_importances_ dice qué variables usó más el bosque: es una pista, no una causa."),
    g([
      { term: "sobreajustar (overfitting)", def: "Memorizar el train, fallar en datos nuevos. Como empollar las preguntas del examen en vez de la materia." },
      { term: "Random Forest", def: "Votación de muchos árboles en subconjuntos aleatorios." },
      { term: "profundidad", def: "Cuántas preguntas encadenadas puede hacer el árbol." },
    ]),
  ],
  u36: [
    z("KNN (k vecinos más cercanos) no 'aprende una fórmula': mira los k ejemplos del train más parecidos al nuevo y copia su etiqueta. Perezoso y muy sensible a la escala (si ingresos va de 0 a 100 000 y edad de 0 a 100, la distancia la marca el dinero). SVM busca la raya (hiperplano) que separa clases con el mayor margen. Con un truco (kernel) esa raya puede ser curva."),
    g([
      { term: "distancia", def: "Qué tan parecidos son dos puntos. En KNN, la votación depende de ella." },
      { term: "margen", def: "El hueco entre la raya y los puntos más cercanos. SVM lo maximiza." },
      { term: "kernel RBF", def: "Permite fronteras no lineales sin que tú dibujes la curva." },
    ]),
  ],
  u37: [
    z("K-Means es agrupación, no predicción de una etiqueta que ya tienes. Dices 'quiero k grupos' y el algoritmo coloca k centros, asigna cada punto al centro más cercano, mueve los centros, y repite. Los grupos no salen con nombre ('clientes VIP'): tú los interpretas después. k lo eliges tú (método del codo, silueta)."),
    list(["Escala las columnas antes: si no, gana la de más rango.", "Prueba varias inicializaciones (n_init).", "K-Means asume manchas más o menos redondas. Si los grupos son bananos, sufrirá."]),
    g([
      { term: "no supervisado", def: "No hay y. Solo X. Buscas estructura." },
      { term: "centroide", def: "El punto medio de un grupo. K-Means los mueve." },
      { term: "k", def: "Cuántos grupos pides. Es un hiperparámetro, no un dato." },
    ]),
  ],
  u38: [
    z("Evaluar es medir si el modelo sirve. Accuracy (porcentaje de aciertos) miente si 99 de cada 100 correos no son spam: un modelo que dice siempre 'no spam' acierta el 99 % y no sirve. Por eso existen precisión (de lo que marqué positivo, cuánto era de verdad), recall (de todos los positivos reales, cuántos pillé), F1 (equilibrio), matriz de confusión (la tablita aciertos/errores). En regresión: RMSE o MAE (qué tan lejos cae el número)."),
    p("Elige la métrica según el coste: un falso negativo en una enfermedad (no detectar) suele ser peor que un falso positivo (un susto). ROC-AUC resume el ranking de probabilidades. Overfitting se ve cuando train va de lujo y validación se cae."),
    g([
      { term: "falso positivo", def: "El modelo dijo sí y era no." },
      { term: "falso negativo", def: "El modelo dijo no y era sí." },
      { term: "matriz de confusión", def: "Tabla 2×2 (o más) de aciertos y esos dos errores." },
    ]),
  ],
  p5: [
    z("El proyecto de modelo no empieza por una red neuronal. Empieza por un baseline (umbral, media), mides, luego un modelo simple, mides otra vez. Si no ganas al baseline, documentas eso también: es un resultado. Anota X, y, cómo partiste train/test y la métrica."),
  ],
  u39: [
    z("Una red neuronal es muchas cuentas encadenadas. Una neurona hace: combina entradas con pesos (importancias), suma un sesgo, y pasa el resultado por una curva no lineal (ReLU: 'si es negativo, pon 0; si no, déjalo'). Una capa es un montón de neuronas en paralelo. Varias capas permiten dibujar fronteras raras que una sola recta no puede. En PyQuest practicamos el álgebra con NumPy: es el mismo 'hacia adelante' que Keras esconde detrás de model.fit."),
    c("import numpy as np\nz = X @ W + b      # combinación lineal\nh = np.maximum(z, 0)  # ReLU", "@ es el producto de matrices. ReLU apaga lo negativo. Eso ya es una capa."),
    g([
      { term: "peso W", def: "Números que la red ajusta. Dicen cuánto cuenta cada entrada." },
      { term: "sesgo b", def: "Un desplazamiento. Como el intercepto de una recta." },
      { term: "ReLU", def: "max(z, 0). No linealidad barata y muy usada." },
      { term: "forward", def: "El cálculo de izquierda a derecha para obtener la predicción." },
    ]),
  ],
  u40: [
    z("Keras y PyTorch son cajas de herramientas para redes. Keras (dentro de TensorFlow) es más 'receta': apilas capas Sequential, compile (qué error y qué optimizador), fit (entrena). PyTorch es más manual: tú escribes el bucle, ves los tensores. Las ideas son las mismas: forward, loss, backward (gradientes), update (mover pesos). En el navegador de PyQuest no cargamos TensorFlow: el mapa conceptual sí."),
    g([
      { term: "tensor", def: "Array con más dimensiones. Un número es 0D, una fila 1D, una tabla 2D, un lote de imágenes 4D…" },
      { term: "Dense", def: "Capa donde cada neurona mira todas las entradas (totalmente conectada)." },
      { term: "época", def: "Una pasada completa por el train." },
      { term: "batch", def: "Un puñado de ejemplos a la vez, no todos ni de uno en uno." },
    ]),
  ],
  u41: [
    z("Entrenar es: calcular el error (loss), ver hacia dónde bajarlo (gradiente: la pendiente), dar un pasito en esa dirección (learning rate = tamaño del paso). Paso enorme: te pasas y el error explota. Paso minúsculo: tardas una eternidad. Un batch es un compromiso: no usas todo el dataset en cada paso (caro) ni un solo ejemplo (muy ruidoso)."),
    c("w = w - lr * grad  # descenso por gradiente, la idea de una línea", "Si grad es positivo, restas y w baja. lr es el tamaño del paso (0.01, 0.001…)."),
    p("Overfitting: el error de train baja y el de validación sube. Remedios: parar antes (early stopping), dropout (apagar neuronas al azar en train), más datos, red más chica."),
    g([
      { term: "loss", def: "El número que quieres bajar. MSE, log-loss, etc." },
      { term: "gradiente", def: "La dirección de máximo aumento. Bajamos en la contraria." },
      { term: "learning rate", def: "Tamaño del paso. Hiperparámetro delicado." },
    ]),
  ],
  u42: [
    z("Una imagen en blanco y negro de 28×28 píxeles es una tabla de 28 filas y 28 columnas, o un vector de 784 números si la aplastas. Cada número es un brillo (0 negro, 255 blanco). MNIST son dígitos escritos a mano: el 'hola mundo' de visión por computador. Una CNN (red convolucional) mira vecindarios de píxeles; un Dense aplastado también funciona, peor, porque olvida que el 3 sigue siendo un 3 si lo mueves un poco."),
    p("Normaliza a [0, 1] dividiendo entre 255. Los enteros crudos marean al optimizador. En PyQuest no entrenamos una CNN gigante: entendemos la forma del dato."),
    g([
      { term: "píxel", def: "Una celda de la imagen. Un número (gris) o tres (RGB)." },
      { term: "MNIST", def: "60 000 dígitos 28×28. Dataset clásico de juguete serio." },
      { term: "convolución", def: "Una ventanita que recorre la imagen buscando patrones locales (bordes, bucles)." },
    ]),
  ],
  u43: [
    z("El texto para un computador es números. El primer paso es tokenizar: partir en palabras o trozos ('hola', 'mundo'). Bag-of-words cuenta cuántas veces aparece cada token e ignora el orden ('perro muerde hombre' ≈ 'hombre muerde perro'). Un embedding coloca cada token en un espacio de números donde 'rey' y 'reina' quedan cerca. Un modelo preentrenado ya vio muchísimo texto; tú lo consultas o lo adaptas."),
    c('texto = "hola hola mundo"\ntokens = texto.split()\nprint(len(set(tokens)))  # 2 palabras distintas', "split parte por espacios. set quita duplicados. Vocabulario = 2."),
    p("Pasar a minúsculas y quitar signos borra señales ('No' vs 'no'). Mide el preproceso como una hipótesis más, no como un ritual sagrado."),
    g([
      { term: "token", def: "Un trozo de texto que el modelo trata como unidad. A menudo una palabra." },
      { term: "vocabulario", def: "El conjunto de tokens distintos." },
      { term: "embedding", def: "Un vector denso que representa un token. Dimensión 50, 300, 768…" },
      { term: "NLP", def: "Procesamiento de lenguaje natural: texto → números → modelo." },
    ]),
  ],
  p6: [
    z("El proyecto final de esta ruta es un clasificador de juguete: cuatro puntos y una regla a mano (pred = 1 si x+y >= 1 si no 0). Si puedes contar aciertos, entendiste el ciclo entero de PyQuest: frontera + evaluación. No hace falta TensorFlow para esa idea."),
  ],
  boss1: [
    z("Un nivel jefe no inventa Python nuevo. Te pide el oficio: un CSV, una pregunta, un número verdadero y una frase que no sobrevenda. Limpia, resume, afirma solo lo que los datos sostienen. Si la muestra es chica, dilo."),
    list(["Comprueba que las sumas cierran.", "Una tabla y un gráfico bastan.", "Escribe la limitación: sin causalidad, muestra pequeña, nulos."]),
  ],
  boss2: [
    z("Aquí unes un número (accuracy, RMSE) con la imagen mental del error. Un 75 % de acierto no es 'el modelo es bueno' hasta que lo comparas con el azar o con 'siempre predigo la clase más frecuente'. Ese es el baseline. Si no lo ganas, el gráfico bonito no salva el informe."),
  ],
  boss3: [
    z("El portafolio de un analista es un ciclo, no una red neuronal. Los cuatro pasos caben en una frase: limpiar → explorar → modelar → comunicar. Si puedes nombrarlos con un ejemplo tuyo (aunque sea el CSV de ventas de 3 filas), ya no eres principiante: cierras el ciclo."),
    c("pasos = ['limpiar', 'explorar', 'modelar', 'comunicar']\nprint(len(pasos))  # 4", "No es un truco de código. Es el mapa mental que PyQuest ha estado entrenando."),
  ],
};
