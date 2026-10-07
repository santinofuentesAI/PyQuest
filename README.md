# PyQuest

Plataforma web de aprendizaje gamificado de **Python para análisis de datos e IA**. Lecciones de 5–10 minutos, corazones, XP, rachas, ligas, árbol de habilidades y un laboratorio que ejecuta Python **dentro del navegador** (Pyodide / WebAssembly). No hace falta instalar Anaconda para aprender.

## Qué incluye

- **Pybot**, mascota animada con consejos según la pantalla, aperturas de clase, ayuda al corregir y celebraciones. Respeta movimiento reducido.
- Mapa con misión sugerida, objetivo diario orientativo, secciones navegables y progreso visible por nivel.
- Laboratorio con borrador automático, guardado al portafolio y descarga de código Python.
- 16 encargos con entregas verificadas, gráficos y salario ficticio; reiniciar conserva el código y no duplica recompensas.
- Motor de ejercicios: opción múltiple, huecos con banco de palabras, código, reordenar, detectar error, predecir salida multilínea, datos reales (CSV), emparejar, construir expresiones por piezas y seguir la ejecución. En **Aprender** se conserva el orden pedagógico y se mezclan las opciones; los repasos sí mezclan ejercicios.
- **Librería**: 53 guías, ejemplos ejecutables, razonamiento paso a paso y práctica libre de los cinco niveles.
- Runtime Python en un **Web Worker** (timeout 8 s, `stdout`/`stderr`, figuras Matplotlib a PNG).
- Currículo completo en el mapa (secciones 0–7): **53 unidades** con lecciones originales (enunciado, pista, solución y tests). Hub por unidad, repaso espaciado y tienda de gemas.
- Entras directo al mapa de **Aprender** (sin slides ni test de colocación).
- Cada unidad tiene **5 niveles** (esencial, afianza, practica, demuestra y profundiza). El mapa se abre con el primero.
- Seis paletas de color en **Perfil → Ajustes** (Lila, Océano, Atardecer, Noche, Bosque, Negro OLED).
- Progreso en `localStorage` (modo invitado). FastAPI + PostgreSQL opcionales para persistir cuentas.
- Modo **Práctica legendaria**, liga semanal, insignias, tienda (corazones y congelador de racha).

## Arquitectura

```
/
├── src/app/                 # Next.js App Router (UI)
├── src/components/          # Motor de lecciones, árbol, editor
├── src/lib/                 # Pyodide client, gamificación, validadores
├── src/content/             # curriculum.json + lesson.schema.json
├── public/pyodide-worker.js # Worker que carga Pyodide
├── scripts/generate_curriculum.py
├── backend/                 # FastAPI (progreso, JWT, /execute opcional)
├── sandbox/                 # Runner aislado (modo EXECUTION_MODE=docker)
├── docker-compose.yml
├── Dockerfile               # frontend producción
└── check_env.py
```

**Por qué Next.js + FastAPI:** la experiencia de aprendizaje es 100 % cliente (Pyodide). Next.js sirve la UI y puede desplegarse en Vercel. FastAPI entra cuando quieres cuentas reales o ejecutar TensorFlow en un contenedor; no bloquea el MVP.

### Ejecución de código

| Variable | Valor | Qué ocurre |
| --- | --- | --- |
| `EXECUTION_MODE` (default) | `pyodide` | El navegador carga Pyodide. Paquetes: numpy, pandas, matplotlib. sklearn vía micropip si un ejercicio lo pide. |
| `EXECUTION_MODE` | `docker` | El frontend puede seguir en Pyodide; `POST /execute` en FastAPI reenvía al servicio `sandbox` (límites CPU/RAM/tiempo, sin red). |

Nunca se hace `exec()` del código de usuario en el proceso de FastAPI.

## Cómo añadir una unidad

1. Edita `scripts/generate_curriculum.py` (o el JSON generado).
2. Una lección es un objeto que cumple `src/content/lesson.schema.json`.
3. Regenera:

```bash
python3 scripts/generate_curriculum.py
```

4. El motor (`src/lib/validators.ts` + `src/components/exercise-view.tsx`) no cambia: solo consume JSON.

Ejemplo mínimo de ejercicio `code`:

```json
{
  "id": "u14-l1-e3",
  "type": "code",
  "prompt": "Crea un array temps y imprime su size.",
  "difficulty": 2,
  "xp": 18,
  "hint": "np.array + .size",
  "explanation": "size cuenta celdas.",
  "solution": "import numpy as np\ntemps = np.array([1, 2])\nprint(temps.size)",
  "starterCode": "import numpy as np\n",
  "tests": [{ "assert": "int(temps.size) == 2" }],
  "expectedStdout": "2"
}
```

Huecos: usa `___` en `template` y una lista `blanks[].accepted`. Reordenar: `blocks` + `correctOrder`. Datos: `files: { "datos.csv": "col\\n1\\n" }` y `type: "data"`.

## Arranque local (desarrollo, solo frontend)

