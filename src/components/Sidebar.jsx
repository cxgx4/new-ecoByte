import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Map as MapIcon, BellRing, Server, Leaf } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Sidebar() {
  const location = useLocation();
  const { authRole } = useAppContext();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "AuraPath", path: "/map", icon: MapIcon },
    { name: "Alerts", path: "/alerts", icon: BellRing },
  ];

  if (authRole === "admin") {
    links.push({ name: "System", path: "/system", icon: Server });
  }

  return (
    <aside className="w-64 h-screen bg-slate-100 dark:bg-slate-900 border-r border-gray-200 dark:border-white/10 p-6 flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-3 mb-10 text-neon-green">
        <Leaf className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wider relative top-0.5">
          EcoByte
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {links.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                ? "bg-white dark:bg-white/10 text-neon-green shadow-sm ring-1 ring-gray-200 dark:ring-white/5"
                : "text-slate-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-gray-200"
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-neon-green" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-3 text-xs text-slate-500 dark:text-gray-500 flex flex-col gap-1">
        <span>v.2.0.1_beta</span>
        <span>EcoByte Neural Net ™</span>
      </div>
    </aside>
  );
}