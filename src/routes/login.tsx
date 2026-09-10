import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";
import { setUsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        throw new Error("Credenciais inválidas");
      }

      const usuario = await res.json();
      setUsuarioLogado(usuario);
      navigate({ to: "/tarefas" });
    } catch (err: any) {
      setErro("E-mail ou palavra-passe incorretos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="inline-block rounded-lg bg-[#0066ff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            TOTVS Insights
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900">Acesso Comercial</h1>
          <p className="text-xs text-slate-500 mt-1">Introduza os seus dados corporativos para aceder à plataforma.</p>
        </div>

        {erro && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">E-mail Corporativo</Label>
            <Input
              type="email"
              required
              placeholder="ex: lucas@totvs.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Palavra-passe</Label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold mt-2"
          >
            {carregando ? "A autenticar..." : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" /> Entrar no Sistema
              </span>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          TOTVS Meeting Insights · FIAP 2026
        </p>
      </div>
    </div>
  );
}