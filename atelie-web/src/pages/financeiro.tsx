import { useEffect, useState } from 'react';
import { PeriodoSelector } from '../components/ui/PeriodoSelector';
import { ResumoCard } from '../components/financeiro/ResumoMensal';
import { obterResumoAnual, obterResumoMensal } from '../api/financeiro.api';
import { listarMovimentacoes } from '../api/financeiro.api';
import { MovimentacoesTabela } from '../components/financeiro/MovimentacoesTabela';
import type { MovimentacaoFinanceira } from '../types/financeiro';
import { NovaMovimentacaoModal } from '../components/financeiro/NovaMovimentacaoModal';
import { excluirMovimentacao as excluirApi } from '../api/financeiro.api';





export default function Financeiro() {
  const [ano, setAno] = useState(2025);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [tipo, setTipo] = useState(3);
  const [resumo, setResumo] = useState<any>(null);
  const [movs, setMovs] = useState<MovimentacaoFinanceira[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movimentacaoEditando, setMovimentacaoEditando] =  useState<MovimentacaoFinanceira | null>(null);

  function abrirEdicao(mov: MovimentacaoFinanceira) {
    setMovimentacaoEditando(mov);
    setModalOpen(true);
    }

  async function excluirMovimentacao(id: number) {
    const confirmar = confirm('Deseja realmente excluir esta movimentação?');

    if (!confirmar) return;

    await excluirApi(id);

    listarMovimentacoes(ano, mes, tipo).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
    }


  useEffect(() => {
    listarMovimentacoes(ano, mes, tipo).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
  }, [ano, mes, tipo, movimentacaoEditando, modalOpen]);

  if (!resumo) return <p>Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Financeiro</h1>

      <div className="flex justify-between">
        <PeriodoSelector
            ano={ano}
            mes={mes}
            tipo={tipo}
            onAnoChange={setAno}
            onMesChange={setMes}
            onTipoChange={setTipo}
        />
        <button
            onClick={() => { setMovimentacaoEditando(null); setModalOpen(true); }}
            className="bg-green-600 text-white px-4 py-2 mb-4 rounded"
            >
            + Nova Movimentação
        </button>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResumoCard titulo="Entradas" valor={resumo.totalEntradas} />
        <ResumoCard titulo="Saídas" valor={resumo.totalSaidas - resumo.totalCredito} />
        <ResumoCard titulo="Saídas Credito" valor={resumo.totalCredito} />
        <ResumoCard titulo="Saídas Débito" valor={resumo.totalDebito} />
        <ResumoCard titulo="Entradas Loja" valor={resumo.totalEntradasLoja} />
        <ResumoCard titulo="Saídas Loja" valor={resumo.totalSaidasLoja} />
        <ResumoCard titulo="Total Loja" valor={resumo.totalLoja} />
        <ResumoCard titulo="Total Pessoal" valor={resumo.totalPessoal} />
      </div>

      <MovimentacoesTabela
        dados={movs}
        onEditar={abrirEdicao}
        onExcluir={excluirMovimentacao}
        />

      <NovaMovimentacaoModal
        isOpen={modalOpen}
        movimentacao={movimentacaoEditando}
        onClose={() => { setModalOpen(false); setMovimentacaoEditando(null); }}
        onSaved={() => {listarMovimentacoes(ano, mes, tipo).then(setMovs)}}
        />

    </div>
  );
}
