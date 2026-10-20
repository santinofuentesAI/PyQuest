#!/usr/bin/env python3
"""One AI-authored Python reading per unit, easy-to-hard questions included."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "content"


def q(prompt: str, correct: str, wrongs: tuple[str, str, str], why: str, start: int, end: int) -> dict:
    return {
        "prompt": prompt,
        "choices": [
            {"id": "a", "text": correct},
            {"id": "b", "text": wrongs[0]},
            {"id": "c", "text": wrongs[1]},
            {"id": "d", "text": wrongs[2]},
        ],
        "correctChoiceId": "a",
        "explanation": why,
        "focusLines": [start, end],
    }


def read(code: str, prompt: str, questions: list[dict]) -> dict:
    return {
        "prompt": prompt,
        "starterCode": code.strip("\n") + "\n",
        "questions": questions,
    }


READS: dict[str, dict] = {
    "u1": read(
        'print("Hola")\nprint(Hola)\n',
        "Una IA escribió un saludo. Lee qué hace y dónde se rompe.",
        [
            q("¿Por qué la primera línea usa comillas?", "Para que Hola sea texto y print lo muestre", ("Para sumar Hola con otro número", "Porque print solo acepta números", "Para importar una librería"), "Sin comillas, Hola es un nombre, no un texto.", 1, 1),
            q("¿Qué hace print en este programa?", "Muestra un valor y pasa a la línea siguiente", ("Guarda el valor en un archivo CSV", "Entrena un modelo", "Borra la variable"), "print escribe en la salida. No guarda ni entrena.", 1, 1),
            q("¿Qué está mal en la línea marcada?", "Hola sin comillas se usa como variable y no existe", ("print está mal escrito", "Sobran los paréntesis", "La primera línea imprime un número"), "La segunda llamada busca una variable Hola. Nadie la definió.", 2, 2),
        ],
    ),
    "u2": read(
        'edad = "20"\nprint(type(edad).__name__)\nprint(edad + 1)\n',
        "La IA guardó una edad. Revisa el tipo antes de creer la suma.",
        [
            q("¿Por qué edad lleva comillas?", "Porque la IA guardó texto, no un número", ("Porque 20 es un float", "Porque type no existe", "Porque las comillas convierten a int"), "Las comillas crean un str aunque se vea como un número.", 1, 1),
            q("¿Qué imprime la segunda línea?", "str", ("int", "20", "bool"), "type(...).__name__ dice el nombre del tipo. Aquí es texto.", 2, 2),
            q("¿Qué está mal al sumar?", "No se puede sumar texto y un número con +", ("20 + 1 da 201 siempre", "print no puede mostrar tipos", "Falta un import de math"), "edad + 1 mezcla str e int. Antes hay que convertir con int.", 3, 3),
        ],
    ),
    "u3": read(
        "precio = 10\nprint(precio * 2 + 3)\nprint(precio == 10)\n",
        "La IA calculó un precio y comparó. Sigue el orden de las operaciones.",
        [
            q("¿Por qué el resultado de la segunda línea es 23 y no 50?", "Porque * ocurre antes que +", ("Porque print redondea", "Porque 10 se lee como texto", "Porque == suma"), "La multiplicación va primero: 20 + 3 = 23.", 2, 2),
            q("¿Qué responde la comparación de la tercera línea?", "True, porque precio sigue siendo 10", ("False, porque ya se multiplicó", "23", "Un error de sintaxis"), "== compara. La multiplicación no cambió precio.", 3, 3),
            q("Si la IA hubiera escrito print(precio = 10), ¿qué estaría mal?", "Un solo = asigna; dentro de print no es una comparación", ("= y == son iguales", "Falta una coma", "precio no puede valer 10"), "Para preguntar si son iguales se usa ==.", 3, 3),
        ],
    ),
    "u4": read(
        'nombre = "PyQuest"\nprint(nombre[0])\nnombre.lower()\nprint(nombre)\n',
        "La IA quiso pasar el nombre a minúsculas. Mira si de verdad lo cambió.",
        [
            q("¿Qué carácter imprime nombre[0]?", "P, el primero. Los índices empiezan en 0", ("y, la segunda letra", "t, la última", "Toda la palabra"), "La posición 0 es la P de PyQuest.", 2, 2),
            q("¿Por qué la IA llamó lower()?", "Para pedir una versión en minúsculas", ("Para borrar el nombre", "Para convertir a número", "Para contar vocales"), "lower() devuelve otro texto en minúsculas.", 3, 3),
            q("¿Qué está mal en el uso de lower()?", "El resultado no se guarda, así que print sigue mostrando PyQuest", ("lower() modifica el texto original", "El índice 0 está fuera de rango", "print no acepta strings"), "Los strings no cambian solos. Hay que asignar el resultado.", 3, 4),
        ],
    ),
    "u5": read(
        "notas = [7, 9]\ncopia = notas\nnotas.append(10)\nprint(copia)\n",
        "La IA creyó que tenía una copia de la lista.",
        [
            q("¿Para qué sirve append?", "Para añadir un elemento al final de la misma lista", ("Para crear una lista nueva sin tocar la original", "Para ordenar de mayor a menor", "Para convertir la lista en texto"), "append modifica la lista que ya existe.", 3, 3),
            q("¿Por qué print(copia) muestra también el 10?", "copia y notas son la misma lista", ("append copia los valores", "print siempre añade 10", "Las listas no se pueden modificar"), "Asignar copia = notas no copia: comparte el mismo objeto.", 2, 4),
            q("¿Qué debería haber escrito la IA para una copia de verdad?", "copia = notas.copy()", ("copia = notas", "copia = notas.append(10)", "copy(notas) = copia"), "copy() crea otra lista. append no devuelve esa copia.", 2, 2),
        ],
    ),
    "u6": read(
        "registro = ('Ana', 23)\netiquetas = {'IA', 'datos', 'IA'}\nprint(registro[0])\nprint(len(etiquetas))\n",
        "La IA mezcló una tupla y un set. Distingue para qué sirve cada uno.",
        [
            q("¿Por qué registro es una tupla?", "El orden importa y no se piensa modificar", ("Para borrar duplicados", "Porque tiene claves", "Porque se puede hacer append"), "('Ana', 23) conserva posición: el nombre va primero.", 1, 1),
            q("¿Qué imprime len(etiquetas)?", "2, porque el set guarda IA una sola vez", ("3, porque hay tres textos", "1, porque solo cuenta letras", "23"), "Un set elimina duplicados. IA aparece dos veces y cuenta una.", 2, 4),
            q("¿Qué estaría mal si la IA hiciera etiquetas[0]?", "Un set no se indexa por posición", ("El 0 es la clave IA", "len no funciona en sets", "La tupla no tiene posición 0"), "Los sets no prometen orden ni índices.", 2, 2),
        ],
    ),
    "u7": read(
        "persona = {'nombre': 'Lía', 'edad': 20}\nprint(persona['nombre'])\nprint(persona['ciudad'])\n",
        "La IA leyó un diccionario y pidió una clave que no está.",
        [
            q("¿Por qué la segunda línea imprime Lía?", "Porque busca el valor de la clave nombre", ("Porque el dict está ordenado alfabéticamente", "Porque print muestra las claves", "Porque edad vale Lía"), "Los corchetes consultan por clave, no por posición.", 2, 2),
            q("¿Qué es una clave en este dict?", "El nombre con el que recuperas un valor", ("Siempre un número de fila", "El resultado de print", "Una lista de duplicados"), "nombre y edad son claves. Lía y 20 son valores.", 1, 1),
            q("¿Qué está mal en la tercera línea?", "ciudad no existe y lanza KeyError", ("ciudad vale 20", "Sobran las comillas de Lía", "Un dict no puede tener dos pares"), "Para una clave opcional conviene .get('ciudad', 'sin dato').", 3, 3),
        ],
    ),
    "u8": read(
        "puntos = 72\nif puntos >= 90:\n    print('excelente')\nelif puntos >= 60:\n    print('aprobado')\nelse:\n    print('a practicar')\n",
        "La IA clasificó un puntaje. Solo debe ejecutarse una rama.",
        [
            q("¿Por qué no imprime excelente?", "72 no llega a 90, así que esa rama se salta", ("if siempre imprime todas las ramas", "else se ejecuta primero", "72 es texto"), "La condición del if es falsa. Python sigue con elif.", 2, 3),
            q("¿Por qué usa elif y no otro if suelto?", "Para probar la siguiente condición solo si la anterior falló", ("Porque elif suma los puntos", "Porque else no puede ir después", "Porque print exige elif"), "Una sola rama gana. elif no se evalúa si el if ya fue verdadero.", 4, 5),
            q("¿Qué estaría mal si faltara la indentación de print?", "Python no sabría qué instrucción pertenece al if", ("El número 72 cambiaría", "elif se convertiría en un bucle", "print dejaría de existir"), "La indentación es el bloque. Sin ella hay IndentationError o un programa distinto.", 3, 3),
        ],
    ),
    "u9": read(
        "total = 0\nfor numero in range(1, 4):\n    total = 0\n    total += numero\nprint(total)\n",
        "La IA quiso sumar 1+2+3. El acumulador está en el lugar equivocado.",
        [
            q("¿Qué valores recorre range(1, 4)?", "1, 2 y 3. El 4 no entra", ("1, 2, 3 y 4", "0, 1, 2, 3", "Solo el 4"), "El extremo final de range no se incluye.", 2, 2),
            q("¿Para qué se quería total fuera del for?", "Para ir guardando la suma entre vueltas", ("Para borrar numero", "Para imprimir en cada vuelta", "Para crear un dict"), "El acumulador tiene que sobrevivir de una vuelta a la siguiente.", 1, 1),
            q("¿Qué está mal en la línea marcada?", "Pone total en 0 en cada vuelta y se pierde la suma", ("range incluye el 4", "print está dentro del for", "+= no existe"), "Al reiniciar total, al final solo queda el último número: 3.", 3, 4),
        ],
    ),
    "u10": read(
        "def doble(numero):\n    print(numero * 2)\n\nresultado = doble(6)\nprint(resultado)\n",
        "La IA escribió una función que muestra el doble, pero no lo entrega.",
        [
            q("¿Qué hace def doble?", "Define una función reutilizable con un parámetro", ("Ejecuta el doble en ese mismo instante", "Importa math", "Crea una lista llamada doble"), "def crea la función. Todavía no la llama.", 1, 2),
            q("¿Por qué la IA usó print dentro de la función?", "Para mostrar 12 en la salida", ("Para devolver 12 a resultado", "Para borrar numero", "Porque return no puede ir en funciones"), "print muestra. No entrega el valor a quien llamó.", 2, 2),
            q("¿Qué está mal si se esperaba guardar el doble?", "Falta return, así que resultado es None", ("doble(6) da 6", "El parámetro se llama mal", "print(resultado) suma 6"), "Sin return, la función devuelve None aunque haya impreso 12.", 2, 5),
        ],
    ),
    "u11": read(
        "dato = 'sin dato'\ntry:\n    numero = int(dato)\nexcept Exception:\n    numero = 0\nprint(numero)\n",
        "La IA atrapó el error al convertir texto. Mira qué tan ancho es el except.",
        [
            q("¿Por qué hay un try?", "Porque int puede fallar si el texto no es un número", ("Porque print siempre lanza un error", "Porque dato ya es un int", "Para importar excepciones"), "int('sin dato') no sabe qué número construir.", 2, 3),
            q("¿Qué imprime el programa?", "0, el valor de reserva", ("sin dato", "None", "No imprime nada"), "El except asigna 0 y el print está fuera del try.", 4, 6),
            q("¿Qué está mal en el except?", "Exception esconde cualquier fallo, no solo una conversión inválida", ("except no puede asignar 0", "int no lanza errores", "Falta un for"), "Conviene capturar ValueError para no tapar otros bugs.", 4, 4),
        ],
    ),
    "u12": read(
        "class Contador:\n    def __init__(self):\n        self.valor = 0\n    def sumar(self):\n        valor = self.valor + 1\n\nc = Contador()\nc.sumar()\nprint(c.valor)\n",
        "La IA creó un contador. Revisa si el método guarda el estado.",
        [
            q("¿Para qué está __init__?", "Para preparar cada objeto cuando se crea", ("Para sumar 1 en cada print", "Para borrar la clase", "Para importar self"), "__init__ corre al hacer Contador(). Aquí deja valor en 0.", 2, 3),
            q("¿Qué es self.valor?", "El dato guardado en ese objeto", ("Una variable global", "El nombre de la clase", "La salida de print"), "self distingue el estado de esta instancia.", 3, 3),
            q("¿Qué está mal en sumar?", "Calcula valor local y no lo guarda en self.valor", ("Contador() no crea un objeto", "print muestra 1", "__init__ no puede usar self"), "Sin self.valor = ..., el objeto sigue en 0.", 5, 5),
        ],
    ),
    "u13": read(
        "import math\nprint(math.sqrt(81))\nprint(ceil(2.1))\n",
        "La IA importó math y usó dos funciones. Una no está a la vista.",
        [
            q("¿Por qué escribe math.sqrt y no solo sqrt?", "Porque import math obliga a usar el nombre del módulo", ("Porque sqrt es una palabra reservada", "Porque math suma 81", "Porque print importa solo"), "El prefijo deja claro de dónde sale la función.", 1, 2),
            q("¿Qué devuelve math.sqrt(81)?", "9.0, un float", ("9, un int", "81", "3"), "La raíz cuadrada de math es float.", 2, 2),
            q("¿Qué está mal en la tercera línea?", "ceil no está importado: falta math.ceil", ("ceil redondea hacia abajo", "81 no tiene raíz", "import va debajo de print"), "import math no vuelca ceil suelto en el programa.", 3, 3),
        ],
    ),
    "p0": read(
        "ventas = [4, 8, 12]\nprint(sum(ventas) / len(ventas))\nprint(max(ventas))\n",
        "La IA resumió tres ventas. La media no cuenta sola.",
        [
            q("¿Por qué divide entre len(ventas)?", "Porque la media necesita el número de datos", ("Porque max exige un denominador", "Porque sum ya divide", "Porque las listas empiezan en 1"), "sum da el total. len es el n del promedio.", 2, 2),
            q("¿Qué aporta max al lado de la media?", "Muestra el extremo, no solo el centro", ("Reemplaza a la media", "Cuenta cuántas filas hay", "Convierte la lista en texto"), "La media es 8, pero el máximo es 12. El contraste importa.", 3, 3),
            q("¿Qué estaría mal con ventas = []?", "len vale 0 y la división rompe el programa", ("max devolvería 0", "sum ignoraría el error", "print no acepta listas"), "No hay media de una muestra vacía. Hay que mirar n antes de dividir.", 2, 2),
        ],
    ),
    "u14": read(
        "import numpy as np\na = np.array([2, 4, 6])\nprint(a.shape)\nprint((a * 2).tolist())\n",
        "La IA pasó una lista a un array y lo multiplicó.",
        [
            q("¿Por qué usa np.array?", "Para tener forma, tipo y operaciones de NumPy", ("Para borrar los números pares", "Porque las listas no existen", "Para leer un CSV"), "El array conoce su shape y opera por elementos.", 2, 2),
            q("¿Qué significa shape (3,)?", "Un eje con tres valores", ("Tres filas y tres columnas", "El máximo es 3", "El tipo es texto"), "(3,) es un vector de longitud 3.", 3, 3),
            q("¿Qué estaría mal si la IA esperara [2, 4, 6, 2, 4, 6]?", "a * 2 no repite la lista: multiplica cada valor", ("tolist() ordena", "shape duplica el array", "import numpy concatena"), "En un array, * 2 es vectorizado: [4, 8, 12].", 4, 4),
        ],
    ),
    "u15": read(
        "import numpy as np\na = np.array([3, 6, 9, 12])\nprint(a[1:3].tolist())\nprint(a[a > 6].tolist())\n",
        "La IA cortó un array y luego lo filtró.",
        [
            q("¿Por qué el slice no incluye el 12?", "Porque el final 3 queda fuera. Entran las posiciones 1 y 2", ("Porque 12 no es número", "Porque > 6 se aplica primero", "Porque los arrays empiezan en 1"), "[1:3] toma 6 y 9.", 3, 3),
            q("¿Qué hace a > 6?", "Crea una máscara True/False para filtrar", ("Borra el array", "Devuelve el máximo", "Convierte todo a texto"), "La máscara se usa como índice: quedan 9 y 12.", 4, 4),
            q("¿Qué estaría mal si la IA dijera que [1:3] incluye la posición 3?", "El extremo final de un slice nunca entra", ("El 3 es el valor, no la posición", "tolist() quita el último", "NumPy cuenta desde 1"), "La posición 3 es 12 y queda fuera del corte.", 3, 3),
        ],
    ),
    "u16": read(
        "import numpy as np\na = np.array([1, 4, 7])\nprint((a + 2).tolist())\nprint(np.where(a > 3, 'alto', 'bajo').tolist())\n",
        "La IA sumó un escalar y etiquetó cada valor.",
        [
            q("¿Por qué a + 2 no falla?", "Broadcasting suma 2 a cada elemento", ("Porque 2 es un array de tres números", "Porque where convierte a texto", "Porque + concatena"), "Un escalar compatible se aplica a todo el array.", 3, 3),
            q("¿Qué decide np.where aquí?", "alto si el valor es mayor que 3, si no bajo", ("El promedio del array", "Solo el primer elemento", "La forma del array"), "1 es bajo. 4 y 7 son alto.", 4, 4),
            q("¿Qué estaría mal al sumar un array de forma incompatible?", "Broadcasting no empareja formas arbitrarias", ("Siempre recorta el más largo", "where arregla la forma", "tolist() alinea los ejes"), "Las formas tienen que coincidir o ser ampliables. Si no, hay error.", 3, 3),
        ],
    ),
    "u17": read(
        "import numpy as np\na = np.array([1, 3, 5, 100])\nprint(a.mean())\nprint(np.median(a))\n",
        "La IA resumió un array con un valor extremo.",
        [
            q("¿Qué calcula mean()?", "El promedio aritmético de todos los valores", ("El valor del medio", "El más frecuente", "La suma sin dividir"), "La media usa todos los números, incluido el 100.", 3, 3),
            q("¿Por qué la mediana cuenta otra historia?", "Porque el 100 empuja la media y casi no mueve la mediana", ("Porque median ignora el array", "Porque mean borra el 100", "Porque son el mismo número"), "Un extremo desplaza el promedio más que el valor central.", 3, 4),
            q("¿Qué estaría mal al reportar solo la media?", "Esconde que un solo 100 cambia el centro", ("La mediana no existe en NumPy", "mean() devuelve texto", "Hay que importar pandas para un array"), "Con un outlier, media y mediana se leen juntas.", 3, 3),
        ],
    ),
    "u18": read(
        "import numpy as np\na = np.array([1, 2, 3, 4, 5, 6])\nb = a.reshape(2, 3)\nprint(b.shape)\nprint(b[b > 3].tolist())\n",
        "La IA cambió la forma del array y filtró.",
        [
            q("¿Qué hace reshape(2, 3)?", "Reorganiza los 6 valores en 2 filas y 3 columnas", ("Borra tres valores", "Ordena de mayor a menor", "Crea una copia con ceros"), "6 elementos caben en 2×3. El shape pasa a (2, 3).", 2, 3),
            q("¿El filtro b > 3 depende de la forma?", "Elige valores, no posiciones. Quedan 4, 5 y 6", ("Solo mira la primera fila", "Devuelve el shape", "Falla porque b es matriz"), "La máscara aplana el criterio: importan los números mayores que 3.", 4, 4),
            q("¿Qué estaría mal con reshape(2, 2)?", "2×2 no tiene sitio para 6 valores", ("Siempre recorta", "shape ignoraría el error", "El filtro lo arregla"), "La cantidad de celdas tiene que coincidir con el tamaño.", 2, 2),
        ],
    ),
    "p1": read(
        "import numpy as np\ntemps = np.array([12.0, 15.5, 14.0, 18.2])\nprint(temps.mean())\nprint(temps.max())\n",
        "La IA resumió temperaturas. Falta decir la unidad y el n.",
        [
            q("¿Qué representa mean() aquí?", "La temperatura promedio de esas cuatro lecturas", ("La mediana", "El primer día", "Un pronóstico"), "Suma las lecturas y divide entre 4.", 3, 3),
            q("¿Por qué max ayuda al lado de la media?", "Muestra el pico, no solo el centro", ("Reemplaza el promedio", "Cuenta los días nulos", "Convierte a texto"), "El máximo dice qué tan lejos llegó la serie.", 4, 4),
            q("¿Qué está incompleto en este resumen?", "No dice n=4 ni la unidad (°C)", ("mean() está mal calculada", "NumPy no puede promediar", "max() borra la media"), "Un número de temperatura sin n ni unidad no se puede auditar.", 3, 4),
        ],
    ),
    "u19": read(
        "import matplotlib.pyplot as plt\nxs = [1, 2, 3]\nys = [4, 4, 9]\nplt.plot(xs, ys)\nplt.show()\n",
        "La IA dibujó una línea. El gráfico todavía no dice qué es.",
        [
            q("¿Qué hace plt.plot(xs, ys)?", "Une los puntos (1,4), (2,4) y (3,9)", ("Calcula la media de ys", "Guarda un CSV", "Entrena un modelo"), "plot dibuja. No resume ni ajusta un modelo.", 4, 4),
            q("¿Por qué xs e ys van separados?", "Una lista es la posición horizontal y la otra la vertical", ("Porque plot solo acepta un número", "Porque show() los resta", "Porque matplotlib exige dicts"), "Cada índice es un punto: x con su y.", 2, 4),
            q("¿Qué le falta a este gráfico para poder leerse?", "Título, ejes y unidad. Así no se sabe qué sube a 9", ("plt.show() borra los datos", "Hay demasiados puntos", "plot no acepta listas"), "Sin nombres, la línea es una forma, no un hallazgo.", 4, 5),
        ],
    ),
    "u20": read(
        "import matplotlib.pyplot as plt\nplt.bar(['web', 'tienda'], [4, 2])\nplt.title('Ventas')\nplt.show()\n",
        "La IA puso un título corto en un gráfico de barras.",
        [
            q("¿Qué compara el bar?", "web contra tienda, con alturas 4 y 2", ("La media de los canales", "Un histograma de edades", "La correlación"), "Cada barra es una categoría y su altura es el valor.", 2, 2),
            q("¿Para qué sirve title?", "Para decir qué se está mirando", ("Para calcular las alturas", "Para ordenar las barras", "Para exportar un modelo"), "El título es la frase que el gráfico defiende.", 3, 3),
            q("¿Qué está flojo en el título 'Ventas'?", "No dice periodo, métrica ni unidad", ("bar no acepta texto", "4 es menor que 2", "show() cambia los datos"), "Ventas de qué, cuándo y en qué unidad. Si no, la barra no se puede citar.", 3, 3),
        ],
    ),
    "u21": read(
        "import seaborn as sns\nimport pandas as pd\ndf = pd.DataFrame({'canal': ['web', 'web', 'tienda'], 'unidades': [4, 6, 2]})\nsns.barplot(data=df, x='canal', y='unidades')\n",
        "La IA pidió un barplot de seaborn sobre una tabla.",
        [
            q("¿Por qué usa un DataFrame?", "Porque seaborn espera columnas con nombre", ("Porque list no existe", "Porque barplot suma strings", "Porque pandas dibuja solo"), "x e y nombran columnas, no posiciones sueltas.", 3, 4),
            q("¿Qué resume barplot por canal, por defecto?", "Una medida de tendencia, no cada fila suelta", ("El texto de la columna canal", "Solo la primera fila", "Un modelo de clasificación"), "Con varias filas web, la barra no es 'una fila': resume.", 4, 4),
            q("¿Qué estaría mal al leer la barra web como si fuera la suma?", "El default no es la suma de 4 y 6", ("seaborn no agrupa", "tienda vale 10", "Falta matplotlib y por eso suma"), "Hay que saber si la barra es media o total antes de citarla.", 4, 4),
        ],
    ),
    "u22": read(
        "import matplotlib.pyplot as plt\nplt.plot([1, 2], [4, 8])\nplt.title('La web siempre vende el doble')\nplt.show()\n",
        "La IA tituló una conclusión que los dos puntos no alcanzan a probar.",
        [
            q("¿Qué muestran de verdad los datos?", "Dos puntos: de 4 se pasa a 8", ("Que todos los canales duplican siempre", "Un año completo de ventas", "Un test estadístico"), "plot solo tiene dos valores. Nada más.", 2, 2),
            q("¿Por qué el título es parte del análisis?", "Afirma una frase que el lector se va a creer", ("matplotlib lo calcula con los datos", "show() lo verifica", "Es decoración sin sentido"), "El título es una afirmación, no un adorno.", 3, 3),
            q("¿Qué está mal en el título?", "'Siempre' generaliza más allá de dos puntos", ("8 es menor que 4", "plot no puede usar listas", "Falta seaborn"), "Esos puntos no prueban una ley. El título se pasa de lo observado.", 3, 3),
        ],
    ),
    "p2": read(
        "paneles = ['media', 'maximo']\nvalores = [8, 12]\nprint(paneles[0], valores[0])\nprint(paneles[1], valores[1])\n",
        "La IA armó dos números para un tablero. Todavía no hay contexto.",
        [
            q("¿Qué empareja el programa?", "El nombre de cada panel con su número", ("Un modelo y su accuracy", "Filas de un CSV externo", "Tokens de un prompt"), "El índice 0 es media=8 y el 1 es máximo=12.", 3, 4),
            q("¿Por qué un tablero necesita más de un número?", "Un solo centro esconde el extremo", ("Porque print exige dos líneas", "Porque las listas deben ser pares", "Porque máximo es siempre la media"), "Media y máximo juntos evitan una historia a medias.", 1, 4),
            q("¿Qué está incompleto para publicarlo?", "No hay n, unidad ni periodo de esos valores", ("Los índices empiezan en 1", "print no muestra texto", "valores está vacío"), "8 y 12 sin decir de qué muestra son no se pueden defender.", 3, 4),
        ],
    ),
    "u23": read(
        "import pandas as pd\ndf = pd.DataFrame({'ciudad': ['Lima', 'Cusco'], 'ventas': [10, 4]})\nprint(df.shape)\nprint(df['ventas'].sum())\n",
        "La IA construyó una tabla pequeña.",
        [
            q("¿Qué es un DataFrame aquí?", "Una tabla con columnas con nombre y una fila por observación", ("Un array de un solo número", "Un gráfico", "Un prompt"), "ciudad y ventas son columnas. Hay dos filas.", 2, 2),
            q("¿Qué dice shape?", "Filas y columnas: 2 por 2", ("La suma de las ventas", "Solo el número de columnas", "El tipo de Lima"), "(2, 2) es dos observaciones y dos variables.", 3, 3),
            q("¿Qué estaría mal al decir que la suma es el promedio?", "sum() totaliza. El promedio dividiría entre el n", ("shape ya divide", "Cusco no entra en la suma", "DataFrame no tiene columnas"), "10+4 es 14. La media sería 14/2.", 4, 4),
        ],
    ),
    "u24": read(
        "import pandas as pd\ndf = pd.DataFrame({'nombre': ['Ana', 'Bo'], 'edad': [20, 17]})\nprint(df.loc[df.edad >= 18, 'nombre'].tolist())\n",
        "La IA filtró filas y se quedó con una columna.",
        [
            q("¿Qué hace df.edad >= 18?", "Una máscara de filas: True donde la edad llega a 18", ("Ordena el DataFrame", "Borra la columna nombre", "Calcula la media"), "Ana queda. Bo, con 17, no.", 3, 3),
            q("¿Por qué hay una coma y luego 'nombre'?", "Después de elegir filas, loc se queda con esa columna", ("nombre es el índice", "La coma suma las edades", "loc solo acepta números"), "loc[filas, columna] es el recorte de Ana.", 3, 3),
            q("¿Qué estaría mal al usar el resultado como 'todas las personas'?", "Es solo quienes cumplen la edad. Bo no está", ("tolist() duplica filas", "18 se lee como texto", "loc no filtra"), "El filtro cambia quién entra. Hay que decir el criterio.", 3, 3),
        ],
    ),
    "u25": read(
        "import pandas as pd\ndf = pd.DataFrame({'edad': [20, None, 30]})\nantes = len(df)\ndf = df.dropna()\nprint(len(df))\n",
        "La IA borró nulos. Mira qué información dejó de poder contar.",
        [
            q("¿Qué hace dropna()?", "Quita las filas donde falta un valor", ("Rellena los nulos con cero", "Convierte None en 30", "Ordena la columna"), "La fila del None desaparece. Quedan dos edades.", 3, 3),
            q("¿Para qué guardó antes?", "Para recordar cuántas filas había antes de borrar", ("Para calcular la mediana", "Porque len no funciona dos veces", "Para crear un índice"), "antes vale 3. Después de reasignar, df ya no tiene esa fila.", 2, 2),
            q("¿Qué está mal en el informe si solo se imprime len(df)?", "Se pierde contar cuántos nulos se fueron", ("dropna() no borra nada", "None es un número", "antes cambia el tipo"), "Sin el n original, el 2 parece la tabla completa.", 3, 4),
        ],
    ),
    "u26": read(
        "import pandas as pd\ndf = pd.DataFrame({'canal': ['web', 'web', 'tienda'], 'u': [4, 6, 2]})\ng = df.groupby('canal')['u'].sum()\nprint(g['web'])\n",
        "La IA agrupó unidades por canal.",
        [
            q("¿Qué agrupa groupby('canal')?", "Las filas que comparten el mismo canal", ("Cada número por separado", "Solo la primera fila", "Las columnas en orden alfabético"), "web tiene dos filas. tienda tiene una.", 3, 3),
            q("¿Por qué el resultado de web es 10?", "Porque sumó 4 y 6", ("Porque promedió", "Porque contó filas", "Porque tomó el máximo"), "sum en el grupo web totaliza las unidades.", 3, 4),
            q("¿Qué estaría mal al llamar a eso 'promedio de la web'?", "Es una suma. El promedio sería 5", ("groupby no puede sumar", "tienda vale 10", "g['web'] es texto"), "El nombre de la métrica tiene que coincidir con la operación.", 3, 4),
        ],
    ),
    "u27": read(
        "import pandas as pd\nfechas = pd.to_datetime(['2024-01-01', '2024-01-02', '2024-02-01'])\ns = pd.Series([2, 3, 8], index=fechas)\nprint(s.resample('ME').sum().iloc[-1])\n",
        "La IA resumió una serie por mes.",
        [
            q("¿Para qué convierte las fechas con to_datetime?", "Para que el índice sea tiempo y se pueda remuestrear", ("Para borrar enero", "Para convertir los valores en texto", "Porque Series no acepta números"), "resample necesita un índice de fechas, no strings sueltos.", 2, 3),
            q("¿Qué hace resample('ME').sum()?", "Suma los valores que caen en cada mes", ("Calcula un modelo", "Cuenta tokens", "Ordena alfabéticamente"), "Enero junta 2 y 3. Febrero se queda con 8.", 4, 4),
            q("¿Qué estaría mal al leer iloc[-1] como 'el total de todo'?", "Es solo el último mes, no la suma de todos", ("ME significa mediana", "iloc[-1] es enero", "sum() promedia"), "El último periodo es febrero. El total de la serie sería otro número.", 4, 4),
        ],
    ),
    "p3": read(
        "import pandas as pd\ndf = pd.DataFrame({'survived': [1, 0, 1], 'age': [38, None, 26]})\nprint(df['age'].count())\nprint(df['survived'].mean())\n",
        "La IA miró una mini tabla tipo Titanic.",
        [
            q("¿Por qué count() de age no es 3?", "count ignora el nulo. Solo hay dos edades", ("mean borra una fila", "survived no entra en el DataFrame", "count cuenta columnas"), "None no cuenta como edad observada.", 3, 3),
            q("¿Qué es la media de survived aquí?", "La proporción de unos: 2 de 3", ("La edad promedio", "El máximo de age", "Un accuracy de un modelo"), "1, 0 y 1 promedian 0.666... Es una tasa, no una edad.", 4, 4),
            q("¿Qué estaría mal al decir que la edad media usa a los tres?", "Una fila no tiene edad. El n de age es 2", ("survived está vacío", "count() cuenta nulos", "mean() de survived usa age"), "Mezclar el n de filas con el n de una columna con nulos cambia la historia.", 3, 4),
        ],
    ),
    "u28": read(
        "datos = [2, 2, 2, 10]\nmedia = sum(datos) / len(datos)\nprint(media)\nprint(max(datos) - min(datos))\n",
        "La IA describió un puñado de números.",
        [
            q("¿Qué es la media en este caso?", "4, porque (2+2+2+10)/4", ("2, la moda", "10, el máximo", "8, el rango"), "La media usa los cuatro valores.", 2, 3),
            q("¿Qué mide max - min?", "El rango: qué tan lejos están los extremos", ("La mediana", "La cantidad de datos", "La moda"), "10 - 2 = 8. Dice la dispersión bruta.", 4, 4),
            q("¿Qué estaría mal al decir que 'casi todos valen 4'?", "La media es 4, pero tres datos valen 2 y uno vale 10", ("El rango es 4", "len es 10", "sum no incluye el 10"), "El centro calculado no es un valor típico de la lista.", 2, 4),
        ],
    ),
    "u29": read(
        "import random\nrandom.seed(0)\nmuestra = [random.gauss(0, 1) for _ in range(3)]\nprint(len(muestra))\nprint(round(sum(muestra) / len(muestra), 2))\n",
        "La IA simuló tres extracciones de una campana.",
        [
            q("¿Qué hace random.gauss(0, 1)?", "Un número al azar de una normal centrada en 0", ("Siempre devuelve 0", "Una fila de pandas", "Un token"), "gauss(media, desviación) no repite el mismo valor.", 3, 3),
            q("¿Por qué fijó seed(0)?", "Para que la muestra se pueda repetir", ("Para que la media sea exactamente 0", "Para borrar el azar de la lista", "Porque gauss lo exige"), "La semilla hace el experimento reproducible.", 2, 2),
            q("¿Qué está mal al tratar esa media como 'la media de la normal'?", "Son 3 sorteos, no el centro teórico", ("seed impide calcular la media", "len es 0", "gauss devuelve texto"), "Con n=3 la media muestral se mueve. La normal teórica sigue centrada en 0.", 3, 4),
        ],
    ),
    "u30": read(
        "import numpy as np\nx = np.array([1, 2, 3, 4])\ny = np.array([2, 4, 6, 8])\nprint(round(np.corrcoef(x, y)[0, 1], 2))\n",
        "La IA midió una correlación perfecta.",
        [
            q("¿Qué relación hay entre x e y?", "y es el doble de x, así que suben juntos", ("y es independiente", "y es el promedio de x", "No se pueden correlacionar"), "Cada y es 2 veces su x. La relación es lineal.", 2, 3),
            q("¿Qué significa un coeficiente cercano a 1?", "Cuando uno sube, el otro también, de forma lineal", ("Que x causa y", "Que la muestra es de un solo punto", "Que hay un error de tipos"), "corrcoef mide asociación lineal, no el mecanismo.", 4, 4),
            q("¿Qué estaría mal al decir 'x causa y'?", "La correlación no demuestra la causa", ("1 significa que no hay relación", "corrcoef promedia los valores", "Faltan comillas"), "Pueden moverse juntos por otra razón. Causa es otra pregunta.", 4, 4),
        ],
    ),
    "u31": read(
        "diferencia = 0.2\np = 0.30\nprint(p < 0.05)\nprint(diferencia)\n",
        "La IA miró un p-valor y una diferencia.",
        [
            q("¿Qué pregunta un p-valor?", "Qué tan sorpresivo sería el resultado si no hubiera efecto", ("El tamaño del efecto en unidades reales", "El número de filas", "La media del grupo"), "p no es la diferencia. Es una pieza de la prueba.", 2, 2),
            q("¿Por qué p < 0.05 da False?", "0.30 no cruza ese umbral", ("Porque la diferencia es 0", "Porque print compara strings", "Porque 0.2 es mayor que 1"), "0.30 es mayor que 0.05. No se rechaza con esa regla.", 3, 3),
            q("¿Qué está mal al decir que 0.2 'no existe' porque p es 0.30?", "Una diferencia puede ser real y aun así no cruzar el umbral, o al revés", ("p es la diferencia", "0.05 es el tamaño del efecto", "print borra diferencia"), "Tamaño y sorpresa son lecturas distintas. No se sustituyen.", 1, 3),
        ],
    ),
    "p4": read(
        "n = 40\nmedia = 12.5\nunidad = 'kg'\nprint(f'n={n}, media={media} {unidad}')\n",
        "La IA redactó una frase de informe.",
        [
            q("¿Por qué la frase incluye n?", "Para saber cuántos datos sostienen la media", ("Porque f-string exige dos variables", "Porque kg es un p-valor", "Porque media sin n es más precisa"), "12.5 kg con n=40 se puede juzgar. Sin n, no.", 1, 4),
            q("¿Qué hace el f-string?", "Intercala los valores dentro del texto", ("Calcula un test t", "Borra la unidad", "Convierte kg a libras"), "Las llaves se reemplazan por n, media y unidad.", 4, 4),
            q("¿Qué estaría mal si se omitiera la unidad?", "12.5 no se sabría si son kg, personas o pesos", ("n dejaría de ser 40", "print fallaría", "La media se duplicaría"), "El número sin unidad no es un hallazgo citable.", 3, 4),
        ],
    ),
    "u32": read(
        "from sklearn.model_selection import train_test_split\nx = [[1], [2], [3], [4]]\ny = [0, 0, 1, 1]\nx_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.25, random_state=0)\nprint(len(x_tr), len(x_te))\n",
        "La IA separó datos para aprender y datos para evaluar.",
        [
            q("¿Para qué está train_test_split?", "Para no evaluar el modelo con las mismas filas con las que aprendió", ("Para borrar los y", "Para calcular la media", "Para dibujar un gráfico"), "Parte la tabla en entrenamiento y prueba.", 4, 4),
            q("¿Qué hace test_size=0.25?", "Reserva cerca de un cuarto de las filas para probar", ("Entrena 25 modelos", "Borra el 25% de las columnas", "Fija la accuracy en 0.25"), "De 4 filas, una se va a prueba y tres se quedan para entrenar.", 4, 5),
            q("¿Qué estaría mal al medir el acierto solo sobre x_tr?", "Eso premia memorizar, no generalizar", ("random_state impide partir", "len(x_te) es siempre 0", "y no se puede partir"), "El examen tiene que ser x_te, las filas que el modelo no usó para ajustarse.", 4, 5),
        ],
    ),
    "u33": read(
        "import numpy as np\nx = np.array([10.0, 20.0, 30.0])\nmedia = x.mean()\nescala = x.std()\nz = (x - media) / escala\nprint(round(z.mean(), 6))\n",
        "La IA estandarizó una columna.",
        [
            q("¿Qué resta x - media?", "Centra los valores: el promedio pasa cerca de 0", ("Los convierte en probabilidades", "Borra el 20", "Calcula la accuracy"), "Restar la media quita el nivel y deja las distancias.", 4, 4),
            q("¿Por qué divide entre la desviación?", "Para que la escala no dependa de las unidades originales", ("Para sumar 1 a cada valor", "Porque std es el máximo", "Para crear un DataFrame"), "Dividir por std deja los valores en unidades de dispersión.", 3, 4),
            q("¿Qué estaría mal al calcular media y std con el set de prueba incluido en el ajuste?", "El examen se contaminaría con información de las filas que hay que evaluar", ("z.mean() no puede ser 0", "std siempre es 1 antes de dividir", "NumPy no resta arrays"), "La escala se aprende en entrenamiento y luego se aplica a la prueba.", 2, 4),
        ],
    ),
    "u34": read(
        "peso = 0.5\nsesgo = -1\nnota = 4\nlogit = peso * nota + sesgo\nprint(logit > 0)\n",
        "La IA armó el corazón de una predicción lineal.",
        [
            q("¿Qué combina peso * nota + sesgo?", "Una puntuación lineal de esa nota", ("La accuracy del examen", "Un árbol de decisión", "Un token"), "Es el mismo esquema de una regresión: coeficiente, dato y sesgo.", 4, 4),
            q("¿Qué decide logit > 0 aquí?", "Si esa puntuación cae del lado positivo", ("El valor de la nota original", "Cuántas filas hay", "El learning rate"), "4 * 0.5 - 1 = 1, así que la comparación es True.", 5, 5),
            q("¿Qué estaría mal al llamar a esto 'la probabilidad'?", "Es una puntuación. La probabilidad exigiría otra función, como una sigmoide", ("peso no puede ser 0.5", "sesgo suma notas", "print solo acepta probabilidades"), "logit no está entre 0 y 1. No se cita como probabilidad.", 4, 5),
        ],
    ),
    "u35": read(
        "arboles = 3\nprofundidad = 2\nprint(arboles)\nprint('cada árbol mira hasta', profundidad, 'cortes')\n",
        "La IA describió un bosque con árboles poco profundos.",
        [
            q("¿Qué es un árbol en este modelo?", "Una secuencia de preguntas que parten los datos", ("Un prompt", "Una columna de pandas", "El p-valor"), "Cada corte es una pregunta. La profundidad limita cuántas seguidas hay.", 4, 4),
            q("¿Por qué usar varios árboles?", "Para promediar votos y no fiarse de una sola partición", ("Porque un árbol no puede usar números", "Para borrar la profundidad", "Porque 3 es el learning rate"), "El bosque junta árboles. Un árbol solo se memoriza más fácil.", 1, 2),
            q("¿Qué estaría mal si la profundidad fuera enorme en pocos datos?", "El árbol puede memorizar filas en vez de una regla general", ("Entonces la profundidad es el n", "Los bosques no tienen profundidad", "print fallaría"), "Más cortes no significan mejor examen si el árbol vio las respuestas.", 2, 2),
        ],
    ),
    "u36": read(
        "vecinos = [(0, 'gato'), (1, 'gato'), (5, 'perro')]\nconsulta = 0.2\nordenado = sorted(vecinos, key=lambda v: abs(v[0] - consulta))\nprint(ordenado[0][1])\n",
        "La IA clasificó un punto mirando al vecino más cercano.",
        [
            q("¿Qué ordena la lambda?", "La distancia de cada vecino a la consulta", ("El nombre alfabético", "La longitud del string", "El índice del DataFrame"), "abs(v[0] - 0.2) es la distancia en la recta.", 4, 4),
            q("¿Por qué el resultado es gato?", "El punto 0 está más cerca de 0.2 que los otros", ("Porque hay más perros", "Porque sorted invierte las clases", "Porque 5 es el menor"), "KNN con un vecino copia la etiqueta del más cercano.", 4, 4),
            q("¿Qué estaría mal al no escalar las columnas antes?", "Una columna con números enormes dominaría la distancia", ("sorted no acepta tuplas", "lambda borra la clase", "El vecino 5 siempre gana"), "La distancia suma ejes. Si uno está en miles, tapa al resto.", 3, 4),
        ],
    ),
    "u37": read(
        "centros = [1, 10]\npuntos = [0, 2, 9, 11]\nfor p in puntos:\n    grupo = 0 if abs(p - centros[0]) < abs(p - centros[1]) else 1\n    print(p, grupo)\n",
        "La IA asignó cada punto al centro más cercano.",
        [
            q("¿Qué decide el if?", "A qué centro se parece más el punto", ("La media global", "Un árbol de tres cortes", "El token del prompt"), "Compara distancias a 1 y a 10.", 4, 4),
            q("¿Por qué 0 y 2 caen en el grupo 0?", "Están más cerca de 1 que de 10", ("Porque son pares", "Porque print los ordena", "Porque el centro 10 está vacío"), "K-means, en este paso, solo asigna. No explica la causa.", 2, 4),
            q("¿Qué estaría mal al tratar el número de grupo como una etiqueta real?", "El grupo es un cluster, no una clase que alguien anotó", ("abs no mide distancia", "Hay cuatro centros", "else no se ejecuta nunca"), "0 y 1 son ids del algoritmo. El sentido lo pones tú después.", 4, 5),
        ],
    ),
    "u38": read(
        "aciertos = 95\nn = 100\npositivos = 5\nprint(aciertos / n)\nprint(positivos / n)\n",
        "La IA celebró 95% de acierto en un problema desbalanceado.",
        [
            q("¿Qué es aciertos / n?", "La accuracy: fracción de filas bien clasificadas", ("El recall de la clase rara", "El tamaño del efecto", "Un p-valor"), "95 de 100 están bien. Eso solo no dice cuáles.", 4, 4),
            q("¿Qué aporta positivos / n?", "Recuerda que la clase de interés es el 5%", ("La accuracy", "El learning rate", "La profundidad del árbol"), "Si casi todo es negativo, acertar 'siempre no' ya da un número alto.", 3, 5),
            q("¿Qué está mal al publicar solo el 95%?", "Puede esconder que el modelo nunca encuentra los 5 casos que importan", ("n tiene que ser 95", "print divide mal", "positivos no se puede imprimir"), "En clases raras hacen falta recall o precisión, no solo accuracy.", 4, 5),
        ],
    ),
    "p5": read(
        "features = ['horas', 'repasos']\nobjetivo = 'aprobo'\nprint('Entradas:', features)\nprint('Salida:', objetivo)\n",
        "La IA nombró qué entra y qué sale de un modelo.",
        [
            q("¿Qué son features?", "Las columnas que el modelo puede mirar para predecir", ("La etiqueta que hay que adivinar", "El test de prueba", "Los tokens del prompt"), "horas y repasos son entradas. No son la respuesta.", 1, 3),
            q("¿Qué es objetivo?", "Lo que se quiere predecir: si aprobó", ("Una feature más", "El random_state", "La media de horas"), "aprobo es la etiqueta, no una entrada.", 2, 4),
            q("¿Qué estaría mal si aprobo también estuviera en features?", "El modelo vería la respuesta antes del examen", ("Habría que borrar horas", "print no acepta listas", "El objetivo debe ser numérico siempre"), "Filtrar la etiqueta de las entradas es parte de no hacer trampa.", 1, 2),
        ],
    ),
    "u39": read(
        "entradas = [0.2, 0.8]\npesos = [0.5, -0.5]\nsesgo = 0.1\npuntuacion = sum(e * p for e, p in zip(entradas, pesos)) + sesgo\nprint(round(puntuacion, 2))\n",
        "La IA calculó la puntuación de una neurona.",
        [
            q("¿Qué hace zip(entradas, pesos)?", "Empareja cada entrada con su peso", ("Entrena durante 10 épocas", "Normaliza a media 0", "Crea un DataFrame"), "0.2 va con 0.5 y 0.8 con -0.5.", 4, 4),
            q("¿Qué suma el sesgo?", "Un ajuste que no depende de las entradas", ("El número de capas", "La accuracy", "El learning rate"), "El sesgo se añade después de los productos.", 3, 4),
            q("¿Qué estaría mal al llamar a esta puntuación 'la clase predicha'?", "Falta una decisión o una activación. Esto es solo el número lineal", ("zip resta los pesos", "El sesgo borra las entradas", "round entrena la red"), "0.2*0.5 + 0.8*(-0.5) + 0.1 = -0.2. Aún no es una etiqueta.", 4, 5),
        ],
    ),
    "u40": read(
        "import numpy as np\nx = np.array([1.0, 2.0])\nw = np.array([0.4, 0.4])\nprint(float(x @ w))\n",
        "La IA escribió el producto que usarías en una capa lineal.",
        [
            q("¿Qué hace @ entre dos arrays?", "El producto punto: suma de multiplicar por pares", ("Concatena las listas", "Calcula la media", "Entrena por gradiente"), "1*0.4 + 2*0.4 = 1.2.", 4, 4),
            q("¿Por qué esto se parece a una capa de Keras o PyTorch?", "Una capa lineal combina entradas y pesos así", ("Porque numpy es un optimizador", "Porque @ guarda un checkpoint", "Porque float crea una red"), "El marco entrena esos pesos. Esta línea solo los aplica.", 2, 4),
            q("¿Qué estaría mal si x y w no tuvieran el mismo tamaño?", "El producto punto no puede emparejarlos", ("@ recorta el más largo", "float lo resuelve", "NumPy copia los pesos que faltan"), "Cada entrada necesita su peso. Si no, la forma no cierra.", 2, 4),
        ],
    ),
    "u41": read(
        "perdida = 1.0\nlr = 0.1\ngradiente = 2.0\nfor epoca in range(3):\n    perdida = perdida - lr * gradiente\nprint(round(perdida, 2))\n",
        "La IA simuló tres pasos de entrenamiento.",
        [
            q("¿Qué es una época en este bucle?", "Una pasada que actualiza el número", ("Un token del prompt", "Una fila de prueba", "El tamaño del batch en pandas"), "range(3) da tres actualizaciones.", 4, 5),
            q("¿Qué hace el learning rate 0.1?", "Escala qué tanto se resta el gradiente en cada paso", ("Fija la pérdida en 0.1", "Cuenta las épocas", "Borrala el gradiente"), "Cada paso resta 0.1 * 2 = 0.2.", 2, 5),
            q("¿Qué está simplificado de más?", "El gradiente no cambia. En un entrenamiento real se recalcula", ("range no puede ser 3", "lr tiene que ser negativo", "print entrena solo"), "Aquí la pérdida baja en línea recta. Un gradiente de verdad depende de los pesos.", 3, 5),
        ],
    ),
    "u42": read(
        "imagen = [\n    [0, 0, 1],\n    [0, 1, 0],\n    [1, 0, 0],\n]\nprint(len(imagen), len(imagen[0]))\nprint(sum(sum(fila) for fila in imagen))\n",
        "La IA guardó una imagen diminuta como matriz.",
        [
            q("¿Qué mide len(imagen), len(imagen[0])?", "Alto y ancho: 3 por 3", ("Los canales de color", "La accuracy", "El batch"), "Cada lista interna es una fila de píxeles.", 5, 5),
            q("¿Qué suma el doble sum?", "Cuántos píxeles están encendidos", ("El número de filas", "El índice del 1", "Una pérdida"), "Hay tres unos. El resto son ceros.", 6, 6),
            q("¿Qué estaría mal al aplanar la imagen y olvidar el alto y el ancho?", "Se pierde la forma: un 1 ya no sabe si es esquina o centro", ("sum no puede anidar", "len de una fila es 1", "Las matrices no pueden tener ceros"), "MNIST se puede aplanar, pero entonces el modelo ya no ve vecinos espaciales.", 1, 5),
        ],
    ),
    "u43": read(
        "texto = 'no me gustó'\npiezas = texto.split()\nvocab = {'no': 0, 'me': 1, 'gustó': 2}\nids = [vocab[p] for p in piezas]\nprint(ids)\n",
        "La IA convirtió una frase en ids.",
        [
            q("¿Qué es el vocabulario?", "Un dict de pieza a número", ("La etiqueta del sentimiento", "Un embedding entrenado", "El learning rate"), "Cada palabra conocida recibe un id estable.", 3, 3),
            q("¿Qué imprime ids?", "[0, 1, 2], en el orden de la frase", ("El texto original", "Un solo 0", "La longitud del embedding"), "split parte tres piezas y cada una se busca en el dict.", 2, 5),
            q("¿Qué está mal si aparece una palabra que no está en vocab?", "vocab[p] lanza KeyError. Hay que decidir un id para lo desconocido", ("split la borra", "ids la convierte en 0", "print la ignora"), "Un texto real trae palabras nuevas. El mapa tiene que tener un plan.", 4, 4),
        ],
    ),
    "p6": read(
        "pred = ['gato', 'perro', 'gato']\nreal = ['gato', 'gato', 'gato']\naciertos = sum(p == r for p, r in zip(pred, real))\nprint(aciertos, '/', len(real))\n",
        "La IA comparó predicciones de un clasificador de juguete.",
        [
            q("¿Qué cuenta la suma?", "Cuántas predicciones coinciden con lo real", ("Cuántas clases existen", "La pérdida", "Los tokens"), "La primera y la tercera coinciden. La segunda no.", 3, 3),
            q("¿Por qué imprime también len(real)?", "Porque 2 aciertos sin el n no se leen", ("Porque zip lo exige", "Porque pred está vacío", "Para calcular un gradiente"), "2/3 dice el tamaño del examen.", 4, 4),
            q("¿Qué estaría mal si pred y real tuvieran distinto largo?", "zip recorta al más corto y el n mentiría", ("== lanza un error siempre", "sum cuenta letras", "len(real) pasa a 0"), "Hay que afirmar que cada predicción tiene su etiqueta.", 1, 3),
        ],
    ),
    "boss1": read(
        "filas = [\n    {'canal': 'web', 'u': 4},\n    {'canal': 'tienda', 'u': None},\n]\nvalidas = [f for f in filas if f['u'] is not None]\nprint(len(filas), len(validas), sum(f['u'] for f in validas))\n",
        "La IA auditó un hallazgo antes de contarlo.",
        [
            q("¿Qué deja fuera la comprensión de lista?", "La fila cuyo valor es None", ("La fila de la web", "Todas las filas", "Los canales"), "validas solo tiene la web.", 4, 4),
            q("¿Por qué imprime tres números?", "n original, n usable y la suma de lo usable", ("Tres medias", "Tres p-valores", "Tres accuracy"), "2 filas, 1 usable, suma 4.", 5, 5),
            q("¿Qué estaría mal al decir 'la tienda vendió 0'?", "None no es 0. Es un dato que falta", ("len(validas) es 2", "sum incluye None", "La web no está"), "Convertir ausencia en cero inventa una venta.", 2, 4),
        ],
    ),
    "boss2": read(
        "puntos = [('web', 4), ('tienda', 2)]\nfor nombre, valor in puntos:\n    print(nombre, valor)\nprint('titulo: unidades de la semana 1')\n",
        "La IA listó un gráfico en texto y le puso título.",
        [
            q("¿Qué recorre el for?", "Cada par canal-valor", ("Los títulos", "Un modelo entrenado", "Los tokens del prompt"), "La primera vuelta es web 4. La segunda, tienda 2.", 2, 3),
            q("¿Por qué el título va aparte de los puntos?", "Los puntos son datos. El título es la frase que afirmas", ("print solo acepta una línea", "El for calcula el título", "valor es el periodo"), "Sin esa frase, 4 y 2 no dicen periodo ni métrica.", 4, 4),
            q("¿Qué estaría mal si el título dijera 'ingresos'?", "Los números son unidades, no dinero", ("La tienda vale 4", "El for está al revés", "print borra web"), "El título tiene que nombrar la misma magnitud que la altura.", 1, 4),
        ],
    ),
    "boss3": read(
        "proyecto = {\n    'pregunta': '¿Qué canal vendió más unidades en la semana 1?',\n    'n': 2,\n    'unidad': 'unidades',\n}\nprint(proyecto['pregunta'])\nprint(proyecto['n'], proyecto['unidad'])\n",
        "La IA armó la ficha de un proyecto de portafolio.",
        [
            q("¿Por qué la pregunta va en el dict?", "Porque el portafolio tiene que decir qué se quiso saber", ("Porque n es el modelo", "Porque print exige una clase", "Porque unidad entrena"), "Sin pregunta, los números no tienen oficio.", 2, 2),
            q("¿Qué documentan n y unidad?", "Cuántas filas sostienen el dato y en qué se mide", ("El learning rate y la época", "El prompt y el token", "La accuracy y el recall"), "n=2 y unidades acotan lo que se puede afirmar.", 3, 5),
            q("¿Qué estaría mal al publicar el proyecto sin el código que produjo el n?", "Nadie podría repetir el número", ("El dict no puede tener strings", "print cambia la pregunta", "n tiene que ser un float"), "Un portafolio se audita si la pregunta, el n y el código viajan juntos.", 1, 5),
        ],
    ),
    "da1": read(
        "pedidos = [4, 2, 6, 2]\nn = len(pedidos)\nmedia = sum(pedidos) / n\nprint(n)\nprint(media)\n",
        "La IA respondió una pregunta de análisis con n y media.",
        [
            q("¿Por qué imprime n antes de la media?", "Porque la media sin denominador no se puede auditar", ("Porque print ordena de mayor a menor", "Porque len es la media", "Porque sum ya divide"), "n=4 dice cuántos pedidos sostienen 3.5.", 2, 5),
            q("¿Qué pregunta sí contesta este código?", "Cuál es el promedio de esos pedidos y con qué n", ("Qué canal vende siempre más", "Si el gráfico es bonito", "El p-valor de la diferencia"), "Solo hay una lista. No hay canales ni prueba estadística.", 1, 5),
            q("¿Qué estaría mal al decir 'el canal web es mejor'?", "El código no tiene canales. Esa frase no sale de estos números", ("media está mal dividida", "n incluye el 0", "print borra el 6"), "Interpretar de más es el fallo. El cálculo solo habla de esos cuatro pedidos.", 1, 3),
        ],
    ),
    "da2": read(
        "import pandas as pd\ndf = pd.DataFrame({'edad': [20, None, 30]})\nprint(df['edad'].isna().sum())\nlimpio = df.dropna()\nprint(len(df), len(limpio))\n",
        "La IA contó nulos sin esconder la tabla original.",
        [
            q("¿Qué cuenta isna().sum()?", "Cuántas edades faltan", ("Cuántas filas quedan después de borrar", "La media de edad", "Las columnas del DataFrame"), "Hay un None. El conteo es 1.", 3, 3),
            q("¿Por qué limpio es otra variable y no df = dropna()?", "Para conservar el antes y el después", ("Porque dropna no existe", "Porque len solo funciona una vez", "Porque None es cero"), "df sigue en 3 filas. limpio queda en 2.", 4, 5),
            q("¿Qué estaría mal al rellenar el nulo con 0 y no decirlo?", "Inventas una edad y el promedio deja de ser el de los datos vistos", ("isna() se rompe", "len(df) pasa a 0", "dropna suma las edades"), "Limpiar sin documentar el cambio es esconder el sucio.", 3, 4),
        ],
    ),
    "da3": read(
        "n = 2\nweb = 4\ntienda = 2\nprint(f'web {web} unidades, tienda {tienda} unidades, n={n}')\n",
        "La IA escribió el hallazgo que iría bajo un gráfico.",
        [
            q("¿Por qué la frase repite la palabra unidades?", "Para que 4 y 2 no se lean como pesos ni como personas", ("Porque f-string duplica los números", "Porque n tiene que ser texto", "Porque print traduce solo"), "La unidad viaja con el número.", 4, 4),
            q("¿Qué aporta n=2?", "Dice que la comparación sale de dos filas", ("Es el total de unidades", "Es el promedio", "Es el p-valor"), "Sin n, no se sabe si el doble es una anécdota o una muestra grande.", 1, 4),
            q("¿Qué estaría mal si el título dijera 'la web siempre duplica a la tienda'?", "Siempre no está en los datos. Solo hay un recorte con n=2", ("4 es menor que 2", "El f-string calcula una tendencia", "n sobra cuando hay unidades"), "El código cuenta un recorte. El título no puede promoverlo a ley.", 4, 4),
        ],
    ),
    "ag1": read(
        "prompt = 'Eres analista. Resume en 2 frases. Cita n y la unidad.'\npiezas = prompt.split()\nprint(len(piezas))\nprint(piezas[0])\n",
        "Una IA escribió un prompt y lo partió como si cada palabra fuera un token.",
        [
            q("¿Qué es este prompt?", "La instrucción: rol, formato y la evidencia que debe citar", ("El peso del modelo", "Un CSV de ventas", "La ventana de contexto completa"), "El texto le dice al modelo quién es y cómo debe responder.", 1, 1),
            q("¿Por qué split() no basta para contar tokens?", "Un tokenizador real parte subpalabras, no solo espacios", ("Porque len no existe", "Porque el prompt está vacío", "Porque print consume tokens"), "len(piezas) es un conteo de palabras de juguete, no la factura del modelo.", 2, 3),
            q("¿Qué está mal si se cree que piezas[0] es el primer token del modelo?", "Eres es la primera palabra, no necesariamente el primer token", ("El prompt no tiene rol", "split() entrena el modelo", "Cita n borra el texto"), "Los tokens no coinciden siempre con las palabras. Hay que decir que esto es un modelo mental.", 2, 4),
        ],
    ),
    "ag2": read(
        "server = {'name': 'ventas', 'tools': ['buscar', 'leer']}\npedido = {'tool': 'borrar', 'arg': 'todo'}\npermitida = pedido['tool'] in server['tools']\nprint(server['name'])\nprint(permitida)\n",
        "La IA simuló un servidor MCP recibiendo una llamada.",
        [
            q("¿Qué publica este server?", "Un nombre y la lista de herramientas que sí existen", ("Un modelo entrenado", "Un prompt del usuario", "Las filas de un CSV"), "buscar y leer están en el contrato. borrar no.", 1, 1),
            q("¿Qué revisa permitida?", "Si la herramienta pedida está en el inventario", ("Si el argumento es un número", "Si el server se llama borrar", "Si hay presupuesto de tokens"), "in mira la lista tools. borrar no está.", 3, 3),
            q("¿Qué está mal si el host ejecuta el pedido aunque permitida sea False?", "Se salta el contrato MCP y corre una herramienta que el server no ofreció", ("print invierte el booleano", "tools no puede ser una lista", "name tiene que ser el del pedido"), "El contrato es la lista. Fuera de ella, la llamada se rechaza.", 2, 5),
        ],
    ),
    "ag3": read(
        "pasos = 4\nmax_pasos = 4\nhecho = False\nparar = hecho or pasos >= max_pasos\nprint(parar)\n",
        "La IA escribió la parada de un harness.",
        [
            q("¿Qué es max_pasos?", "El presupuesto: cuántas acciones puede intentar", ("La respuesta final", "El nombre de la skill", "El número de tokens de una palabra"), "El harness corta aunque el modelo quiera seguir.", 2, 2),
            q("¿Por qué parar es True si hecho es False?", "Porque ya se gastó el presupuesto de pasos", ("Porque or exige que las dos sean True", "Porque print niega el valor", "Porque 4 es menor que 4"), "or para si terminó o si se acabaron los pasos. Aquí se acabaron.", 4, 5),
            q("¿Qué estaría mal sin esta condición?", "El agente podría seguir llamando herramientas sin límite", ("hecho pasaría a True solo", "max_pasos se imprime", "or no existe en Python"), "Un bucle sin parada no es un agente controlado: es gasto infinito.", 1, 4),
        ],
    ),
}


def main() -> None:
    ids: list[str] = []
    for name in ("curriculum.json", "datos-curriculum.json", "agentes-curriculum.json"):
        payload = json.loads((ROOT / name).read_text(encoding="utf-8"))
        for section in payload["sections"]:
            ids.extend(unit["id"] for unit in section["units"])
    missing = [uid for uid in ids if uid not in READS]
    extra = [uid for uid in READS if uid not in ids]
    if missing or extra:
        raise SystemExit(f"missing={missing} extra={extra}")
    out: dict[str, dict] = {}
    for uid, raw in READS.items():
        questions = raw["questions"]
        if len(questions) != 3:
            raise SystemExit(f"{uid} needs 3 questions")
        lines = raw["starterCode"].count("\n")
        for item in questions:
            if len(item["choices"]) != 4:
                raise SystemExit(f"{uid} needs 4 choices")
            start, end = item["focusLines"]
            if not (1 <= start <= end <= lines):
                raise SystemExit(f"{uid} focus {start}-{end} outside {lines} lines")
        out[uid] = {
            "id": f"{uid}-ai",
            "type": "ai_interpret",
            "prompt": raw["prompt"],
            "difficulty": 2,
            "xp": 16,
            "explanation": "Leíste el código como revisor: qué hace, por qué está escrito así y qué no se sostiene.",
            "solution": " | ".join(
                choice["text"]
                for item in questions
                for choice in item["choices"]
                if choice["id"] == item["correctChoiceId"]
            ),
            "starterCode": raw["starterCode"],
            "aiQuestions": questions,
        }
    path = ROOT / "ai-reads.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path.name} — {len(out)} readings")


if __name__ == "__main__":
    main()
