import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  ChevronRight,
  HeartHandshake,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUsuarioLogado, UsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas · TOTVS Meeting Insights" },
      { name: "description", content: "Ações comerciais pendentes geradas pelo agente de IA." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any | null>(null);

  useEffect(() => {
    const carregarUsuario = () => {
      const u = getUsuarioLogado();
      setUsuario(u);
    };

    carregarUsuario();
    window.addEventListener("auth-change", carregarUsuario);
    window.addEventListener("storage", carregarUsuario);

    return () => {
      window.removeEventListener("auth-change", carregarUsuario);
      window.removeEventListener("storage", carregarUsuario);
    };
  }, []);

  const vendedorId = usuario?.idVendedor;

  const { data: tarefas = [], isLoading } = useQuery({
    queryKey: ["tarefas", vendedorId],
    queryFn: async () => {
      if (!vendedorId) return [];
      const res = await fetch(`http://localhost:8080/api/tarefas/vendedor/${vendedorId}`);
      if (!res.ok) throw new Error("Falha ao carregar tarefas do vendedor");
      return res.json();
    },
    enabled: !!vendedorId,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10 space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Plano de Ação Comercial
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clique em qualquer tarefa para inspecionar os insights, oportunidade e risco calculados pela IA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
          <User className="h-4 w-4 text-[#0066ff]" />
          <span className="text-xs text-muted-foreground">Vendedor:</span>
          <span className="font-mono text-xs font-bold text-slate-800">
            {usuario ? `${usuario.nomeVendedor} (ID #${usuario.idVendedor})` : "Carregando..."}
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0066ff] border-t-transparent" />
          Carregando tarefas no Oracle para {usuario?.nomeVendedor}...
        </div>
      ) : tarefas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-muted-foreground space-y-2">
          <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="font-medium text-foreground">
            Nenhuma tarefa pendente para {usuario?.nomeVendedor || "este vendedor"}.
          </p>
          <p className="text-xs text-slate-500">
            Envie novas transcrições vinculadas a empresas da sua carteira para disparar as recomendações da IA.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {tarefas.map((t: any) => {
            const isUrgente = t.statusAlerta === "URGENTE" || t.ameacaChurn === "ALTO";

            return (
              <div
                key={t.idAcao}
                onClick={() => setTarefaSelecionada(t)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-blue-50/40 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-5 w-5 text-slate-300 group-hover:text-[#0066ff] transition-colors mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-[#0066ff] transition-colors">
                      {t.titulo}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {t.razaoSocial}
                      </span>
                      <span>·</span>
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-[#0066ff] border border-blue-100">
                        {t.produto}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" /> {t.dataAcao}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 self-start sm:self-center">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1 ${
                      isUrgente
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {isUrgente && <AlertTriangle className="h-3 w-3" />}
                    {isUrgente ? "Urgente / Risco" : "Sugestão Comercial"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#0066ff] transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Card Detalhado */}
      <Dialog open={!!tarefaSelecionada} onOpenChange={(open) => !open && setTarefaSelecionada(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {tarefaSelecionada && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-semibold text-[#0066ff] w-fit mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Diagnóstico da IA · Ação #{tarefaSelecionada.idAcao}
                </div>
                <DialogTitle className="font-display text-xl font-bold text-foreground">
                  {tarefaSelecionada.razaoSocial}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Data de extração: {tarefaSelecionada.dataAcao}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0066ff]">
                  Solução TOTVS Sugerida
                </span>
                <p className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {tarefaSelecionada.produto}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Produto homologado para sanar as inconsistências operacionais detectadas na reunião.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                    Risco de Churn
                  </span>
                  <span
                    className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded ${
                      tarefaSelecionada.ameacaChurn === "ALTO"
                        ? "bg-red-100 text-red-700"
                        : tarefaSelecionada.ameacaChurn === "MEDIO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {tarefaSelecionada.ameacaChurn || "BAIXO"}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                    Oportunidade
                  </span>
                  <span className="inline-block mt-1 font-bold text-slate-800">
                    {tarefaSelecionada.oportunidadeUpsell || "UPSELL"}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                    Sentimento Detectado
                  </span>
                  <span className="inline-block mt-1 font-semibold text-slate-800">
                    {tarefaSelecionada.sentimentoGeral || "NEUTRO"}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                    Orçamento Estimado
                  </span>
                  <span className="inline-block mt-1 font-mono font-bold text-slate-900">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      tarefaSelecionada.orcamentoEstimado || 0
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4 text-[#0066ff]" />
                  Direcionamento Comercial
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tarefaSelecionada.titulo}. Inicie o contato comercial mitigando os riscos mapeados na reunião para manter o cliente na base.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setTarefaSelecionada(null)}>
                  Fechar
                </Button>
                <Button size="sm" className="bg-[#0066ff] hover:bg-[#0052cc] text-white">
                  Marcar como Concluída
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}