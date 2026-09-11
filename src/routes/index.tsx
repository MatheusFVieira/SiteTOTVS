import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  CheckSquare, 
  Plus, 
  Bot, 
  ArrowRight 
} from "lucide-react";
import { ClientCard } from "@/components/ClientCard";
import { NewClientModal } from "@/components/NewClientModal";
import { Button } from "@/components/ui/button";
import { getUsuarioLogado, UsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · TOTVS Meeting Insights" },
      { name: "description", content: "Visão estratégica e inteligência comercial autônoma." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    const syncUser = () => setUsuario(getUsuarioLogado());
    syncUser();

    window.addEventListener("auth-change", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const vendedorId = usuario?.idVendedor;

  // Busca apenas os clientes do vendedor logado
  const { data: clients = [], isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes-vendedor", vendedorId],
    queryFn: async () => {
      if (!vendedorId) return [];
      const res = await fetch(`http://localhost:8080/api/clientes/vendedor/${vendedorId}`);
      if (!res.ok) throw new Error("Erro ao buscar clientes");
      return res.json();
    },
    enabled: !!vendedorId,
  });

  // Busca as tarefas daquele vendedor para calcular as ações em aberto
  const { data: tarefas = [] } = useQuery({
    queryKey: ["tarefas", vendedorId],
    queryFn: async () => {
      if (!vendedorId) return [];
      const res = await fetch(`http://localhost:8080/api/tarefas/vendedor/${vendedorId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vendedorId,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Banner Principal TOTVS */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0b1329] p-8 text-white shadow-md">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Ecossistema TOTVS · Inteligência Conversacional Autônoma
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight">
            TOTVS Meeting Insights
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Diagnóstico de reuniões comerciais com extração autônoma de gaps operacionais, riscos de churn e direcionamento de soluções especializadas.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/transcricoes">
              <Button className="bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold gap-2">
                <Bot className="h-4 w-4" />
                Analisar Nova Transcrição
              </Button>
            </Link>

            <NewClientModal
              trigger={
                <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Conta
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Métricas do Vendedor Logado */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contas Cadastradas
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {clients.length}
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-blue-50 text-[#0066ff] flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline Analisado
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              100%
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">RAG Qwen 2.5 Online</p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Oportunidades Mapeadas
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {tarefas.length}
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ações em Aberto
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {tarefas.length}
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Contas em Acompanhamento (Apenas da carteira) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Contas em Acompanhamento
            </h2>
            <p className="text-xs text-muted-foreground">
              Registros integrados diretamente à base de dados do Oracle para{" "}
              <strong className="text-foreground">{usuario?.nomeVendedor || "sua conta"}</strong>.
            </p>
          </div>

          <Link
            to="/clientes"
            className="text-xs font-semibold text-[#0066ff] hover:underline flex items-center gap-1"
          >
            Ver base completa <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loadingClientes ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0066ff] border-t-transparent" />
            Carregando contas atribuídas no Oracle...
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-muted-foreground">
            Nenhuma conta atribuída a este vendedor no banco de dados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((c: any) => (
              <ClientCard key={c.idCliente} client={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}