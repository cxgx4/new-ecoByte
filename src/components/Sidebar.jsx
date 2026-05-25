import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Map as MapIcon, BellRing, Server, Leaf, Eye } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Sidebar() {
  const location = useLocation();
  const { authRole } = useAppContext();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "AuraPath", path: "/map", icon: MapIcon },
    { name: "AirIQ", path: "/forecast", icon: Eye },
    { name: "Alerts", path: "/alerts", icon: BellRing },
  ];

  if (authRole === "admin") {
    links.push({ name: "System", path: "/system", icon: Server });
  }

  return (
    <aside className="fixed bottom-0 left-0 w-full z-50 h-[calc(56px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[var(--bg-surface)] border-t border-[var(--border)] flex flex-row px-2 md:relative md:w-[220px] md:h-screen md:flex-col md:bg-[var(--bg-base)] md:border-t-0 md:border-r md:p-6 md:pb-6 transition-colors duration-300">
      <div className="hidden md:flex items-center gap-3 mb-10 text-[var(--accent-green)]">
        <Leaf className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-[-0.02em] font-sora relative top-0.5">
          EcoByte
        </h1>
      </div>

      <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full flex-1 md:flex-none items-center md:items-stretch justify-around md:justify-start mt-1 md:mt-0">
        {links.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 transition-all flex-1 md:flex-none justify-center md:justify-start ${
                isActive
                  ? "text-[var(--text-primary)] md:bg-[var(--bg-elevated)] md:border-l-[3px] md:border-[var(--accent-green)] md:rounded-r-lg"
                  : "text-[var(--text-muted)] hover:bg-[rgba(34,197,94,0.06)] md:rounded-r-lg"
              }`}
            >
              <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? "text-[var(--accent-green)]" : ""}`} />
              <span className="text-[10px] md:text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex mt-auto px-4 py-3 text-[9px] text-[var(--text-muted)] opacity-50 flex-col gap-1">
        <span>v.2.0.1_beta</span>
        <span>EcoByte Neural Net ™</span>
      </div>
    </aside>
  );
}