import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { registrarEntrada, registrarSaida } from '../api/estoque.api';
import { criarMaterial, deletarMaterial, atualizarMaterial } from '../api/materiais.api';
import type { MovimentacaoEstoque } from '../api/estoque.api';
import type { Material } from '../api/materiais.api';
import { CategoriaMaterial, TipoMovimentacao } from '../types/estoque';
import { Plus, TrendingDown, Trash2, X, Save, Edit2, Eye, EyeOff } from 'lucide-react';
import { adicionarMaterialCache, cache, carregarMateriais, carregarMovimentacoes, verReceita } from '../api/cache.api';
import { Modal } from '../components/Modal';
import { ToastContainer, type ToastMessage } from '../components/Toast';

const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400';
const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Estoque() {
  const [tab, setTab] = useState<'materiais' | 'movimentacoes'>('materiais');
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [movFilter, setMovFilter] = useState<number | undefined>(undefined);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [movimentacaoModalOpen, setMovimentacaoModalOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacao>(TipoMovimentacao.Entrada);
  const [resumo, setResumo] = useState<{ quantidadeTotalPecas: number; valorTotalEstoque: number } | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);
  const [materialFilter, setMaterialFilter] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [salvandoMaterial, setSalvandoMaterial] = useState(false);
  const [registrandoMov, setRegistrandoMov] = useState(false);
  const [deletandoMaterial, setDeletandoMaterial] = useState<number | null>(null);

  const esc = (v: string) => mostrarValores ? v : '···,··';

  const [formMaterial, setFormMaterial] = useState({ nome: '', categoria: '', tamanho: '', quantidade: '', valor: '' });
  const [formMovimentacao, setFormMovimentacao] = useState({ materialId: '', quantidade: '', observacao: '' });

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.material.materiais.length === 0) await carregarMateriais();
      if (cache.movimentacoes.length === 0) await carregarMovimentacoes();
      setMateriais([...cache.material.materiais]);
      setMovimentacoes([...cache.movimentacoes]);
      setResumo({ quantidadeTotalPecas: cache.material.quantidade, valorTotalEstoque: cache.material.valor });
      setMostrarValores(cache.mostrarValor);
      setLoading(false);
    }
    init();
  }, []);

  async function mostrarValor() { const v = !mostrarValores; setMostrarValores(v); await verReceita(v); }

  useEffect(() => {
    let movs = cache.movimentacoes;
    let mats = cache.material.materiais;
    if (movFilter !== undefined) movs = movs.filter(m => m.materialId === movFilter);
    setMovimentacoes(movs);
    if (materialFilter.trim()) {
      const t = materialFilter.toLowerCase();
      mats = mats.filter(m => m.nome.toLowerCase().includes(t) || String(m.tamanho).toLowerCase().includes(t));
    }
    setMateriais(mats);
  }, [materialFilter, movFilter]);

  useEffect(() => { setMaterialFilter(''); setMovimentacoes(cache.movimentacoes); setMateriais(cache.material.materiais); }, [tab]);

  function abrirModalNovo() {
    setMaterialEditando(null);
    setFormMaterial({ nome: '', categoria: '1', tamanho: '', quantidade: '', valor: '' });
    setMaterialModalOpen(true);
  }

  function abrirModalEdicao(material: Material) {
    setMaterialEditando(material);
    setFormMaterial({ nome: material.nome, categoria: material.categoria.toString(), tamanho: material.tamanho || '', quantidade: material.quantidade.toString(), valor: material.valor.toString() });
    setMaterialModalOpen(true);
  }

  async function salvarMaterial() {
    if (!formMaterial.nome || !formMaterial.categoria) {
      addToast('Preencha os campos obrigatórios', 'error');
      return;
    }
    setSalvandoMaterial(true);
    try {
      const dados = { atelieId: 0, nome: formMaterial.nome, categoria: Number(formMaterial.categoria) as typeof CategoriaMaterial[keyof typeof CategoriaMaterial], tamanho: formMaterial.tamanho, quantidade: Number(formMaterial.quantidade) || 0, valor: Number(formMaterial.valor) || 0 };
      if (materialEditando) {
        await atualizarMaterial(materialEditando.id!, dados);
        await carregarMateriais();
        addToast('Material atualizado com sucesso!', 'success');
      } else {
        const mat = await criarMaterial(dados);
        await adicionarMaterialCache(mat);
        addToast('Material criado com sucesso!', 'success');
      }
      setFormMaterial({ nome: '', categoria: '', tamanho: '', quantidade: '', valor: '' });
      setMaterialEditando(null);
      setMaterialModalOpen(false);
      setMateriais([...cache.material.materiais]);
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao salvar material', 'error');
    } finally {
      setSalvandoMaterial(false);
    }
  }

  async function registrarMovimentacao() {
    if (!formMovimentacao.materialId || !formMovimentacao.quantidade) {
      addToast('Preencha os campos obrigatórios', 'error');
      return;
    }
    setRegistrandoMov(true);
    try {
      if (tipoMovimentacao === TipoMovimentacao.Entrada)
        await registrarEntrada(Number(formMovimentacao.materialId), Number(formMovimentacao.quantidade), formMovimentacao.observacao);
      else
        await registrarSaida(Number(formMovimentacao.materialId), Number(formMovimentacao.quantidade), formMovimentacao.observacao);
      setFormMovimentacao({ materialId: '', quantidade: '', observacao: '' });
      setMovimentacaoModalOpen(false);
      await carregarMateriais(); await carregarMovimentacoes();
      setMateriais([...cache.material.materiais]); setMovimentacoes([...cache.movimentacoes]);
      setResumo({ quantidadeTotalPecas: cache.material.quantidade, valorTotalEstoque: cache.material.valor });
      addToast('Movimentação registrada com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao registrar movimentação', 'error');
    } finally {
      setRegistrandoMov(false);
    }
  }

  async function deletarMaterialFunc(id: number) {
    if (!confirm('Deletar este material?')) return;
    setDeletandoMaterial(id);
    try {
      await deletarMaterial(id);
      await carregarMateriais();
      setMateriais([...cache.material.materiais]);
      setResumo({ quantidadeTotalPecas: cache.material.quantidade, valorTotalEstoque: cache.material.valor });
      addToast('Material deletado com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || 'Erro ao deletar material', 'error');
    } finally {
      setDeletandoMaterial(null);
    }
  }

  function addToast(message: string, type: 'success' | 'error') {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  const getMaterialNome = (id: number) => materiais.find(m => m.id === id)?.nome || `Material #${id}`;

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <ToastContainer messages={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Estoque" />
        <button onClick={mostrarValor} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${mostrarValores ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}>
          {mostrarValores ? <EyeOff size={14} /> : <Eye size={14} />}
          {mostrarValores ? 'Ocultar' : 'Mostrar valores'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Valor Total</p>
          <p className="text-xl font-bold text-green-700">R$ {esc(Math.abs(resumo?.valorTotalEstoque || 0).toFixed(2).replace('.', ','))}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total de Peças</p>
          <p className="text-xl font-bold text-blue-700">{resumo?.quantidadeTotalPecas || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['materiais', 'movimentacoes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t === 'materiais' ? 'Materiais' : 'Movimentações'}
          </button>
        ))}
      </div>

      {/* Modal Material */}
      <Modal isOpen={materialModalOpen} onClose={() => { setMaterialModalOpen(false); setMaterialEditando(null); }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">{materialEditando ? 'Editar Material' : 'Novo Material'}</h2>
          <button onClick={() => { setMaterialModalOpen(false); setMaterialEditando(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div><label className={lbl}>Nome *</label><input autoFocus type="text" value={formMaterial.nome} onChange={e => setFormMaterial({ ...formMaterial, nome: e.target.value })} placeholder="Nome do material" className={inp} /></div>
          <div><label className={lbl}>Categoria *</label>
            <select value={formMaterial.categoria} onChange={e => setFormMaterial({ ...formMaterial, categoria: e.target.value })} className={inp}>
              <option value="">Selecione</option>
              <option value={CategoriaMaterial.Peca}>Peça</option>
              <option value={CategoriaMaterial.Ferragem}>Ferragem</option>
              <option value={CategoriaMaterial.Pintura}>Pintura</option>
              <option value={CategoriaMaterial.Papelaria}>Papelaria</option>
              <option value={CategoriaMaterial.Tesoura}>Tesoura</option>
              <option value={CategoriaMaterial.Outro}>Outro</option>
            </select>
          </div>
          <div><label className={lbl}>Tamanho</label><textarea value={formMaterial.tamanho} onChange={e => setFormMaterial({ ...formMaterial, tamanho: e.target.value })} placeholder="Tamanho" className={`${inp} h-20 resize-none`} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Quantidade</label><input type="number" value={formMaterial.quantidade} onChange={e => setFormMaterial({ ...formMaterial, quantidade: e.target.value })} placeholder="0" className={inp} /></div>
            <div><label className={lbl}>Valor (R$)</label><input type="number" step="0.01" value={formMaterial.valor} onChange={e => setFormMaterial({ ...formMaterial, valor: e.target.value })} placeholder="0,00" className={inp} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setMaterialModalOpen(false); setMaterialEditando(null); }} disabled={salvandoMaterial} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
            <button onClick={salvarMaterial} disabled={salvandoMaterial} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {salvandoMaterial ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando</>
              ) : (
                <><Save size={16} /> Salvar</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Movimentação */}
      <Modal isOpen={movimentacaoModalOpen} onClose={() => setMovimentacaoModalOpen(false)}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">Registrar Movimentação</h2>
          <button onClick={() => setMovimentacaoModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setTipoMovimentacao(TipoMovimentacao.Entrada)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tipoMovimentacao === TipoMovimentacao.Entrada ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Entrada</button>
            <button onClick={() => setTipoMovimentacao(TipoMovimentacao.Saida)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tipoMovimentacao === TipoMovimentacao.Saida ? 'bg-red-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Saída</button>
          </div>
          <div><label className={lbl}>Material *</label>
            <select value={formMovimentacao.materialId} onChange={e => setFormMovimentacao({ ...formMovimentacao, materialId: e.target.value })} className={inp}>
              <option value="">Selecione</option>
              {materiais.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Quantidade *</label><input type="number" value={formMovimentacao.quantidade} onChange={e => setFormMovimentacao({ ...formMovimentacao, quantidade: e.target.value })} placeholder="0" className={inp} /></div>
          <div><label className={lbl}>Observação</label><textarea value={formMovimentacao.observacao} onChange={e => setFormMovimentacao({ ...formMovimentacao, observacao: e.target.value })} placeholder="Observações" className={`${inp} h-16 resize-none`} /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setMovimentacaoModalOpen(false)} disabled={registrandoMov} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
            <button onClick={registrarMovimentacao} disabled={registrandoMov} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {registrandoMov ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registrando</>
              ) : (
                <><Save size={16} /> Registrar</>
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
          {tab === 'materiais' && (
            <>
              <button onClick={abrirModalNovo} className="w-full mb-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all">
                <Plus size={18} />Novo Material
              </button>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <input type="text" placeholder="Buscar por nome ou tamanho..." value={materialFilter} onChange={e => setMaterialFilter(e.target.value)} className={inp} />
              </div>
              {materiais.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">Nenhum material encontrado</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {materiais.map(mat => (
                    <div key={mat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{mat.nome}</h3>
                          {mat.tamanho && <p className="text-xs text-gray-400 mt-0.5">{mat.tamanho}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => abrirModalEdicao(mat)} disabled={deletandoMaterial === mat.id} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Edit2 size={15} /></button>
                          <button onClick={() => deletarMaterialFunc(mat.id!)} disabled={deletandoMaterial === mat.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletandoMaterial === mat.id ? (
                              <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-gray-50 pt-3 space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Qtd.</span><span className="font-bold text-gray-900">{mat.quantidade}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Preço</span><span className="font-bold text-gray-900">R$ {esc(mat.valor.toFixed(2).replace('.', ','))}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Total</span><span className="font-bold text-green-600">R$ {esc((mat.quantidade * mat.valor).toFixed(2).replace('.', ','))}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'movimentacoes' && (
            <>
              <button onClick={() => setMovimentacaoModalOpen(true)} className="w-full mb-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all">
                <Plus size={18} />Registrar Movimentação
              </button>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <label className={lbl}>Filtrar por Material</label>
                <select value={movFilter || ''} onChange={e => setMovFilter(e.target.value ? Number(e.target.value) : undefined)} className={inp}>
                  <option value="">Todos</option>
                  {materiais.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {movimentacoes.length === 0 ? <div className="text-center py-16 text-gray-400 text-sm">Nenhuma movimentação registrada</div> :
                  movimentacoes.map((mov, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div><p className="text-xs text-gray-400">{new Date(mov.data || '').toLocaleDateString('pt-BR')}</p><p className="font-semibold text-gray-900 text-sm">{getMaterialNome(mov.materialId)}</p></div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${mov.tipo === TipoMovimentacao.Entrada ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {mov.tipo === TipoMovimentacao.Entrada ? <Plus size={12} /> : <TrendingDown size={12} />}
                          {mov.tipo === TipoMovimentacao.Entrada ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-2">Qtd: {mov.quantidade}</p>
                      {mov.observacao && <p className="text-xs text-gray-500 mt-1">{mov.observacao}</p>}
                    </div>
                  ))
                }
              </div>

              {/* Desktop */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      {['Data','Material','Tipo','Quantidade','Observação'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma movimentação</td></tr> :
                      movimentacoes.map((mov, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">{new Date(mov.data || '').toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{getMaterialNome(mov.materialId)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${mov.tipo === TipoMovimentacao.Entrada ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {mov.tipo === TipoMovimentacao.Entrada ? <Plus size={12} /> : <TrendingDown size={12} />}
                              {mov.tipo === TipoMovimentacao.Entrada ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{mov.quantidade}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{mov.observacao || '—'}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
