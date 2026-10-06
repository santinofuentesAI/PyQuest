"""Pega 3 niveles extra (2–4) en cada unidad del currículo."""

from extra_s0_s2 import packs as packs_early
from extra_u6_u22 import packs as packs_mid
from extra_u23_boss import packs as packs_late
from extra_depth import packs as packs_depth


def attach_extra_levels(sections, **h):
    packs = {}
    packs.update(packs_early(h))
    packs.update(packs_mid(h))
    packs.update(packs_late(h))
    depth = packs_depth(h)
    missing = []
    missing_depth = []
    for sec in sections:
        for unit in sec["units"]:
            extra = packs.get(unit["id"])
            if extra:
                unit["lessons"].extend(extra)
            else:
                missing.append(unit["id"])
            deeper = depth.get(unit["id"])
            if deeper:
                unit["lessons"].extend(deeper)
            else:
                missing_depth.append(unit["id"])
    if missing:
        raise SystemExit(f"Faltan niveles extra para: {', '.join(missing)}")
    if missing_depth:
        raise SystemExit(f"Falta el nivel Profundiza para: {', '.join(missing_depth)}")
