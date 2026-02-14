import { api } from './http';

export const TipoPecaPronta = {
  Produzida: 0,
  Manutencao: 1,
} as const;

export type TipoPecaPronta = typeof TipoPecaPronta[keyof typeof TipoPecaPronta];

export interface PecaProntaMaterial {
  id: number;
  pecaProntaId: number;
  materialId: number;
  material: {
    id: number;
    nome: string;
    quantidade: number;
  };
  quantidadeUsada: number;
}

export interface PecaPronta {
  id: number;
  titulo: string;
  descricao?: string;
  valor: number;
  fotoUrl?: string;
  tipo: TipoPecaPronta;
  vendida: boolean;
  dataCriacao: string;
  materiais?: PecaProntaMaterial[];
}

export interface CriarPecaProntaRequest {
  titulo: string;
  valor: number;
  descricao?: string;
  tipo: TipoPecaPronta;
  fotoUrl?: string;
}

export interface AtualizarPecaProntaRequest {
  titulo: string;
  valor: number;
  descricao?: string;
  fotoUrl?: string;
  vendida: boolean;
  tipo: TipoPecaPronta;
}

export async function criarPecaPronta(data: CriarPecaProntaRequest) {
  const response = await api.post('/PecasProntas', data);
  return response.data;
}

export async function obterTodasPecasProntas() {
  const response = await api.get('/PecasProntas');
  return response.data;
}

//nao precisa dessa aqui
export async function obterPecasNaoVendidas() {
  const response = await api.get('/PecasProntas/nao-vendidas');
  return response.data;
}

//nao precisa dessas aqui
export async function obterPecasPorTipo(tipo: TipoPecaPronta) {
  const response = await api.get(`/PecasProntas/tipo/${tipo}`);
  return response.data;
}

export async function obterPecaProntaPorId(id: number) {
  const response = await api.get(`/PecasProntas/${id}`);
  return response.data;
}

//.....

export async function atualizarPecaPronta(id: number, data: AtualizarPecaProntaRequest) {
  const response = await api.put(`/PecasProntas/${id}`, data);
  return response.data;
}

export async function marcarComoVendida(id: number) {
  const response = await api.put(`/PecasProntas/${id}/marcar-como-vendida`);
  return response.data;
}

export async function adicionarMaterial(pecaProntaId: number, materialId: number, quantidadeUsada: number) {
  const response = await api.post(`/PecasProntas/${pecaProntaId}/materiais`, {
    materialId,
    quantidadeUsada,
  });
  return response.data;
}

export async function removerMaterial(pecaProntaId: number, materialId: number) {
  const response = await api.delete(`/PecasProntas/${pecaProntaId}/materiais/${materialId}`);
  return response.data;
}

export async function deletarPecaPronta(id: number) {
  const response = await api.delete(`/PecasProntas/${id}`);
  return response.data;
}
