import { useEffect, useState } from 'react';
import { PeriodoSelector } from '../components/ui/PeriodoSelector';
import { ResumoCard } from '../components/financeiro/ResumoMensal';
import { obterResumoMensal } from '../api/financeiro.api';
import { listarMovimentacoes } from '../api/financeiro.api';
import { MovimentacoesTabela } from '../components/financeiro/MovimentacoesTabela';
import type { MovimentacaoFinanceira } from '../types/financeiro';




export default function Financeiro() {
  const [ano, setAno] = useState(2025);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [resumo, setResumo] = useState<any>(null);
  const [movs, setMovs] = useState<MovimentacaoFinanceira[]>([]);

  useEffect(() => {
    listarMovimentacoes(ano, mes).then(setMovs);
  }, [ano, mes]);

  useEffect(() => {
    obterResumoMensal(ano, mes).then(setResumo);
  }, [ano, mes]);

  if (!resumo) return <p>Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Financeiro</h1>

      <PeriodoSelector
        ano={ano}
        mes={mes}
        onAnoChange={setAno}
        onMesChange={setMes}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ResumoCard titulo="Entradas" valor={resumo.totalEntradas} />
        <ResumoCard titulo="Saídas" valor={resumo.totalSaidas} />
        <ResumoCard titulo="Loja" valor={resumo.totalLoja} />
        <ResumoCard titulo="Pessoal" valor={resumo.totalPessoal} />
        <ResumoCard titulo="Débito" valor={resumo.totalDebito} />
        <ResumoCard titulo="Crédito" valor={resumo.totalCredito} />
      </div>

      <MovimentacoesTabela dados={movs} />

    </div>
  );
}
