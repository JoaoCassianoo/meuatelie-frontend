import { api } from './http';
import { StatusEncomenda } from '../types/encomendas';

export interface Encomenda {
  id?: number;
  descricao: string;
  materialId: number;
  valorOrcado: number;
  cliente: string;
  observacao?: string;
  status: StatusEncomenda;
  dataCriacao?: string;
}

export { StatusEncomenda } from '../types/encomendas';

export async function criarEncomenda(encomenda: Omit<Encomenda, 'id'>) {
  const response = await api.post('/Encomendas', encomenda);
  return response.data;
}

export async function obterEncomendas() {
  const response = await api.get('/Encomendas');
  return response.data;
}

//nao precisa dessa aqui
export async function obterEncomendaPorId(id: number) {
  const response = await api.get(`/Encomendas/${id}`);
  return response.data;
}

export async function atualizarStatusEncomenda(id: number, novoStatus: StatusEncomenda) {
  const response = await api.patch(`/Encomendas/${id}/status?novoStatus=${novoStatus}`);
  return response.data;
}

export async function deletarEncomenda(id: number) {
  return api.delete(`/Encomendas/${id}`);
}
