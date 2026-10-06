"""Nivel 5, Profundiza: un caso un poco más real por tema."""


def packs(h):
    L, mc, fill, predict = h["lesson"], h["mc"], h["fill"], h["predict"]
    code, find_err = h["code"], h["find_err"]
    out = {}

    def add(uid, focus, description, exercises):
        out[uid] = [L(f"{uid}-l5", f"Profundiza: {focus}", description, exercises, level=5)]

    add("u1", "un programa de tres pasos", "Encadena instrucciones y distingue lo que se ejecuta de lo que solo se escribe.", [
        mc("u1-l5-e1", "Una línea lanza un error. ¿Qué pasa con las líneas de abajo?",
           [("a", "No se ejecutan: Python se detiene en el error"), ("b", "Python las adivina y sigue"), ("c", "Se convierten en comentarios")],
           "a", "Un error detiene el programa en esa línea. Las siguientes no corren."),
        predict("u1-l5-e2", "¿Qué imprime este programa?",
                "print('listo')\nprint('A', 'B', sep='-')", "listo\nA-B",
                "sep cambia el separador entre argumentos. El salto de línea entre prints se mantiene."),
        code("u1-l5-e3", "Crea `pasos = 3`, imprime `Inicio` y después imprime `pasos`.",
             "", ["pasos == 3"], "pasos = 3\nprint('Inicio')\nprint(pasos)",
             "Primero guardas el dato y después lo muestras. El orden es parte del programa.",
             expected_stdout="Inicio\n3"),
        find_err("u1-l5-e4", "¿Por qué este programa no llega a imprimir `fin`?",
                 [("a", "Falla en la segunda línea y Python se detiene"), ("b", "print solo puede usarse una vez"), ("c", "Las comillas dobles no existen")],
                 "a", "print(hola) busca una variable. Al no existir, el programa aborta antes del último print.",
                 starter="print('inicio')\nprint(hola)\nprint('fin')"),
    ])

    add("u2", "tipos que se mezclan", "Convierte datos antes de operarlos y distingue el nombre del valor.", [
        mc("u2-l5-e1", "¿Qué tipo produce `3 / 1` en Python 3?",
           [("a", "float, aunque el resultado sea 3.0"), ("b", "int, porque no hay decimal visible"), ("c", "str")],
           "a", "La división con / siempre devuelve float."),
        predict("u2-l5-e2", "¿Qué imprime?", "print(type(3 / 1).__name__)", "float",
                "/ produce un float. type(...).__name__ devuelve el nombre del tipo."),
        code("u2-l5-e3", "Convierte el texto `edad_txt = '28'` a entero y suma 1. Guarda el resultado en `edad`.",
             "edad_txt = '28'\n", ["edad == 29"], "edad_txt = '28'\nedad = int(edad_txt) + 1",
             "int() convierte el texto a número. Sin esa conversión, no puedes sumar."),
        find_err("u2-l5-e4", "¿Por qué falla esta suma?",
                 [("a", "No se puede sumar un str y un int sin convertir"), ("b", "El 1 es demasiado pequeño"), ("c", "Falta un comentario")],
                 "a", "'3' es texto. int('3') + 1 sí funciona.", starter="total = '3' + 1"),
    ])

    add("u3", "prioridad y comparaciones", "Lee una fórmula como lo haría Python, no como una calculadora descuidada.", [
        predict("u3-l5-e1", "¿Qué imprime?", "print(2 + 3 * 4)", "14",
                "* se resuelve antes que +. 2 + 12 es 14."),
        mc("u3-l5-e2", "¿Cuál expresión es verdadera para `edad = 18`?",
           [("a", "18 <= edad < 65"), ("b", "edad = 18"), ("c", "edad => 18")],
           "a", "Se puede encadenar una comparación. = asigna y => no existe."),
        code("u3-l5-e3", "Con `precio = 80` y `iva = 0.08`, guarda en `total` el precio más el impuesto.",
             "precio = 80\niva = 0.08\n", ["abs(total - 86.4) < 1e-9"],
             "precio = 80\niva = 0.08\ntotal = precio * (1 + iva)",
             "El paréntesis deja claro que el 1 es el precio completo y el iva es el extra."),
        find_err("u3-l5-e4", "¿Qué está mal si la intención era comparar?",
                 [("a", "Usa =, que asigna, en vez de =="), ("b", "Los números no se pueden comparar"), ("c", "Falta un print")],
                 "a", "== pregunta si son iguales. Un solo = guarda un valor.", starter="if total = 10:\n    print('ok')"),
    ])

    add("u4", "texto que se transforma", "Construye otro string sin intentar modificar el original.", [
        predict("u4-l5-e1", "¿Qué imprime?", "s = 'PyQuest'\nprint(s[1:4])", "yQu",
                "El slice incluye el índice 1 y excluye el 4."),
        mc("u4-l5-e2", "¿Por qué `s[0] = 'A'` falla si s es un str?",
           [("a", "Los strings son inmutables: hay que construir otro"), ("b", "Los índices empiezan en 1"), ("c", "Solo las listas pueden guardar letras")],
           "a", "Para cambiar texto creas un string nuevo, por ejemplo con un f-string o replace."),
        code("u4-l5-e3", "Con `nombre = 'ana'`, crea `saludo` que sea `Hola, Ana` usando un f-string y title().",
             "nombre = 'ana'\n", ["saludo == 'Hola, Ana'"],
             "nombre = 'ana'\nsaludo = f'Hola, {nombre.title()}'",
             "title() capitaliza el texto y el f-string lo inserta. El original no cambia."),
        find_err("u4-l5-e4", "¿Cuál es el error?",
                 [("a", "Intenta modificar un carácter de un string"), ("b", "title no existe"), ("c", "Las comillas simples son inválidas")],
                 "a", "s[0] = 'A' no es legal. Usa un string nuevo.", starter="s = 'py'\ns[0] = 'A'"),
    ])

    add("u5", "la misma lista, dos nombres", "Distingue copiar una lista de compartirla.", [
        predict("u5-l5-e1", "¿Qué imprime?", "a = [1, 2]\nb = a\nb.append(3)\nprint(a)", "[1, 2, 3]",
                "b = a no copia. append cambia la única lista, visible desde ambos nombres."),
        mc("u5-l5-e2", "¿Qué devuelve `notas.append(8)`?",
           [("a", "None. La lista cambia, pero append no la devuelve"), ("b", "La lista ya con el 8"), ("c", "El número 8")],
           "a", "Por eso `notas = notas.append(8)` deja notas en None."),
        code("u5-l5-e3", "De `notas = [4, 7, 5, 9]`, crea `altas` con las notas mayores que 6, en el mismo orden.",
             "notas = [4, 7, 5, 9]\n", ["altas == [7, 9]"],
             "notas = [4, 7, 5, 9]\naltas = [n for n in notas if n > 6]",
             "La comprensión filtra sin borrar elementos mientras recorres la lista original."),
        find_err("u5-l5-e4", "¿Por qué `copia` no protege a `base`?",
                 [("a", "copia y base apuntan a la misma lista"), ("b", "append solo funciona con números"), ("c", "Las listas no pueden tener tres elementos")],
                 "a", "Para copiar usa base[:] o list(base).", starter="base = [1]\ncopia = base\ncopia.append(2)"),
    ])

    add("u6", "únicos de verdad", "Elige set cuando te importa la pertenencia y no el orden.", [
        mc("u6-l5-e1", "¿Por qué un set no puede guardar listas?",
           [("a", "Sus elementos tienen que ser hashables e inmutables"), ("b", "Un set solo acepta números"), ("c", "Las listas ya no tienen duplicados")],
           "a", "Una lista puede cambiar, así que no sirve como elemento de un set ni como clave."),
        predict("u6-l5-e2", "¿Qué imprime?", "print(len(set([1, 1, 2, 3])))", "3",
                "El 1 repetido cuenta una sola vez."),
        code("u6-l5-e3", "Con `a = {1, 2}` y `b = {2, 3}`, guarda en `ambos` la intersección y en `todos` la unión.",
             "a = {1, 2}\nb = {2, 3}\n", ["ambos == {2}", "todos == {1, 2, 3}"],
             "a = {1, 2}\nb = {2, 3}\nambos = a & b\ntodos = a | b",
             "& es la intersección y | la unión. El orden dentro del set no importa."),
        find_err("u6-l5-e4", "¿Qué falla?",
                 [("a", "Una lista no puede ser elemento de un set"), ("b", "set() no existe"), ("c", "Los números 1 y 2 son duplicados")],
                 "a", "Usa tuplas si necesitas registros dentro de un set.", starter="grupos = set()\ngrupos.add([1, 2])"),
    ])

    add("u7", "un registro con huecos", "Lee un diccionario aunque alguna clave no venga.", [
        predict("u7-l5-e1", "¿Qué imprime?", "cliente = {'ciudad': 'Limón'}\nprint(cliente.get('edad', 0))", "0",
                "get devuelve el valor por defecto si la clave no existe, en vez de lanzar KeyError."),
        mc("u7-l5-e2", "¿Qué guarda la clave y qué guarda el valor en `{'ciudad': 'Limón'}`?",
           [("a", "ciudad es la clave y Limón es el valor"), ("b", "Limón es la clave"), ("c", "Las dos son valores y no hay clave")],
           "a", "Buscas por la clave para obtener el valor."),
        code("u7-l5-e3", "En `pedido = {'latte': 2, 'agua': 1}`, suma las unidades en `total` recorriendo los valores.",
             "pedido = {'latte': 2, 'agua': 1}\n", ["total == 3"],
             "pedido = {'latte': 2, 'agua': 1}\ntotal = sum(pedido.values())",
             "values() recorre las cantidades, no los nombres de los productos."),
        find_err("u7-l5-e4", "¿Por qué falla el acceso?",
                 [("a", "Un dict no tiene atributos con el nombre de la clave; se usa pedido['latte']"), ("b", "latte no puede ser texto"), ("c", "Falta importar dict")],
                 "a", "La notación de punto no busca claves. Usa corchetes o .get().", starter="pedido = {'latte': 2}\nprint(pedido.latte)"),
    ])

    add("u8", "varias reglas, un resultado", "Traduce una escala a if, elif y else sin dejar huecos.", [
        predict("u8-l5-e1", "¿Qué imprime?", "nota = 7\nif nota >= 9:\n    etiqueta = 'alto'\nelif nota >= 6:\n    etiqueta = 'medio'\nelse:\n    etiqueta = 'bajo'\nprint(etiqueta)", "medio",
                "7 no llega a 9, pero sí a 6. Se ejecuta solo la rama elif."),
        mc("u8-l5-e2", "¿Cuántas ramas de un if/elif/else se ejecutan?",
           [("a", "Solo la primera cuya condición es verdadera"), ("b", "Todas las que sean verdaderas"), ("c", "Siempre el else")],
           "a", "En cuanto una condición cumple, las siguientes se saltan."),
        code("u8-l5-e3", "Con `total = 80`, guarda en `etiqueta` el texto `alto` si total > 100 y `normal` si no.",
             "total = 80\n", ["etiqueta == 'normal'"],
             "total = 80\netiqueta = 'alto' if total > 100 else 'normal'",
             "La expresión condicional elige un valor. 80 no supera 100."),
        find_err("u8-l5-e4", "¿Qué le falta a la cabecera?",
                 [("a", "Los dos puntos que abren el bloque"), ("b", "Un punto y coma"), ("c", "La palabra then")],
                 "a", "En Python el bloque empieza después de `:`.", starter="if total > 100\n    print('alto')"),
    ])

    add("u9", "acumular sin perder la cuenta", "Un bucle lleva un acumulador que vive fuera y se actualiza dentro.", [
        predict("u9-l5-e1", "¿Qué imprime?", "print(list(range(3)))", "[0, 1, 2]",
                "range(3) empieza en 0 y se detiene antes de 3."),
        mc("u9-l5-e2", "¿Dónde debe empezar un acumulador de suma?",
           [("a", "Antes del bucle, normalmente en 0"), ("b", "Dentro del bucle, para reiniciarlo cada vez"), ("c", "Después del print")],
           "a", "Si lo creas dentro, cada vuelta olvida lo anterior."),
        code("u9-l5-e3", "Suma los números de `ventas = [2, 3, 5]` con un for. Guarda el resultado en `total`.",
             "ventas = [2, 3, 5]\n", ["total == 10"],
             "ventas = [2, 3, 5]\ntotal = 0\nfor venta in ventas:\n    total = total + venta",
             "total empieza en 0 y cada vuelta le suma la venta actual."),
        find_err("u9-l5-e4", "¿Por qué este bucle no incluye el 3?",
                 [("a", "range se detiene antes del número final"), ("b", "range empieza en 1"), ("c", "for no puede recorrer números")],
                 "a", "range(1, 3) produce 1 y 2. Para incluir 3 usa range(1, 4).", starter="for n in range(1, 3):\n    print(n)"),
    ])

    add("u10", "devolver, no solo mostrar", "Una función útil entrega un valor con return para que otra parte lo use.", [
        predict("u10-l5-e1", "¿Qué vale `resultado`?", "def doble(x):\n    print(x * 2)\nresultado = doble(4)\nprint(resultado)", "8\nNone",
                "print muestra 8, pero la función no hace return. Quien la llama recibe None."),
        mc("u10-l5-e2", "¿Qué hace `def` por sí solo?",
           [("a", "Guarda la función, pero no la ejecuta"), ("b", "Ejecuta el cuerpo inmediatamente"), ("c", "Imprime los parámetros")],
           "a", "El cuerpo corre cuando llamas la función con paréntesis."),
        code("u10-l5-e3", "Define `saludar(nombre)` que devuelva `Hola, ` más el nombre. Llama `saludo = saludar('Ana')`.",
             "", ["saludo == 'Hola, Ana'"],
             "def saludar(nombre):\n    return 'Hola, ' + nombre\nsaludo = saludar('Ana')",
             "return entrega el texto. La llamada guarda ese texto en saludo."),
        find_err("u10-l5-e4", "¿Por qué `doble(3)` no deja un 6 usable?",
                 [("a", "Muestra el 6, pero no lo devuelve"), ("b", "El parámetro se llama x y no 3"), ("c", "def no admite return")],
                 "a", "Cambia print por return si el resultado tiene que seguir viviendo.", starter="def doble(x):\n    print(x * 2)"),
    ])

    add("u11", "leer el error correcto", "El tipo de excepción dice qué arreglar.", [
        mc("u11-l5-e1", "`int('x')` lanza ¿qué tipo de error?",
           [("a", "ValueError: el texto no es un entero"), ("b", "NameError: x no existe"), ("c", "SyntaxError: faltan dos puntos")],
           "a", "La sintaxis es válida. Falla la conversión del contenido."),
        predict("u11-l5-e2", "¿Qué imprime?", "try:\n    n = int('x')\nexcept ValueError:\n    n = None\nprint(n)", "None",
                "El except captura ValueError y deja n en None en vez de abortar."),
        code("u11-l5-e3", "Intenta `int('8a')`. Si falla con ValueError, guarda `edad = None`. Si funciona, guarda el entero.",
             "", ["edad is None"],
             "try:\n    edad = int('8a')\nexcept ValueError:\n    edad = None",
             "ValueError avisa que el texto no es un número. El programa puede decidir un valor de reserva."),
        find_err("u11-l5-e4", "¿Qué problema tiene este manejo de errores?",
                 [("a", "Un except vacío esconde cualquier fallo, no solo el que esperabas"), ("b", "try no existe en Python"), ("c", "int no puede fallar")],
                 "a", "Atrapa ValueError, o el error que de verdad esperas, y deja pasar el resto.", starter="try:\n    edad = int('8a')\nexcept:\n    edad = None"),
    ])

    add("u12", "un objeto que recuerda", "La instancia guarda su propio estado en self.", [
        mc("u12-l5-e1", "¿Qué es `self` dentro de un método?",
           [("a", "La instancia sobre la que se llamó el método"), ("b", "Una variable global obligatoria"), ("c", "El nombre de la clase")],
           "a", "self.n es el dato de ese objeto, no de todos los objetos."),
        predict("u12-l5-e2", "¿Qué imprime?", "class Contador:\n    def __init__(self):\n        self.n = 0\n    def suma(self):\n        self.n += 1\n        return self.n\nc = Contador()\nprint(c.suma())\nprint(c.n)", "1\n1",
                "suma modifica el n de esa instancia y también lo devuelve."),
        code("u12-l5-e3", "Crea una clase `Contador` con `n` en 0 y un método `suma` que lo incrementa y lo devuelve. Haz `c = Contador()` y `primero = c.suma()`.",
             "", ["primero == 1", "c.n == 1"],
             "class Contador:\n    def __init__(self):\n        self.n = 0\n    def suma(self):\n        self.n += 1\n        return self.n\nc = Contador()\nprimero = c.suma()",
             "Cada contador recuerda su n. Llamar suma cambia solo ese objeto."),
        find_err("u12-l5-e4", "¿Por qué falla el método?",
                 [("a", "Olvida self, así que n no pertenece a la instancia"), ("b", "Las clases no pueden tener métodos"), ("c", "return está prohibido")],
                 "a", "Escribe def suma(self) y usa self.n.", starter="class Contador:\n    def __init__(self):\n        self.n = 0\n    def suma():\n        self.n += 1"),
    ])

    add("u13", "traer solo lo que usas", "Importar ejecuta el módulo y deja sus nombres disponibles.", [
        mc("u13-l5-e1", "¿Qué diferencia hay entre `import math` y `from math import pi`?",
           [("a", "El primero usa math.pi; el segundo deja pi como nombre suelto"), ("b", "Solo from ejecuta el módulo"), ("c", "import math instala la librería")],
           "a", "import no instala. pip instala. import solo carga lo que ya está disponible."),
        predict("u13-l5-e2", "¿Qué imprime?", "import math\nprint(round(math.sqrt(9)))", "3",
                "sqrt(9) es 3.0 y round lo deja en 3."),
        code("u13-l5-e3", "Importa math y guarda en `area` el área de un círculo de radio 2: pi * r * r.",
             "", ["abs(area - __import__('math').pi * 4) < 1e-9"],
             "import math\narea = math.pi * 2 * 2",
             "El módulo math aporta pi. El radio entra en la fórmula; no hace falta memorizar el número."),
        find_err("u13-l5-e4", "¿Qué está mal?",
                 [("a", "Usa pi antes de importar math, o sin el prefijo math"), ("b", "pi no existe en math"), ("c", "El radio no puede ser 2")],
                 "a", "Primero import math y después math.pi.", starter="area = math.pi * 2 * 2"),
    ])

    add("p0", "media, máximo y mínimo", "Un resumen útil dice el centro y también los extremos.", [
        mc("p0-l5-e1", "En `[2, 4, 100]`, ¿qué resumen engaña más si lo das solo?",
           [("a", "La media, porque el 100 la empuja"), ("b", "El máximo, porque es un dato real"), ("c", "La cantidad de elementos")],
           "a", "Por eso el resumen del proyecto también pide máximo y mínimo: muestran el rango."),
        predict("p0-l5-e2", "¿Qué imprime?", "xs = [2, 4, 6]\nprint(min(xs), max(xs))", "2 6",
                "min y max recorren la lista. print separa los dos valores con un espacio."),
        code("p0-l5-e3", "Escribe `resumen(xs)` que devuelva un dict con media, maximo y minimo. Llama `r = resumen([2, 4, 6])`.",
             "", ["abs(r['media'] - 4) < 1e-9", "r['maximo'] == 6", "r['minimo'] == 2"],
             "def resumen(xs):\n    return {'media': sum(xs)/len(xs), 'maximo': max(xs), 'minimo': min(xs)}\nr = resumen([2, 4, 6])",
             "Un dict con nombres deja claro qué número es cuál. La media de 2, 4 y 6 es 4."),
        find_err("p0-l5-e4", "¿Qué le falta a este resumen?",
                 [("a", "Divide la suma entre la cantidad de datos"), ("b", "max no existe"), ("c", "Un dict no puede guardar números")],
                 "a", "La media es suma / cantidad, no la suma sola.", starter="def resumen(xs):\n    return {'media': sum(xs), 'maximo': max(xs)}"),
    ])

    add("u14", "un bloque numérico", "El array guarda un tipo y permite operar todos los valores a la vez.", [
        mc("u14-l5-e1", "¿Qué hace `np.array([1, 2, 3]) * 2`?",
           [("a", "Multiplica cada número por 2"), ("b", "Repite la lista, como [1, 2, 3] * 2"), ("c", "Suma 2 al final")],
           "a", "En una lista, * 2 la repite. En un array, * 2 escala cada elemento."),
        predict("u14-l5-e2", "¿Qué imprime?", "import numpy as np\na = np.array([1, 2, 3])\nprint(a.size)", "3",
                "size cuenta los elementos del array."),
        code("u14-l5-e3", "Crea un array con 1, 2 y 3 y guarda su media en `media` como float.",
             "", ["abs(media - 2) < 1e-9"],
             "import numpy as np\na = np.array([1.0, 2.0, 3.0])\nmedia = float(a.mean())",
             "mean resume el bloque. float() deja un número de Python, fácil de comprobar."),
        find_err("u14-l5-e4", "¿Por qué esta línea no crea un array?",
                 [("a", "Llama a array sin el prefijo np, porque no importó el nombre suelto"), ("b", "Un array no admite enteros"), ("c", "Faltan comillas en los números")],
                 "a", "Escribe import numpy as np y luego np.array(...).", starter="a = array([1, 2, 3])"),
    ])

    add("u15", "cortar sin copiar la pregunta", "El extremo final de un slice no entra.", [
        predict("u15-l5-e1", "¿Qué imprime?", "import numpy as np\na = np.array([10, 20, 30, 40])\nprint(a[1:3].tolist())", "[20, 30]",
                "Desde el índice 1 hasta antes del 3."),
        mc("u15-l5-e2", "¿Qué índice es el último de un array de 4 elementos?",
           [("a", "-1 o 3"), ("b", "4"), ("c", "1")],
           "a", "El último índice válido es tamaño - 1. 4 quedaría fuera."),
        code("u15-l5-e3", "De `a = np.array([10, 20, 30, 40])`, suma el slice de los índices 1 y 2 en `n`.",
             "", ["n == 50"],
             "import numpy as np\na = np.array([10, 20, 30, 40])\nn = int(a[1:3].sum())",
             "20 + 30 = 50. El 40 queda fuera porque el final del slice no se incluye."),
        find_err("u15-l5-e4", "¿Qué está mal si querías el último elemento?",
                 [("a", "El índice 4 no existe en un array de 4 elementos"), ("b", "Los arrays no admiten índices"), ("c", "Hay que empezar en 1")],
                 "a", "Usa a[-1] o a[3].", starter="import numpy as np\na = np.array([10, 20, 30, 40])\nultimo = a[4]"),
    ])

    add("u16", "la misma operación, varias filas", "Broadcasting alinea formas en vez de escribir un for.", [
        mc("u16-l5-e1", "¿Qué permite el broadcasting?",
           [("a", "Operar un vector con cada fila de una matriz si las formas encajan"), ("b", "Convertir texto en números"), ("c", "Ordenar un array de mayor a menor")],
           "a", "Una fila de dos números puede sumarse a cada fila de una matriz de dos columnas."),
        predict("u16-l5-e2", "¿Qué imprime?", "import numpy as np\na = np.array([1, 2, 3])\nprint((a * 2).tolist())", "[2, 4, 6]",
                "La multiplicación es elemento a elemento."),
        code("u16-l5-e3", "Suma el vector `[10, 20]` a cada fila de `[[1, 2], [3, 4]]`. Guarda la suma de todas las celdas en `total`.",
             "", ["total == 70"],
             "import numpy as np\nm = np.array([[1, 2], [3, 4]])\ns = m + np.array([10, 20])\ntotal = int(s.sum())",
             "Cada fila recibe +10 y +20. 11+22+13+24 = 70."),
        find_err("u16-l5-e4", "¿Por qué estas formas no se pueden sumar?",
                 [("a", "3 columnas no encajan con un vector de 2"), ("b", "NumPy no suma arrays"), ("c", "Hay que usar un for de Python sí o sí")],
                 "a", "El vector tiene que coincidir con la última dimensión o poder estirarse hasta ella.",
                 starter="import numpy as np\nm = np.ones((2, 3))\nv = np.array([10, 20])\nprint(m + v)"),
    ])

    add("u17", "la media no es la única historia", "Un valor extremo mueve la media y casi no mueve la mediana.", [
        predict("u17-l5-e1", "¿Qué imprime?", "import numpy as np\nprint(float(np.median([1, 2, 100])))", "2.0",
                "La mediana es el valor central, no el promedio. 100 no la desplaza a la mitad."),
        mc("u17-l5-e2", "Tienes salarios `[1, 2, 2, 100]`. ¿Qué resumen resistiría mejor al 100?",
           [("a", "La mediana"), ("b", "La media"), ("c", "La suma")],
           "a", "La media se va hacia el 100. La mediana se queda junto a los valores típicos."),
        code("u17-l5-e3", "Con el array `[1, 2, 100]`, guarda la mediana en `med` y la media en `media`.",
             "", ["med == 2", "abs(media - 34.3333333333) < 1e-6"],
             "import numpy as np\na = np.array([1.0, 2.0, 100.0])\nmed = float(np.median(a))\nmedia = float(a.mean())",
             "Compara las dos: si se alejan, hay un extremo que conviene mostrar."),
        find_err("u17-l5-e4", "¿Qué confunde este resumen?",
                 [("a", "Llama media a la mediana"), ("b", "median no existe"), ("c", "Un array no puede tener tres números")],
                 "a", "Nombra la métrica por lo que es. Quien lee el número toma una decisión con ese nombre.",
                 starter="import numpy as np\na = np.array([1, 2, 100])\nmedia = np.median(a)"),
    ])

    add("u18", "filtrar con una máscara", "La comparación crea verdaderos y falsos; el array se queda con los verdaderos.", [
        predict("u18-l5-e1", "¿Qué imprime?", "import numpy as np\na = np.array([1, -2, 3])\nprint(a[a > 0].tolist())", "[1, 3]",
                "La máscara es True, False, True. Se conservan 1 y 3."),
        mc("u18-l5-e2", "¿Qué es una máscara booleana?",
           [("a", "Un array de True y False, uno por elemento"), ("b", "Una copia ordenada del array"), ("c", "El índice del máximo")],
           "a", "Sirve para elegir posiciones, no para ordenarlas."),
        code("u18-l5-e3", "De `a = np.array([1, -2, 3, -4])`, cuenta en `n` cuántos valores son positivos.",
             "", ["n == 2"],
             "import numpy as np\na = np.array([1, -2, 3, -4])\nn = int(a[a > 0].size)",
             "El filtro deja 1 y 3. size cuenta esa selección."),
        find_err("u18-l5-e4", "¿Qué hace esta condición con el cero?",
                 [("a", "Lo deja fuera, porque 0 no es mayor que 0"), ("b", "Lo trata como positivo"), ("c", "Invierte el array")],
                 "a", "Si el cero te importa, usa >= 0 y dilo en el nombre de la variable.",
                 starter="import numpy as np\na = np.array([-1, 0, 3])\npositivos = a[a > 0]"),
    ])

    add("p1", "la serie, no un día suelto", "Resume temperaturas y señala el día más caliente.", [
        mc("p1-l5-e1", "¿Qué pregunta responde el máximo de una serie de temperaturas?",
           [("a", "Cuál fue el valor más alto, no si la serie sube siempre"), ("b", "La temperatura de mañana"), ("c", "Cuántos sensores hay")],
           "a", "El máximo es un extremo. La tendencia pide mirar el orden de los días."),
        predict("p1-l5-e2", "¿Qué imprime?", "import numpy as np\ntemp = np.array([12.0, 15.5, 18.2])\nprint(int(temp.argmax()))", "2",
                "argmax devuelve la posición del máximo. 18.2 está en el índice 2."),
        code("p1-l5-e3", "Con las temperaturas `[12.0, 15.5, 14.0, 18.2, 17.0]`, guarda la media en `media` y la posición del máximo en `dia_pico`.",
             "", ["abs(media - 15.34) < 1e-9", "dia_pico == 3"],
             "import numpy as np\ntemp = np.array([12.0, 15.5, 14.0, 18.2, 17.0])\nmedia = float(temp.mean())\ndia_pico = int(temp.argmax())",
             "La media resume el nivel. argmax dice dónde ocurrió el pico, no solo cuánto valió."),
        find_err("p1-l5-e4", "¿Qué índice está mal si las posiciones empiezan en 0?",
                 [("a", "El día del máximo es 3, no 4, aunque sea el cuarto dato"), ("b", "argmax cuenta desde 1"), ("c", "mean no funciona con floats")],
                 "a", "Cuatro datos ocupan los índices 0, 1, 2 y 3.",
                 starter="import numpy as np\ntemp = np.array([12.0, 15.5, 14.0, 18.2])\ndia = int(temp.argmax()) + 1"),
    ])

    add("u19", "un gráfico que responde una pregunta", "La barra compara cantidades. El título dice qué comparación es.", [
        mc("u19-l5-e1", "¿Cuándo una barra es mejor que una línea?",
           [("a", "Cuando comparas categorías, no una secuencia en el tiempo"), ("b", "Cuando hay un solo número"), ("c", "Cuando quieres ocultar el cero")],
           "a", "La línea sugiere continuidad. Si julio y agosto son categorías, la barra no inventa una pendiente entre ellas."),
        predict("u19-l5-e2", "¿Cuántas barras crea este gráfico? Imprime el número.",
                "import matplotlib.pyplot as plt\nplt.bar(['a', 'b'], [3, 1])\nprint(len(plt.gca().patches))\nplt.close('all')", "2",
                "Cada altura es una barra. patches las cuenta."),
        code("u19-l5-e3", "Dibuja barras para `a`, `b` y `c` con alturas 3, 1 y 4. Guarda en `barras` cuántas quedaron.",
             "", ["barras == 3"],
             "import matplotlib.pyplot as plt\nplt.bar(['a', 'b', 'c'], [3, 1, 4])\nbarras = len(plt.gca().patches)\nplt.close('all')",
             "Tres categorías, tres barras. Cierra la figura para no mezclarla con el siguiente gráfico."),
        find_err("u19-l5-e4", "¿Qué no coincide?",
                 [("a", "Hay tres etiquetas y solo dos alturas"), ("b", "bar no acepta texto"), ("c", "Hay que usar seaborn para una barra")],
                 "a", "Cada etiqueta necesita su altura, en el mismo orden.",
                 starter="import matplotlib.pyplot as plt\nplt.bar(['a', 'b', 'c'], [3, 1])"),
    ])

    add("u20", "el título es el hallazgo", "Un título dice qué mirar, no solo el nombre de la columna.", [
        predict("u20-l5-e1", "¿Qué imprime?",
                "import matplotlib.pyplot as plt\nplt.plot([1, 2], [1, 2])\nplt.title('Ventas')\nprint(plt.gca().get_title())\nplt.close('all')", "Ventas",
                "title guarda el texto en los ejes actuales."),
        mc("u20-l5-e2", "¿Cuál título ayuda más?",
           [("a", "Ventas de julio a septiembre"), ("b", "gráfico1"), ("c", "plt.plot")],
           "a", "El título nombra el periodo y la medida. El nombre del archivo no informa a quien lee."),
        code("u20-l5-e3", "Dibuja una línea con `[1, 2]` y `[1, 2]`, ponle título `Ventas` y guárdalo en `titulo`.",
             "", ["titulo == 'Ventas'"],
             "import matplotlib.pyplot as plt\nplt.plot([1, 2], [1, 2])\nplt.title('Ventas')\ntitulo = plt.gca().get_title()\nplt.close('all')",
             "El título vive en los ejes. Leerlo de vuelta confirma que sí quedó puesto."),
        find_err("u20-l5-e4", "¿Qué le falta al gráfico para que se entienda solo?",
                 [("a", "Un título que diga qué se está comparando"), ("b", "Un segundo plot obligatorio"), ("c", "Colores distintos en cada punto")],
                 "a", "Sin título, la línea es una forma. Con título, es una afirmación.",
                 starter="import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [2, 4, 3])"),
    ])

    add("u21", "la tabla alimenta el gráfico", "Seaborn dibuja a partir de columnas con nombre.", [
        mc("u21-l5-e1", "¿Qué ventaja tiene pasar un DataFrame a seaborn?",
           [("a", "Las columnas se nombran en x e y, y el gráfico hereda esos nombres"), ("b", "Evita tener que limpiar nulos"), ("c", "Calcula un modelo predictivo")],
           "a", "x='mes' dice qué columna va al eje, no solo qué lista."),
        predict("u21-l5-e2", "¿Qué imprime el nombre del eje y?",
                "import seaborn as sns\nimport pandas as pd\ndf = pd.DataFrame({'mes': ['Jul'], 'ventas': [10]})\nax = sns.barplot(data=df, x='mes', y='ventas')\nprint(ax.get_ylabel())", "ventas",
                "seaborn usa el nombre de la columna como etiqueta."),
        code("u21-l5-e3", "Con un DataFrame de mes y ventas, dibuja un barplot y guarda la etiqueta del eje y en `eje`.",
             "", ["eje == 'ventas'"],
             "import seaborn as sns\nimport pandas as pd\ndf = pd.DataFrame({'mes': ['Jul', 'Ago'], 'ventas': [10, 20]})\nax = sns.barplot(data=df, x='mes', y='ventas')\neje = ax.get_ylabel()",
             "El gráfico queda atado a columnas. Si renombras la columna, cambia lo que se lee."),
        find_err("u21-l5-e4", "¿Por qué seaborn no encuentra los datos?",
                 [("a", "Pide la columna ventas, pero el DataFrame tiene venta"), ("b", "barplot no existe"), ("c", "Un DataFrame no puede tener dos filas")],
                 "a", "El nombre en y= tiene que existir tal cual en las columnas.",
                 starter="import seaborn as sns\nimport pandas as pd\ndf = pd.DataFrame({'mes': ['Jul'], 'venta': [10]})\nsns.barplot(data=df, x='mes', y='ventas')"),
    ])

    add("u22", "el porcentaje necesita su base", "30 de 120 no es lo mismo que 30 de 40, aunque el numerador coincida.", [
        predict("u22-l5-e1", "¿Qué imprime?", "parte = 30\ntotal = 120\nprint(round(100 * parte / total, 1))", "25.0",
                "30 es el 25% de 120. Sin el total, 30 no dice la proporción."),
        mc("u22-l5-e2", "Dos tiendas venden 30 unidades. ¿Qué falta para compararlas?",
           [("a", "El total de cada una, o el mismo periodo"), ("b", "El color del gráfico"), ("c", "Una tercera tienda")],
           "a", "El mismo numerador puede ser una fracción muy distinta."),
        code("u22-l5-e3", "Calcula `pct`, el porcentaje de `parte = 30` sobre `total = 120`, redondeado a 1 decimal.",
             "parte = 30\ntotal = 120\n", ["pct == 25.0"],
             "parte = 30\ntotal = 120\npct = round(100 * parte / total, 1)",
             "Multiplicas por 100 después de dividir entre la base. El redondeo es para mostrarlo, no para calcular de nuevo."),
        find_err("u22-l5-e4", "¿Qué afirmación queda coja?",
                 [("a", "Dice 30 ventas sin decir de cuántas oportunidades"), ("b", "Usar un porcentaje siempre miente"), ("c", "round no existe")],
                 "a", "Escribe el numerador y el denominador juntos.",
                 starter="parte = 30\nprint(f'{parte} ventas, un gran resultado')"),
    ])

    add("p2", "comparar dos series", "Gana quien suma más solo si las dos series tienen la misma lectura.", [
        mc("p2-l5-e1", "La serie B suma más que la A. ¿Qué debes mirar antes de declarar un ganador?",
           [("a", "Que tengan el mismo número de periodos y la misma unidad"), ("b", "Solo el color de cada línea"), ("c", "El título en inglés")],
           "a", "Tres meses contra seis meses no es una comparación justa."),
        predict("p2-l5-e2", "¿Qué imprime?", "a = [10, 12, 9]\nb = [8, 11, 14]\nprint(sum(b) > sum(a))", "True",
                "31 contra 33. La comparación es de los totales, no del primer día."),
        code("p2-l5-e3", "Con `a = [10, 12, 9]` y `b = [8, 11, 14]`, guarda en `gana_b` si la suma de b es mayor.",
             "a = [10, 12, 9]\nb = [8, 11, 14]\n", ["gana_b is True"],
             "a = [10, 12, 9]\nb = [8, 11, 14]\ngana_b = sum(b) > sum(a)",
             "Primero resumes cada serie y después comparas. No alcanza con mirar el último punto."),
        find_err("p2-l5-e4", "¿Qué comparación está incompleta?",
                 [("a", "Compara el primer elemento, no las series completas"), ("b", "sum no puede usarse con listas"), ("c", "Dos listas no se pueden nombrar a y b")],
                 "a", "a[0] > b[0] solo mira el primer periodo.",
                 starter="a = [10, 12, 9]\nb = [8, 11, 14]\ngana_b = a[0] > b[0]"),
    ])

    add("u23", "filas y columnas con nombre", "Un DataFrame es una tabla: cada columna es una Series.", [
        predict("u23-l5-e1", "¿Qué imprime?", "import pandas as pd\ndf = pd.DataFrame({'ventas': [10, 20, 30]})\nprint(len(df))", "3",
                "Cada valor de la lista es una fila."),
        mc("u23-l5-e2", "¿Qué selecciona `df['ventas']`?",
           [("a", "La columna ventas, como una Series"), ("b", "Solo la primera fila"), ("c", "El nombre del archivo")],
           "a", "Una columna mantiene el índice de las filas y un solo tipo de medida."),
        code("u23-l5-e3", "Crea un DataFrame con ciudades San José y Limón y ventas 10 y 30. Guarda el número de filas en `n`.",
             "", ["n == 2"],
             "import pandas as pd\ndf = pd.DataFrame({'ciudad': ['San José', 'Limón'], 'ventas': [10, 30]})\nn = int(len(df))",
             "Las dos listas tienen el mismo largo, así que cada posición forma una fila."),
        find_err("u23-l5-e4", "¿Por qué no cuadra la tabla?",
                 [("a", "Hay dos ciudades y tres ventas"), ("b", "DataFrame no acepta texto"), ("c", "len cuenta columnas")],
                 "a", "Cada columna necesita un valor por fila.",
                 starter="import pandas as pd\ndf = pd.DataFrame({'ciudad': ['San José', 'Limón'], 'ventas': [10, 30, 40]})"),
    ])

    add("u24", "la pregunta es el filtro", "Una condición por fila elige el subconjunto.", [
        predict("u24-l5-e1", "¿Qué imprime?", "import pandas as pd\ndf = pd.DataFrame({'ventas': [80, 120, 40]})\nprint(len(df[df['ventas'] > 100]))", "1",
                "Solo 120 cumple. El filtro devuelve esas filas."),
        mc("u24-l5-e2", "¿Qué produce `df['ventas'] > 100` antes de usarlo como índice?",
           [("a", "Una Series de True y False, una por fila"), ("b", "El número 100"), ("c", "Las columnas que se llaman ventas")],
           "a", "Esa Series es la máscara. df[máscara] se queda con las filas True."),
        code("u24-l5-e3", "Filtra las filas de `ventas` mayores que 100 y guarda cuántas son en `n`.",
             "", ["n == 1"],
             "import pandas as pd\ndf = pd.DataFrame({'ventas': [80, 120, 40]})\nn = int(len(df[df['ventas'] > 100]))",
             "Nombra la condición como una pregunta: altas = df['ventas'] > 100."),
        find_err("u24-l5-e4", "¿Qué compara mal?",
                 [("a", "Compara la columna con un texto"), ("b", "No se puede filtrar un DataFrame"), ("c", "120 no es mayor que 100")],
                 "a", "Las ventas son números. Compáralas con un número.",
                 starter="import pandas as pd\ndf = pd.DataFrame({'ventas': [80, 120, 40]})\naltas = df[df['ventas'] > '100']"),
    ])

    add("u25", "rellenar con una razón", "El valor que sustituye un nulo es una decisión, no un adorno.", [
        predict("u25-l5-e1", "¿Qué imprime?", "import pandas as pd\ns = pd.Series([1.0, None, 3.0])\nprint(float(s.fillna(s.median()).sum()))", "6.0",
                "La mediana de 1 y 3 es 2. La suma queda 1 + 2 + 3."),
        mc("u25-l5-e2", "¿Cuándo rellenar nulos con 0 puede mentir?",
           [("a", "Cuando 0 significa 'medí cero' y el nulo significa 'no medí'"), ("b", "Cuando la columna es numérica"), ("c", "Nunca: 0 es neutro")],
           "a", "Antes de fillna, decide qué significa el hueco."),
        code("u25-l5-e3", "En la Series `[1.0, None, 3.0]`, rellena nulos con la mediana y guarda la suma en `total`.",
             "", ["abs(total - 6) < 1e-9"],
             "import pandas as pd\ns = pd.Series([1.0, None, 3.0])\ntotal = float(s.fillna(s.median()).sum())",
             "La mediana se calcula con los datos presentes. El nulo no entra en ese cálculo."),
        find_err("u25-l5-e4", "¿Qué hace este relleno sin decirlo?",
                 [("a", "Convierte 'no sé' en cero"), ("b", "Borra la columna"), ("c", "Calcula la mediana")],
                 "a", "Si usas 0, escribe por qué 0 es el valor correcto.",
                 starter="import pandas as pd\ns = pd.Series([1.0, None, 3.0])\nlimpia = s.fillna(0)"),
    ])

    add("u26", "agrupar y después resumir", "groupby parte la tabla. La suma ocurre dentro de cada parte.", [
        predict("u26-l5-e1", "¿Qué imprime?", "import pandas as pd\ndf = pd.DataFrame({'ciudad': ['A', 'A', 'B'], 'ventas': [1, 2, 4]})\nprint(int(df.groupby('ciudad')['ventas'].sum().loc['A']))", "3",
                "A tiene 1 y 2. El grupo B no entra en ese loc."),
        mc("u26-l5-e2", "¿Qué cambia el grano de la fila al agrupar por ciudad?",
           [("a", "Pasas de una fila por venta a una fila por ciudad"), ("b", "Borras los números"), ("c", "Ordenas el archivo en disco")],
           "a", "Después del groupby ya no puedes hablar de una venta individual."),
        code("u26-l5-e3", "Agrupa por ciudad, suma ventas y guarda la suma de A en `a`.",
             "", ["a == 3"],
             "import pandas as pd\ndf = pd.DataFrame({'ciudad': ['A', 'A', 'B'], 'ventas': [1, 2, 4]})\na = int(df.groupby('ciudad')['ventas'].sum().loc['A'])",
             "Primero los grupos, después la columna y al final la operación."),
        find_err("u26-l5-e4", "¿Qué resumen mezcla cosas distintas?",
                 [("a", "Suma ventas de todas las ciudades y lo presenta como si fuera A"), ("b", "groupby no admite sum"), ("c", "loc no puede buscar texto")],
                 "a", "Si la pregunta es por ciudad, el resumen también tiene que estar por ciudad.",
                 starter="import pandas as pd\ndf = pd.DataFrame({'ciudad': ['A', 'A', 'B'], 'ventas': [1, 2, 4]})\na = int(df['ventas'].sum())"),
    ])

    add("u27", "fechas de verdad", "Un texto con forma de fecha no sabe restar días.", [
        predict("u27-l5-e1", "¿Qué imprime?", "import pandas as pd\nfechas = pd.to_datetime(['2024-01-01', '2024-01-03'])\nprint(int((fechas[1] - fechas[0]).days))", "2",
                "to_datetime crea fechas. La resta da un tiempo y .days lo deja en días."),
        mc("u27-l5-e2", "¿Por qué no basta guardar `'2024-01-03'` como texto?",
           [("a", "No puedes restar días ni ordenar cronológicamente con seguridad"), ("b", "Pandas no lee texto"), ("c", "Las fechas solo existen en Excel")],
           "a", "to_datetime convierte el texto en un tipo que entiende el calendario."),
        code("u27-l5-e3", "Convierte `2024-01-01` y `2024-01-03` a fechas y guarda la diferencia en días en `dias`.",
             "", ["dias == 2"],
             "import pandas as pd\nfechas = pd.to_datetime(['2024-01-01', '2024-01-03'])\ndias = int((fechas[1] - fechas[0]).days)",
             "La resta de dos timestamps da una duración. .days extrae el número entero."),
        find_err("u27-l5-e4", "¿Qué resta está mal?",
                 [("a", "Resta dos textos, no dos fechas"), ("b", "enero no tiene día 3"), ("c", "to_datetime borra el año")],
                 "a", "Convierte antes de restar.",
                 starter="dias = '2024-01-03' - '2024-01-01'"),
    ])

    add("p3", "una tasa con su grupo", "El promedio global puede esconder que un grupo va muy distinto.", [
        mc("p3-l5-e1", "La supervivencia global es 0.5, pero entre mujeres es 1. ¿Qué miras?",
           [("a", "La tasa por grupo, no solo el promedio de toda la tabla"), ("b", "Solo la primera fila"), ("c", "El nombre de las columnas en mayúsculas")],
           "a", "Un promedio único mezcla grupos que no viven la misma situación."),
        predict("p3-l5-e2", "¿Qué imprime?", "import pandas as pd\ndf = pd.DataFrame({'survived': [1, 0, 1], 'sex': ['female', 'male', 'female']})\nprint(float(df.loc[df['sex'] == 'female', 'survived'].mean()))", "1.0",
                "Las dos filas female sobrevivieron. La media del subconjunto es 1."),
        code("p3-l5-e3", "En una tabla pequeña de survived y sex, guarda en `tasa` la media de survived solo para female.",
             "", ["tasa == 1.0"],
             "import pandas as pd\ndf = pd.DataFrame({'survived': [1, 0, 1], 'sex': ['female', 'male', 'female']})\ntasa = float(df.loc[df['sex'] == 'female', 'survived'].mean())",
             "loc elige filas y la columna que quieres promediar. El filtro es parte del resultado."),
        find_err("p3-l5-e4", "¿Qué esconde este número?",
                 [("a", "Promedia a todo el mundo y pierde la diferencia por grupo"), ("b", "mean no existe"), ("c", "sex no puede ser texto")],
                 "a", "Si la pregunta es por grupo, parte la tabla antes de resumir.",
                 starter="import pandas as pd\ndf = pd.DataFrame({'survived': [1, 0, 1], 'sex': ['female', 'male', 'female']})\ntasa = float(df['survived'].mean())"),
    ])

    add("u28", "centro y dispersión juntos", "Decir la media sin el rango deja el dato a medias.", [
        predict("u28-l5-e1", "¿Qué imprime?", "xs = [2, 4, 4, 10]\nprint(sum(xs) / len(xs))", "5.0",
                "20 / 4 = 5. La media no tiene que ser uno de los datos."),
        mc("u28-l5-e2", "Dos grupos tienen media 5. Uno es `[5, 5, 5]` y el otro `[0, 5, 10]`. ¿Qué falta?",
           [("a", "Una medida de dispersión, como el rango"), ("b", "Otra media"), ("c", "El nombre del archivo")],
           "a", "La misma media puede salir de datos quietos o de datos abiertos."),
        code("u28-l5-e3", "Con `xs = [2, 4, 4, 10]`, guarda la media en `media` y el rango en `rango`.",
             "xs = [2, 4, 4, 10]\n", ["media == 5", "rango == 8"],
             "xs = [2, 4, 4, 10]\nmedia = sum(xs) / len(xs)\nrango = max(xs) - min(xs)",
             "El rango es la distancia entre extremos. Aquí va de 2 a 10."),
        find_err("u28-l5-e4", "¿Qué resumen está incompleto?",
                 [("a", "Reporta la media y no dice cuánto se abren los datos"), ("b", "len no cuenta elementos"), ("c", "Una lista no tiene máximo")],
                 "a", "Acompaña el centro con el rango o la desviación.",
                 starter="xs = [2, 4, 4, 10]\nmedia = sum(xs) / len(xs)"),
    ])

    add("u29", "la desviación cuenta el alejamiento", "No es el error del cálculo: es qué tan lejos viven los datos de la media.", [
        mc("u29-l5-e1", "¿Qué describe la desviación estándar?",
           [("a", "Qué tan lejos están los datos de su media, en las mismas unidades"), ("b", "El valor más repetido"), ("c", "La diferencia entre máximo y mínimo, siempre")],
           "a", "Una desviación chica significa datos apretados alrededor del centro."),
        predict("u29-l5-e2", "¿Qué imprime, con dos decimales?",
                "import numpy as np\nprint(round(float(np.std([1, 2, 3, 4, 5])), 2))", "1.41",
                "La desviación poblacional de 1..5 es la raíz de 2, cerca de 1.41."),
        code("u29-l5-e3", "Calcula la desviación estándar poblacional de `[1, 2, 3, 4, 5]` y guárdala en `std`.",
             "", ["abs(std - (2 ** 0.5)) < 1e-9"],
             "import numpy as np\nstd = float(np.std([1, 2, 3, 4, 5]))",
             "np.std usa por defecto la versión poblacional, dividiendo entre n."),
        find_err("u29-l5-e4", "¿Qué comparación mezcla unidades?",
                 [("a", "Compara la desviación de salarios con la de edades como si fueran lo mismo"), ("b", "np.std no existe"), ("c", "Una desviación no puede ser mayor que 1")],
                 "a", "La desviación está en las unidades de la columna. No compares salarios con edades directo.",
                 starter="import numpy as np\niguales = np.std([1000, 2000]) == np.std([1, 2])"),
    ])

    add("u30", "correlación no es causa", "r = 1 dice que se mueven juntas, no quién empuja a quién.", [
        predict("u30-l5-e1", "¿Qué imprime?", "import numpy as np\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 4.0, 6.0])\nprint(float(np.corrcoef(x, y)[0, 1]))", "1.0",
                "y es el doble de x. La correlación lineal es perfecta."),
        mc("u30-l5-e2", "Dos variables tienen correlación 0.9. ¿Qué puedes afirmar?",
           [("a", "Se mueven juntas en esta muestra; la causa hay que justificar aparte"), ("b", "La primera causa la segunda"), ("c", "El modelo ya está listo para producción")],
           "a", "La correlación resume una nube de puntos. No reemplaza el mecanismo."),
        code("u30-l5-e3", "Calcula la correlación entre `[1, 2, 3]` y `[2, 4, 6]` y guárdala en `r`.",
             "", ["abs(r - 1) < 1e-9"],
             "import numpy as np\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 4.0, 6.0])\nr = float(np.corrcoef(x, y)[0, 1])",
             "corrcoef devuelve una matriz. La posición [0, 1] es la correlación entre las dos series."),
        find_err("u30-l5-e4", "¿Qué salto está de más?",
                 [("a", "Pasar de 'se mueven juntas' a 'una causa la otra'"), ("b", "Usar números en corrcoef"), ("c", "Tener tres pares de puntos")],
                 "a", "Reporta r y, si hablas de causa, aporta otra razón.",
                 starter="r = 0.9\ncausa = True"),
    ])

    add("u31", "una prueba no es un veredicto eterno", "El p-valor habla de esta muestra y de la hipótesis que planteaste.", [
        mc("u31-l5-e1", "Un p-valor de 0.03 contra la media 0 significa:",
           [("a", "Estos datos serían raros si la media verdadera fuera 0"), ("b", "Hay 3% de probabilidad de que el estudio sea falso"), ("c", "La diferencia es grande, sin mirar el tamaño")],
           "a", "El p-valor no es la probabilidad de que la hipótesis sea cierta."),
        predict("u31-l5-e2", "¿Qué imprime?",
                "from scipy import stats\nres = stats.ttest_1samp([2, 4, 6, 8], 0)\nprint(bool(res.pvalue < 0.05))", "True",
                "Una muestra de números positivos, comparada con 0, da un p-valor pequeño."),
        code("u31-l5-e3", "Haz un t-test de `[2, 4, 6, 8]` contra 0 y guarda en `significativo` si el p-valor es menor que 0.05.",
             "", ["significativo is True"],
             "from scipy import stats\nres = stats.ttest_1samp([2, 4, 6, 8], 0)\nsignificativo = bool(res.pvalue < 0.05)",
             "Planteas la comparación antes de mirar el p-valor. El umbral 0.05 es una convención, no una ley."),
        find_err("u31-l5-e4", "¿Qué lectura está mal?",
                 [("a", "Interpretar 0.03 como la probabilidad de que la hipótesis nula sea falsa"), ("b", "Comparar el p-valor con 0.05"), ("c", "Usar una muestra de cuatro números")],
                 "a", "El p-valor condiciona en la hipótesis nula. No es la probabilidad de la hipótesis.",
                 starter="p = 0.03\nprob_nula_falsa = p"),
    ])

    add("p4", "media y mediana en el informe", "Si se separan, el informe tiene que decirlo.", [
        mc("p4-l5-e1", "La media queda muy por encima de la mediana. ¿Qué escribes?",
           [("a", "Hay valores altos que jalan la media; muestro las dos"), ("b", "Borro la mediana porque es menor"), ("c", "Promedio las dos y reporto un solo número")],
           "a", "La distancia entre media y mediana es parte del hallazgo."),
        predict("p4-l5-e2", "¿Qué imprime?", "import numpy as np\nxs = np.array([10, 12, 11, 40])\nprint(float(np.median(xs)))", "11.5",
                "Con cuatro datos, la mediana es el promedio de los dos centrales: 11 y 12."),
        code("p4-l5-e3", "Con `[10, 12, 11, 40]`, guarda en `sesgo` la media menos la mediana.",
             "", ["abs(sesgo - 6.75) < 1e-9"],
             "import numpy as np\nxs = np.array([10.0, 12.0, 11.0, 40.0])\nsesgo = float(xs.mean() - np.median(xs))",
             "La media es 18.25 y la mediana 11.5. La diferencia positiva delata una cola alta."),
        find_err("p4-l5-e4", "¿Qué esconde el informe?",
                 [("a", "Publica solo la media cuando un 40 la está empujando"), ("b", "np.median no existe"), ("c", "Cuatro números no se pueden resumir")],
                 "a", "Si hay un extremo, la mediana también va en la frase.",
                 starter="import numpy as np\nxs = np.array([10, 12, 11, 40])\ninforme = {'media': float(xs.mean())}"),
    ])

    add("u32", "el baseline antes del modelo", "Si adivinar la clase mayoritaria ya acierta mucho, el modelo tiene que superar eso.", [
        predict("u32-l5-e1", "¿Qué imprime?", "clases = [0, 0, 0, 1]\nbaseline = max(set(clases), key=clases.count)\nprint(baseline)", "0",
                "La clase más frecuente es 0. Ese es el baseline de 'siempre predecir lo común'."),
        mc("u32-l5-e2", "Un clasificador acierta el 80% y la clase mayoritaria ya es el 80%. ¿Qué pasó?",
           [("a", "No supera al baseline; puede estar repitiendo la clase común"), ("b", "Es un modelo excelente"), ("c", "Hay que subir el porcentaje a 100 antes de mirar el baseline")],
           "a", "El mérito del modelo es lo que gana por encima de la regla tonta."),
        code("u32-l5-e3", "Con `clases = [0, 0, 0, 1]`, guarda la clase más frecuente en `baseline` y su acierto en `acierto`.",
             "clases = [0, 0, 0, 1]\n", ["baseline == 0", "abs(acierto - 0.75) < 1e-9"],
             "clases = [0, 0, 0, 1]\nbaseline = max(set(clases), key=clases.count)\nacierto = clases.count(baseline) / len(clases)",
             "Tres de cuatro son 0. Cualquier modelo nuevo tiene que pasar de 0.75 para merecer la complejidad."),
        find_err("u32-l5-e4", "¿Qué celebración está de más?",
                 [("a", "Festejar 75% de acierto sin comparar con la clase mayoritaria"), ("b", "Contar elementos de una lista"), ("c", "Tener una clase minoritaria")],
                 "a", "75% puede ser exactamente el baseline.",
                 starter="acierto = 0.75\nlisto_para_produccion = True"),
    ])

    add("u33", "aprender del train, transformar el test", "La media y la escala salen del entrenamiento. El test solo se transforma.", [
        mc("u33-l5-e1", "¿Por qué no calculas la media con train y test juntos?",
           [("a", "El test se contamina: el modelo vio información del futuro"), ("b", "La media queda más exacta y eso siempre es mejor"), ("c", "Pandas no puede partir una tabla")],
           "a", "El test simula datos que todavía no existen al entrenar."),
        predict("u33-l5-e2", "¿Qué imprime?", "train = [0, 10]\ntest = [5]\nmedia = sum(train) / len(train)\nescala = (test[0] - media) / (max(train) - min(train))\nprint(escala)", "0.0",
                "La media del train es 5. El 5 del test queda a 0 de distancia en esa escala."),
        code("u33-l5-e3", "Escala `test = [5]` usando solo `train = [0, 10]`: resta la media del train y divide entre el rango del train. Guarda el resultado en `escala`.",
             "train = [0, 10]\ntest = [5]\n", ["abs(escala - 0) < 1e-9"],
             "train = [0, 10]\ntest = [5]\nmedia = sum(train) / len(train)\nescala = (test[0] - media) / (max(train) - min(train))",
             "Nada del test entra en la media ni en el rango. Así el preprocesamiento no hace trampa."),
        find_err("u33-l5-e4", "¿Dónde se filtra información?",
                 [("a", "La media se calcula con train y test"), ("b", "Se usa una resta"), ("c", "El test tiene un solo número")],
                 "a", "Calcula la media solo con train.",
                 starter="train = [0, 10]\ntest = [5]\nmedia = sum(train + test) / len(train + test)"),
    ])

    add("u34", "una recta que se puede revisar", "La regresión predice un número. Puedes comprobar un punto a mano.", [
        mc("u34-l5-e1", "Si cada x predice aproximadamente `2x`, ¿qué debería devolver el modelo en x = 4?",
           [("a", "Cerca de 8"), ("b", "Cerca de 4"), ("c", "La clase 0 o 1")],
           "a", "Una regresión continúa la relación. No elige una clase."),
        predict("u34-l5-e2", "¿Qué imprime, redondeado?",
                "from sklearn.linear_model import LinearRegression\nimport numpy as np\nX = np.array([[1], [2], [3]])\ny = np.array([2, 4, 6])\npred = LinearRegression().fit(X, y).predict([[4]])[0]\nprint(round(float(pred)))", "8",
                "Los puntos están en la recta y = 2x. En 4, la predicción es 8."),
        code("u34-l5-e3", "Ajusta una regresión lineal a X = 1, 2, 3 e y = 2, 4, 6. Guarda en `pred` la predicción para 4.",
             "", ["abs(pred - 8) < 1e-6"],
             "from sklearn.linear_model import LinearRegression\nimport numpy as np\nX = np.array([[1.0], [2.0], [3.0]])\ny = np.array([2.0, 4.0, 6.0])\npred = float(LinearRegression().fit(X, y).predict([[4.0]])[0])",
             "X entra como columna. predict devuelve un array; el primer elemento es el número."),
        find_err("u34-l5-e4", "¿Qué forma está mal?",
                 [("a", "X llega como una lista plana y el modelo espera una columna por muestra"), ("b", "LinearRegression no predice números"), ("c", "y no puede ser el doble de X")],
                 "a", "Cada fila de X es una muestra. Una sola variable se escribe como columna.",
                 starter="from sklearn.linear_model import LinearRegression\nX = [1, 2, 3]\ny = [2, 4, 6]\nLinearRegression().fit(X, y)"),
    ])

    add("u35", "el árbol parte donde hay señal", "Si una columna separa las clases por completo, el árbol la usa.", [
        mc("u35-l5-e1", "¿Qué peligro tiene un árbol muy profundo en datos pequeños?",
           [("a", "Memoriza el train y falla en datos nuevos"), ("b", "No puede usar números"), ("c", "Siempre predice la clase 0")],
           "a", "Limitar la profundidad es una forma de no aprender el ruido."),
        predict("u35-l5-e2", "¿Qué imprime?",
                "from sklearn.tree import DecisionTreeClassifier\nimport numpy as np\nX = np.array([[0], [0], [1], [1]])\ny = np.array([0, 0, 1, 1])\nprint(int(DecisionTreeClassifier(random_state=0).fit(X, y).predict([[1]])[0]))", "1",
                "Cuando X es 1, y siempre fue 1. El árbol repite esa partición."),
        code("u35-l5-e3", "Entrena un árbol con X 0,0,1,1 e y 0,0,1,1. Guarda en `pred` la clase de X = 1.",
             "", ["pred == 1"],
             "from sklearn.tree import DecisionTreeClassifier\nimport numpy as np\nX = np.array([[0], [0], [1], [1]])\ny = np.array([0, 0, 1, 1])\npred = int(DecisionTreeClassifier(random_state=0).fit(X, y).predict([[1]])[0])",
             "random_state fija el desempate. Aquí la separación es perfecta, así que la predicción es 1."),
        find_err("u35-l5-e4", "¿Qué columna no debería entrar al árbol?",
                 [("a", "Una copia de la respuesta, porque el árbol la usaría para 'acertar' siempre"), ("b", "Una columna numérica"), ("c", "La primera fila")],
                 "a", "Si X contiene y, el accuracy de train no significa nada.",
                 starter="import numpy as np\nX = np.array([[0, 0], [1, 1]])\ny = np.array([0, 1])"),
    ])

    add("u36", "el vecino más cercano", "KNN no aprende una fórmula: mira los puntos que ya vio.", [
        mc("u36-l5-e1", "Con k = 1, ¿a quién se parece un punto nuevo?",
           [("a", "Al ejemplo de entrenamiento más cercano"), ("b", "A la media de todas las clases"), ("c", "Al primer elemento del archivo")],
           "a", "k = 1 es sensible a un solo vecino raro. k más grande pide más votos."),
        predict("u36-l5-e2", "¿Qué imprime?",
                "from sklearn.neighbors import KNeighborsClassifier\nimport numpy as np\nX = np.array([[0], [0], [10], [10]])\ny = np.array([0, 0, 1, 1])\nprint(int(KNeighborsClassifier(n_neighbors=1).fit(X, y).predict([[9]])[0]))", "1",
                "9 está pegado a los puntos 10, cuya clase es 1."),
        code("u36-l5-e3", "Entrena un KNN con k = 1 sobre 0,0,10,10 y clases 0,0,1,1. Predice la clase de 9 en `pred`.",
             "", ["pred == 1"],
             "from sklearn.neighbors import KNeighborsClassifier\nimport numpy as np\nX = np.array([[0.0], [0.0], [10.0], [10.0]])\ny = np.array([0, 0, 1, 1])\npred = int(KNeighborsClassifier(n_neighbors=1).fit(X, y).predict([[9.0]])[0])",
             "La distancia decide. 9 queda junto a la clase 1."),
        find_err("u36-l5-e4", "¿Qué olvida esta comparación de distancias?",
                 [("a", "Mezcla columnas con escalas muy distintas sin normalizar"), ("b", "KNN no usa distancias"), ("c", "k tiene que ser par")],
                 "a", "Si una columna va de 0 a 1000 y otra de 0 a 1, la grande domina la distancia.",
                 starter="from sklearn.neighbors import KNeighborsClassifier\nimport numpy as np\nX = np.array([[0, 0], [0, 1000]])\ny = np.array([0, 1])"),
    ])

    add("u37", "k es una decisión", "El algoritmo parte los puntos. Tú decides cuántos grupos pedir.", [
        mc("u37-l5-e1", "¿Qué no te dice K-Means por sí solo?",
           [("a", "El nombre ni el significado de cada grupo"), ("b", "Una asignación de cada punto a un cluster"), ("c", "Que pediste un número k")],
           "a", "Los clusters salen numerados. El sentido lo pones tú al mirar los centros."),
        predict("u37-l5-e2", "¿Cuántos grupos distintos hay en la predicción? Imprime ese número.",
                "from sklearn.cluster import KMeans\nimport numpy as np\nX = np.array([[0, 0], [0, 1], [10, 10], [10, 11]])\nlabels = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)\nprint(len(set(labels)))", "2",
                "Pediste 2 clusters y los puntos forman dos nubes separadas."),
        code("u37-l5-e3", "Agrupa los puntos (0,0), (0,1), (10,10) y (10,11) en 2 clusters. Guarda en `n` cuántas etiquetas distintas salieron.",
             "", ["n == 2"],
             "from sklearn.cluster import KMeans\nimport numpy as np\nX = np.array([[0.0, 0.0], [0.0, 1.0], [10.0, 10.0], [10.0, 11.0]])\nlabels = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)\nn = len(set(labels))",
             "n_init repite el arranque para no quedarte con un centro malo. Aquí las dos nubes están lejos."),
        find_err("u37-l5-e4", "¿Qué decisión quedó implícita?",
                 [("a", "Pedir 2 grupos aunque los datos pudieran contar otra historia"), ("b", "Usar coordenadas"), ("c", "Fijar random_state")],
                 "a", "k no se descubre solo. Prueba más de un valor y mira los centros.",
                 starter="from sklearn.cluster import KMeans\nimport numpy as np\nX = np.array([[0, 0], [0, 1], [10, 10], [10, 11]])\nKMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)"),
    ])

    add("u38", "un acierto es una fracción", "Correctos entre total. El número solo dice algo comparado con un baseline.", [
        predict("u38-l5-e1", "¿Qué imprime?", "y_true = [1, 0, 1, 1]\ny_pred = [1, 0, 0, 1]\nprint(sum(a == b for a, b in zip(y_true, y_pred)) / len(y_true))", "0.75",
                "Tres de cuatro coinciden."),
        mc("u38-l5-e2", "¿Por qué un solo accuracy puede alcanzar?",
           [("a", "No dice qué clase falló ni a qué costo"), ("b", "Porque siempre es menor que 0"), ("c", "Porque no se puede calcular en Python")],
           "a", "Una matriz de confusión muestra si el error cae en la clase que te importa."),
        code("u38-l5-e3", "Compara `y_true = [1, 0, 1, 1]` con `y_pred = [1, 0, 0, 1]` y guarda el accuracy en `acc`.",
             "y_true = [1, 0, 1, 1]\ny_pred = [1, 0, 0, 1]\n", ["abs(acc - 0.75) < 1e-9"],
             "y_true = [1, 0, 1, 1]\ny_pred = [1, 0, 0, 1]\nacc = sum(a == b for a, b in zip(y_true, y_pred)) / len(y_true)",
             "zip recorre las dos listas a la par. Divides los aciertos entre el total."),
        find_err("u38-l5-e4", "¿Qué accuracy está inflado?",
                 [("a", "Se calculó con los mismos datos con los que se entrenó"), ("b", "Se usó una división"), ("c", "Hay cuatro ejemplos")],
                 "a", "El accuracy que importa es el del test, no el del train.",
                 starter="acc_train = 1.0\nlisto = True"),
    ])

    add("p5", "predecir una clase y mirar el punto", "Aunque el modelo sea logística, un caso separable se puede revisar a mano.", [
        mc("p5-l5-e1", "¿Qué devuelve una regresión logística al predecir una clase?",
           [("a", "Una clase, después de convertir una probabilidad con un umbral"), ("b", "Siempre la media de y"), ("c", "El número de columnas de X")],
           "a", "Por dentro hay una probabilidad. El 0.5 es un umbral, no una verdad."),
        predict("p5-l5-e2", "¿Qué imprime?",
                "from sklearn.linear_model import LogisticRegression\nimport numpy as np\nX = np.array([[0], [0], [1], [1]])\ny = np.array([0, 0, 1, 1])\nprint(int(LogisticRegression().fit(X, y).predict([[1]])[0]))", "1",
                "Los 1 están separados de los 0. El punto 1 cae del lado de la clase 1."),
        code("p5-l5-e3", "Ajusta una logística a X 0,0,1,1 e y 0,0,1,1. Guarda en `pred` la clase predicha para 1.",
             "", ["pred == 1"],
             "from sklearn.linear_model import LogisticRegression\nimport numpy as np\nX = np.array([[0.0], [0.0], [1.0], [1.0]])\ny = np.array([0, 0, 1, 1])\npred = int(LogisticRegression().fit(X, y).predict([[1.0]])[0])",
             "En un caso separable el modelo recupera el corte. En datos reales hay que mirar el test."),
        find_err("p5-l5-e4", "¿Qué umbral se dio por sentado?",
                 [("a", "Creer que 0.5 siempre es el corte correcto"), ("b", "Usar dos clases"), ("c", "Llamar predict")],
                 "a", "Si fallar una clase cuesta más, el corte se mueve.",
                 starter="from sklearn.linear_model import LogisticRegression\nimport numpy as np\nX = np.array([[0], [1]])\ny = np.array([0, 1])\npred = LogisticRegression().fit(X, y).predict([[1]])"),
    ])

    add("u39", "ReLU apaga lo negativo", "La neurona deja pasar el lado positivo y convierte el negativo en cero.", [
        predict("u39-l5-e1", "¿Qué imprime?", "import numpy as np\nz = np.array([-2.0, 0.0, 3.0])\nprint(np.maximum(0, z).tolist())", "[0.0, 0.0, 3.0]",
                "ReLU no cambia el 3 y apaga el -2."),
        mc("u39-l5-e2", "¿Qué le pasa a un valor negativo con ReLU?",
           [("a", "Se vuelve 0"), ("b", "Se vuelve positivo"), ("c", "Se borra la neurona del modelo")],
           "a", "np.maximum(0, z) elige el mayor entre 0 y z."),
        code("u39-l5-e3", "Aplica ReLU a `[-2, 0, 3]` y guarda la suma del resultado en `total`.",
             "", ["total == 3"],
             "import numpy as np\nz = np.array([-2.0, 0.0, 3.0])\ntotal = float(np.maximum(0, z).sum())",
             "Solo el 3 sobrevive. La suma comprueba que los negativos no aportaron."),
        find_err("u39-l5-e4", "¿Qué activación no es ReLU?",
                 [("a", "Cambiar el signo de los negativos en vez de apagarlos"), ("b", "Usar np.maximum"), ("c", "Dejar el cero en cero")],
                 "a", "ReLU no refleja el número: lo corta.",
                 starter="import numpy as np\nz = np.array([-2.0, 3.0])\nactivacion = np.abs(z)"),
    ])

    add("u40", "una capa es una cuenta", "Sin Keras ni PyTorch puedes ver la cuenta: pesos, entrada y sesgo.", [
        mc("u40-l5-e1", "En el navegador, ¿para qué alcanza una capa escrita a mano?",
           [("a", "Para entender la cuenta, no para entrenar un modelo grande"), ("b", "Para reemplazar un cluster de GPUs"), ("c", "Para descargar un modelo de lenguaje")],
           "a", "La fórmula y = x·w + b es el corazón de la capa. El framework la repite millones de veces."),
        predict("u40-l5-e2", "¿Qué imprime?", "import numpy as np\nx = np.array([1.0, 2.0])\nw = np.array([0.5, -1.0])\nb = 0.5\nprint(float(x @ w + b))", "-1.0",
                "1*0.5 + 2*(-1) + 0.5 = -1."),
        code("u40-l5-e3", "Calcula `y = x·w + b` con x = [1, 2], w = [0.5, -1] y b = 0.5.",
             "", ["abs(y - (-1)) < 1e-9"],
             "import numpy as np\nx = np.array([1.0, 2.0])\nw = np.array([0.5, -1.0])\nb = 0.5\ny = float(x @ w + b)",
             "El producto punto junta cada entrada con su peso. El sesgo se suma al final."),
        find_err("u40-l5-e4", "¿Qué formas no se pueden multiplicar así?",
                 [("a", "x tiene 2 valores y w tiene 3 pesos"), ("b", "El sesgo es un número"), ("c", "Se usa un producto punto")],
                 "a", "Cada entrada necesita su peso. Las longitudes tienen que coincidir.",
                 starter="import numpy as np\nx = np.array([1.0, 2.0])\nw = np.array([0.5, -1.0, 0.2])\ny = x @ w"),
    ])

    add("u41", "un paso en contra del gradiente", "Restar una fracción del gradiente mueve el peso hacia menos error.", [
        predict("u41-l5-e1", "¿Qué imprime?", "w = 4.0\ngrad = 2.0\nlr = 0.1\nw = w - lr * grad\nprint(w)", "3.8",
                "0.1 * 2 = 0.2. 4 - 0.2 = 3.8."),
        mc("u41-l5-e2", "Si el learning rate es enorme, ¿qué puede pasar?",
           [("a", "El paso se pasa del mínimo y el error sube"), ("b", "El gradiente se vuelve cero siempre"), ("c", "El modelo deja de usar datos")],
           "a", "Un paso pequeño baja la pérdida. Un paso enorme puede alejarse."),
        code("u41-l5-e3", "Actualiza `w = 4` restando `lr * grad`, con lr = 0.1 y grad = 2.",
             "", ["abs(w - 3.8) < 1e-9"],
             "w = 4.0\ngrad = 2.0\nlr = 0.1\nw = w - lr * grad",
             "La dirección es menos el gradiente. lr decide el tamaño del paso."),
        find_err("u41-l5-e4", "¿Hacia dónde camina esta actualización?",
                 [("a", "Suma el gradiente y puede subir la pérdida"), ("b", "Usa un learning rate"), ("c", "w sigue siendo un número")],
                 "a", "El descenso resta. Sumar empuja hacia donde el error crece.",
                 starter="w = 4.0\ngrad = 2.0\nlr = 0.1\nw = w + lr * grad"),
    ])

    add("u42", "el error tiene forma", "Fallar 3 contra 8 no es lo mismo que fallar al azar: las formas se parecen.", [
        mc("u42-l5-e1", "¿Qué aporta una matriz de confusión frente al accuracy?",
           [("a", "Muestra qué clases se confunden entre sí"), ("b", "Sube el accuracy sin cambiar el modelo"), ("c", "Entrena la red más rápido")],
           "a", "Ver que los 8 caen en la casilla del 3 cuenta una historia de formas."),
        predict("u42-l5-e2", "¿Qué imprime?", "verdad = [3, 8, 3, 4]\npred = [3, 3, 3, 4]\nprint(sum(t == 8 and p == 3 for t, p in zip(verdad, pred)))", "1",
                "Hay un 8 real predicho como 3."),
        code("u42-l5-e3", "Cuenta en `errores_3_vs_8` cuántos ochos reales fueron predichos como 3. verdad = [3, 8, 3, 4], pred = [3, 3, 3, 4].",
             "verdad = [3, 8, 3, 4]\npred = [3, 3, 3, 4]\n", ["errores_3_vs_8 == 1"],
             "verdad = [3, 8, 3, 4]\npred = [3, 3, 3, 4]\nerrores_3_vs_8 = sum(t == 8 and p == 3 for t, p in zip(verdad, pred))",
             "Mirar ese par de clases dice más que un accuracy global."),
        find_err("u42-l5-e4", "¿Qué lectura se queda corta?",
                 [("a", "Decir solo el accuracy y no qué dígitos se confunden"), ("b", "Contar un 8 predicho como 3"), ("c", "Comparar verdad y predicción elemento a elemento")],
                 "a", "El error de MNIST suele ser una confusión de formas, no un número suelto.",
                 starter="acc = 0.99\nexplicado = True"),
    ])

    add("u43", "partir texto no es entenderlo", "split corta por espacios. Un modelo de lenguaje hace otra cosa, y también puede sesgar.", [
        predict("u43-l5-e1", "¿Qué imprime?", "texto = 'hola mundo ia'\nprint(len(texto.split()))", "3",
                "split sin argumentos corta por espacios y descarta los vacíos."),
        mc("u43-l5-e2", "¿Qué no hace `texto.split()`?",
           [("a", "Entender el significado o quitar el sesgo del texto"), ("b", "Devolver una lista de trozos"), ("c", "Separar por espacios")],
           "a", "Es una herramienta de limpieza, no un modelo de lenguaje."),
        code("u43-l5-e3", "Parte `texto = 'hola mundo ia'` por espacios y guarda la cantidad de palabras en `n`.",
             "texto = 'hola mundo ia'\n", ["n == 3"],
             "texto = 'hola mundo ia'\nn = len(texto.split())",
             "La lista tiene tres palabras. Contarlas es el primer control antes de cualquier modelo."),
        find_err("u43-l5-e4", "¿Qué confianza está de más?",
                 [("a", "Creer que el modelo responde verdad porque armó una frase coherente"), ("b", "Usar split para contar palabras"), ("c", "Guardar el texto en una variable")],
                 "a", "Una frase fluida puede estar sesgada o inventada. Compárala con una fuente o con un baseline.",
                 starter="respuesta = 'seguro que sí'\nconfianza = 1.0"),
    ])

    add("p6", "el juguete que sí puedes explicar", "Un clasificador diminuto vale si puedes decir qué cálculo hizo.", [
        mc("p6-l5-e1", "¿Qué debe poder contar el proyecto final?",
           [("a", "Qué entra, qué cálculo hace y en qué dato se probó"), ("b", "Solo el accuracy más alto que encontraste"), ("c", "El nombre de un modelo famoso")],
           "a", "Si no puedes explicar el juguete, un modelo más grande no se vuelve más claro."),
        predict("p6-l5-e2", "¿Qué imprime?", "import numpy as np\nz = np.array([-1.0, 2.0])\nprint(int((np.maximum(0, z) > 0).sum()))", "1",
                "ReLU deja un solo positivo. La comparación cuenta cuántos siguieron vivos."),
        code("p6-l5-e3", "Define `relu(z)` con NumPy y cuenta en `n` cuántos valores de `[-1, 2]` quedan positivos.",
             "", ["n == 1"],
             "import numpy as np\ndef relu(z):\n    return np.maximum(0, z)\nn = int((relu(np.array([-1.0, 2.0])) > 0).sum())",
             "La función tiene nombre y una salida comprobable. Eso es el clasificador toy: pequeño y explicable."),
        find_err("p6-l5-e4", "¿Qué falta en este cierre de proyecto?",
                 [("a", "No dice en qué datos se midió el resultado"), ("b", "Usó una función"), ("c", "El resultado es un número")],
                 "a", "Accuracy sin el conjunto de prueba no se puede creer.",
                 starter="resultado = 0.99"),
    ])

    add("boss1", "el extremo que mueve la media", "El insight de un EDA a veces es que la media y la mediana no coinciden.", [
        mc("boss1-l5-e1", "Ventas `[10, 10, 100]`. ¿Cuál es el insight?",
           [("a", "Una venta enorme separa la media de la mediana"), ("b", "Las tres ventas son típicas"), ("c", "Hay que borrar la mediana")],
           "a", "La mediana se queda en 10. La media sube a 40 por un solo punto."),
        predict("boss1-l5-e2", "¿Qué imprime?", "import pandas as pd\ndf = pd.DataFrame({'ventas': [10, 10, 100]})\nprint(float(df['ventas'].mean()) > float(df['ventas'].median()) * 1.5)", "True",
                "40 es más de 1.5 veces 10. La media está jalada."),
        code("boss1-l5-e3", "Con ventas `[10, 10, 100]`, guarda en `outlier` si la media es mayor que 1.5 veces la mediana.",
             "", ["outlier is True"],
             "import pandas as pd\ndf = pd.DataFrame({'ventas': [10, 10, 100]})\noutlier = bool(df['ventas'].mean() > df['ventas'].median() * 1.5)",
             "La comparación deja el hallazgo en una frase que se puede testear."),
        find_err("boss1-l5-e4", "¿Qué informe se queda ciego?",
                 [("a", "Reporta la media 40 y no menciona el 100"), ("b", "Calcula la mediana"), ("c", "Usa una tabla")],
                 "a", "El 100 es el insight. La media sola lo esconde.",
                 starter="import pandas as pd\ndf = pd.DataFrame({'ventas': [10, 10, 100]})\ninforme = float(df['ventas'].mean())"),
    ])

    add("boss2", "dibujar y después comprobar el modelo", "La recta se puede leer en un punto que no estaba en el gráfico.", [
        mc("boss2-l5-e1", "Ajustaste una recta a los puntos y predices uno nuevo. ¿Qué compruebas?",
           [("a", "Que el punto nuevo sigue la misma relación, no solo que el gráfico se ve bien"), ("b", "Que el color de la línea sea azul"), ("c", "Que el modelo no tenga intercepto")],
           "a", "Un gráfico convence; el número predicho se puede testear."),
        predict("boss2-l5-e2", "¿Qué imprime, redondeado?",
                "import numpy as np\nfrom sklearn.linear_model import LinearRegression\nX = np.array([[1], [2], [3]])\ny = np.array([3, 5, 7])\npred = LinearRegression().fit(X, y).predict([[4]])[0]\nprint(round(float(pred)))", "9",
                "La relación es y = 2x + 1. En x = 4, y = 9."),
        code("boss2-l5-e3", "Ajusta una recta a (1,3), (2,5), (3,7) y guarda en `pred` la predicción para x = 4.",
             "", ["abs(pred - 9) < 1e-6"],
             "import numpy as np\nfrom sklearn.linear_model import LinearRegression\nX = np.array([[1.0], [2.0], [3.0]])\ny = np.array([3.0, 5.0, 7.0])\npred = float(LinearRegression().fit(X, y).predict([[4.0]])[0])",
             "Primero miras que los puntos van en línea. Después pides el número del punto que no dibujaste."),
        find_err("boss2-l5-e4", "¿Qué predice de más?",
                 [("a", "Usa el punto que quieres predecir también para entrenar"), ("b", "Tiene tres puntos de entrenamiento"), ("c", "Guarda un float")],
                 "a", "El punto nuevo no entra al fit.",
                 starter="import numpy as np\nfrom sklearn.linear_model import LinearRegression\nX = np.array([[1], [2], [3], [4]])\ny = np.array([3, 5, 7, 9])\nLinearRegression().fit(X, y).predict([[4]])"),
    ])

    add("boss3", "el portafolio dice el número y la muestra", "Un hallazgo sin n no se puede creer.", [
        mc("boss3-l5-e1", "¿Qué tiene que acompañar al número destacado del portafolio?",
           [("a", "Qué métrica es y cuántos datos la sostienen"), ("b", "Solo un adjetivo como 'increíble'"), ("c", "El accuracy de otro proyecto")],
           "a", "media 4 con n = 3 cuenta una historia distinta que media 4 con n = 3000."),
        predict("boss3-l5-e2", "¿Qué imprime?", "hallazgo = {'metrica': 'media', 'valor': 4.0, 'n': 3}\nprint(hallazgo['n'] >= 1 and 'valor' in hallazgo)", "True",
                "El dict trae el número y el tamaño de la muestra."),
        code("boss3-l5-e3", "Arma `hallazgo` con metrica `media`, valor 4.0 y n = 3. Guarda en `completo` si tiene valor y n es al menos 1.",
             "", ["hallazgo['metrica'] == 'media'", "hallazgo['valor'] == 4.0", "completo is True"],
             "hallazgo = {'metrica': 'media', 'valor': 4.0, 'n': 3}\ncompleto = hallazgo['n'] >= 1 and 'valor' in hallazgo",
             "Completo no significa bonito: significa que el número se puede interpretar."),
        find_err("boss3-l5-e4", "¿Qué le falta a esta ficha?",
                 [("a", "El tamaño de la muestra"), ("b", "Un diccionario"), ("c", "La palabra media")],
                 "a", "Sin n, el lector no sabe si el 4 salió de tres filas o de tres mil.",
                 starter="hallazgo = {'metrica': 'media', 'valor': 4.0}"),
    ])

    return out
