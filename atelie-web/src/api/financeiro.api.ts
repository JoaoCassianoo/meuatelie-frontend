import { api } from './http';
import type { ResumoAnual, MovimentacaoFinanceira } from '../types/financeiro';
export { ContextoFinanceiro, MeioPagamento } from '../types/financeiro';

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
  mes: number,
  tipo: number,
  meio: number,
  contexto: number
): Promise<MovimentacaoFinanceira[]> {
  const response = await api.get(
    `/Financeiro/movimentacoes?ano=${ano}&mes=${mes}&tipo=${tipo}&meio=${meio}&contexto=${contexto}`
  );
  return response.data;
  console.log(response.data);
}

export function criarMovimentacao(
  data: Omit<MovimentacaoFinanceira, 'id'>
) {
  return api.post('/Financeiro', data);
}

export function excluirMovimentacao(id: number) {
  return api.delete(`/Financeiro/${id}`);
}

export function atualizarMovimentacao(
  id: number,
  data: MovimentacaoFinanceira
) {
  return api.put(`/Financeiro/${id}`, data);
}

export async function importarMovimentacoesCSV(
  arquivo: File,
  ano: number,
  mes: number
) {
  const formData = new FormData();
  formData.append('file', arquivo);
  return api.post(`/Financeiro/importar?ano=${ano}&mes=${mes}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

