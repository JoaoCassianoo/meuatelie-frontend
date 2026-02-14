import { api } from './http';
import { CategoriaMaterial } from '../types/estoque';

export interface Material {
  id?: number;
  atelieId: number;
  nome: string;
  categoria: CategoriaMaterial;
  tamanho?: string;
  quantidade: number;
  valor: number;
}

export async function obterTodosMateriais() {
  const response = await api.get(`/Materiais`);
  return response.data;
}

//acho que nao precisa
export async function obterMaterialPorId(id: number) {
  const response = await api.get(`/Materiais/${id}`);
  return response.data;
}

export async function obterMaterialPorCategoria(categoria: CategoriaMaterial) {
  const response = await api.get(`/Materiais/categoria/${categoria}`);
  return response.data;
}

//de nenhuma dessas duas acima

export async function obterResumo() {
  const response = await api.get(`/Materiais/resumo`);
  return response.data;
}

export async function criarMaterial(material: Omit<Material, 'id'>) {
  const response = await api.post('/Materiais', material);
  return response.data;
}

export async function atualizarMaterial(id: number, material: Material) {
  const response = await api.put(`/Materiais/${id}`, material);
  return response.data;
}

export async function deletarMaterial(id: number) {
  return api.delete(`/Materiais/${id}`);
}
