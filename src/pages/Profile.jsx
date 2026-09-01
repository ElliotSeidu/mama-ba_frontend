import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import {
  User,
  Mic,
  Volume2,
  Square,
  Pause,
  Play,
  Globe,
  PhoneCall,
  ShieldAlert,
  Lock,
  KeyRound,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const {
    lang,
    setLang,
    voiceLang,
    setVoiceLang,
    isSpeaking,
    isPaused,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    playVoiceSample,
  } = useLang();
  const navigate = useNavigate();

  const [notificationMsg, setNotificationMsg] = useState("");

  // Stop speech if navigating away
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const handleSwitchVoice = (vl) => {
    stopSpeech();
    setVoiceLang(vl, true); // update context and play full sample
    if (setUser) {
      setUser((prev) => ({ ...prev, voiceLanguage: vl }));
    }
    setNotificationMsg(
      vl === "twi"
        ? "Voice assistant switched to Twi (Akwaaba!)"
        : "Voice assistant switched to English"
    );
    setTimeout(() => setNotificationMsg(""), 3000);
  };

  const handleTogglePlay = () => {
    if (isSpeaking && !isPaused) {
      pauseSpeech();
    } else if (isPaused) {
      resumeSpeech();
    } else {
      playVoiceSample(voiceLang);
    }
  };

  const handleSwitchAppLang = (l) => {
    setLang(l);
    if (setUser) {
      setUser((prev) => ({ ...prev, language: l }));
    }
  };

  const handleLogout = async () => {
    stopSpeech();
    await logout();
    navigate("/signin", { replace: true });
  };

  const sampleTranscript =
    voiceLang === "twi"
      ? "“Akwaaba! Me ne Mama Ba, wo nnamfo pa wɔ nyinsɛn mu. Metumi aboa wo wɔ apomuden ne wo ba no ho.”"
      : "“Welcome to Mama Ba! I am your personal maternal health companion, here to support you through your pregnancy and early motherhood.”";

  return (
    <div className="px-4 py-6 md:px-6 max-w-lg mx-auto flex flex-col gap-6 pb-24">
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-3 shadow-sm">
          <User className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-headline-lg text-primary">
          {user?.name || (lang === "twi" ? "Wo Akawnt" : "Your Account")}
        </h1>
        <p className="text-on-surface-variant text-sm">{user?.email}</p>
      </section>

      {/* Instant Feedback Toast */}
      {notificationMsg && (
        <div className="bg-forest-green/10 border border-forest-green/30 text-forest-green px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ═══ VOICE ASSISTANT & LANGUAGE SETTINGS ═══ */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface">
              {lang === "twi" ? "Kasa Mmoafo Nhyehyɛe" : "Voice Assistant Language"}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {lang === "twi"
                ? "Sesa kasa a Mama Ba de kasa kyerɛ wo"
                : "Choose the language Mama Ba speaks and listens to"}
            </p>
          </div>
        </div>

        {/* Voice Assistant Switcher Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Twi */}
          <button
            type="button"
            onClick={() => handleSwitchVoice("twi")}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
              voiceLang === "twi"
                ? "bg-primary-container/20 border-primary shadow-sm ring-1 ring-primary"
                : "bg-surface-container border-outline-variant hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-lg">🇬🇭</span>
              {voiceLang === "twi" ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-outline-variant" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Twi Voice</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Asante Twi speech</p>
            </div>
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => handleSwitchVoice("en")}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
              voiceLang === "en"
                ? "bg-primary-container/20 border-primary shadow-sm ring-1 ring-primary"
                : "bg-surface-container border-outline-variant hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-lg">🇬🇧</span>
              {voiceLang === "en" ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-outline-variant" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">English Voice</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">English speech</p>
            </div>
          </button>
        </div>

        {/* App UI Language Toggle */}
        <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-outline" />
            <span className="text-xs font-semibold text-on-surface">
              {lang === "twi" ? "App No Kasa (App Display):" : "App Display Language:"}
            </span>
          </div>

          <div className="flex gap-1 bg-surface-container p-1 rounded-full border border-outline-variant">
            <button
              type="button"
              onClick={() => handleSwitchAppLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                lang === "en"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAppLang("twi")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                lang === "twi"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Twi
            </button>
          </div>
        </div>
      </section>

      {/* Support & Safety Section */}
      <section>
        <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-1 text-xs font-semibold">
          {lang === "twi" ? "Mmoa & Banbɔ" : "Support & Safety"}
        </h2>
        <div className="flex flex-col divide-y divide-outline-variant bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <Link
            to="emergency-contacts"
            className="flex items-center justify-between px-4 py-4 text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="text-on-surface text-sm font-medium">
                {lang === "twi" ? "Nhyiam a Wɔfrɛ Ntɛm" : "Emergency Contacts"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" strokeWidth={1.5} />
          </Link>

          <Link
            to="health-disclaimer"
            className="flex items-center justify-between px-4 py-4 text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="text-on-surface text-sm font-medium">
                {lang === "twi" ? "Apomuden Nkaebɔ" : "Health Disclaimer"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Account Section */}
      <section>
        <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-1 text-xs font-semibold">
          {lang === "twi" ? "Akawnt Nhyehyɛe" : "Account Settings"}
        </h2>
        <div className="flex flex-col divide-y divide-outline-variant bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <Link
            to="privacy-data"
            className="flex items-center justify-between px-4 py-4 text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="text-on-surface text-sm font-medium">
                {lang === "twi" ? "Wo Ho Nsɛm & Banbɔ" : "Privacy & Data"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" strokeWidth={1.5} />
          </Link>

          <Link
            to="change-password"
            className="flex items-center justify-between px-4 py-4 text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="text-on-surface text-sm font-medium">
                {lang === "twi" ? "Sesa Wo Password" : "Change Password"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" strokeWidth={1.5} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between px-4 py-4 text-left hover:bg-error-container/40 transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-error" strokeWidth={1.5} />
              <span className="text-error font-semibold text-sm">
                {lang === "twi" ? "Pue Wɔ Mu (Sign Out)" : "Sign Out"}
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}