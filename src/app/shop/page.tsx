"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Gem, Heart, School, Snowflake } from "lucide-react";
import { useProgress } from "@/lib/progress-store";
import {
  HEART_REFILL_COST,
  HEART_SALARY_COST,
  FREEZE_SALARY_COST,
  STREAK_FREEZE_COST,
  MAX_HEARTS,
} from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { COURSE_CATALOG, formatCoursePrice, ownsCourse } from "@/lib/courses";
import { Pybot } from "@/components/pybot";
import { UnitIcon } from "@/components/unit-icon";
import { cn } from "@/lib/utils";

type Good = {
  id: string;
  aisle: "mostrador" | "cursos" | "colegio";
  name: string;
  tag: string;
  blurb: string;
  owned?: boolean;
  buyLabel: string;
  onBuy: () => void;
};

export default function ShopPage() {
  const p = useProgress();
  const goods: Good[] = [
    {
      id: "hearts",
      aisle: "mostrador",
      name: "Recarga de corazones",
      tag: `${HEART_REFILL_COST} gemas`,
      blurb: `Vuelves a ${MAX_HEARTS}/5 ahora mismo. Puedes comprarla otra vez cuando se gasten.`,
      buyLabel: "Llevarme la recarga",
      onBuy: () => {
        if (p.hearts >= MAX_HEARTS) toast.message("Ya tienes los corazones al máximo");
        else if (p.refillHearts()) toast.success("Corazones recargados");
        else toast.error(`Necesitas ${HEART_REFILL_COST} gemas`);
      },
    },
    {
      id: "freeze",
      aisle: "mostrador",
      name: "Congelador de racha",
      tag: `${STREAK_FREEZE_COST} gemas`,
      blurb: `Si un día no practicas, la racha sigue. Tienes ${p.streakFreezes} listos. Se pueden apilar.`,
      buyLabel: "Llevarme un congelador",
      onBuy: () => {
        if (p.buyFreeze()) toast.success("Congelador listo");
        else toast.error(`Necesitas ${STREAK_FREEZE_COST} gemas`);
      },
    },
    {
      id: "heart-salary",
      aisle: "mostrador",
      name: "1 vida de oficina",
      tag: `$${HEART_SALARY_COST}`,
      blurb: `Un corazón pagado con el salario de los encargos. Ahora ${p.hearts}/${MAX_HEARTS}.`,
      buyLabel: "Llevarme la vida",
      onBuy: () => {
        if (p.hearts >= MAX_HEARTS) toast.message("Ya tienes las vidas al máximo");
        else if (p.buyHeartWithSalary()) toast.success(`+1 corazón · −$${HEART_SALARY_COST}`);
        else toast.error(`Necesitas $${HEART_SALARY_COST} de oficina`);
      },
    },
    {
      id: "freeze-salary",
      aisle: "mostrador",
      name: "Congelador de oficina",
      tag: `$${FREEZE_SALARY_COST}`,
      blurb: "La misma protección de racha, pagada con lo que cobraste.",
      buyLabel: "Llevarme uno",
      onBuy: () => {
        if (p.buyFreezeWithSalary()) toast.success(`Congelador listo · −$${FREEZE_SALARY_COST}`);
        else toast.error(`Necesitas $${FREEZE_SALARY_COST} de oficina`);
      },
    },
    ...COURSE_CATALOG.map((course) => {
      const owned = ownsCourse(p, course.id);
      return {
        id: course.id,
        aisle: "cursos" as const,
        name: course.title,
        tag: owned ? "Tuyo" : formatCoursePrice(course.priceUsd),
        blurb: owned
          ? "Este curso ya está en este dispositivo. El primer tramo sigue gratis para quien no lo tenga."
          : `${course.tagline} Pago único, sin suscripción.`,
        owned,
        buyLabel: owned ? "Ir al mapa" : `Desbloquear ${formatCoursePrice(course.priceUsd)}`,
        onBuy: () => {
          if (owned) return;
          if (p.unlockCourse(course.id)) toast.success(`${course.title} desbloqueado en este dispositivo`);
          else toast.message("Ese curso ya estaba desbloqueado");
        },
      };
    }),
    {
      id: "colegio",
      aisle: "colegio",
      name: "Licencia para un grupo",
      tag: p.schoolInterestAt ? "Anotado" : "Sin tarjeta",
      blurb: "Para un colegio o un bootcamp: otro monto, por estudiante, sin publicidad en clase. Aquí solo dejas el interés.",
      owned: Boolean(p.schoolInterestAt),
      buyLabel: p.schoolInterestAt ? "Interés guardado" : "Me interesa para un grupo",
      onBuy: () => {
        if (p.schoolInterestAt) return;
        p.registerSchoolInterest();
        toast.success("Listo. Quedó el interés en este dispositivo.");
      },
    },
  ];
  const [picked, setPicked] = useState(goods[0].id);
  const good = goods.find((item) => item.id === picked) ?? goods[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28">
      <section className="overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,#3a2a18_0%,#24180f_42%,var(--card)_42%)] text-amber-50">
        <div className="flex items-end gap-3 px-4 pt-4 pb-5">
          <Pybot mood="wave" size="sm" />
          <div>
            <p className="text-[10px] font-bold tracking-[.18em] uppercase text-amber-200">El puesto de Pybot</p>
            <h1 className="font-heading text-3xl font-extrabold text-white">Tienda</h1>
          </div>
        </div>
        <div className="bg-card px-4 pt-4 pb-5 text-card-foreground">
          <p className="text-sm leading-relaxed text-muted-foreground">Elige algo del mostrador. El precio está en la etiqueta. Abajo confirmas la compra.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Gem className="size-3.5 text-cyan-600" />{p.gems} gemas</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">${p.jobUsd ?? 0} oficina</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Heart className="size-3.5 text-rose-500" />{p.hearts}/{MAX_HEARTS}</span>
          </div>
        </div>
      </section>

      <Aisle title="En el mostrador" hint="Se pueden comprar otra vez.">
        {goods.filter((item) => item.aisle === "mostrador").map((item) => (
          <ShelfItem key={item.id} item={item} picked={picked === item.id} onPick={() => setPicked(item.id)} icon={item.id.includes("freeze") ? "freeze" : "heart"} />
        ))}
      </Aisle>
      <Aisle title="Cursos" hint="Un pago, y el curso se queda.">
        {goods.filter((item) => item.aisle === "cursos").map((item) => {
          const course = COURSE_CATALOG.find((entry) => entry.id === item.id);
          return <ShelfItem key={item.id} item={item} picked={picked === item.id} onPick={() => setPicked(item.id)} icon={course?.icon} accent={course?.accent} />;
        })}
      </Aisle>
      <Aisle title="Colegios y bootcamps" hint="No es una compra de gemas.">
        {goods.filter((item) => item.aisle === "colegio").map((item) => (
          <ShelfItem key={item.id} item={item} picked={picked === item.id} onPick={() => setPicked(item.id)} icon="school" />
        ))}
      </Aisle>

      <div className="mt-4 rounded-3xl border bg-card p-4 shadow-sm">
        <p className="text-[10px] font-bold tracking-wider text-primary uppercase">En el mostrador ahora</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold">{good.name}</h2>
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-900 dark:bg-amber-900 dark:text-amber-100">{good.tag}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{good.blurb}</p>
        {good.owned && good.aisle === "cursos" ? (
          <Button className="mt-4 h-12 w-full rounded-2xl font-bold" render={<Link href="/learn" />}>Ir al mapa</Button>
        ) : (
          <Button className="mt-4 h-12 w-full rounded-2xl font-bold" disabled={good.owned} onClick={good.onBuy}>{good.buyLabel}</Button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          También recuperas 1 corazón al <Link href="/learn" className="font-semibold text-primary">repasar una unidad débil</Link>.
        </p>
      </div>
    </div>
  );
}

function Aisle({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-extrabold">{title}</h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{children}</div>
    </section>
  );
}

function ShelfItem({ item, picked, onPick, icon, accent }: { item: Good; picked: boolean; onPick: () => void; icon?: string; accent?: string }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className={cn(
        "flex w-36 shrink-0 flex-col rounded-3xl border-2 bg-card p-3 text-left shadow-sm",
        picked ? "border-primary" : "border-border"
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl text-white" style={{ background: accent ?? "#7c3aed" }}>
        {icon === "heart" ? <Heart className="size-5" /> : icon === "freeze" ? <Snowflake className="size-5" /> : icon === "school" ? <School className="size-5" /> : <UnitIcon name={icon} className="size-5" />}
      </span>
      <p className="mt-3 text-sm font-extrabold leading-tight">{item.name}</p>
      <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300">{item.tag}</p>
    </button>
  );
}
