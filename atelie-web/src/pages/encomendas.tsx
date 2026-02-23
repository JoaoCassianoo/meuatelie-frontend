import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { atualizarStatusEncomenda, deletarEncomenda, criarEncomenda, StatusEncomenda } from '../api/encomendas.api';
import type { Encomenda } from '../api/encomendas.api';
import type { Material } from '../api/materiais.api';
import { Trash2, Plus, X, Save, Truck } from 'lucide-react';
import { adicionarEncomenda, cache, carregarEncomendas, carregarMateriais } from '../api/cache.api';
import { ToastContainer, type ToastMessage } from '../components/Toast';

const STATUS_CONFIG: Record<StatusEncomenda, { bg: string; text: string; label: string }> = {
  [StatusEncomenda.Pendente]:    { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Pendente' },
  [StatusEncomenda.EmProducao]:  { bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'Em Produção' },
  [StatusEncomenda.Finalizada]:  { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Finalizada' },
  [StatusEncomenda.Cancelada]:   { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Cancelada' },
};

const inputCls = `w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all`;
const labelCls = `block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5`;

export default function Encomendas() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [materiais, setMateriais]   = useState<Material[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState<number | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<number | null>(null);
  const [form, setForm] = useState({ descricao: '', materialId: '', valorOrcado: '', cliente: '', observacao: '' });

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.encomendas.length === 0) await carregarEncomendas();
      if (cache.material.materiais.length === 0) await carregarMateriais();
      setEncomendas(cache.encomendas);
      setMateriais(cache.material.materiais);
      setLoading(false);
    }
    init();
  }, []);

  async function salvar() {
    if (!form.descricao || !form.valorOrcado || !form.cliente) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setSalvando(true);
    try {
      const enc = await criarEncomenda({
        descricao: form.descricao, materialId: Number(form.materialId),
        status: StatusEncomenda.Pendente, valorOrcado: Number(form.valorOrcado),
        cliente: form.cliente, observacao: form.observacao,
      });
      setForm({ descricao: '', materialId: '', valorOrcado: '', cliente: '', observacao: '' });
      setModalOpen(false);
      adicionarEncomenda(enc);
      setEncomendas([...cache.encomendas]);
      addToast('Encomenda criada com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao criar encomenda', 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(id: number, novoStatus: StatusEncomenda) {
    setAtualizandoStatus(id);
    try {
      await atualizarStatusEncomenda(id, novoStatus);
      await carregarEncomendas();
      setEncomendas([...cache.encomendas]);
      addToast('Status atualizado com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao atualizar status', 'error');
    } finally {
      setAtualizandoStatus(null);
    }
  }

  async function deletar(id: number) {
    if (!confirm('Deseja realmente excluir esta encomenda?')) return;
    setDeletando(id);
    try {
      await deletarEncomenda(id);
      await carregarEncomendas();
      setEncomendas([...cache.encomendas]);
      addToast('Encomenda excluída com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao excluir encomenda', 'error');
    } finally {
      setDeletando(null);
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
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Encomendas" subtitle={`${encomendas.length} encomenda${encomendas.length !== 1 ? 's' : ''}`} />
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
            shadow-md shadow-blue-500/20 transition-all active:scale-[0.97]">
          <Plus size={18}/> Nova Encomenda
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl"/>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Nova Encomenda</h2>
                <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500"/>
                </button>
              </div>
              <div className="space-y-4">
                <div><label className={labelCls}>Cliente *</label>
                  <input type="text" value={form.cliente} placeholder="Nome do cliente"
                    onChange={(e) => setForm({...form, cliente: e.target.value})} className={inputCls}/>
                </div>
                <div><label className={labelCls}>Descrição *</label>
                  <textarea value={form.descricao} placeholder="Descrição da encomenda"
                    onChange={(e) => setForm({...form, descricao: e.target.value})}
                    className={`${inputCls} h-20 resize-none`}/>
                </div>
                <div><label className={labelCls}>Material</label>
                  <select value={form.materialId} onChange={(e) => setForm({...form, materialId: e.target.value})} className={inputCls}>
                    <option value="">Selecione um material</option>
                    {materiais.map(m => <option key={m.id} value={m.id}>{m.atelieId} - {m.nome} (Disponível: {m.quantidade})</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Valor Orçado (R$) *</label>
                  <input type="number" step="0.01" value={form.valorOrcado} placeholder="0,00"
                    onChange={(e) => setForm({...form, valorOrcado: e.target.value})} className={inputCls}/>
                </div>
                <div><label className={labelCls}>Observação</label>
                  <textarea value={form.observacao} placeholder="Observações adicionais"
                    onChange={(e) => setForm({...form, observacao: e.target.value})}
                    className={`${inputCls} h-16 resize-none`}/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={salvando}>
                    Cancelar
                  </button>
                  <button onClick={salvar} disabled={salvando}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm
                      bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
                      flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed">
                    {salvando ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando</>
                    ) : (
                      <><Save size={16}/> Salvar</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      ) : encomendas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Truck size={40} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">Nenhuma encomenda registrada</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Nova Encomenda" para começar</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Descrição</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Obs.</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {encomendas.map((enc) => {
                  const s = STATUS_CONFIG[enc.status || 1];
                  return (
                    <tr key={enc.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{enc.cliente}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm max-w-[180px] truncate">{enc.descricao}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm max-w-[150px] truncate">{enc.observacao || '—'}</td>
                      <td className="px-5 py-4 text-right font-bold text-gray-900 text-sm">
                        R$ {enc.valorOrcado.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.text} border-current/20`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <select value={enc.status || 1}
                            onChange={(e) => mudarStatus(enc.id!, Number(e.target.value) as StatusEncomenda)}
                            disabled={atualizandoStatus === enc.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value={1}>Pendente</option>
                            <option value={2}>Em Produção</option>
                            <option value={3}>Finalizada</option>
                            <option value={4}>Cancelada</option>
                          </select>
                          <button onClick={() => deletar(enc.id!)}
                            disabled={deletando === enc.id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletando === enc.id ? (
                              <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16}/>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {encomendas.map((enc) => {
              const s = STATUS_CONFIG[enc.status || 1];
              return (
                <div key={enc.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{enc.cliente}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-snug">{enc.descricao}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm ml-3 flex-shrink-0">
                      R$ {enc.valorOrcado.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  {enc.observacao && (
                    <p className="text-xs text-gray-400 mb-3">{enc.observacao}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    <span className={`self-start px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <select value={enc.status || 1}
                      onChange={(e) => mudarStatus(enc.id!, Number(e.target.value) as StatusEncomenda)}
                      disabled={atualizandoStatus === enc.id}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value={1}>Pendente</option>
                      <option value={2}>Em Produção</option>
                      <option value={3}>Finalizada</option>
                      <option value={4}>Cancelada</option>
                    </select>
                    <button onClick={() => deletar(enc.id!)} disabled={deletando === enc.id}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                        border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {deletando === enc.id ? (
                        <><div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /> Excluindo</>
                      ) : (
                        <><Trash2 size={15}/> Excluir</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
