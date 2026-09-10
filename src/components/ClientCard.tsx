import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientCard({ client }: { client: any }) {
  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0066ff]">
              {client.segmento || "Geral"}
            </span>
            <h3 className="truncate font-display text-base font-bold text-foreground mt-0.5">
              {client.razaoSocial}
            </h3>
            <p className="truncate text-xs font-mono text-muted-foreground mt-0.5">
              CNPJ: {client.cnpj}
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            ID #{client.idCliente}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-3">
          Conta comercial vinculada. Análises de IA realizadas nesta conta são atribuídas automaticamente ao executivo de contas responsável.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span>Vendedor Resp.: <strong className="text-foreground">{client.idVendedor}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild size="sm" variant="ghost" className="h-8 gap-1 text-[#0066ff] hover:bg-blue-50 font-medium">
            <Link to="/clientes/$clientId" params={{ clientId: String(client.idCliente) }}>
              Detalhes
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}