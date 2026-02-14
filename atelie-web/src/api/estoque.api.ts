import { api } from './http';
import { TipoMovimentacao } from '../types/estoque';

export interface MovimentacaoEstoque {
  id?: number;
  materialId: number;
  quantidade: number;
  tipo: TipoMovimentacao;
  observacao?: string;
  data?: string;
}

export async function registrarEntrada(materialId: number, quantidade: number, observacao?: string) {
  const response = await api.post('/Estoque/entrada', { materialId, quantidade, observacao });
  return response.data;
}

export async function registrarSaida(materialId: number, quantidade: number, observacao?: string) {
  const response = await api.post('/Estoque/saida', { materialId, quantidade, observacao });
  return response.data;
}

export async function obterMovimentacoes(materialId?: number) {
  const response = await api.get('/Estoque/movimentacoes', {
    params: materialId ? { materialId } : {},
  });
  return response.data;
}

//nao precisa dessa aqui
export async function obterMovimentacoesPorPeriodo(dataInicio: string, dataFim: string) {
  const response = await api.get('/Estoque/movimentacoes/periodo', {
    params: { dataInicio, dataFim },
  });
  return response.data;
}
