"""Lecciones adicionales de los trayectos S0, S1 y S2 de PyQuest."""


def u1(h):
    return {
        "u1": [
            h["lesson"](
                "u1-l2",
                "Afianza: recetas precisas",
                "Relaciona un programa con una receta y evita errores al mostrar texto.",
                [
                    h["mc"](
                        "u1-l2-e1",
                        "Si un programa es una receta, ¿qué representa cada línea?",
                        [
                            ("a", "Una instrucción concreta que Python ejecuta"),
                            ("b", "Un resultado que Python adivina"),
                            ("c", "Un comentario obligatorio"),
                        ],
                        "a",
                        "Python sigue instrucciones explícitas y en orden, como quien sigue los pasos de una receta.",
                    ),
                    h["predict"](
                        "u1-l2-e2",
                        "¿Qué imprime este programa?",
                        "print('uno')\n# print('dos')\nprint('tres')",
                        "uno\ntres",
                        "La línea que empieza con # es un comentario y no se ejecuta.",
                    ),
                    h["fill"](
                        "u1-l2-e3",
                        "Completa la instrucción que muestra el saludo.",
                        "___('Hola, PyQuest')",
                        [{"accepted": ["print"]}],
                        "print envía el valor entre paréntesis a la salida.",
                    ),
                    h["find_err"](
                        "u1-l2-e4",
                        "¿Por qué falla `print(Hola)` si no existe una variable llamada Hola?",
                        [
                            ("a", "Faltan comillas para indicar que Hola es texto"),
                            ("b", "print solo admite números"),
                            ("c", "Todo programa necesita un comentario antes"),
                        ],
                        "a",
                        "Sin comillas, Python interpreta Hola como el nombre de una variable.",
                    ),
                ],
                level=2,
            ),
            h["lesson"](
                "u1-l3",
                "Practica: mensajes en orden",
                "Aplica print y comentarios a una secuencia nueva de instrucciones.",
                [
                    h["code"](
                        "u1-l3-e1",
                        "Crea `mensaje = 'Listo'` e imprime primero `Inicio` y después el valor de `mensaje`.",
                        "",
                        ["mensaje == 'Listo'"],
                        "mensaje = 'Listo'\nprint('Inicio')\nprint(mensaje)",
                        "Las instrucciones se ejecutan de arriba abajo y print puede recibir texto literal o variables.",
                        expected_stdout="Inicio\nListo",
                    ),
                    h["mc"](
                        "u1-l3-e2",
                        "¿Qué comentario explica mejor `print(total)`?",
                        [
                            ("a", "# Muestra el total calculado"),
                            ("b", "# Python hace algo"),
                            ("c", "# total siempre vale cero"),
                        ],
                        "a",
                        "Un comentario útil explica la intención sin afirmar algo que el código no garantiza.",
                    ),
                    h["predict"](
                        "u1-l3-e3",
                        "¿Cuál es la salida exacta?",
                        "print(7)\nprint('7')",
                        "7\n7",
                        "El número 7 y el texto '7' se ven igual al imprimirlos, aunque son valores de tipos distintos.",
                    ),
                    h["matching"](
                        "u1-l3-e4",
                        "Empareja cada elemento con su función.",
                        [
                            {"id": "l1", "text": "print('dato')"},
                            {"id": "l2", "text": "# revisar mañana"},
                            {"id": "l3", "text": "'dato'"},
                        ],
                        [
                            {"id": "r1", "text": "Muestra un valor"},
                            {"id": "r2", "text": "Documenta sin ejecutarse"},
                            {"id": "r3", "text": "Representa texto"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "print muestra, # comenta y las comillas delimitan un string.",
                    ),
                ],
                level=3,
            ),
            h["lesson"](
                "u1-l4",
                "Demuestra: explica el fallo",
                "Transfiere lo aprendido para ordenar y corregir un pequeño programa.",
                [
                    h["find_err"](
                        "u1-l4-e1",
                        "El programa debe mostrar `Ruta lista`, pero contiene `print('Ruta)`. ¿Qué está mal?",
                        [
                            ("a", "La comilla de cierre no coincide y el texto queda sin terminar"),
                            ("b", "La palabra Ruta está reservada"),
                            ("c", "print necesita dos pares de paréntesis"),
                        ],
                        "a",
                        "Todo literal de texto debe abrir y cerrar con comillas compatibles.",
                    ),
                    h["code"](
                        "u1-l4-e2",
                        "Guarda `curso = 'Python'` y muestra `Curso:` seguido del valor usando dos argumentos de print.",
                        "",
                        ["curso == 'Python'"],
                        "curso = 'Python'\nprint('Curso:', curso)",
                        "print separa sus argumentos con un espacio, por eso produce una etiqueta legible.",
                        expected_stdout="Curso: Python",
                    ),
                    h["reorder"](
                        "u1-l4-e3",
                        "Ordena el programa para anunciar una tarea después de definirla.",
                        [
                            {"id": "a", "code": "tarea = 'analizar datos'"},
                            {"id": "b", "code": "# La tarea ya está definida"},
                            {"id": "c", "code": "print(tarea)"},
                        ],
                        ["a", "b", "c"],
                        "La variable debe existir antes de usarla; el comentario puede documentar ese momento.",
                    ),
                    h["predict"](
                        "u1-l4-e4",
                        "¿Por qué solo aparece una línea y cuál es?",
                        "# print('oculto')\nprint('visible')",
                        "visible",
                        "Los comentarios permiten desactivar una explicación o una instrucción sin producir salida.",
                    ),
                ],
                level=4,
            ),
        ]
    }


def u2(h):
    return {
        "u2": [
            h["lesson"](
                "u2-l2",
                "Afianza: cajas y etiquetas",
                "Usa la analogía de cajas con nombre para distinguir valores y tipos.",
                [
                    h["mc"](
                        "u2-l2-e1",
                        "Una variable se parece a una caja etiquetada porque…",
                        [
                            ("a", "su nombre permite recuperar el valor guardado"),
                            ("b", "solo puede contener texto"),
                            ("c", "su valor no puede cambiar"),
                        ],
                        "a",
                        "El nombre referencia un valor y puede reasignarse a otro durante el programa.",
                    ),
                    h["predict"](
                        "u2-l2-e2",
                        "¿Qué nombre de tipo se imprime?",
                        "precio = 3.5\nprint(type(precio).__name__)",
                        "float",
                        "Un número con parte decimal se representa normalmente como float.",
                    ),
                    h["fill"](
                        "u2-l2-e3",
                        "Completa el valor booleano que indica que la sesión está activa.",
                        "activa = ___",
                        [{"accepted": ["True"]}],
                        "Los booleanos de Python son True y False, con inicial mayúscula.",
                    ),
                    h["find_err"](
                        "u2-l2-e4",
                        "`edad = '30'` se usa después en `edad + 1`. ¿Por qué falla?",
                        [
                            ("a", "edad es str y no se suma directamente con un int"),
                            ("b", "30 es demasiado grande para Python"),
                            ("c", "Las variables no admiten operaciones"),
                        ],
                        "a",
                        "Las comillas convierten 30 en texto; usa int(edad) antes de sumarle un entero.",
                    ),
                ],
                level=2,
            ),
            h["lesson"](
                "u2-l3",
                "Practica: cambia de tipo",
                "Convierte valores nuevos y comprueba cómo influye el tipo en una operación.",
                [
                    h["code"](
                        "u2-l3-e1",
                        "Dado `cantidad_texto = '12'`, crea `cantidad` como entero y `doble` con el doble de cantidad.",
                        "cantidad_texto = '12'\n",
                        ["cantidad == 12", "doble == 24"],
                        "cantidad_texto = '12'\ncantidad = int(cantidad_texto)\ndoble = cantidad * 2\nprint(doble)",
                        "int convierte dígitos escritos como texto en un entero que sí admite aritmética.",
                        expected_stdout="24",
                    ),
                    h["mc"](
                        "u2-l3-e2",
                        "¿Cuál de estos valores es un bool y no un str?",
                        [
                            ("a", "False"),
                            ("b", "'False'"),
                            ("c", "\"False\""),
                        ],
                        "a",
                        "Sin comillas, False es booleano; con comillas es texto.",
                    ),
                    h["predict"](
                        "u2-l3-e3",
                        "¿Qué imprime la repetición del string?",
                        "veces = '4'\nprint(veces * 3)",
                        "444",
                        "Multiplicar un string por 3 repite su contenido; no realiza 4 por 3.",
                    ),
                    h["matching"](
                        "u2-l3-e4",
                        "Empareja cada valor con su tipo.",
                        [
                            {"id": "l1", "text": "18"},
                            {"id": "l2", "text": "18.0"},
                            {"id": "l3", "text": "'18'"},
                            {"id": "l4", "text": "True"},
                        ],
                        [
                            {"id": "r1", "text": "int"},
                            {"id": "r2", "text": "float"},
                            {"id": "r3", "text": "str"},
                            {"id": "r4", "text": "bool"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "La notación del valor permite anticipar su tipo antes de usar type.",
                    ),
                ],
                level=3,
            ),
            h["lesson"](
                "u2-l4",
                "Demuestra: datos compatibles",
                "Corrige mezclas de tipos y razona sobre una reasignación.",
                [
                    h["find_err"](
                        "u2-l4-e1",
                        "¿Por qué `mensaje = 'Total: ' + 8` no construye el texto esperado?",
                        [
                            ("a", "No se concatena str con int sin convertir el entero"),
                            ("b", "El signo + solo sirve para restar"),
                            ("c", "mensaje debe llamarse texto"),
                        ],
                        "a",
                        "Usa 'Total: ' + str(8) o un f-string para combinar texto y números.",
                    ),
                    h["code"](
                        "u2-l4-e2",
                        "Dado `entrada = '7.5'`, crea `medida` como float y `redondeada` como int de esa medida.",
                        "entrada = '7.5'\n",
                        ["medida == 7.5", "redondeada == 7"],
                        "entrada = '7.5'\nmedida = float(entrada)\nredondeada = int(medida)\nprint(redondeada)",
                        "float acepta el decimal escrito como texto; int aplicado al float trunca hacia cero.",
                        expected_stdout="7",
                    ),
                    h["mc"](
                        "u2-l4-e3",
                        "Después de `dato = 2` y `dato = 'dos'`, ¿qué afirmación es correcta?",
                        [
                            ("a", "dato referencia ahora un str"),
                            ("b", "dato conserva a la vez int y str"),
                            ("c", "Python prohíbe cambiar el tipo asociado a un nombre"),
                        ],
                        "a",
                        "Python tiene tipado dinámico: el nombre pasa a referenciar el último valor asignado.",
                    ),
                    h["predict"](
                        "u2-l4-e4",
                        "¿Qué imprime tras la reasignación?",
                        "estado = False\nestado = not estado\nprint(estado)",
                        "True",
                        "not invierte el booleano y la segunda asignación reemplaza el valor anterior.",
                    ),
                ],
                level=4,
            ),
        ]
    }


def u3(h):
    return {
        "u3": [
            h["lesson"](
                "u3-l2",
                "Afianza: reglas de cálculo",
                "Compara los operadores con reglas de una calculadora y detecta precedencias engañosas.",
                [
                    h["mc"](
                        "u3-l2-e1",
                        "¿Por qué `2 + 3 * 4` vale 14 y no 20?",
                        [
                            ("a", "La multiplicación tiene prioridad sobre la suma"),
                            ("b", "Python ignora el primer número"),
                            ("c", "Las operaciones siempre se leen de derecha a izquierda"),
                        ],
                        "a",
                        "La precedencia aplica primero 3 * 4; los paréntesis permiten cambiar ese orden.",
                    ),
                    h["predict"](
                        "u3-l2-e2",
                        "¿Qué imprime al forzar la suma primero?",
                        "print((2 + 3) * 4)",
                        "20",
                        "Los paréntesis convierten 2 + 3 en la primera operación.",
                    ),
                    h["fill"](
                        "u3-l2-e3",
                        "Completa la división entera que produce 3.",
                        "resultado = 17 ___ 5",
                        [{"accepted": ["//"]}],
                        "// conserva el cociente entero; % conservaría el resto.",
                    ),
                    h["find_err"](
                        "u3-l2-e4",
                        "Se quiere aceptar edades entre 18 y 65, pero se escribe `edad >= 18 or edad <= 65`. ¿Qué falla?",
                        [
                            ("a", "Debe usarse and para exigir ambos límites"),
                            ("b", "Los números deben llevar comillas"),
                            ("c", "or solo funciona con strings"),
                        ],
                        "a",
                        "Con or casi cualquier edad cumple al menos una condición; el intervalo exige las dos.",
                    ),
                ],
                level=2,
            ),
            h["lesson"](
                "u3-l3",
                "Practica: cocientes y filtros",
                "Aplica operadores con otros números y relaciona cada símbolo con su resultado.",
                [
                    h["code"](
                        "u3-l3-e1",
                        "Para `total = 29` y `grupos = 6`, guarda `completos` con el cociente entero y `sobran` con el resto.",
                        "total = 29\ngrupos = 6\n",
                        ["completos == 4", "sobran == 5"],
                        "total = 29\ngrupos = 6\ncompletos = total // grupos\nsobran = total % grupos\nprint(completos, sobran)",
                        "// cuenta grupos completos y % calcula los elementos que quedan.",
                        expected_stdout="4 5",
                    ),
                    h["mc"](
                        "u3-l3-e2",
                        "¿Qué expresión detecta correctamente si `n` es múltiplo de 3?",
                        [
                            ("a", "n % 3 == 0"),
                            ("b", "n / 3 == 0"),
                            ("c", "n // 3 == 0"),
                        ],
                        "a",
                        "Un múltiplo deja resto cero al dividirlo entre 3.",
                    ),
                    h["predict"](
                        "u3-l3-e3",
                        "¿Qué valor booleano se imprime?",
                        "x = 9\nprint(x > 5 and x != 10)",
                        "True",
                        "9 supera 5 y es distinto de 10, así que ambas comparaciones son verdaderas.",
                    ),
                    h["matching"](
                        "u3-l3-e4",
                        "Empareja la expresión con su resultado.",
                        [
                            {"id": "l1", "text": "3 ** 2"},
                            {"id": "l2", "text": "14 % 4"},
                            {"id": "l3", "text": "14 // 4"},
                            {"id": "l4", "text": "not True"},
                        ],
                        [
                            {"id": "r1", "text": "9"},
                            {"id": "r2", "text": "2"},
                            {"id": "r3", "text": "3"},
                            {"id": "r4", "text": "False"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3", "l4": "r4"},
                        "** eleva, % da el resto, // el cociente entero y not niega.",
                    ),
                ],
                level=3,
            ),
            h["lesson"](
                "u3-l4",
                "Demuestra: fórmulas fiables",
                "Transfiere los operadores a descuentos y explica errores frecuentes.",
                [
                    h["find_err"](
                        "u3-l4-e1",
                        "Para elevar 5 al cuadrado se escribe `5 ^ 2`. ¿Por qué es incorrecto?",
                        [
                            ("a", "^ es XOR; la potencia se escribe **"),
                            ("b", "^ solo eleva números negativos"),
                            ("c", "Python no tiene potencias"),
                        ],
                        "a",
                        "En Python la exponenciación usa ** y ^ realiza una operación binaria distinta.",
                    ),
                    h["code"](
                        "u3-l4-e2",
                        "Con `precio = 80` y `descuento = 25`, calcula `final` aplicando el porcentaje de descuento.",
                        "precio = 80\ndescuento = 25\n",
                        ["abs(final - 60) < 1e-9"],
                        "precio = 80\ndescuento = 25\nfinal = precio * (1 - descuento / 100)\nprint(final)",
                        "Convertir 25 a 0.25 y restarlo de 1 conserva el 75 % del precio.",
                        expected_stdout="60.0",
                    ),
                    h["reorder"](
                        "u3-l4-e3",
                        "Ordena las operaciones para comprobar si un total está dentro del presupuesto.",
                        [
                            {"id": "a", "code": "subtotal = 12 * 3"},
                            {"id": "b", "code": "envio = 4"},
                            {"id": "c", "code": "total = subtotal + envio"},
                            {"id": "d", "code": "print(total <= 40)"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero se calculan las partes, después el total y finalmente la comparación.",
                    ),
                    h["predict"](
                        "u3-l4-e4",
                        "¿Qué imprime esta validación?",
                        "puntos = 72\nprint(puntos >= 50 and not puntos > 100)",
                        "True",
                        "72 alcanza el mínimo y no supera 100, por lo que la condición completa es verdadera.",
                    ),
                ],
                level=4,
            ),
        ]
    }


def u4(h):
    return {
        "u4": [
            h["lesson"](
                "u4-l2",
                "Afianza: texto inmutable",
                "Piensa en los strings como tiras selladas y evita confundir métodos con cambios directos.",
                [
                    h["mc"](
                        "u4-l2-e1",
                        "¿Qué implica que un string sea como una tira sellada?",
                        [
                            ("a", "Para cambiarlo hay que crear otro string"),
                            ("b", "No se puede leer ningún carácter"),
                            ("c", "Todos los strings tienen la misma longitud"),
                        ],
                        "a",
                        "Los métodos de string devuelven nuevos valores; no alteran los caracteres del original.",
                    ),
                    h["predict"](
                        "u4-l2-e2",
                        "¿Qué se imprime si no se guarda el resultado del método?",
                        "nombre = '  Ada  '\nnombre.strip()\nprint(nombre)",
                        "  Ada  ",
                        "strip devuelve un string nuevo; nombre sigue conservando sus espacios.",
                    ),
                    h["fill"](
                        "u4-l2-e3",
                        "Completa el método que normaliza el texto a minúsculas.",
                        "clave = 'PyThOn'.___()",
                        [{"accepted": ["lower"]}],
                        "lower crea una versión en minúsculas útil para comparar entradas.",
                    ),
                    h["find_err"](
                        "u4-l2-e4",
                        "¿Por qué falla `palabra = 'sol'; print(palabra[3])`?",
                        [
                            ("a", "Los índices válidos son 0, 1 y 2"),
                            ("b", "Los strings solo admiten índices negativos"),
                            ("c", "sol debe escribirse sin comillas"),
                        ],
                        "a",
                        "La longitud es 3, así que el último índice es len(palabra) - 1, es decir, 2.",
                    ),
                ],
                level=2,
            ),
            h["lesson"](
                "u4-l3",
                "Practica: corta y compone",
                "Aplica slicing y composición de texto con palabras diferentes.",
                [
                    h["code"](
                        "u4-l3-e1",
                        "Con `nombre = 'Luna'` y `apellido = 'Vega'`, crea `iniciales = 'LV'` usando índices.",
                        "nombre = 'Luna'\napellido = 'Vega'\n",
                        ["iniciales == 'LV'"],
                        "nombre = 'Luna'\napellido = 'Vega'\niniciales = nombre[0] + apellido[0]\nprint(iniciales)",
                        "Cada índice 0 toma la primera letra y + concatena ambos strings.",
                        expected_stdout="LV",
                    ),
                    h["mc"](
                        "u4-l3-e2",
                        "¿Qué slice extrae los tres últimos caracteres de `codigo`?",
                        [
                            ("a", "codigo[-3:]"),
                            ("b", "codigo[:3]"),
                            ("c", "codigo[3:0]"),
                        ],
                        "a",
                        "El índice -3 empieza tres posiciones desde el final y el extremo vacío llega hasta el final.",
                    ),
                    h["predict"](
                        "u4-l3-e3",
                        "¿Qué imprime el slice con paso 2?",
                        "texto = 'abcdefg'\nprint(texto[1:7:2])",
                        "bdf",
                        "Empieza en b, avanza de dos en dos y excluye el índice 7.",
                    ),
                    h["matching"](
                        "u4-l3-e4",
                        "Empareja cada transformación con su resultado.",
                        [
                            {"id": "l1", "text": "'dato'.capitalize()"},
                            {"id": "l2", "text": "'a-b'.split('-')"},
                            {"id": "l3", "text": "'uno dos'.replace(' ', '_')"},
                        ],
                        [
                            {"id": "r1", "text": "'Dato'"},
                            {"id": "r2", "text": "['a', 'b']"},
                            {"id": "r3", "text": "'uno_dos'"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "capitalize cambia la caja, split separa y replace sustituye dentro de un nuevo string.",
                    ),
                ],
                level=3,
            ),
            h["lesson"](
                "u4-l4",
                "Demuestra: transforma sin perder",
                "Explica por qué una transformación no persiste y construye texto reutilizable.",
                [
                    h["find_err"](
                        "u4-l4-e1",
                        "`etiqueta = 'azul'; etiqueta.upper(); print(etiqueta)` muestra `azul`. ¿Por qué?",
                        [
                            ("a", "No se asignó el nuevo string devuelto por upper"),
                            ("b", "upper solo funciona con números"),
                            ("c", "print siempre convierte a minúsculas"),
                        ],
                        "a",
                        "Debe escribirse etiqueta = etiqueta.upper() si se quiere conservar el resultado.",
                    ),
                    h["code"](
                        "u4-l4-e2",
                        "Con `producto = 'café'` y `unidades = 4`, crea `resumen` con el texto `café: 4 unidades` usando un f-string.",
                        "producto = 'café'\nunidades = 4\n",
                        ["resumen == 'café: 4 unidades'"],
                        "producto = 'café'\nunidades = 4\nresumen = f'{producto}: {unidades} unidades'\nprint(resumen)",
                        "El f-string convierte e inserta los valores sin concatenar tipos incompatibles.",
                        expected_stdout="café: 4 unidades",
                    ),
                    h["reorder"](
                        "u4-l4-e3",
                        "Ordena la normalización de una etiqueta recibida con espacios.",
                        [
                            {"id": "a", "code": "entrada = '  Datos Abiertos  '"},
                            {"id": "b", "code": "limpia = entrada.strip()"},
                            {"id": "c", "code": "normalizada = limpia.lower().replace(' ', '-')"},
                            {"id": "d", "code": "print(normalizada)"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero se quitan bordes, luego se normaliza el caso y finalmente se sustituyen espacios.",
                    ),
                    h["predict"](
                        "u4-l4-e4",
                        "¿Qué muestra el original después de replace?",
                        "texto = '2025/06'\nnuevo = texto.replace('/', '-')\nprint(texto)\nprint(nuevo)",
                        "2025/06\n2025-06",
                        "replace crea nuevo; conservar ambas variables permite ver la inmutabilidad.",
                    ),
                ],
                level=4,
            ),
        ]
    }


def u5(h):
    return {
        "u5": [
            h["lesson"](
                "u5-l2",
                "Afianza: listas compartidas",
                "Compara las listas con pizarras editables y reconoce alias y copias.",
                [
                    h["mc"](
                        "u5-l2-e1",
                        "Si `b = a` y ambas variables son listas, ¿qué ocurre normalmente?",
                        [
                            ("a", "Las dos apuntan a la misma lista"),
                            ("b", "b recibe siempre una copia independiente"),
                            ("c", "a se convierte en tupla"),
                        ],
                        "a",
                        "Asignar otra variable no copia el objeto; una mutación desde b también se observa desde a.",
                    ),
                    h["predict"](
                        "u5-l2-e2",
                        "¿Qué imprime al mutar mediante el alias?",
                        "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
                        "[1, 2, 3]",
                        "a y b referencian la misma lista, por eso append se ve desde ambos nombres.",
                    ),
                    h["fill"](
                        "u5-l2-e3",
                        "Completa una copia superficial independiente de la lista.",
                        "original = [4, 5]\ncopia = original.___()",
                        [{"accepted": ["copy"]}],
                        "copy crea otra lista para que append o sort no alteren el contenedor original.",
                    ),
                    h["find_err"](
                        "u5-l2-e4",
                        "Se escribe `ordenada = datos.sort()` y ordenada queda en None. ¿Por qué?",
                        [
                            ("a", "sort modifica datos y no devuelve la lista"),
                            ("b", "sort solo ordena strings"),
                            ("c", "Falta convertir datos en set"),
                        ],
                        "a",
                        "Usa datos.sort() y luego datos, o sorted(datos) para obtener una lista nueva.",
                    ),
                ],
                level=2,
            ),
            h["lesson"](
                "u5-l3",
                "Practica: filtra colecciones",
                "Construye y transforma listas con valores distintos a los ejemplos iniciales.",
                [
                    h["code"](
                        "u5-l3-e1",
                        "Dada `medidas = [3, 8, 2, 10, 5]`, crea `altas` con los valores mayores que 5.",
                        "medidas = [3, 8, 2, 10, 5]\n",
                        ["altas == [8, 10]"],
                        "medidas = [3, 8, 2, 10, 5]\naltas = [x for x in medidas if x > 5]\nprint(altas)",
                        "La condición al final de la comprensión conserva solo los valores que la cumplen.",
                        expected_stdout="[8, 10]",
                    ),
                    h["mc"](
                        "u5-l3-e2",
                        "¿Qué expresión crea los cuadrados de 1, 2 y 3?",
                        [
                            ("a", "[x ** 2 for x in [1, 2, 3]]"),
                            ("b", "[1, 2, 3] ** 2"),
                            ("c", "[x for [1, 2, 3]]"),
                        ],
                        "a",
                        "La comprensión evalúa x ** 2 una vez por cada elemento.",
                    ),
                    h["predict"](
                        "u5-l3-e3",
                        "¿Qué lista queda después de insertar y eliminar?",
                        "xs = [2, 4]\nxs.insert(1, 3)\nxs.remove(4)\nprint(xs)",
                        "[2, 3]",
                        "insert coloca 3 en el índice 1 y remove borra la primera aparición del valor 4.",
                    ),
                    h["matching"](
                        "u5-l3-e4",
                        "Empareja la necesidad con la operación.",
                        [
                            {"id": "l1", "text": "Añadir varios elementos"},
                            {"id": "l2", "text": "Contar apariciones de 7"},
                            {"id": "l3", "text": "Obtener una copia ordenada"},
                        ],
                        [
                            {"id": "r1", "text": "extend"},
                            {"id": "r2", "text": "count"},
                            {"id": "r3", "text": "sorted"},
                        ],
                        {"l1": "r1", "l2": "r2", "l3": "r3"},
                        "extend amplía, count cuenta valores iguales y sorted conserva el original.",
                    ),
                ],
                level=3,
            ),
            h["lesson"](
                "u5-l4",
                "Demuestra: muta con intención",
                "Resuelve transformaciones de listas sin caer en mutaciones accidentales.",
                [
                    h["find_err"](
                        "u5-l4-e1",
                        "Se eliminan negativos de una lista mientras se recorre la misma lista. ¿Cuál es el riesgo?",
                        [
                            ("a", "Al cambiar índices durante el bucle pueden saltarse elementos"),
                            ("b", "Las listas no admiten números negativos"),
                            ("c", "remove convierte la lista en string"),
                        ],
                        "a",
                        "Es más seguro construir otra lista filtrada o recorrer una copia.",
                    ),
                    h["code"](
                        "u5-l4-e2",
                        "Con `cola = ['B', 'C', 'A']`, crea `rotada = ['A', 'B', 'C']` sin modificar `cola`.",
                        "cola = ['B', 'C', 'A']\n",
                        ["rotada == ['A', 'B', 'C']", "cola == ['B', 'C', 'A']"],
                        "cola = ['B', 'C', 'A']\nrotada = cola[-1:] + cola[:-1]\nprint(rotada)",
                        "Los slices crean piezas nuevas que se pueden concatenar sin mutar la lista original.",
                        expected_stdout="['A', 'B', 'C']",
                    ),
                    h["reorder"](
                        "u5-l4-e3",
                        "Ordena los pasos para duplicar solo los valores pares.",
                        [
                            {"id": "a", "code": "valores = [1, 2, 3, 4]"},
                            {"id": "b", "code": "pares = [x for x in valores if x % 2 == 0]"},
                            {"id": "c", "code": "duplicados = [x * 2 for x in pares]"},
                            {"id": "d", "code": "print(duplicados)"},
                        ],
                        ["a", "b", "c", "d"],
                        "Primero se define la fuente, luego se filtra y por último se transforma.",
                    ),
                    h["predict"](
                        "u5-l4-e4",
                        "¿Qué demuestra esta salida?",
                        "base = [9, 1]\nordenada = sorted(base)\nprint(base)\nprint(ordenada)",
                        "[9, 1]\n[1, 9]",
                        "sorted devuelve otra lista y deja intacta la colección de entrada.",
                    ),
                ],
                level=4,
            ),
        ]
    }


def packs(h):
    out = {}
    for fn in (u1, u2, u3, u4, u5):
        out.update(fn(h))
    return out
