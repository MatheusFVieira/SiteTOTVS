import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsuarioLogado, UsuarioLogado } from "@/lib/auth";

export function NewClientModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segmento, setSegmento] = useState("");
  const [email, setEmail] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    setUsuario(getUsuarioLogado());
  }, [open]);

  const mutation = useMutation({
    mutationFn: async (novoCliente: any) => {
      const res = await fetch("http://localhost:8080/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoCliente),
      });
      if (!res.ok) throw new Error("Erro ao salvar cliente");
      return res.json();
    },
    onSuccess: () => {
      // Invalida a query do vendedor atual para atualizar a tela na hora
      queryClient.invalidateQueries({ queryKey: ["clientes-vendedor", usuario?.idVendedor] });
      setOpen(false);
      setRazaoSocial("");
      setCnpj("");
      setSegmento("");
      setEmail("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      razaoSocial,
      cnpj,
      segmento,
      email,
      idVendedor: usuario?.idVendedor || 1, // Envia o ID do vendedor logado (ex: 2 para Mariana)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-[#0066ff] hover:bg-[#0052cc] text-white">
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Cadastrar Conta Corporativa</DialogTitle>
            <DialogDescription className="text-xs">
              Vincular nova conta à carteira de {usuario?.nomeVendedor} (ID #{usuario?.idVendedor}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Razão Social / Nome Fantasia *</Label>
              <Input
                required
                placeholder="Ex: Nova Health LTDA"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CNPJ (Apenas números) *</Label>
                <Input
                  required
                  placeholder="Ex: 12345678000199"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Segmento</Label>
                <Input
                  placeholder="Ex: Saúde, Logística..."
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail Corporativo de Contato *</Label>
              <Input
                required
                type="email"
                placeholder="contato@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold"
            >
              {mutation.isPending ? "Cadastrando no Oracle..." : "Criar Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}