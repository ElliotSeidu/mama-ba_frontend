import { useState } from "react";
import { useLang } from "../context/LanguageContext.jsx";
import { Activity, Droplets, Thermometer, Footprints, Flame, Compass, Plus, X } from "lucide-react";

const PRESET_SYMPTOMS = [
  { id: "headache",  icon: Activity,    en: "Headache",       twi: "Tiawa",           risk: "moderate" },
  { id: "bleeding",  icon: Droplets,    en: "Bleeding",       twi: "Mogya tu",        risk: "high" },
  { id: "fever",     icon: Thermometer, en: "High Fever",     twi: "Hye boro",        risk: "high" },
  { id: "swollen",   icon: Footprints,  en: "Swollen Ankles", twi: "Nan abɔ ntonton", risk: "moderate" },
  { id: "abdominal", icon: Flame,       en: "Abdominal Pain", twi: "Yafunu yaw",      risk: "high" },
  { id: "dizziness", icon: Compass,     en: "Dizziness",      twi: "Tibɔ",            risk: "moderate" },
];

const TRIAGE_LEVELS = {
  none: null,
  mild: {
    label: { en: "Mild — Self Care", twi: "Mmere — Wo Ho Adamfo" },
    color: "bg-forest-green/10 border-forest-green/30 text-forest-green",
    icon: "check_circle",
    advice: { en: "Your symptoms appear mild. Rest, hydrate, and monitor. Call your midwife if symptoms worsen.", twi: "Wo yadeɛ yɛ mmerɛ. Home, nom nsuo, na hwɛ. Frɛ wo ɔwɔfoɔ sɛ ɛsɔ boro." },
  },
  moderate: {
    label: { en: "Moderate — Book Clinic Visit", twi: "Ewiem — Kɔ Ayaresabea" },
    color: "bg-earthen-ochre/10 border-earthen-ochre/30 text-earthen-ochre",
    icon: "calendar_month",
    advice: { en: "Please book a clinic visit within 24 hours. Do not ignore these symptoms.", twi: "Yɛ wo ara kɔ ayaresabea nnɔnhwerew 24 mu. Mma yadeɛ no nnye wo." },
  },
  high: {
    label: { en: "High Risk — Urgent Emergency", twi: "Ɔhaw Kɛseɛ — Ntɛm Ara" },
    color: "bg-error-container border-error text-error",
    icon: "emergency",
    advice: { en: "This is an emergency. Go to the nearest clinic immediately.", twi: "Ɔhaw kɛseɛ ni. Kɔ ayaresabea ntɛm ara." },
  },
};

function computeTriage(selectedPreset, customSymptoms) {
  const total = selectedPreset.length + customSymptoms.length;
  if (total === 0) return "none";
  const risks = selectedPreset.map(id => PRESET_SYMPTOMS.find(s => s.id === id)?.risk);
  // Custom typed symptoms default to "moderate"
  const allRisks = [...risks, ...customSymptoms.map(() => "moderate")];
  if (allRisks.includes("high")) return "high";
  if (allRisks.includes("moderate")) return "moderate";
  return "mild";
}

export default function Triage() {
  const { lang } = useLang();
  const [selected, setSelected]       = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customSymptoms, setCustom]   = useState([]);
  const [showModal, setShowModal]     = useState(false);

  const togglePreset = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addCustom = () => {
    const val = customInput.trim();
    if (!val || customSymptoms.includes(val)) return;
    setCustom(prev => [...prev, val]);
    setCustomInput("");
  };

  const removeCustom = (sym) => setCustom(prev => prev.filter(s => s !== sym));

  const clearAll = () => { setSelected([]); setCustom([]); setCustomInput(""); };

  const level  = computeTriage(selected, customSymptoms);
  const result = TRIAGE_LEVELS[level];
  const isEmergency = level === "high";
  const totalSelected = selected.length + customSymptoms.length;

  return (
    <div className="px-4 py-6 md:px-6 max-w-lg mx-auto">
      <h1 className="font-headline text-headline-md text-on-background mb-1">
        {lang === "twi" ? "Hwɛ Wo Yadeɛ" : "Check Symptoms"}
      </h1>
      <p className="text-on-surface-variant mb-5 text-sm">
        {lang === "twi"
          ? "Yi yadeɛ a wohunu, anaasɛ kyerɛw wo yadeɛ pono"
          : "Select preset symptoms or type your own below"}
      </p>

      {/* Preset Symptom Tiles */}
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
        {lang === "twi" ? "Yadeɛ a wɔnim" : "Common symptoms — tap to select"}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {PRESET_SYMPTOMS.map(s => {
          const Icon = s.icon;
          const isActive = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => togglePreset(s.id)}
              className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <Icon className={`w-7 h-7 ${isActive ? "text-on-primary" : "text-primary"}`} strokeWidth={1.75} />
              <span className="text-xs font-semibold text-center leading-tight">
                {lang === "twi" ? s.twi : s.en}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Symptom Input */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          {lang === "twi" ? "Kyerɛw wo yadeɛ pono" : "Type a custom symptom"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder={lang === "twi" ? "e.g. Nan yaw, bo yaw..." : "e.g. Back pain, nausea, blurred vision..."}
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold disabled:opacity-40 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Custom symptom chips */}
        {customSymptoms.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customSymptoms.map(sym => (
              <span
                key={sym}
                className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold"
              >
                {sym}
                <button onClick={() => removeCustom(sym)} className="text-primary/70 hover:text-primary">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Triage Result */}
      {result && (
        <div className={`rounded-2xl border p-5 mb-4 ${result.color}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[28px]">{result.icon}</span>
            <h2 className="font-headline text-headline-md">
              {lang === "twi" ? result.label.twi : result.label.en}
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            {lang === "twi" ? result.advice.twi : result.advice.en}
          </p>
          {isEmergency && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full bg-error text-on-error font-headline text-button py-3 rounded-full active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">emergency</span>
              {lang === "twi" ? "Frɛ Mmoa Ntɛm" : "Get Emergency Help Now"}
            </button>
          )}
        </div>
      )}

      {/* Clear */}
      {totalSelected > 0 && (
        <button
          onClick={clearAll}
          className="w-full border border-outline-variant text-on-surface-variant py-3 rounded-full text-sm hover:bg-surface-container-low transition-colors"
        >
          {lang === "twi" ? "Tew nyinaa" : `Clear all ${totalSelected} symptom${totalSelected !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-error z-50 flex flex-col items-center justify-center px-6 text-center">
          <span className="material-symbols-outlined text-on-error text-[72px] mb-4 animate-pulse">emergency</span>
          <h2 className="font-headline text-headline-lg text-on-error mb-2">
            {lang === "twi" ? "ƆHAW KƐSEƐ!" : "EMERGENCY!"}
          </h2>
          <p className="text-on-error text-lg font-semibold mb-2">Kɔ ayaresabea ntɛm ara</p>
          <p className="text-on-error/90 mb-8">Go to the nearest clinic immediately</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <a href="tel:112" className="bg-on-error text-error font-headline text-button py-4 rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
              <span className="material-symbols-outlined">call</span>
              Call 112 — National Ambulance
            </a>
            <a href="tel:193" className="bg-on-error/90 text-error font-headline text-button py-4 rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
              <span className="material-symbols-outlined">call</span>
              Call 193 — Emergency Services
            </a>
            <button onClick={() => setShowModal(false)} className="text-on-error/70 text-sm mt-2 underline">
              {lang === "twi" ? "Sane kɔ" : "Go back"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
