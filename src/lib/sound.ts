"use client";

export function playTone(kind: "ok" | "bad" | "done") {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  if (kind === "ok") {
    osc.frequency.value = 523;
    osc.frequency.exponentialRampToValueAtTime(784, now + 0.12);
  } else if (kind === "done") {
    osc.frequency.value = 392;
    osc.frequency.exponentialRampToValueAtTime(784, now + 0.25);
  } else {
    osc.frequency.value = 220;
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
  }
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.start(now);
  osc.stop(now + 0.23);
  osc.onended = () => ctx.close();
}
