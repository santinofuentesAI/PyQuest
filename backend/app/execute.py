"""Optional sandboxed execution used when EXECUTION_MODE=docker.

The FastAPI process never exec()s user code. It POSTs to the sandbox service,
which runs a child process with CPU/memory/time limits and no host FS writes
outside a temp dir.
"""
from __future__ import annotations

import os

import httpx

SANDBOX_URL = os.getenv("SANDBOX_URL", "http://sandbox:8001")
TIMEOUT = float(os.getenv("SANDBOX_TIMEOUT", "10"))


async def run_in_sandbox(code: str, tests: str = "") -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT + 2) as client:
        response = await client.post(
            f"{SANDBOX_URL}/run",
            json={"code": code, "tests": tests},
        )
        response.raise_for_status()
        return response.json()
