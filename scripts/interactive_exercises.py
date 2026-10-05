"""Authored touch challenges; kept in the generator so regeneration preserves them."""

# Pieces intentionally represent Python syntax, rather than whole answers.
# Only one canonical order is requested; each instruction explicitly states it.
TOKENS = [
    ('u1', 'Construye la instrucción que imprime el texto Hola. Usa todas las piezas.', ['print', '(', '"Hola"', ')'], 'Las comillas indican texto; los paréntesis contienen el argumento de print.'),
    ('u2', 'Asigna el entero 12 a ventas. Usa todas las piezas.', ['ventas', ' = ', '12'], '= asigna el valor de la derecha al nombre de la izquierda.'),
    ('u3', 'Construye la comparación edad mayor o igual que 18.', ['edad', ' >= ', '18'], '>= incluye el límite de 18; > lo excluiría.'),
    ('u4', 'Construye la llamada que convierte nombre a minúsculas.', ['nombre', '.', 'lower', '(', ')'], 'El punto accede al método y los paréntesis lo ejecutan.'),
    ('u5', 'Construye la llamada que añade 8 al final de notas.', ['notas', '.', 'append', '(', '8', ')'], 'append modifica la lista existente y no devuelve la lista nueva.'),
    ('u6', 'Construye la llamada que elimina los duplicados de etiquetas.', ['set', '(', 'etiquetas', ')'], 'set conserva valores únicos; no promete el orden de una lista.'),
    ('u7', 'Accede al valor de la clave ciudad en cliente.', ['cliente', '[', '"ciudad"', ']'], 'Una clave de texto lleva comillas; el diccionario busca ese valor.'),
    ('u8', 'Construye la cabecera if que compara total > 100. Incluye los dos puntos.', ['if ', 'total', ' > ', '100', ':'], 'Los dos puntos abren un bloque que debe ir indentado.'),
    ('u9', 'Construye la cabecera for que recorre ventas con la variable venta.', ['for ', 'venta', ' in ', 'ventas', ':'], 'En cada iteración venta toma el siguiente elemento de ventas.'),
    ('u10', 'Define la cabecera de una función llamada doble con el parámetro x.', ['def ', 'doble', '(', 'x', ')', ':'], 'def define la función; el parámetro recibirá un valor al llamarla.'),
    ('u14', 'Construye la expresión que crea un array NumPy con 2 y 4.', ['np', '.', 'array', '(', '[2, 4]', ')'], 'np.array convierte la secuencia en un array numérico.'),
    ('u15', 'Construye el slice de a que selecciona índices 1 y 2.', ['a', '[', '1', ':', '3', ']'], 'El extremo final 3 no se incluye.'),
    ('u16', 'Multiplica todas las celdas de a por 2; escribe a primero.', ['a', ' * ', '2'], 'NumPy aplica la multiplicación elemento a elemento sin un for escrito a mano.'),
    ('u17', 'Calcula la mediana del array temperaturas con NumPy.', ['np', '.', 'median', '(', 'temperaturas', ')'], 'La mediana es el valor central después de ordenar.'),
    ('u18', 'Construye la selección de los valores de a mayores que 0.', ['a', '[', 'a', ' > ', '0', ']'], 'La comparación crea una máscara booleana y el array usa esa máscara para filtrar.'),
    ('u19', 'Construye la llamada a plt.bar con etiquetas y ventas, en ese orden.', ['plt', '.', 'bar', '(', 'etiquetas', ', ', 'ventas', ')'], 'Las etiquetas nombran categorías y ventas da la altura de cada barra.'),
    ('u20', 'Pon el título Ventas al gráfico actual.', ['plt', '.', 'title', '(', '"Ventas"', ')'], 'El título comunica la pregunta o el hallazgo del gráfico.'),
    ('u23', 'Lee ventas.csv con Pandas.', ['pd', '.', 'read_csv', '(', '"ventas.csv"', ')'], 'read_csv devuelve un DataFrame. El nombre del archivo es texto.'),
    ('u24', 'Selecciona las filas de df donde ventas > 100.', ['df', '[', 'df["ventas"]', ' > ', '100', ']'], 'El filtro es una Series booleana con una condición por fila.'),
    ('u25', 'Sustituye los nulos de la columna edad por 0, usando fillna.', ['df["edad"]', '.', 'fillna', '(', '0', ')'], 'fillna devuelve la columna rellenada; decide si 0 es adecuado antes de usarlo.'),
    ('u26', 'Agrupa df por ciudad y suma la columna ventas.', ['df', '.', 'groupby', '(', '"ciudad"', ')', '["ventas"]', '.', 'sum', '(', ')'], 'Primero se forman los grupos; después se resume una columna por grupo.'),
    ('u27', 'Convierte la columna fecha a fechas reales usando pd.to_datetime.', ['pd', '.', 'to_datetime', '(', 'df["fecha"]', ')'], 'Una fecha como texto no tiene las operaciones temporales de una fecha real.'),
    ('u28', 'Calcula el rango: máximo de xs menos mínimo de xs.', ['max', '(', 'xs', ')', ' - ', 'min', '(', 'xs', ')'], 'El rango mide la distancia entre los extremos, no el centro.'),
    ('u33', 'Aplica scaler.transform a X_test, sin volver a hacer fit.', ['scaler', '.', 'transform', '(', 'X_test', ')'], 'El preprocesamiento aprende de train y solo transforma el test.'),
    ('u38', 'Construye la fracción de aciertos: correctos dividido entre total.', ['correctos', ' / ', 'total'], 'Accuracy es una proporción; compárala con un baseline antes de interpretarla.'),
    ('u39', 'Construye la ReLU de z con NumPy: np.maximum con 0 primero.', ['np', '.', 'maximum', '(', '0', ', ', 'z', ')'], 'ReLU deja los positivos y transforma los negativos en cero.'),
    ('u41', 'Actualiza w por descenso de gradiente: resta lr * grad a w.', ['w', ' = ', 'w', ' - ', 'lr', ' * ', 'grad'], 'La dirección negativa del gradiente reduce la pérdida para un paso suficientemente pequeño.'),
    ('u43', 'Separa texto por espacios llamando a split sin argumentos.', ['texto', '.', 'split', '(', ')'], 'split produce una lista de palabras; no es la tokenización de todos los modelos de lenguaje.'),
]

