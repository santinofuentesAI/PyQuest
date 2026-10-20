const LATIN = /^es-(mx|419|co|ar|cl|pe|uy|ve|ec|bo|py|cr|pa|gt|hn|sv|ni|cu|do)/i;

export function spanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("es"))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "es"));
}

function rank(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  if (LATIN.test(lang)) return 0;
  if (lang.startsWith("es")) return 1;
  return 2;
}

export function speakSpanish(text: string, voiceURI?: string | null) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = spanishVoices();
  const chosen = voices.find((voice) => voice.voiceURI === voiceURI) ?? voices[0];
  if (chosen) {
    utterance.voice = chosen;
    utterance.lang = chosen.lang;
  } else {
    utterance.lang = "es-MX";
  }
  utterance.rate = 0.95;
  synth.speak(utterance);
  return true;
}
