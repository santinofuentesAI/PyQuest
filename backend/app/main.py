from __future__ import annotations

import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .auth import hash_password, make_token, read_token, verify_password
from .db import get_db, init_db
from .execute import run_in_sandbox
from .models import LessonCompletion, User, UserBadge, UnitProgress

app = FastAPI(title="PyQuest API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXECUTION_MODE = os.getenv("EXECUTION_MODE", "pyodide")


@app.on_event("startup")
def startup() -> None:
    init_db()


class RegisterIn(BaseModel):
    email: str
    password: str
    display_name: str = "Explorador"


class LoginIn(BaseModel):
    email: str
    password: str


class ProgressIn(BaseModel):
    xp: int = 0
    gems: int = 0
    hearts: int = 5
    streak: int = 0
    weekly_xp: int = 0
    week_id: str = ""
    league: str = "bronze"
    starting_unit_id: str = "u1"
    last_practice_date: str | None = None
    lesson_id: str | None = None
    lesson_xp: int = 0
    perfect: bool = False


class ExecuteIn(BaseModel):
    code: str = Field(max_length=20_000)
    tests: str = ""


def current_user(
    db: Session = Depends(get_db),
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Token requerido")
    try:
        payload = read_token(authorization.split(" ", 1)[1])
        user = db.get(User, int(payload["sub"]))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(401, "Token inválido") from exc
    if not user:
        raise HTTPException(401, "Usuario no encontrado")
    return user


@app.get("/health")
def health() -> dict:
    return {"ok": True, "execution_mode": EXECUTION_MODE}


@app.post("/auth/guest")
def guest(db: Session = Depends(get_db)) -> dict:
    user = User(guest=True, display_name="Invitado")
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": make_token(user.id, guest=True), "user_id": user.id}


@app.post("/auth/register")
def register(body: RegisterIn, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(409, "Ese email ya existe")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        guest=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": make_token(user.id), "user_id": user.id}


@app.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    return {"token": make_token(user.id), "user_id": user.id}


@app.get("/progress")
def get_progress(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    return {
        "display_name": user.display_name,
        "xp": user.xp,
        "gems": user.gems,
        "hearts": user.hearts,
        "streak": user.streak,
        "weekly_xp": user.weekly_xp,
        "league": user.league,
        "starting_unit_id": user.starting_unit_id,
        "lessons": [
            {"lesson_id": l.lesson_id, "xp": l.xp, "perfect": l.perfect}
            for l in db.query(LessonCompletion).filter(LessonCompletion.user_id == user.id)
        ],
        "badges": [b.badge_id for b in db.query(UserBadge).filter(UserBadge.user_id == user.id)],
        "units": [
            {"unit_id": u.unit_id, "strength": u.strength}
            for u in db.query(UnitProgress).filter(UnitProgress.user_id == user.id)
        ],
    }


@app.put("/progress")
def put_progress(body: ProgressIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    user.xp = body.xp
    user.gems = body.gems
    user.hearts = body.hearts
    user.streak = body.streak
    user.weekly_xp = body.weekly_xp
    user.week_id = body.week_id
    user.league = body.league
    user.starting_unit_id = body.starting_unit_id
    user.last_practice_date = body.last_practice_date
    if body.lesson_id:
        db.add(
            LessonCompletion(
                user_id=user.id,
                lesson_id=body.lesson_id,
                xp=body.lesson_xp,
                perfect=body.perfect,
            )
        )
    db.commit()
    return {"ok": True}


@app.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)) -> dict:
    rows = db.query(User).order_by(User.weekly_xp.desc()).limit(20).all()
    return {
        "rows": [
            {"name": u.display_name, "xp": u.weekly_xp, "league": u.league}
            for u in rows
        ]
    }


@app.post("/execute")
async def execute(body: ExecuteIn) -> dict:
    if EXECUTION_MODE != "docker":
        raise HTTPException(
            400,
            "El modo por defecto es Pyodide en el navegador. "
            "Arranca con EXECUTION_MODE=docker para usar el sandbox.",
        )
    try:
        return await run_in_sandbox(body.code, body.tests)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Sandbox no disponible: {exc}") from exc
