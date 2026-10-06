"use client";

import { OFFICE_SVG } from "./office-svg";

export function OfficeCinematic() {
  return (
    <div className="office-cinematic">
      <div className="contenedor-animacion" dangerouslySetInnerHTML={{ __html: OFFICE_SVG }} />
    </div>
  );
}
