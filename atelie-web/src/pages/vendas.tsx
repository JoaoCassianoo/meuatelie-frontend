import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { deletarVenda, registrarVenda } from '../api/vendas.api';
import type { Venda } from '../api/vendas.api';
import { Plus, TrendingUp, Trash2, Edit2, X, Save, Eye, EyeOff } from 'lucide-react';
import { type PecaPronta } from '../api/pecasProntas.api';
import { cache, carregarPecasProntas, carregarVendas, verReceita } from '../api/cache.api';
import { Modal } from '../components/Modal';
import { ToastContainer, type ToastMessage } from '../components/Toast';

const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400';
const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pecasProntas, setPecasProntas] = useState<PecaPronta[]>([]);
  const [pecasProntasNV, setPecasProntasNV] = useState<PecaPronta[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVendas, setTotalVendas] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState<number | null>(null);
  const [formData, setFormData] = useState({ cliente: '', pecaProntaId: '', valorVenda: '', observacao: '' });

  const esc = (v: string) => mostrarValores ? v : '···,··';

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.vendas.length === 0) await carregarVendas();
      if (cache.pecasProntas.length === 0) await carregarPecasProntas();
      const pecasNV = cache.pecasProntas.filter(p => !p.vendida);
      setVendas(cache.vendas);
      setPecasProntas(cache.pecasProntas);
      setPecasProntasNV(pecasNV);
      setTotalVendas(cache.vendas.reduce((s, v) => s + v.valorVenda, 0));
      setMostrarValores(cache.mostrarValor);
      setLoading(false);
    }
    init();
  }, []);

  async function mostrarValor() { const v = !mostrarValores; setMostrarValores(v); await verReceita(v); }

  function abrirModalNova() { setVendaEditando(null); setFormData({ cliente: '', pecaProntaId: '', valorVenda: '', observacao: '' }); setModalOpen(true); }
  function abrirModalEdicao(venda: Venda) {
    setVendaEditando(venda);
    setFormData({ cliente: venda.cliente, pecaProntaId: venda.pecaProntaId.toString(), valorVenda: venda.valorVenda.toString(), observacao: venda.observacao || '' });
    setModalOpen(true);
  }

  async function salvarVenda() {
    if (!formData.cliente || !formData.pecaProntaId || !formData.valorVenda) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setSalvando(true);
    try {
      await registrarVenda({ cliente: formData.cliente, pecaProntaId: Number(formData.pecaProntaId), valorVenda: Number(formData.valorVenda), observacao: formData.observacao });
      await carregarVendas(); await carregarPecasProntas();
      setVendas(cache.vendas); setPecasProntas(cache.pecasProntas);
      setTotalVendas(cache.vendas.reduce((s, v) => s + v.valorVenda, 0));
      setModalOpen(false);
      setFormData({ cliente: '', pecaProntaId: '', valorVenda: '', observacao: '' });
      addToast('Venda registrada com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao registrar venda', 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function deletarVendaFunc(id: number) {
    if (!confirm('Deseja realmente deletar esta venda?')) return;
    setDeletando(id);
    try {
      await deletarVenda(id);
      await carregarVendas(); await carregarPecasProntas();
      setVendas(cache.vendas); setPecasProntas(cache.pecasProntas);
      addToast('Venda excluída com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao deletar venda', 'error');
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

  const getPecaNome = (id: number) => pecasProntas.find(m => m.id === id)?.titulo || `Peça #${id}`;

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <ToastContainer messages={toasts} onClose={removeToast} />
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Vendas" />
        <button onClick={mostrarValor} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${mostrarValores ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}>
          {mostrarValores ? <EyeOff size={14} /> : <Eye size={14} />}
          {mostrarValores ? 'Ocultar' : 'Mostrar valores'}
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">{vendaEditando ? 'Editar Venda' : 'Nova Venda'}</h2>
          <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div><label className={lbl}>Cliente *</label><input type="text" value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} placeholder="Nome do cliente" className={inp} /></div>
          <div><label className={lbl}>Peça *</label>
            <select value={formData.pecaProntaId} onChange={e => { const p = pecasProntas.find(x => x.id.toString() === e.target.value); setFormData({ ...formData, valorVenda: p?.valor.toString() || formData.valorVenda, pecaProntaId: e.target.value }); }} className={inp}>
              <option value="">Selecione uma peça</option>
              {pecasProntasNV.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Valor (R$) *</label><input type="number" step="0.01" value={formData.valorVenda} onChange={e => setFormData({ ...formData, valorVenda: e.target.value })} placeholder="0,00" className={inp} /></div>
          <div><label className={lbl}>Observação</label><textarea value={formData.observacao} onChange={e => setFormData({ ...formData, observacao: e.target.value })} placeholder="Observações" className={`${inp} h-16 resize-none`} /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={salvando} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
            <button onClick={salvarVenda} disabled={salvando} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {salvando ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando</>
              ) : (
                <><Save size={16} /> Salvar</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white mb-4 shadow-lg shadow-green-500/20">
            <p className="text-sm font-medium opacity-90 mb-1">Total de Vendas</p>
            <p className="text-3xl font-bold flex items-center gap-2"><TrendingUp size={26} />R$ {esc(totalVendas.toFixed(2).replace('.', ','))}</p>
          </div>

          <button onClick={abrirModalNova} className="w-full mb-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm">
            <Plus size={18} />Nova Venda
          </button>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {vendas.length === 0 ? <div className="text-center py-16 text-gray-400 text-sm">Nenhuma venda registrada</div> :
              vendas.map(venda => (
                <div key={venda.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="text-xs text-gray-400">Cliente</p><p className="font-semibold text-gray-900">{venda.cliente}</p></div>
                    <p className="font-bold text-green-600">R$ {esc(venda.valorVenda.toFixed(2).replace('.', ','))}</p>
                  </div>
                  <p className="text-xs text-gray-500"><span className="font-medium">Peça:</span> {getPecaNome(venda.pecaProntaId)}</p>
                  {venda.observacao && <p className="text-xs text-gray-400 mt-1">{venda.observacao}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => abrirModalEdicao(venda)} disabled={deletando === venda.id} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"><Edit2 size={14} />Editar</button>
                    <button onClick={() => deletarVendaFunc(venda.id!)} disabled={deletando === venda.id} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-600 border border-red-100 rounded-xl hover:bg-red-50 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                      {deletando === venda.id ? (
                        <><div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /> Excluindo</>
                      ) : (
                        <><Trash2 size={14} /> Excluir</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>{['Cliente','Peça','Observação','Valor','Ações'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {vendas.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma venda</td></tr> :
                  vendas.map(venda => (
                    <tr key={venda.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{venda.cliente}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPecaNome(venda.pecaProntaId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{venda.observacao || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">R$ {esc(venda.valorVenda.toFixed(2).replace('.', ','))}</td>
                      <td className="px-4 py-3"><div className="flex gap-1">
                        <button onClick={() => abrirModalEdicao(venda)} disabled={deletando === venda.id} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Edit2 size={15} /></button>
                        <button onClick={() => deletarVendaFunc(venda.id!)} disabled={deletando === venda.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {deletando === venda.id ? (
                            <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
