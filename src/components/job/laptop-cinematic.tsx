"use client";

import { LAPTOP_SVG } from "./laptop-svg";

export function LaptopCinematic() {
  return (
    <div className="laptop-cinematic">
      <div className="laptop-frame" dangerouslySetInnerHTML={{ __html: LAPTOP_SVG }} />
    </div>
  );
}
