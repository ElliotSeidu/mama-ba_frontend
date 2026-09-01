import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

/** Bilingual string helper — pass { en, twi } and get the right string. */
export function t(strings, lang) {
  return lang === "twi" ? strings.twi : strings.en;
}

// Module-level persistent reference to prevent Chrome/Edge garbage collection from cutting off speech mid-sentence
let activeUtterance = null;

/** Helper to get best matching voice for a language */
function getBestVoice(language) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  if (language === "twi") {
    // Look for West African / English or standard clear voice for Twi phonetic pronunciation
    const twiVoice =
      voices.find((v) => v.lang.includes("ak") || v.lang.includes("tw")) ||
      voices.find((v) => v.lang.includes("en-GH") || v.lang.includes("en-NG")) ||
      voices.find((v) => v.lang.includes("en-GB") && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang.startsWith("en") && !v.name.includes("Google US"));
    return twiVoice || voices[0];
  } else {
    // English voice
    const engVoice =
      voices.find((v) => v.lang.includes("en-GH") || v.lang.includes("en-NG")) ||
      voices.find((v) => v.lang.includes("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en"));
    return engVoice || voices[0];
  }
}

/** Stop any currently active speech synthesis */
export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

/** Pause currently active speech */
export function pauseSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

/** Resume paused speech */
export function resumeSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

/** Play full statement voice sample with garbage-collection protection and callbacks */
export function playVoiceSample(language, onStart, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  stopSpeech();

  const phrase =
    language === "twi"
      ? "Akwaaba! Me ne Mama Ba, wo nnamfo pa wɔ nyinsɛn mu. Metumi aboa wo wɔ apomuden ne wo ba no ho."
      : "Welcome to Mama Ba! I am your personal maternal health companion, here to support you through your pregnancy and early motherhood.";

  const utt = new SpeechSynthesisUtterance(phrase);

  // Set supported language code and best available voice
  const bestVoice = getBestVoice(language);
  if (bestVoice) {
    utt.voice = bestVoice;
    utt.lang = bestVoice.lang || (language === "twi" ? "en-GB" : "en-US");
  } else {
    utt.lang = language === "twi" ? "en-GB" : "en-US";
  }

  utt.rate = 0.92; // slightly relaxed natural pace
  utt.pitch = 1.05; // warm, friendly maternal tone

  utt.onstart = () => {
    if (onStart) onStart();
  };

  utt.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utt.onerror = (e) => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  // Hold in module-level active reference so browser GC does not terminate utterance
  activeUtterance = utt;

  // Speak
  window.speechSynthesis.speak(utt);
}

export function LanguageProvider({ children }) {
  // App UI language (default: en)
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("mama_ba_lang") || "en";
  });

  // Voice assistant language (default: twi)
  const [voiceLang, setVoiceLangState] = useState(() => {
    return localStorage.getItem("mama_ba_voice_lang") || "twi";
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused]     = useState(false);

  // Prime voices when browser is ready
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

      return () => {
        stopSpeech();
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      };
    }
  }, []);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("mama_ba_lang", l);
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handlePauseSpeech = () => {
    pauseSpeech();
    setIsPaused(true);
  };

  const handleResumeSpeech = () => {
    resumeSpeech();
    setIsPaused(false);
  };

  const handlePlayVoiceSample = (vl) => {
    if (isSpeaking && !isPaused) {
      handleStopSpeech();
      return;
    }
    setIsPaused(false);
    playVoiceSample(
      vl,
      () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      () => {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    );
  };

  const setVoiceLang = (vl, playSample = false) => {
    setVoiceLangState(vl);
    localStorage.setItem("mama_ba_voice_lang", vl);
    if (playSample) {
      handlePlayVoiceSample(vl);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        voiceLang,
        setVoiceLang,
        isSpeaking,
        isPaused,
        stopSpeech: handleStopSpeech,
        pauseSpeech: handlePauseSpeech,
        resumeSpeech: handleResumeSpeech,
        playVoiceSample: handlePlayVoiceSample,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
