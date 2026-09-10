import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  LogIn,
  Layers,
} from "lucide-react";
import { getUsuarioLogado, logout, UsuarioLogado } from "@/lib/auth";

export function AppSidebar() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const location = useLocation();

  useEffect(() => {
    const carregar = () => setUsuario(getUsuarioLogado());
    carregar();

    window.addEventListener("auth-change", carregar);
    window.addEventListener("storage", carregar);

    return () => {
      window.removeEventListener("auth-change", carregar);
      window.removeEventListener("storage", carregar);
    };
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transcricoes", label: "Transcrições", icon: FileText },
    { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
    { to: "/clientes", label: "Clientes", icon: Users },
    ...(usuario?.admin === "S"
      ? [{ to: "/usuarios", label: "Gestão de Vendedores", icon: ShieldCheck, destaque: true }]
      : []),
    { to: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="sticky top-0 left-0 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between overflow-hidden">
      {/* Área superior scrollável internamente se houver muitos links */}
      <div className="flex flex-col gap-6 p-4 overflow-y-auto">
        {/* Topo / Logotipo e Título clicáveis para o Dashboard */}
        <div className="flex items-center justify-between px-2 pt-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-85"
            title="Ir para o Dashboard"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-sidebar-foreground leading-none">
                TOTVS Insights
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Meeting Agent
              </p>
            </div>
          </Link>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            v1.0
          </span>
        </div>

        {/* Links de Navegação */}
        <nav className="flex flex-col gap-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  item.destaque
                    ? "text-[#0066ff] bg-blue-50/60 font-semibold"
                    : "text-sidebar-foreground/80"
                }`}
                activeProps={{
                  className: "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-xs",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.destaque && (
                  <span className="ml-auto text-[9px] uppercase font-bold tracking-wider bg-[#0066ff] text-white px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé fixo do Vendedor Logado e Logout */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar shrink-0">
        {usuario ? (
          <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {usuario.nomeVendedor?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight text-sidebar-foreground truncate">
                  {usuario.nomeVendedor}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {usuario.admin === "S" ? "Administrador" : usuario.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Terminar sessão (Logout)"
              className="ml-2 p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Fazer Login</span>
          </Link>
        )}
      </div>
    </aside>
  );
}