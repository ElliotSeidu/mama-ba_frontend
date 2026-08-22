import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/app", label: "Home", icon: "home", end: true },
  { to: "/app/ask", label: "Ask", icon: "mic" },
  { to: "/app/tracker", label: "Tracker", icon: "calendar_today" },
  { to: "/app/safety", label: "Safety", icon: "health_and_safety" },
  { to: "/app/profile", label: "Profile", icon: "person" },
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto w-full md:max-w-md min-h-screen md:shadow-xl md:border-x md:border-outline-variant">
        <header className="fixed top-0 inset-x-0 mx-auto w-full md:max-w-md z-40 flex items-center h-14 px-4 bg-background/95 backdrop-blur-sm border-b border-outline-variant">
          <span className="font-headline text-headline-md text-primary font-bold">Mama Ba</span>
        </header>

        <main className="pt-14 pb-24 min-h-screen">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 inset-x-0 mx-auto w-full md:max-w-md z-40 flex justify-around items-center px-2 py-2 bg-surface-container border-t border-outline-variant rounded-t-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-4 py-1 rounded-2xl transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-variant"
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}