"""Ephemeral Python runner with resource limits. No network, no host mounts."""
from __future__ import annotations

import os
import resource
import subprocess
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="PyQuest sandbox")
TIMEOUT = int(os.getenv("RUN_TIMEOUT", "8"))
MEMORY_MB = int(os.getenv("RUN_MEMORY_MB", "256"))


class RunIn(BaseModel):
    code: str = Field(max_length=20_000)
    tests: str = ""


def _limit() -> None:
    mem = MEMORY_MB * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (mem, mem))
    resource.setrlimit(resource.RLIMIT_CPU, (TIMEOUT, TIMEOUT + 1))
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/run")
def run(body: RunIn) -> dict:
    script = body.code
    if body.tests.strip():
        script = f"{body.code}\n\n# hidden tests\n{body.tests}\n"
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "user.py"
        path.write_text(script, encoding="utf-8")
        try:
            proc = subprocess.run(
                [sys.executable, "-I", str(path)],
                capture_output=True,
                text=True,
                timeout=TIMEOUT,
                cwd=tmp,
                env={"PYTHONPATH": "", "HOME": tmp, "PYTHONDONTWRITEBYTECODE": "1"},
                preexec_fn=_limit,
            )
        except subprocess.TimeoutExpired:
            return {"ok": False, "stdout": "", "stderr": "", "error": "Tiempo agotado"}
        error = None if proc.returncode == 0 else (proc.stderr or f"exit {proc.returncode}")
        return {
            "ok": proc.returncode == 0,
            "stdout": proc.stdout[-8000:],
            "stderr": proc.stderr[-4000:],
            "error": error,
        }
