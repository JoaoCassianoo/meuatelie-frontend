import { api } from './http';
import type { PecaPronta } from './pecasProntas.api';

export interface Venda {
  id?: number;
  pecaProntaId: number;
  pecaPronta?: PecaPronta;
  valorVenda: number;
  cliente: string;
  observacao?: string;
}

export async function registrarVenda(venda: Omit<Venda, 'id'>) {
  const response = await api.post('/Vendas', venda);
  return response.data;
}

export async function obterVendas() {
  const response = await api.get('/Vendas');
  return response.data;
}

export async function obterVendasPorPeriodo(dataInicio: string, dataFim: string) {
  const response = await api.get('/Vendas/periodo', {
    params: { dataInicio, dataFim },
  });
  return response.data;
}

export async function obterTotalVendas(dataInicio?: string, dataFim?: string) {
  const response = await api.get('/Vendas/total', {
    params: { dataInicio, dataFim },
  });
  return response.data;
}

export async function deletarVenda(id: number) {
  return api.delete(`/Vendas/${id}`);
}
