from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    display_name: Mapped[str] = mapped_column(String(80), default="Explorador")
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    guest: Mapped[bool] = mapped_column(Boolean, default=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    gems: Mapped[int] = mapped_column(Integer, default=0)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    hearts_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    last_practice_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    streak_freezes: Mapped[int] = mapped_column(Integer, default=1)
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0)
    week_id: Mapped[str] = mapped_column(String(12), default="")
    league: Mapped[str] = mapped_column(String(20), default="bronze")
    starting_unit_id: Mapped[str] = mapped_column(String(20), default="u1")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lessons: Mapped[list["LessonCompletion"]] = relationship(back_populates="user")
    units: Mapped[list["UnitProgress"]] = relationship(back_populates="user")
    badges: Mapped[list["UserBadge"]] = relationship(back_populates="user")


class LessonCompletion(Base):
    __tablename__ = "lesson_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[str] = mapped_column(String(80), index=True)
    correct: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    perfect: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="lessons")


class UnitProgress(Base):
    __tablename__ = "unit_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    unit_id: Mapped[str] = mapped_column(String(20), index=True)
    strength: Mapped[float] = mapped_column(Float, default=0.4)
    last_practiced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped[User] = relationship(back_populates="units")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    badge_id: Mapped[str] = mapped_column(String(40))
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="badges")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ok: Mapped[bool] = mapped_column(Boolean, default=False)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    elapsed_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
