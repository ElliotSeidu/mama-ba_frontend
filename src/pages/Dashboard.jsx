import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { medications as medsAPI } from "../services/api.js";
import { showDeviceNotification, scheduleAlarm, nextOccurrenceMs } from "../services/notifications.js";
import {
  Baby, Leaf, AlertTriangle, HeartPulse, MapPin,
  ChevronRight, Mic, Check, Clock, Plus, Trash2, Loader2,
} from "lucide-react";

// Baby size lookup by gestational week
const BABY_SIZE = {
  4: { en: "a poppy seed", twi: "abɔ ketewa" },
  8: { en: "a raspberry", twi: "afrow" },
  12: { en: "a lime", twi: "ankaa ketewa" },
  16: { en: "an avocado", twi: "apɛrɛkɔ" },
  20: { en: "a banana", twi: "kwadu" },
  24: { en: "an ear of corn", twi: "aburoɔ" },
  28: { en: "an eggplant", twi: "ntroba" },
  32: { en: "a squash", twi: "aboɔ" },
  36: { en: "a honeydew melon", twi: "kwadu kesee" },
  40: { en: "a small watermelon", twi: "ɛkuankoa" },
};

function getBabySize(week) {
  const keys = Object.keys(BABY_SIZE).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, cur) =>
    Math.abs(cur - week) < Math.abs(prev - week) ? cur : prev
  );
  return BABY_SIZE[closest];
}

