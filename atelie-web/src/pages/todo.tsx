import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { obterTodasListas, adicionarTarefa, concluirTarefa, desmarcaTarefa, deletarTarefa, deletarLista, criarLista } from '../api/todo.api';
import type { TodoLista, Tarefa } from '../api/todo.api';
import { Plus, Trash2, Check, X } from 'lucide-react';

export default function TodoList() {
  const [listas, setListas] = useState<TodoLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [novaListaTitulo, setNovaListaTitulo] = useState('');
  const [novasTarefas, setNovasTarefas] = useState<Record<number, string>>({});

  useEffect(() => {
    carregarListas();
  }, []);

  async function carregarListas() {
    try {
      setLoading(true);
      const dados = await obterTodasListas();
      setListas(dados || []);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function criarNovaLista() {
    if (!novaListaTitulo.trim()) return;
    try {
      await criarLista(novaListaTitulo);
      setNovaListaTitulo('');
      carregarListas();
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    }
  }

  async function adicionarNovaTarefa(listaId: number) {
    const descricao = novasTarefas[listaId];
    if (!descricao?.trim()) return;
    try {
      await adicionarTarefa(listaId, descricao);
      setNovasTarefas({ ...novasTarefas, [listaId]: '' });
      carregarListas();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  }

  async function toggleTarefa(tarefaId: number, concluida: boolean) {
    try {
      if (concluida) {
        await desmarcaTarefa(tarefaId);
      } else {
        await concluirTarefa(tarefaId);
      }
      carregarListas();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  }

  async function deletarTarefaFunc(tarefaId: number) {
    try {
      await deletarTarefa(tarefaId);
      carregarListas();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  }

  async function deletarListaFunc(listaId: number) {
    if (!confirm('Deletar esta lista?')) return;
    try {
      await deletarLista(listaId);
      carregarListas();
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="To-do List" />

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Nova Lista</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={novaListaTitulo}
                onChange={(e) => setNovaListaTitulo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && criarNovaLista()}
                placeholder="Digite o título da lista..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={criarNovaLista}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Criar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listas.map((lista) => (
              <div key={lista.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{lista.titulo}</h2>
                  <button
                    onClick={() => deletarListaFunc(lista.id!)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {lista.tarefas?.map((tarefa) => (
                    <div key={tarefa.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <button
                        onClick={() => toggleTarefa(tarefa.id!, tarefa.concluido)}
                        className={`p-1 rounded-lg transition-colors ${
                          tarefa.concluido ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {tarefa.concluido ? <Check size={18} /> : <X size={18} />}
                      </button>
                      <span className={`flex-1 ${tarefa.concluido ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {tarefa.descricao}
                      </span>
                      <button
                        onClick={() => deletarTarefaFunc(tarefa.id!)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novasTarefas[lista.id!] || ''}
                    onChange={(e) => setNovasTarefas({ ...novasTarefas, [lista.id!]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarNovaTarefa(lista.id!)}
                    placeholder="Adicionar tarefa..."
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => adicionarNovaTarefa(lista.id!)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
