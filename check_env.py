#!/usr/bin/env python3
"""Verify that a local Python 3.11+ environment has the data-science stack."""
from __future__ import annotations

import sys

REQUIRED = ["numpy", "pandas", "matplotlib", "sklearn"]


def main() -> int:
    print(f"Python {sys.version}")
    if sys.version_info < (3, 11):
        print("ERROR: se requiere Python 3.11 o superior.")
        return 1
    missing = []
    for name in REQUIRED:
        try:
            mod = __import__(name)
            ver = getattr(mod, "__version__", "?")
            print(f"  ok  {name} {ver}")
        except Exception as exc:  # noqa: BLE001
            print(f"  FAIL {name}: {exc}")
            missing.append(name)
    if missing:
        print("\nInstala el stack con:")
        print("  python3 -m venv .venv && source .venv/bin/activate")
        print("  pip install -r backend/requirements.txt")
        return 1
    print("\nEntorno listo. PyQuest puede usar el modo Docker/FastAPI si lo activas.")
    print("El modo por defecto (Pyodide) no necesita este entorno: corre en el navegador.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