Requisitos: Node 20+ (22 recomendado).

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43180](http://127.0.0.1:43180). La primera ejecución de código descarga Pyodide (~20–40 s) y luego queda en caché del navegador.

## Deploy en Vercel

El frontend es un Next.js estándar. No hace falta backend:

```bash
npx vercel --prod --yes
```

O conecta el repo de GitHub en [vercel.com/new](https://vercel.com/new). Framework: Next.js. Pyodide se descarga en el navegador desde jsDelivr la primera vez que alguien ejecuta código.

En Project Settings, deja **Root Directory vacío**: `package.json`, `next.config.ts` y `vercel.json` están en la raíz del repositorio. No selecciones `backend`; esa carpeta contiene el servidor FastAPI opcional y no la aplicación Next.js. El archivo `vercel.json` fija Next.js, instala las dependencias con `npm ci --include=dev` y ejecuta `npm run build`.

Si aparece `No Next.js version detected` o Vercel busca `backend/.next`, corrige Root Directory, guarda los ajustes y crea un nuevo despliegue de `main`; repetir el despliegue antiguo con su configuración anterior no aplica la corrección.

## Python local (backend / check_env)

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r backend/requirements.txt
python check_env.py
cd backend && uvicorn app.main:app --reload --port 43181
```

## Docker (todo el stack)

```bash
docker compose up --build
```

- Web: `http://localhost:43180`
- API: `http://localhost:43181/health`

Para el sandbox avanzado:

```bash
EXECUTION_MODE=docker docker compose up --build
```

## Base de datos (modo cuentas)

Tablas SQLAlchemy: `users`, `lesson_completions`, `unit_progress`, `user_badges`, `execution_logs`. En desarrollo sin Docker, FastAPI usa SQLite (`./pyquest.db`). En Compose usa PostgreSQL 16. Redis queda listo para cachear ligas.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | UI en :43180 |
| `npm run build && npm start` | Producción Node |
| `python3 scripts/generate_curriculum.py` | Regenera `src/content/curriculum.json` |
| `python check_env.py` | Comprueba numpy/pandas/matplotlib/sklearn |

## Notas de producto

- El color de la app se elige en Perfil (incluye Negro OLED). El progreso vive en este dispositivo.
- TensorFlow/PyTorch no caben bien en Pyodide: las unidades de deep learning enseñan el álgebra con NumPy (el mismo forward/loss que usarás en Keras). El sandbox Docker es la vía para TF más adelante.
- Las 53 unidades tienen lecciones originales (sin plantillas). Amplía o edita `scripts/generate_curriculum.py` y `scripts/remaining_units.py`, luego regenera con `python3 scripts/generate_curriculum.py`.

## Interacción y aprendizaje

- Editor táctil con símbolos, inserción en el cursor, pares de comillas/paréntesis,
  indentación automática y sugerencias de nombres. Tab completa o indenta;
  Shift+Tab permite salir del editor. Mantener el dedo quieto 650 ms completa
  la primera sugerencia. Monaco sigue disponible como editor avanzado.
- Piezas movibles con arrastre, teclado y botones; reiniciar y retirar piezas.
- 28 retos de construir expresiones y 18 recorridos con 38 puntos de control.
- Tras un error debes corregir la respuesta antes de avanzar. Una misma pregunta
  consume como máximo un corazón. Puedes corregirla incluso con cero corazones.
  La puntuación conserva los aciertos al primer intento y no premia reintentos como
  aciertos perfectos. Fallos de carga de Python no consumen vidas.
- Comparación numérica explícita en ejercicios que admiten diferencias de
  representación. El texto sigue siendo exacto, incluidos los espacios internos.
- Ejemplos de la biblioteca con datos visibles, código editable, gráficos y
  restauración; práctica independiente que no desbloquea unidades ni escribe XP.

## Ciclo de calidad

```bash
npm run curriculum
npm run check
python3 scripts/audit_curriculum.py --runtime
npm run test:jobs
```

La auditoría estructural revisa IDs, huecos, opciones, emparejamientos, piezas y
puntos de control. `--runtime` comprueba los programas de referencia y las salidas
con Python local; necesita numpy, pandas, matplotlib, scipy, scikit-learn y seaborn.
Las pruebas de componentes cubren interacción y reintentos; usan un DOM simulado,
no una revisión visual del navegador. Las pruebas del Worker simulan carga,
concurrencia, fallos y recuperación. Las IDs existentes se conservan para mantener
el progreso guardado. Las definiciones originales viven en `scripts/`; los retos
interactivos se añaden en `scripts/interactive_exercises.py`.

## Pruebas en navegador

```bash
npx playwright install chromium
npm run build
npm run test:browser
```

La suite abre la biblioteca en 390×844, 1280×800 y 1440×900, verifica inserción
por cursor y piezas, comprueba desbordamiento horizontal y guarda capturas.
También ejecuta los 437 programas de referencia en el Worker real de Pyodide.
Requiere acceso a jsDelivr y PyPI para los paquetes WASM. GitHub Actions ejecuta
este ciclo en cada pull request y en cambios a main. Un fallo deja trazas y
capturas en el artefacto browser-review. Una prueba pendiente no equivale a una
revisión visual aprobada.

La suite de Pybot revisa 320, 390, 768 y 1440 px, una clase completa con error y
corrección, recompensas reales, persistencia del laboratorio, descarga del portafolio
y modo Noche con movimiento reducido. `test:jobs` comprueba los 16 programas
de entrega y rechaza una normalización softmax incorrecta y recompensas duplicadas.
