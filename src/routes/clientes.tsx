import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { ClientCard } from "@/components/ClientCard";
import { NewClientModal } from "@/components/NewClientModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsuarioLogado, UsuarioLogado } from "@/lib/auth";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes · TOTVS Meeting Insights" },
      { name: "description", content: "Base de clientes gerenciada pelo vendedor logado." },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [search, setSearch] = useState("");

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

  // Busca EXCLUSIVAMENTE os clientes vinculados ao ID do vendedor conectado
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clientes-vendedor", vendedorId],
    queryFn: async () => {
      if (!vendedorId) return [];
      const res = await fetch(`http://localhost:8080/api/clientes/vendedor/${vendedorId}`);
      if (!res.ok) throw new Error("Erro ao buscar clientes da carteira");
      return res.json();
    },
    enabled: !!vendedorId,
  });

  const filtered = clients.filter(
    (c: any) =>
      c.razaoSocial?.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj?.includes(search) ||
      c.segmento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho Original */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Base de Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} registro(s) encontrado(s) na carteira de{" "}
            <strong className="text-foreground">{usuario?.nomeVendedor || "Vendedor"}</strong>
          </p>
        </div>

        {/* Modal de cadastro mantendo o botão azul original */}
        <NewClientModal
          trigger={
            <Button className="bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          }
        />
      </div>

      {/* Barra de Pesquisa Original */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por Razão Social, CNPJ ou Segmento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-white rounded-xl border-slate-200"
        />
      </div>

      {/* Grid de Cards Originais */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0066ff] border-t-transparent" />
          Filtrando carteira do vendedor no Oracle...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center text-sm text-muted-foreground">
          Nenhum cliente cadastrado na carteira deste vendedor.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <ClientCard key={c.idCliente} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}