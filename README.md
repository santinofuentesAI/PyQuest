# PyQuest

Plataforma web de aprendizaje gamificado de **Python para análisis de datos e IA**. Lecciones de 5–10 minutos, corazones, XP, rachas, ligas, árbol de habilidades y un laboratorio que ejecuta Python **dentro del navegador** (Pyodide / WebAssembly). No hace falta instalar Anaconda para aprender.

## Qué incluye este slice

- Motor de ejercicios genérico: opción múltiple, huecos, código, reordenar, detectar error, predecir salida, datos reales (CSV) y emparejar. En **Aprender**, el orden de los ejercicios y de las opciones cambia en cada intento (para no memorizar el mapa).
- **Librería**: fichas desde cero de cada unidad (glosario, analogías, y luego más detalle).
- Runtime Python en un **Web Worker** (timeout 8 s, `stdout`/`stderr`, figuras Matplotlib a PNG).
- Currículo completo en el mapa (secciones 0–7): **53 unidades** con lecciones originales (enunciado, pista, solución y tests). Hub por unidad, repaso espaciado y tienda de gemas.
- Entras directo al mapa de **Aprender** (sin slides ni test de colocación).
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
