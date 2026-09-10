import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Cpu, Bell, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { getUsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · TOTVS Meeting Insights" },
      { name: "description", content: "Preferências da workspace e segurança." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const usuario = getUsuarioLogado();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (novaSenha !== confirmaSenha) {
      setStatusMsg({ tipo: "erro", texto: "As palavras-passe não coincidem." });
      return;
    }

    if (!usuario?.idVendedor) {
      setStatusMsg({ tipo: "erro", texto: "Utilizador não autenticado." });
      return;
    }

    setCarregandoSenha(true);

    try {
      const res = await fetch(`http://localhost:8080/api/auth/alterar-senha/${usuario.idVendedor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha }),
      });

      if (!res.ok) throw new Error("Erro na requisição");

      setStatusMsg({ tipo: "ok", texto: "Palavra-passe alterada com sucesso!" });
      setNovaSenha("");
      setConfirmaSenha("");
    } catch {
      setStatusMsg({ tipo: "erro", texto: "Falha ao atualizar a palavra-passe no Oracle." });
    } finally {
      setCarregandoSenha(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Configurações da Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Faça a gestão das suas credenciais corporativas, segurança e parâmetros da IA.
        </p>
      </header>

      <div className="space-y-6">
        {/* Perfil */}
        <Card title="Perfil do Utilizador" icon={<User className="h-4 w-4 text-[#0066ff]" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome Completo" defaultValue={usuario?.nomeVendedor || "Vendedor TOTVS"} />
            <Field label="E-mail Corporativo" defaultValue={usuario?.email || "vendedor@totvs.com.br"} />
            <Field label="Perfil de Acesso" defaultValue={usuario?.admin === "S" ? "Administrador" : "Vendedor Regular"} />
            <Field label="Workspace" defaultValue="TOTVS São Paulo" />
          </div>
        </Card>

        {/* Segurança e Palavra-passe */}
        <Card title="Segurança & Palavra-passe" icon={<Lock className="h-4 w-4 text-[#0066ff]" />}>
          <form onSubmit={handleTrocarSenha} className="space-y-4 max-w-md pt-2">
            {statusMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  statusMsg.tipo === "ok"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {statusMsg.tipo === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {statusMsg.texto}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">Nova Palavra-passe</Label>
              <Input
                type="password"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">Confirmar Nova Palavra-passe</Label>
              <Input
                type="password"
                required
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={carregandoSenha}
              className="bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold text-xs"
            >
              {carregandoSenha ? "A atualizar..." : "Atualizar Palavra-passe"}
            </Button>
          </form>
        </Card>

        {/* IA & Automações */}
        <Card title="IA & Automações" icon={<Cpu className="h-4 w-4 text-[#0066ff]" />}>
          <Toggle
            label="Gerar resumos automáticos"
            description="Executa o parsing semântico e sumarização a cada nova transcrição enviada."
            defaultChecked
          />
          <Toggle
            label="Sugerir próximos passos"
            description="Gera recomendações de follow-up alinhadas ao portfólio TOTVS."
            defaultChecked
          />
        </Card>

        {/* Alertas */}
        <Card title="Alertas & Notificações" icon={<Bell className="h-4 w-4 text-[#0066ff]" />}>
          <Toggle
            label="Lembretes de follow-up comercial"
            description="Receba avisos com 24h de antecedência para contas com risco de churn elevado."
            defaultChecked
          />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {icon}
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </h2>
      </div>
      <div className="space-y-3 pt-1">{children}</div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      <Input
        readOnly
        defaultValue={defaultValue}
        className="h-10 rounded-lg border-border bg-slate-50 text-sm"
      />
    </div>
  );
}

function Toggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} className="data-[state=checked]:bg-[#0066ff]" />
    </div>
  );
}