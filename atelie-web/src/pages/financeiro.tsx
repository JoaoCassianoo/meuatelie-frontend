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
  const [resumo, setResumo] = useState<any>(null);
  const [resumoAnual, setResumoAnual] = useState<any>(null);
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

    listarMovimentacoes(ano, mes).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
    }


  useEffect(() => {
    listarMovimentacoes(ano, mes).then(setMovs);
    obterResumoMensal(ano, mes).then(setResumo);
    obterResumoAnual(ano).then(setResumoAnual);
  }, [ano, mes]);

  if (!resumo) return <p>Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Financeiro</h1>

      <div className="flex justify-between">
        <PeriodoSelector
            ano={ano}
            mes={mes}
            onAnoChange={setAno}
            onMesChange={setMes}
        />
        <button
            onClick={() => setModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 mb-4 rounded"
            >
            + Nova Movimentação
        </button>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResumoCard titulo="Entradas Anuais" valor={resumoAnual.totalEntradas} />
        <ResumoCard titulo="Saídas Anuais" valor={resumoAnual.totalSaidas} />
        <ResumoCard titulo="Loja Anual" valor={resumoAnual.totalLoja} />
        <ResumoCard titulo="Pessoal Anual" valor={resumoAnual.totalPessoal} />
        <ResumoCard titulo="Entradas" valor={resumo.totalEntradas} />
        <ResumoCard titulo="Saídas" valor={resumo.totalSaidas} />
        <ResumoCard titulo="Loja" valor={resumo.totalLoja} />
        <ResumoCard titulo="Pessoal" valor={resumo.totalPessoal} />
        <ResumoCard titulo="Débito" valor={resumo.totalDebito} />
        <ResumoCard titulo="Crédito" valor={resumo.totalCredito} />
        <ResumoCard titulo="Débito Anual" valor={resumoAnual.totalDebito} />
        <ResumoCard titulo="Crédito Anual" valor={resumoAnual.totalCredito} />
      </div>

      <MovimentacoesTabela
        dados={movs}
        onEditar={abrirEdicao}
        onExcluir={excluirMovimentacao}
        />

      <NovaMovimentacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {listarMovimentacoes(ano, mes).then(setMovs), obterResumoMensal(ano, mes).then(setResumo)}}
        />

    </div>
  );
}
