export function speakText(text: string, options?: { voiceName?: string; lang?: string; rate?: number }): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang ?? "vi-VN";
  utterance.rate = options?.rate ?? 1;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((item) => item.name === options?.voiceName) ?? voices.find((item) => item.lang.toLowerCase().startsWith((options?.lang ?? "vi").toLowerCase().split("-")[0] ?? "vi"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
