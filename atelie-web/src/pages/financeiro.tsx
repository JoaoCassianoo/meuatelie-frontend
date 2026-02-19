import { useEffect, useState } from 'react';
import { PeriodoSelector } from '../components/ui/PeriodoSelector';
import { ContextoFinanceiro, MeioPagamento, obterResumoMensal } from '../api/financeiro.api';
import { listarMovimentacoes } from '../api/financeiro.api';
import { MovimentacoesTabela } from '../components/financeiro/MovimentacoesTabela';
import type { MovimentacaoFinanceira } from '../types/financeiro';
import { NovaMovimentacaoModal } from '../components/financeiro/NovaMovimentacaoModal';
import { excluirMovimentacao as excluirApi, importarMovimentacoesCSV } from '../api/financeiro.api';
import { PageHeader } from '../components/PageHeader';
import { TrendingUp, TrendingDown, BarChart3, Plus, Upload, EyeOff, Eye } from 'lucide-react';
import { cache, carregarCacheDoLocalStorage, carregarResumo } from '../api/cache.api';
import { ToastContainer, type ToastMessage } from '../components/Toast';





export default function Financeiro() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [tipo, setTipo] = useState(3);
  const [meio, setMeio] = useState(4);
  const [contexto, setContexto] = useState(3);
  const [resumo, setResumo] = useState<any>(null);
  const [resumoAnual, setResumoAnual] = useState<any>(null);
  const [movsBase, setMovsBase] = useState<MovimentacaoFinanceira[]>([]);
  const [movs, setMovs] = useState<MovimentacaoFinanceira[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movimentacaoEditando, setMovimentacaoEditando] =  useState<MovimentacaoFinanceira | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [importando, setImportando] = useState(false);
  const [deletando, setDeletando] = useState<number | null>(null);

  // Calculate balance
  const saldoAnual = (resumoAnual?.totalEntradas || 0) + ((resumoAnual?.totalSaidas || 0) - (resumoAnual?.totalCredito || 0));
  const saldoMensal = (resumo?.totalEntradas || 0) + ((resumo?.totalSaidas || 0) - (resumo?.totalCredito || 0));

  async function handleImportarCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    setImportando(true);
    try {
      await importarMovimentacoesCSV(arquivo, ano, mes);
      addToast('Movimentações importadas com sucesso!', 'success');
      listarMovimentacoes(ano, mes).then(setMovs);
      obterResumoMensal(ano, mes).then(setResumo);
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao importar movimentações', 'error');
    } finally {
      setImportando(false);
      event.target.value = '';
    }
  }

  async function excluirMovimentacao(id: number) {
    const confirmar = confirm('Deseja realmente excluir esta movimentação?');
    if (!confirmar) return;
    setDeletando(id);
    try {
      await excluirApi(id);
      listarMovimentacoes(ano, mes).then(setMovs);
      obterResumoMensal(ano, mes).then(setResumo);
      addToast('Movimentação excluída com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao excluir movimentação', 'error');
    } finally {
      setDeletando(null);
    }
  }

  function addToast(message: string, type: 'success' | 'error') {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  async function mostrarValor(){
    let valor = !mostrarValores;
    setMostrarValores(valor);
    // verReceita removed as it's not in the API anymore
  }

  function esconderReceita(valor: string) {
    return mostrarValores ? valor : "***,**";
  }

  function abrirEdicao(mov: MovimentacaoFinanceira) {
    setMovimentacaoEditando(mov);
    setModalOpen(true);
  }

  useEffect(() =>{
    async function init() {
      carregarCacheDoLocalStorage();
      if(!cache.resumo.mensal || !cache.resumo.anual) {
        await carregarResumo(ano, mes);
      }
      const movimentacoes = await listarMovimentacoes(ano, mes);
      setMovsBase(movimentacoes);
      setMovs(movimentacoes);
      setResumo(cache.resumo.mensal);
      setResumoAnual(cache.resumo.anual);
      setMostrarValores(cache.mostrarValor);
    }
    init();
  }, [ano, mes]);

  useEffect(() => {
    let base = [...movsBase]; // 👈 ORIGINAL
    let filtrado = base;

    if (tipo === 2)
      filtrado = filtrado.filter(m => m.valor < 0);

    else if (tipo === 1)
      filtrado = filtrado.filter(m => m.valor > 0);

    if (contexto === 2)
      filtrado = filtrado.filter(m => m.contexto === ContextoFinanceiro.Pessoal);

    else if (contexto === 1)
      filtrado = filtrado.filter(m => m.contexto === ContextoFinanceiro.Loja);

    if (meio === 3)
      filtrado = filtrado.filter(m => m.meioPagamento === MeioPagamento.Pix);

    else if (meio === 2)
      filtrado = filtrado.filter(m => m.meioPagamento === MeioPagamento.CartaoDebito);

    else if (meio === 1)
      filtrado = filtrado.filter(m => m.meioPagamento === MeioPagamento.CartaoCredito);

    setMovs(filtrado);

  }, [tipo, meio, contexto]);


  if (!resumo || !resumoAnual) return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
      <p className="text-sm text-gray-400">Carregando...</p>
    </div>
  );

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      <ToastContainer messages={toasts} onClose={removeToast} />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <PageHeader title="Financeiro" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => mostrarValor()}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${mostrarValores ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}
          >
            {mostrarValores ? <EyeOff size={14}/> : <Eye size={14} />}
            {mostrarValores ? 'Ocultar' : 'Mostrar valores'}
          </button>
          <input
            type="file"
            id="csvInput"
            accept=".csv"
            className="hidden"
            onChange={handleImportarCSV}
          />
          <button
            onClick={() => document.getElementById('csvInput')?.click()}
            disabled={importando}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs text-white
              bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600
              shadow-md shadow-amber-500/20 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed">
            {importando ? (
              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importando</>
            ) : (
              <><Upload size={14}/> Importar CSV</>
            )}
          </button>
          <button
            onClick={() => { setMovimentacaoEditando(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
              shadow-md shadow-blue-500/20 transition-all active:scale-[0.97]"
          >
            <Plus size={18}/> Nova Movimentação
          </button>
        </div>
      </div>
      
      {/* Quick Stats - Top 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Saldo Anual</p>
              <p className={`text-lg md:text-2xl font-bold mt-1 ${saldoAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {esconderReceita(Math.abs(saldoAnual).toFixed(2).replace('.', ','))}
              </p> 
            </div>
            {saldoAnual >= 0 ? (
              <TrendingUp size={24} className="text-green-600 opacity-60" />
            ) : (
              <TrendingDown size={24} className="text-red-600 opacity-60" />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 md:p-5 border border-green-200 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 font-medium">Entradas (mês)</p>
          <p className="text-lg md:text-2xl font-bold text-green-600 mt-1">
            R$ {esconderReceita((resumo?.totalEntradas || 0).toFixed(2).replace('.', ','))}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 md:p-5 border border-red-200 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 font-medium">Saídas (mês)</p>
          <p className="text-lg md:text-2xl font-bold text-red-600 mt-1">
            R$ {esconderReceita(Math.abs(resumo?.totalSaidas || 0).toFixed(2).replace('.', ','))}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 md:p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Saldo Mensal</p>
              <p className={`text-lg md:text-2xl font-bold mt-1 ${saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {esconderReceita(Math.abs(saldoMensal).toFixed(2).replace('.', ','))}
              </p>
            </div>
            {saldoMensal >= 0 ? (
              <TrendingUp size={24} className="text-green-600 opacity-60" />
            ) : (
              <TrendingDown size={24} className="text-red-600 opacity-60" />
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        <PeriodoSelector
          ano={ano}
          mes={mes}
          tipo={tipo}
          meio={meio}
          contexto={contexto}
          onAnoChange={setAno}
          onMesChange={setMes}
          onTipoChange={setTipo}
          onMeioChange={setMeio}
          onContextoChange={setContexto}
        />
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            Movimentações
          </h3>
        </div>
        <div className="overflow-x-auto">
          <MovimentacoesTabela
            dados={movs}
            onEditar={abrirEdicao}
            onExcluir={excluirMovimentacao}
            esconderReceita={esconderReceita}
            deletandoId={deletando}
          />
        </div>
      </div>

      <NovaMovimentacaoModal
        isOpen={modalOpen}
        ano={ano}
        mes={mes}
        movimentacao={movimentacaoEditando}
        onClose={() => { setModalOpen(false); setMovimentacaoEditando(null); }}
        onSaved={() => {listarMovimentacoes(ano, mes).then(setMovs)}}
      />
    </div>
  );
}