# Each checkpoint carries an executable assertion. The audit checks it at the
# stated line, not merely at the end, including print output when appropriate.
TRACES = [
    ('u1', "mensaje = 'Listo'\nprint(mensaje)", [
        (1, '¿Qué valor tiene mensaje?', "mensaje = 'Listo'", "mensaje = 'mensaje'", "mensaje = None", "mensaje == 'Listo'", 'Asignar crea el nombre; no imprime nada.'),
        (2, '¿Qué aparece en la consola?', 'Listo', 'mensaje', "'Listo'", "__stdout__.strip() == 'Listo'", 'print muestra el contenido de la variable sin comillas.')]),
    ('u2', 'ventas = 10\nventas = ventas + 3\nprint(ventas)', [
        (1, '¿Cuánto vale ventas?', '10', '3', '13', 'ventas == 10', 'La primera asignación da el valor 10.'),
        (2, '¿Cuánto vale ventas ahora?', '13', '10', '3', 'ventas == 13', 'Se calcula 10 + 3 antes de guardar el nuevo valor.'),
        (3, '¿Qué imprime?', '13', 'ventas', '10', "__stdout__.strip() == '13'", 'print usa el valor actualizado.')]),
    ('u3', 'edad = 18\npuede = edad >= 18\nprint(puede)', [
        (2, '¿Qué valor tiene puede?', 'True', 'False', '18', 'puede is True', 'Mayor o igual incluye exactamente 18.'),
        (3, '¿Qué imprime?', 'True', 'puede', '18', "__stdout__.strip() == 'True'", 'La comparación produjo un booleano.')]),
    ('u4', "texto = 'IA'\nnuevo = texto.lower()\nprint(texto, nuevo)", [
        (2, '¿Qué valores tienen texto y nuevo?', "texto='IA', nuevo='ia'", "texto='ia', nuevo='ia'", "texto='IA', nuevo='IA'", "texto == 'IA' and nuevo == 'ia'", 'lower devuelve otro string; no modifica el original.'),
        (3, '¿Qué imprime?', 'IA ia', 'ia ia', 'IA IA', "__stdout__.strip() == 'IA ia'", 'print separa sus argumentos con un espacio por defecto.')]),
    ('u5', 'notas = [5, 7]\nnotas.append(9)\nprimera = notas[0]', [
        (2, '¿Cómo queda notas?', '[5, 7, 9]', '[9, 5, 7]', '[5, 7]', 'notas == [5, 7, 9]', 'append agrega al final, no al principio.'),
        (3, '¿Qué valor tiene primera?', '5', '7', '9', 'primera == 5', 'El índice 0 selecciona el primer elemento.')]),
    ('u6', 'etiquetas = [1, 1, 2]\nunicas = set(etiquetas)\nn = len(unicas)', [
        (2, '¿Cuántos valores únicos hay?', '2', '3', '1', 'len(unicas) == 2', 'La repetición del 1 no agrega otro valor al set.'),
        (3, '¿Qué vale n?', '2', '3', '0', 'n == 2', 'len cuenta los elementos del set resultante.')]),
    ('u7', "cliente = {'ciudad': 'San José'}\nciudad = cliente['ciudad']", [
        (1, '¿Qué clave tiene el diccionario?', 'ciudad', 'San José', 'cliente', "list(cliente) == ['ciudad']", 'La clave es ciudad; San José es su valor.'),
        (2, '¿Qué vale la variable ciudad?', 'San José', 'ciudad', 'None', "ciudad == 'San José'", 'El acceso por clave devuelve el valor asociado.')]),
    ('u8', "total = 80\netiqueta = 'alto' if total > 100 else 'normal'\nprint(etiqueta)", [
        (2, '¿Qué rama se elige?', 'normal', 'alto', '80', "etiqueta == 'normal'", '80 > 100 es falso, por lo que se elige else.'),
        (3, '¿Qué imprime?', 'normal', 'alto', 'etiqueta', "__stdout__.strip() == 'normal'", 'Solo se imprime el resultado elegido.')]),
    ('u9', 'total = 0\nfor venta in [2, 3]:\n    total = total + venta\nprint(total)', [
        (1, '¿Cuánto vale total antes del bucle?', '0', '2', '5', 'total == 0', 'El acumulador empieza en cero.'),
        (3, 'Tras completar las dos iteraciones, ¿cuánto vale total?', '5', '3', '2', 'total == 5', 'Primero 0 + 2, luego 2 + 3.'),
        (4, '¿Qué imprime al salir del bucle?', '5', '2 3', '0', "__stdout__.strip() == '5'", 'La línea sin indentación se ejecuta después de terminar el bucle.')]),
    ('u10', 'def doble(x):\n    return x * 2\nresultado = doble(4)', [
        (2, 'Tras definir la función, ¿ya existe resultado?', 'Todavía no', 'Vale 8', 'Vale 4', "'resultado' not in globals()", 'Definir guarda la función; no la llama.'),
        (3, 'Después de llamar doble(4), ¿qué vale resultado?', '8', '4', 'None', 'resultado == 8', 'return entrega 4 * 2 a quien llamó la función.')]),
    ('u14', 'import numpy as np\na = np.array([2, 4])\nb = a * 2', [
        (2, '¿Cuál es el tamaño de a?', '2', '4', '1', 'a.size == 2', 'El array contiene dos elementos.'),
        (3, '¿Cómo queda b?', '[4, 8]', '[2, 4, 2, 4]', '[2, 4]', 'np.array_equal(b, [4, 8])', 'En un array, * 2 multiplica cada valor; no repite la secuencia como una lista.')]),
    ('u18', 'import numpy as np\na = np.array([-1, 0, 3])\nmascara = a > 0\npositivos = a[mascara]', [
        (3, '¿Cuál es la máscara?', '[False, False, True]', '[True, False, True]', '[False, True, True]', 'np.array_equal(mascara, [False, False, True])', '0 > 0 es falso; solo 3 pasa la condición.'),
        (4, '¿Qué valores se conservan?', '[3]', '[0, 3]', '[-1, 0, 3]', 'np.array_equal(positivos, [3])', 'El filtro conserva posiciones marcadas True.')]),
    ('u23', "import pandas as pd\ndf = pd.DataFrame({'ventas': [10, 20, 30]})\nmedia = df['ventas'].mean()", [
        (2, '¿Cuántas filas tiene df?', '3', '1', '2', 'len(df) == 3', 'Cada elemento de la lista aporta una fila.'),
        (3, '¿Cuánto vale media?', '20.0', '60.0', '30.0', 'float(media) == 20', 'La suma 60 dividida entre tres filas es 20.')]),
    ('u25', "import pandas as pd\ns = pd.Series([2.0, None, 6.0])\nmediana = s.median()\nlimpia = s.fillna(mediana)", [
        (3, '¿Cuánto vale mediana?', '4.0', '2.0', '0.0', 'mediana == 4', 'Pandas omite el nulo; el centro de 2 y 6 es 4.'),
        (4, '¿Qué valores quedan en limpia?', '[2.0, 4.0, 6.0]', '[2.0, 0.0, 6.0]', '[2.0, None, 6.0]', 'limpia.tolist() == [2, 4, 6]', 'fillna reemplaza solo el valor ausente.')]),
    ('u38', 'reales = [1, 0, 1, 0]\npredichos = [1, 0, 0, 0]\ncorrectos = sum(a == b for a, b in zip(reales, predichos))\naccuracy = correctos / len(reales)', [
        (3, '¿Cuántas predicciones son correctas?', '3', '4', '2', 'correctos == 3', 'Solo la tercera predicción no coincide.'),
        (4, '¿Cuál es la accuracy?', '0.75', '3.0', '0.25', 'accuracy == 0.75', 'Tres aciertos divididos entre cuatro observaciones.')]),
    ('u39', 'z = -2\ny = max(0, z)\nprint(y)', [
        (2, '¿Qué vale y tras ReLU?', '0', '-2', '2', 'y == 0', 'ReLU corta los valores negativos en cero.'),
        (3, '¿Qué imprime?', '0', '-2', 'y', "__stdout__.strip() == '0'", 'print muestra la activación, no la entrada z.')]),
    ('u41', 'w = 1.0\nlr = 0.1\ngrad = 2.0\nw = w - lr * grad', [
        (3, 'Antes de actualizar, ¿cuánto vale w?', '1.0', '0.8', '2.0', 'w == 1', 'Asignar lr y grad aún no cambia w.'),
        (4, 'Después de actualizar, ¿cuánto vale w?', '0.8', '1.2', '0.2', 'abs(w - 0.8) < 1e-9', 'Se resta 0.1 * 2 = 0.2 al peso inicial.')]),
    ('u43', "texto = 'ia ia datos'\ntokens = texto.split()\nvocabulario = set(tokens)", [
        (2, '¿Cuántos tokens hay?', '3', '2', '1', 'len(tokens) == 3', 'split conserva las dos apariciones de ia.'),
        (3, '¿Cuántas palabras diferentes hay?', '2', '3', '1', 'len(vocabulario) == 2', 'El set elimina la repetición; tokens y vocabulario miden cosas distintas.')]),
]


