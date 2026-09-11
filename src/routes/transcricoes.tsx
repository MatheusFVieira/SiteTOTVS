import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Bot, Sparkles, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NewClientModal } from '@/components/NewClientModal';

export const Route = createFileRoute('/transcricoes')({
  component: TranscricoesPage,
});

function TranscricoesPage() {
  const [transcricao, setTranscricao] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');

  // Busca lista atualizada de clientes no Oracle
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8080/api/clientes');
      if (!res.ok) throw new Error('Falha ao carregar clientes');
      return res.json();
    },
  });

  const enviarParaJava = async () => {
    setErroValidacao('');
    
    if (!selectedClienteId) {
      setErroValidacao('Selecione ou cadastre uma empresa antes de executar o diagnóstico.');
      return;
    }

    if (!transcricao.trim()) {
      setErroValidacao('Cole o texto da transcrição para análise.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/analise/processar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          texto: transcricao,
          idCliente: Number(selectedClienteId) 
        }),
      });

      if (!response.ok) throw new Error('Erro na resposta do backend');

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Falha ao comunicar com o servidor Spring Boot (8080).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8 space-y-8 animate-in fade-in duration-300">
      <header className="border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0066ff] mb-3 border border-blue-100">
          <Sparkles className="h-3.5 w-3.5" />
          IA Generativa Comercial · Qwen 2.5
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Diagnóstico de Reunião por Empresa
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vincule a transcrição à conta corporativa para gravação e geração de recomendações autônomas.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Envio */}
        <section className="lg:col-span-7 space-y-5">
          
          {/* Seletor e Validador de Empresa */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#0066ff]" />
                Empresa Participante
              </label>
              <NewClientModal trigger={
                <button type="button" className="text-xs font-semibold text-[#0066ff] hover:underline">
                  + Cadastrar Nova Conta
                </button>
              } />
            </div>

            <select
              value={selectedClienteId}
              onChange={(e) => {
                setSelectedClienteId(e.target.value);
                setErroValidacao('');
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-[#0066ff] focus:outline-none focus:ring-1 focus:ring-[#0066ff]"
            >
              <option value="">-- Selecione a empresa no banco de dados --</option>
              {clientes.map((c: any) => (
                <option key={c.idCliente} value={c.idCliente}>
                  {c.razaoSocial} (CNPJ: {c.cnpj} | {c.email || 'Sem e-mail'})
                </option>
              ))}
            </select>

            {clientes.length === 0 && !loadingClientes && (
              <p className="text-xs text-amber-600">
                Nenhuma empresa cadastrada. Use o botão acima para adicionar a primeira conta no banco.
              </p>
            )}
          </div>

          {/* Área de Transcrição */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-4 focus-within:ring-2 focus-within:ring-[#0066ff] transition-all">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Texto da Reunião
            </label>
            <textarea
              className="w-full h-80 bg-transparent border-0 resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed"
              placeholder="Cole o diálogo da reunião aqui..."
              value={transcricao}
              onChange={(e) => {
                setTranscricao(e.target.value);
                setErroValidacao('');
              }}
            />
          </div>

          {erroValidacao && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {erroValidacao}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{transcricao.length} caracteres</span>
            <button
              onClick={enviarParaJava}
              disabled={loading || !transcricao.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0066ff] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0052cc] disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gravando no Oracle & Analisando IA...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Salvar e Executar Diagnóstico
                </>
              )}
            </button>
          </div>
        </section>

        {/* Resultados */}
        <aside className="lg:col-span-5">
          {resultado ? (
            <div className="rounded-xl border border-border bg-card shadow-md p-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="border-b border-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solução Recomendada
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold font-display text-[#0066ff]">
                    {resultado.produtoRecomendado}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> Gravado no Oracle
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Oportunidade
                  </span>
                  <span className="mt-1 inline-block font-semibold text-sm text-slate-800">
                    {resultado.oportunidadeUpsell}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Risco de Churn
                  </span>
                  <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded ${
                    resultado.riscoChurn === 'ALTO' 
                      ? 'bg-red-100 text-red-700' 
                      : resultado.riscoChurn === 'MEDIO' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {resultado.riscoChurn}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Orçamento Mapeado
                </span>
                <p className="mt-1 text-xl font-bold font-mono text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resultado.orcamentoEstimado || 0)}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Diagnóstico Técnico
                </span>
                <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg p-3">
                  {resultado.raciocinio}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-[#0066ff] flex items-center justify-center mb-3">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">Aguardando Execução</h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                Selecione a empresa vinculada e submeta a transcrição para persistência imediata na base e processamento pelo agente.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}