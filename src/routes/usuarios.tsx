import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, ShieldAlert, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/usuarios")({
  component: GestaoUsuariosPage,
});

function GestaoUsuariosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usuario = getUsuarioLogado();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!usuario) {
      navigate({ to: "/login" });
    }
  }, [usuario]);

  // Se não for admin, bloqueia o acesso
  if (usuario && usuario.admin !== "S") {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-slate-900">Acesso Restrito</h2>
        <p className="text-sm text-slate-600">
          Apenas utilizadores com permissões de Administrador podem registar novos vendedores.
        </p>
      </div>
    );
  }

  const { data: vendedores = [], isLoading } = useQuery({
    queryKey: ["vendedores"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/api/auth/vendedores");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (novoVendedor: any) => {
      const res = await fetch("http://localhost:8080/api/auth/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoVendedor),
      });
      if (!res.ok) throw new Error("Erro ao criar vendedor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendedores"] });
      setNome("");
      setEmail("");
      setSenha("");
      setIsAdmin(false);
      setMensagem("Vendedor registado com sucesso no Oracle!");
      setTimeout(() => setMensagem(""), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      nomeVendedor: nome,
      email,
      senha,
      admin: isAdmin ? "S" : "N",
    });
  };

  return (
    <div className="mx-auto max-w-5xl p-8 space-y-8 animate-in fade-in duration-300">
      <header className="border-b border-border pb-4">
        <div className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0066ff] mb-2 border border-blue-100">
          <Shield className="h-3.5 w-3.5" /> Acesso de Administrador
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Gestão de Vendedores e Utilizadores
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registe novos membros da equipa comercial e defina as permissões de acesso ao sistema.
        </p>
      </header>

      {mensagem && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulário de Novo Vendedor */}
        <div className="md:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#0066ff]" /> Novo Utilizador
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Nome Completo</Label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Carlos Mendes" />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">E-mail Corporativo</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="carlos@totvs.com.br" />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Palavra-passe Provisória</Label>
              <Input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="checkAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0066ff] focus:ring-[#0066ff]"
              />
              <label htmlFor="checkAdmin" className="text-xs font-medium text-slate-700">
                Perfil Administrador
              </label>
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-semibold mt-2"
            >
              {mutation.isPending ? "A registar..." : "Registar Vendedor"}
            </Button>
          </form>
        </div>

        {/* Lista de Vendedores Registados */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-800">
            Equipa Registada na Base Oracle ({vendedores.length})
          </h2>

          {isLoading ? (
            <p className="text-xs text-muted-foreground">A carregar...</p>
          ) : (
            <div className="divide-y divide-border">
              {vendedores.map((v: any) => (
                <div key={v.idVendedor} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{v.nomeVendedor}</p>
                    <p className="text-slate-500">{v.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">ID #{v.idVendedor}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.admin === "S"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {v.admin === "S" ? "ADMIN" : "VENDEDOR"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}