function computeWeek(dueDate) {
  if (!dueDate) return null;
  const msLeft = new Date(dueDate) - new Date();
  const weeksLeft = Math.max(0, Math.round(msLeft / (7 * 24 * 60 * 60 * 1000)));
  return Math.min(40, Math.max(1, 40 - weeksLeft));
}

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const { lang } = useLang();
  const { addNotification } = useNotifications();
  const name = user?.name || (lang === "twi" ? "Ɛho" : "there");

  const week    = computeWeek(user?.dueDate);
  const size    = week ? getBabySize(week) : null;
  const dashOff = week ? 251.2 - (week / 40) * 251.2 : 251.2;

  const [recording, setRecording] = useState(false);

  // Medications
  const [meds, setMeds]           = useState([]);
  const [medsLoading, setMedsLoading] = useState(true);
  const [checked, setChecked]     = useState([]);
  const [addOpen, setAddOpen]     = useState(false);
  const [medName, setMedName]     = useState("");
  const [medTime, setMedTime]     = useState("");
  const [saving, setSaving]       = useState(false);

  // Alarm cleanup refs: map of medId → cancel function
  const alarmCancellers = useRef({});

  // ── Load medications ───────────────────────────────────────────────────────
  const loadMeds = useCallback(() => {
    if (!accessToken) return;
    setMedsLoading(true);
    medsAPI.list(accessToken)
      .then(setMeds)
      .catch(() => setMeds([]))
      .finally(() => setMedsLoading(false));
  }, [accessToken]);

  useEffect(() => { loadMeds(); }, [loadMeds]);

  // ── Schedule / reschedule alarms whenever med list changes ─────────────────
  useEffect(() => {
    // Cancel all existing alarms
    Object.values(alarmCancellers.current).forEach(fn => fn?.());
    alarmCancellers.current = {};

    meds.forEach((med) => {
      if (!med.time) return;
      try {
        const targetMs = nextOccurrenceMs(med.time);
        const cancel = scheduleAlarm(
          targetMs,
          lang === "twi" ? "Nnuro Bere!" : "Medication Time!",
          lang === "twi"
            ? `Bere a wubegye wo nnuro – ${med.label}`
            : `Time to take ${med.label}`
        );
        alarmCancellers.current[med.id] = cancel;

        // Also queue an in-app notification at the same time
        const delay = targetMs - Date.now();
        const inAppId = setTimeout(() => {
          addNotification({
            type: "reminder",
            titleEn: "Medication Time!",
            titleTwi: "Nnuro Bere!",
            bodyEn: `Time to take ${med.label}`,
            bodyTwi: `Bere a wubegye wo nnuro – ${med.label}`,
          });
        }, delay);

        // Store both cancellers
        const prevCancel = alarmCancellers.current[med.id];
        alarmCancellers.current[med.id] = () => {
          prevCancel?.();
          clearTimeout(inAppId);
        };
      } catch {
        /* ignore malformed time strings */
      }
    });

    return () => {
      Object.values(alarmCancellers.current).forEach(fn => fn?.());
    };
  }, [meds, lang, addNotification]);

  const toggleMed = (id) =>
    setChecked((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddMed = async (e) => {
    e.preventDefault();
    if (!medName.trim() || !medTime.trim()) return;
    setSaving(true);
    try {
      const item = await medsAPI.create(accessToken, { label: medName.trim(), time: medTime.trim() });
      setMeds((prev) => [...prev, item]);
      setMedName(""); setMedTime(""); setAddOpen(false);

      // Immediate confirmation notification
      showDeviceNotification(
        lang === "twi" ? "Nnuro Fa Ho" : "Medication Added",
        lang === "twi"
          ? `${item.label} – wobɛkae wo sɛ wubegye ${item.time}`
          : `${item.label} — you'll be reminded at ${item.time}`
      );
      addNotification({
        type: "reminder",
        titleEn: "Medication Added",
        titleTwi: "Nnuro Fa Ho",
        bodyEn: `${item.label} — you'll be reminded daily at ${item.time}`,
        bodyTwi: `${item.label} – wobɛkae wo sɛ wubegye ${item.time}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMed = async (id) => {
    // Cancel the alarm for this med
    alarmCancellers.current[id]?.();
    delete alarmCancellers.current[id];

    await medsAPI.remove(accessToken, id);
    setMeds((prev) => prev.filter(m => m.id !== id));
    setChecked((prev) => prev.filter(x => x !== id));
  };

  return (
    <div className="px-4 py-6 md:px-6 flex flex-col gap-6 max-w-lg mx-auto pb-24">

      {/* Hero greeting */}
      <section className="flex flex-col items-center text-center gap-2">
        <div className="relative w-32 h-32 mb-1 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
            {week && (
              <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40"
                stroke="currentColor" strokeWidth="8"
                strokeDasharray="251.2" strokeDashoffset={dashOff} strokeLinecap="round"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
            {week ? (
              <>
                <span className="text-3xl font-bold leading-none">{week}</span>
                <span className="text-xs uppercase tracking-widest mt-1">{lang === "twi" ? "Nnawɔtwe" : "Weeks"}</span>
              </>
            ) : (
              <span className="material-symbols-outlined text-4xl opacity-50">pregnant_woman</span>
            )}
          </div>
        </div>
        <h1 className="font-headline text-headline-md text-on-surface">
          {lang === "twi" ? `Akwaaba, ${name}` : `Hello, ${name}`}
        </h1>
        {week && size ? (
          <p className="text-on-surface-variant text-sm">
            {lang === "twi" ? `Wo ba su sɛ ${size.twi}!` : `Your baby is the size of ${size.en}!`}
          </p>
        ) : (
          <p className="text-on-surface-variant text-sm">
            {lang === "twi"
              ? "Fa wo da a wobɛwoo no akye wo profile mu."
              : "Add your due date in your profile to see your progress."}
          </p>
        )}
      </section>

      {/* Voice Button */}
      <section className="flex flex-col items-center gap-3">
        <button
          onClick={() => setRecording(r => !r)}
          aria-label={lang === "twi" ? "Bisa me biribiara" : "Ask me anything"}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            recording ? "bg-error text-on-error" : "bg-primary text-on-primary"
          }`}
        >
          <Mic className="w-10 h-10" strokeWidth={1.5} />
        </button>
        {recording && (
          <div className="flex items-center gap-1 h-8">
            {[1,2,3,4,5,4,3,2,1].map((h, i) => (
              <span key={i} className="w-1 rounded-full bg-primary"
                style={{ height: `${h*6}px`, animation: `pulse 0.8s ease-in-out ${i*0.08}s infinite alternate` }} />
            ))}
          </div>
        )}
        <p className="text-on-surface-variant text-sm font-semibold">
          {lang === "twi" ? "Bisa me biribiara" : "Ask me anything"}
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="font-headline text-headline-md text-on-surface mb-3">
          {lang === "twi" ? "Yɛ biribi ntɛm" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/app/maternal" className="bg-primary-container/30 border border-primary/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:bg-primary-container/50 transition-colors">
            <Baby className="w-7 h-7 text-primary" strokeWidth={1.5} />
            <span className="text-label-md text-on-surface text-sm leading-tight">{lang === "twi" ? "Maame & Ba" : "Maternal & Baby Tracker"}</span>
          </Link>
          <Link to="/app/safety" className="bg-forest-green/10 border border-forest-green/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:bg-forest-green/20 transition-colors">
            <Leaf className="w-7 h-7 text-forest-green" strokeWidth={1.5} />
            <span className="text-label-md text-on-surface text-sm leading-tight">{lang === "twi" ? "Afifide & Nnuro" : "Herbal & Medication Safety"}</span>
          </Link>
          <Link to="/app/triage" className="bg-error-container/40 border border-error/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:bg-error-container/60 transition-colors">
            <AlertTriangle className="w-7 h-7 text-error" strokeWidth={1.5} />
            <span className="text-label-md text-on-surface text-sm leading-tight">{lang === "twi" ? "Hwɛ Yadeɛ" : "Check Symptoms"}</span>
          </Link>
          <Link to="/app/vitals" className="bg-tertiary-container/20 border border-tertiary/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:bg-tertiary-container/40 transition-colors">
            <HeartPulse className="w-7 h-7 text-tertiary" strokeWidth={1.5} />
            <span className="text-label-md text-on-surface text-sm leading-tight">{lang === "twi" ? "Gye Apomuden Nkae" : "Log Daily Vitals"}</span>
          </Link>
          <Link to="/app/care" className="col-span-2 bg-secondary-container/20 border border-secondary/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-secondary-container/40 transition-colors">
            <MapPin className="w-7 h-7 text-secondary shrink-0" strokeWidth={1.5} />
            <div className="text-left flex-1">
              <span className="text-label-md text-on-surface block">{lang === "twi" ? "Hwɛ Adwumakuw a Ɛbɛn Wo" : "Find Nearby Pharmacy"}</span>
              <span className="text-sm text-on-surface-variant">{lang === "twi" ? "Ayaresabea ne Adwumakuw" : "Book appointments & order meds"}</span>
            </div>
            <ChevronRight className="ml-auto text-outline w-6 h-6" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Today's Medications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline text-headline-md text-on-surface">
            {lang === "twi" ? "Nnuro Ɛnnɛ" : "Today's Medications"}
          </h2>
          <button
            onClick={() => setAddOpen(o => !o)}
            aria-label={lang === "twi" ? "Fa nnuro" : "Add medication"}
            className="p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {addOpen && (
          <form onSubmit={handleAddMed} className="mb-3 bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-on-surface">{lang === "twi" ? "Fa Nnuro Foforo" : "Add Medication"}</p>
            <input
              type="text" required
              placeholder={lang === "twi" ? "Nnuro din (e.g. Iron & Folic Acid)" : "Medication name (e.g. Iron & Folic Acid)"}
              value={medName} onChange={e => setMedName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">{lang === "twi" ? "Bere a wubegye" : "Time to take"}</label>
              <input
                type="time" required value={medTime} onChange={e => setMedTime(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAddOpen(false); setMedName(""); setMedTime(""); }}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                {lang === "twi" ? "Gyae" : "Cancel"}
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {lang === "twi" ? "Fa Ho" : "Save"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          {medsLoading && <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}

          {!medsLoading && meds.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl opacity-40">medication</span>
              <p className="text-sm">{lang === "twi" ? "Nnuro biara nni hɔ" : "No medications added yet"}</p>
              <button onClick={() => setAddOpen(true)} className="text-xs text-primary font-semibold mt-1">
                + {lang === "twi" ? "Fa nnuro" : "Add one"}
              </button>
            </div>
          )}

          {!medsLoading && meds.length > 0 && (
            <div className="divide-y divide-outline-variant">
              {meds.map(med => (
                <div key={med.id} className="flex items-center gap-3 px-4 py-4">
                  <button onClick={() => toggleMed(med.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked.includes(med.id) ? "bg-forest-green border-forest-green" : "border-outline-variant"
                    }`}>
                    {checked.includes(med.id) && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${checked.includes(med.id) ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                      {med.label}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "twi" ? `Gye ${med.time}` : `Take at ${med.time}`}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteMed(med.id)} aria-label="Remove medication"
                    className="p-1.5 text-outline hover:text-error transition-colors rounded-full hover:bg-error/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* This Week */}
      {week && (
        <section>
          <h2 className="font-headline text-headline-md text-on-surface mb-3">
            {lang === "twi" ? "Nnawɔtwe Yi Mu Afotu" : "This Week for You"}
          </h2>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="w-full h-48 bg-[#F8EFE6] relative overflow-hidden">
              <img src="https://media.istockphoto.com/id/2229743222/photo/pregnant-woman-in-therapy-session-mental-health-care.webp?a=1&b=1&s=612x612&w=0&k=20&c=SpsvNV36yQOW7rVv4C00R8KP8XiBzW8RVZwohmUKhOQ=" alt="Weekly Wellness Tip" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <span className="text-sm font-bold text-[#964B22]">{lang === "twi" ? "Ahomegye ne Nsuonom" : "Rest & Hydration"}</span>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {lang === "twi"
                  ? "Sɛ wo ba no renyini ntɛmntɛm nnawɔtwe yi a, wubetumi atumi abrɛ paa. Bɔ mmɔden nom nsuo kuruwa 8 da biara na ma wo nan so..."
                  : "As your baby grows rapidly this week, you might feel more fatigued. Aim for 8 glasses of water a day and elevate your feet when resting..."}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}