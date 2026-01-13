import { api } from './http';
import type { ResumoAnual, MovimentacaoFinanceira } from '../types/financeiro';

export async function obterResumoAnual(ano: number): Promise<ResumoAnual> {
  const response = await api.get(`/Financeiro/resumo/anual?ano=${ano}`);
  return response.data;
}


export async function obterResumoMensal(
  ano: number,
  mes: number
) {
  const response = await api.get(
    `/financeiro/resumo/mensal?ano=${ano}&mes=${mes}`
  );
  return response.data;
}

export async function listarMovimentacoes(
  ano: number,
  mes: number
): Promise<MovimentacaoFinanceira[]> {
  const response = await api.get(
    `/Financeiro/movimentacoes?ano=${ano}&mes=${mes}`
  );
  return response.data;
}
