"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  msPerChar = 28,
  className,
  caret = true,
}: {
  text: string;
  msPerChar?: number;
  className?: string;
  caret?: boolean;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, msPerChar]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      {caret ? (
        <span className="ml-0.5 inline-block w-2 animate-pulse bg-current align-[-2px]">&nbsp;</span>
      ) : null}
    </span>
  );
}
