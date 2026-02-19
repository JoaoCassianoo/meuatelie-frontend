import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { adicionarTarefa, concluirTarefa, desmarcaTarefa, deletarTarefa, deletarLista, criarLista } from '../api/todo.api';
import type { TodoLista } from '../api/todo.api';
import { Plus, Trash2, Check, ClipboardList } from 'lucide-react';
import { cache, carregarListas } from '../api/cache.api';
import { ToastContainer, type ToastMessage } from '../components/Toast';

const inputCls = `flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all`;

export default function TodoList() {
  const [listas, setListas]       = useState<TodoLista[]>([]);
  const [loading, setLoading]     = useState(true);
  const [titulo, setTitulo]       = useState('');
  const [novasTarefas, setNovasTarefas] = useState<Record<number, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [criandoLista, setCriandoLista] = useState(false);
  const [adicionandoTarefa, setAdicionandoTarefa] = useState<number | null>(null);
  const [deletandoTarefa, setDeletandoTarefa] = useState<number | null>(null);
  const [deletandoLista, setDeletandoLista] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.listas.length === 0) await carregarListas();
      setListas(cache.listas);
      setLoading(false);
    }
    init();
  }, []);

  async function criarNovaLista() {
    if (!titulo.trim()) {
      addToast('Digite um nome para a lista', 'error');
      return;
    }
    setCriandoLista(true);
    try {
      await criarLista(titulo);
      setTitulo('');
      await carregarListas();
      setListas([...cache.listas]);
      addToast('Lista criada com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao criar lista', 'error');
    } finally {
      setCriandoLista(false);
    }
  }

  async function adicionarNovaTarefa(listaId: number) {
    const desc = novasTarefas[listaId];
    if (!desc?.trim()) {
      addToast('Digite uma descrição para a tarefa', 'error');
      return;
    }
    setAdicionandoTarefa(listaId);
    try {
      await adicionarTarefa(listaId, desc);
      setNovasTarefas({ ...novasTarefas, [listaId]: '' });
      await carregarListas();
      setListas([...cache.listas]);
      addToast('Tarefa adicionada!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao adicionar tarefa', 'error');
    } finally {
      setAdicionandoTarefa(null);
    }
  }

  async function toggleTarefa(tarefaId: number, concluida: boolean) {
    try {
      concluida ? await desmarcaTarefa(tarefaId) : await concluirTarefa(tarefaId);
      await carregarListas();
      setListas([...cache.listas]);
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao atualizar tarefa', 'error');
    }
  }

  async function removerTarefa(tarefaId: number) {
    setDeletandoTarefa(tarefaId);
    try {
      await deletarTarefa(tarefaId);
      await carregarListas();
      setListas([...cache.listas]);
      addToast('Tarefa removida!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao remover tarefa', 'error');
    } finally {
      setDeletandoTarefa(null);
    }
  }

  async function removerLista(listaId: number) {
    if (!confirm('Deletar esta lista e todas as tarefas?')) return;
    setDeletandoLista(listaId);
    try {
      await deletarLista(listaId);
      await carregarListas();
      setListas([...cache.listas]);
      addToast('Lista removida!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao remover lista', 'error');
    } finally {
      setDeletandoLista(null);
    }
  }

  function addToast(message: string, type: 'success' | 'error') {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <ToastContainer messages={toasts} onClose={removeToast} />
      <PageHeader title="To-do List" subtitle="Organize suas tarefas e lembretes"/>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      ) : (
        <>
          {/* Nova lista */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Nova Lista</p>
            <div className="flex gap-2">
              <input type="text" value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && criarNovaLista()}
                placeholder="Nome da lista..." className={inputCls}
                disabled={criandoLista}/>
              <button onClick={criarNovaLista} disabled={criandoLista}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2
                  bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
                  shadow-sm shadow-blue-500/20 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed">
                {criandoLista ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando</>
                ) : (
                  <><Plus size={18}/> Criar</>
                )}
              </button>
            </div>
          </div>

          {listas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <ClipboardList size={40} className="text-gray-300 mx-auto mb-3"/>
              <p className="text-gray-500 font-medium">Nenhuma lista criada</p>
              <p className="text-gray-400 text-sm mt-1">Crie sua primeira lista acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listas.map((lista) => {
                const total     = lista.tarefas?.length || 0;
                const concluidas = lista.tarefas?.filter(t => t.concluido).length || 0;
                const progresso  = total > 0 ? (concluidas / total) * 100 : 0;

                return (
                  <div key={lista.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {/* List header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-bold text-gray-900">{lista.titulo}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{concluidas}/{total} concluídas</p>
                      </div>
                      <button onClick={() => removerLista(lista.id!)} disabled={deletandoLista === lista.id}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {deletandoLista === lista.id ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16}/>
                        )}
                      </button>
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${progresso}%` }}/>
                      </div>
                    )}

                    {/* Tasks */}
                    <div className="space-y-1.5 mb-4">
                      {lista.tarefas?.map((tarefa) => (
                        <div key={tarefa.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors
                            ${tarefa.concluido ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <button onClick={() => toggleTarefa(tarefa.id!, tarefa.concluido)}
                            className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                              ${tarefa.concluido
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-gray-300 hover:border-blue-400'}`}>
                            {tarefa.concluido && <Check size={11} className="text-white" strokeWidth={3}/>}
                          </button>
                          <span className={`flex-1 text-sm ${tarefa.concluido ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {tarefa.descricao}
                          </span>
                          <button onClick={() => removerTarefa(tarefa.id!)} disabled={deletandoTarefa === tarefa.id}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletandoTarefa === tarefa.id ? (
                              <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={13}/>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add task input */}
                    <div className="flex gap-2">
                      <input type="text"
                        value={novasTarefas[lista.id!] || ''}
                        onChange={(e) => setNovasTarefas({ ...novasTarefas, [lista.id!]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && adicionarNovaTarefa(lista.id!)}
                        placeholder="Adicionar tarefa..."
                        disabled={adicionandoTarefa === lista.id}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50
                          focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"/>
                      <button onClick={() => adicionarNovaTarefa(lista.id!)} disabled={adicionandoTarefa === lista.id}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {adicionandoTarefa === lista.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Plus size={16}/>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
