"""Pega 3 niveles extra (2–4) en cada unidad del currículo."""

from extra_s0_s2 import packs as packs_early
from extra_u6_u22 import packs as packs_mid
from extra_u23_boss import packs as packs_late


def attach_extra_levels(sections, **h):
    packs = {}
    packs.update(packs_early(h))
    packs.update(packs_mid(h))
    packs.update(packs_late(h))
    missing = []
    for sec in sections:
        for unit in sec["units"]:
            extra = packs.get(unit["id"])
            if extra:
                unit["lessons"].extend(extra)
            else:
                missing.append(unit["id"])
    if missing:
        raise SystemExit(f"Faltan niveles extra para: {', '.join(missing)}")
