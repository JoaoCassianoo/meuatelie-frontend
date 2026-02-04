import { useEffect, useState } from 'react';
import { PeriodoSelector } from '../components/ui/PeriodoSelector';
import { ResumoCard } from '../components/financeiro/ResumoMensal';
import { obterResumoAnual, obterResumoMensal } from '../api/financeiro.api';
import { listarMovimentacoes } from '../api/financeiro.api';
import { MovimentacoesTabela } from '../components/financeiro/MovimentacoesTabela';
import type { MovimentacaoFinanceira } from '../types/financeiro';
import { NovaMovimentacaoModal } from '../components/financeiro/NovaMovimentacaoModal';
import { excluirMovimentacao as excluirApi, importarMovimentacoesCSV } from '../api/financeiro.api';
import { PageHeader } from '../components/PageHeader';
import { TrendingUp, TrendingDown, BarChart3, Plus, Upload, EyeOff, Eye } from 'lucide-react';





export default function Financeiro() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [tipo, setTipo] = useState(3);
  const [meio, setMeio] = useState(4);
  const [contexto, setContexto] = useState(3);
  const [resumo, setResumo] = useState<any>(null);
  const [resumoAnual, setResumoAnual] = useState<any>(null);
  const [movs, setMovs] = useState<MovimentacaoFinanceira[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movimentacaoEditando, setMovimentacaoEditando] =  useState<MovimentacaoFinanceira | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);

  // Calculate balance
  const saldoAnual = (resumoAnual?.totalEntradas || 0) + ((resumoAnual?.totalSaidas || 0) - (resumoAnual?.totalCredito || 0));
  const saldoMensal = (resumo?.totalEntradas || 0) + ((resumo?.totalSaidas || 0) - (resumo?.totalCredito || 0));

  async function handleImportarCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    try {
      await importarMovimentacoesCSV(arquivo, ano, mes);
      alert('Movimentações importadas com sucesso!');
      listarMovimentacoes(ano, mes, tipo, meio, contexto).then(setMovs);
      obterResumoMensal(ano, mes).then(setResumo);
    } catch (error) {
      alert('Erro ao importar movimentações');
      console.error(error);
    }

    // Reset input
    event.target.value = '';
  }

  function esconderReceita(valor: string) {
    return mostrarValores ? valor : "***,**";
  }

  function abrirEdicao(mov: MovimentacaoFinanceira) {
    setMovimentacaoEditando(mov);
    setModalOpen(true);
    }

  async function excluirMovimentacao(id: number) {
    const confirmar = confirm('Deseja realmente excluir esta movimentação?');

    if (!confirmar) return;

    await excluirApi(id);

    listarMovimentacoes(ano, mes, tipo, meio, contexto).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
    }


  useEffect(() =>{
    listarMovimentacoes(ano, mes, tipo, meio, contexto).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
    obterResumoAnual(ano).then(setResumoAnual);
  }, [ano, mes, tipo, movimentacaoEditando, modalOpen, meio, contexto]);

  if (!resumo || !resumoAnual) return <p>Carregando...</p>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center text-center justify-between">
        <PageHeader title="Financeiro" />
        <button
          onClick={() => setMostrarValores(!mostrarValores)}
          className={`
            mb-6 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md border
            transition-all
            ${
              mostrarValores
                ? 'text-gray-700 border-gray-300 hover:bg-gray-100'
                : 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100'
            }
          `}
        >
          {mostrarValores ? <EyeOff size={16}/> : <Eye size={16} />}
          {mostrarValores ? 'Ocultar valores' : 'Mostrar valores'}
        </button>
      </div>
      
      {/* Quick Stats - Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Saldo Anual</p>
              <p className={`text-2xl font-bold ${saldoAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {esconderReceita(Math.abs(saldoAnual).toFixed(2).replace('.', ','))}
              </p> 
            </div>
            {saldoAnual >= 0 ? (
              <TrendingUp size={32} className="text-green-500" />
            ) : (
              <TrendingDown size={32} className="text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-gray-600 text-sm">Entradas (mês)</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {esconderReceita((resumo?.totalEntradas || 0).toFixed(2).replace('.', ','))}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <p className="text-gray-600 text-sm">Saídas (mês)</p>
          <p className="text-2xl font-bold text-red-600">
            R$ {esconderReceita(Math.abs(resumo?.totalSaidas || 0).toFixed(2).replace('.', ','))}
          </p>
        </div>

         <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Saldo Mensal</p>
              <p className={`text-2xl font-bold ${saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {esconderReceita(Math.abs(saldoMensal).toFixed(2).replace('.', ','))}
              </p>
            </div>
            {saldoMensal >= 0 ? (
              <TrendingUp size={32} className="text-green-500" />
            ) : (
              <TrendingDown size={32} className="text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Header com Filtros e Botão */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold">Movimentações</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              id="csvInput"
              accept=".csv"
              className="hidden"
              onChange={handleImportarCSV}
            />
            <button
              onClick={() => document.getElementById('csvInput')?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={20} />
              Importar CSV
            </button>
            <button
              onClick={() => { setMovimentacaoEditando(null); setModalOpen(true); }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nova Movimentação
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
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
      </div>

      {/* Resumo Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Resumo Anual */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            Movimento Anual ({ano})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ResumoCard titulo="Entradas" valor={esconderReceita(resumoAnual.totalEntradas.toFixed(2))} />
            <ResumoCard titulo="Saídas" valor={esconderReceita((resumoAnual.totalSaidas.toFixed(2) - resumoAnual.totalCredito.toFixed(2)).toString())} />
            <ResumoCard titulo="Saldo" valor={esconderReceita((resumoAnual.totalEntradas.toFixed(2) - (resumoAnual.totalSaidas.toFixed(2) - resumoAnual.totalCredito.toFixed(2))).toFixed(2).toString())} />
            <ResumoCard titulo="Crédito" valor={esconderReceita(resumoAnual.totalCredito.toFixed(2))} />
          </div>
        </div>

        {/* Resumo Mensal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-600 rounded"></div>
            Movimento Mensal ({mes}/{ano})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ResumoCard titulo="Entradas" valor={esconderReceita(resumo.totalEntradas.toFixed(2))} />
            <ResumoCard titulo="Saídas" valor={esconderReceita((resumo.totalSaidas.toFixed(2) - resumo.totalCredito.toFixed(2)).toString())} />
            <ResumoCard titulo="Saldo" valor={esconderReceita((resumo.totalEntradas.toFixed(2) - (resumo.totalSaidas.toFixed(2) - resumo.totalCredito.toFixed(2))).toFixed(2).toString())} />
            <ResumoCard titulo="Crédito" valor={esconderReceita(resumo.totalCredito.toFixed(2))} />
          </div>
        </div>
      </div>

        {/* Por Contexto */}
        <div className="bg-white rounded-lg shadow-lg p-6 w-full gap-8 mb-8">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-600 rounded"></div>
            Por Contexto
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <ResumoCard titulo="Entradas Loja" valor={esconderReceita(resumo.totalEntradasLoja.toFixed(2))} />
            <ResumoCard titulo="Saídas Loja" valor={esconderReceita(resumo.totalSaidasLoja.toFixed(2))} />
            <ResumoCard titulo="Total Loja" valor={esconderReceita(resumo.totalLoja.toFixed(2))} />
            <ResumoCard titulo="Entradas Pessoal" valor={esconderReceita(resumo.totalEntradasPessoal.toFixed(2))} />
            <ResumoCard titulo="Saídas Pessoal" valor={esconderReceita(resumo.totalSaidasPessoal.toFixed(2))} />
            <ResumoCard titulo="Total Pessoal" valor={esconderReceita(resumo.totalPessoal.toFixed(2))} />
          </div>
        </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
        <MovimentacoesTabela
          dados={movs}
          onEditar={abrirEdicao}
          onExcluir={excluirMovimentacao}
          esconderReceita={esconderReceita}
        />
      </div>

      <NovaMovimentacaoModal
        isOpen={modalOpen}
        ano={ano}
        mes={mes}
        movimentacao={movimentacaoEditando}
        onClose={() => { setModalOpen(false); setMovimentacaoEditando(null); }}
        onSaved={() => {listarMovimentacoes(ano, mes, tipo, meio, contexto).then(setMovs)}}
        />

    </div>
  );
}
