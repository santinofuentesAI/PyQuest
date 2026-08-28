from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

SECRET = os.getenv("JWT_SECRET", "pyquest-dev-secret-change-me")
ALGO = "HS256"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd.verify(password, hashed)


def make_token(user_id: int, guest: bool = False) -> str:
    payload = {
        "sub": str(user_id),
        "guest": guest,
        "exp": datetime.now(timezone.utc) + timedelta(days=14),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def read_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=[ALGO])