def enrich_curriculum(sections):
    units = {u['id']: u for s in sections for u in s['units']}
    for uid, prompt, pieces, why in TOKENS:
        eid = f'{uid}-l1-touch'
        exercise = dict(id=eid, type='token_order', prompt=prompt, difficulty=1, xp=14,
                        hint='Identifica primero el nombre principal; después coloca sus argumentos o su condición.',
                        explanation=why, solution=''.join(pieces),
                        blocks=[dict(id=f't{i}', code=p) for i, p in enumerate(pieces)],
                        correctOrder=[f't{i}' for i in range(len(pieces))])
        units[uid]['lessons'][0]['exercises'].insert(2, exercise)
    for uid, program, rows in TRACES:
        steps = []
        for i, (line, question, yes, no1, no2, assertion, why) in enumerate(rows):
            choices = [dict(id='a', text=yes), dict(id='b', text=no1), dict(id='c', text=no2)]
            # Stable variation so correct answers are not always in the same place.
            rotation = i % 3
            choices = choices[rotation:] + choices[:rotation]
            steps.append(dict(line=line, question=question, choices=choices, correctChoiceId='a', assert_=assertion, explanation=why))
            steps[-1]['assert'] = steps[-1].pop('assert_')
        units[uid]['lessons'][1]['exercises'].append(dict(
            id=f'{uid}-l2-trace', type='trace', prompt='Sigue el programa paso a paso y observa cómo cambian sus valores.',
            difficulty=2, xp=18, hint='Lee solo las líneas ejecutadas hasta el punto marcado. No adelantes el resultado final.',
            explanation='Cada instrucción usa el estado que dejó la anterior. Distingue asignar, transformar y mostrar.',
            solution='\n'.join(f"Paso {i + 1}: {row[2]} — {row[-1]}" for i, row in enumerate(rows)),
            starterCode=program, traceSteps=steps))
    for unit in units.values():
        for lesson in unit['lessons']:
            for exercise in lesson['exercises']:
                if exercise['id'] in ('u34-l4-e3', 'u39-l1-e4'):
                    exercise['outputComparison'] = 'numeric'
                if exercise['type'] == 'fill_blank':
                    # Alternatives are supplied only when already introduced in the topic.
                    distractors = {'print': ['len', 'type'], 'mean': ['sum', 'max'], 'True': ['False', 'None']}
                    first = exercise['blanks'][0]['accepted'][0]
                    if first in distractors:
                        exercise['wordBank'] = distractors[first]
            lesson['xp'] = sum(e['xp'] for e in lesson['exercises'])
