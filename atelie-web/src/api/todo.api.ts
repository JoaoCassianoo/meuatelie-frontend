import { api } from './http';

export interface TodoLista {
  id?: number;
  titulo: string;
  tarefas?: Tarefa[];
}

export interface Tarefa {
  id?: number;
  listaId?: number;
  descricao: string;
  concluido: boolean;
  dataCriacao?: string;
}

export async function criarLista(titulo: string) {
  const response = await api.post('/TodoList', { titulo });
  return response.data;
}

export async function obterTodasListas() {
  const response = await api.get('/TodoList');
  return response.data;
}

export async function obterListaPorId(id: number) {
  const response = await api.get(`/TodoList/${id}`);
  return response.data;
}

export async function adicionarTarefa(listaId: number, descricao: string) {
  const response = await api.post(`/TodoList/${listaId}/tarefas`, { descricao });
  return response.data;
}

export async function concluirTarefa(tarefaId: number) {
  return api.patch(`/TodoList/tarefas/${tarefaId}/concluir`);
}

export async function desmarcaTarefa(tarefaId: number) {
  return api.patch(`/TodoList/tarefas/${tarefaId}/desmarcar`);
}

export async function atualizarTarefa(tarefaId: number, descricao: string) {
  return api.put(`/TodoList/tarefas/${tarefaId}`, { descricao });
}

export async function deletarTarefa(tarefaId: number) {
  return api.delete(`/TodoList/tarefas/${tarefaId}`);
}

export async function deletarLista(id: number) {
  return api.delete(`/TodoList/${id}`);
}
