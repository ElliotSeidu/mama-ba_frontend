import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.name || "there";

  return (
    <div className="px-4 py-6 flex flex-col gap-8 max-w-md mx-auto">
      <section className="flex flex-col items-center text-center">
        <div className="relative w-36 h-36 mb-3 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
            <circle
              className="text-primary"
              cx="50" cy="50" fill="transparent" r="40"
              stroke="currentColor" strokeWidth="8"
              strokeDasharray="251.2" strokeDashoffset="100.48" strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
            <span className="text-3xl font-bold leading-none">24</span>
            <span className="text-xs uppercase tracking-widest mt-1">Weeks</span>
          </div>
        </div>
        <h1 className="font-headline text-headline-md text-on-surface">Hello, {name}</h1>
        <p className="text-on-surface-variant mt-1">Your baby is the size of an ear of corn!</p>
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
        <p className="text-label-md text-primary uppercase tracking-wider mb-1">Next ANC Checkup</p>
        <p className="font-headline text-headline-md text-on-surface">Oct 12, 2026</p>
        <p className="text-on-surface-variant mt-1 mb-4">3rd Trimester Scan &amp; Bloodwork</p>
        <button className="w-full bg-primary text-on-primary font-headline text-button py-3 rounded-full active:scale-95 transition-transform flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          Remind Me
        </button>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/app/ask" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center gap-3 text-center hover:bg-surface-container-low transition-colors">
          <div className="bg-primary-container text-on-primary-container w-12 h-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">mic</span>
          </div>
          <span className="text-label-md text-on-surface">Ask a Question</span>
        </Link>
        <Link to="/app/tracker" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center gap-3 text-center hover:bg-surface-container-low transition-colors">
          <div className="bg-secondary-container text-on-secondary-container w-12 h-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <span className="text-label-md text-on-surface">Symptoms</span>
        </Link>
        <Link to="/app/safety" className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
          <div className="bg-tertiary-container text-on-tertiary-container w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <div className="text-left">
            <span className="text-label-md text-on-surface block">Check Herbal Safety</span>
            <span className="text-sm text-on-surface-variant block mt-0.5">Verify traditional medicines before use</span>
          </div>
          <span className="material-symbols-outlined ml-auto text-outline">chevron_right</span>
        </Link>
      </section>

      <section>
        <h2 className="font-headline text-headline-md text-on-surface mb-3">This Week for You</h2>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h3 className="text-label-md text-primary mb-2">Rest &amp; Hydration</h3>
          <p className="text-on-surface-variant">
            As your baby grows rapidly this week, you might feel more fatigued. Aim for 8
            glasses of water a day and elevate your feet when resting to reduce swelling.
          </p>
        </div>
      </section>
    </div>
  );
}