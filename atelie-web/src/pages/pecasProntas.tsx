import {useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import {
  criarPecaPronta,
  atualizarPecaPronta,
  deletarPecaPronta,
  adicionarMaterial,
  removerMaterial,
  TipoPecaPronta,
  type PecaPronta,
} from '../api/pecasProntas.api';
import { type Material } from '../api/materiais.api';
import { Trash2, Plus, X, Save, Eye, Edit2 } from 'lucide-react';
import { cache, carregarMateriais, carregarPecasProntas } from '../api/cache.api';
import { Modal } from '../components/Modal';
import { ToastContainer, type ToastMessage } from '../components/Toast';

const inputCls = `w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all`;
const labelCls = `block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5`;

interface FormData {
  titulo: string;
  valor: string;
  descricao: string;
  tipo: TipoPecaPronta;
  vendida: boolean;
}

interface EditingMaterial {
  materialId: string;
  quantidadeUsada: string;
}

export default function PecasProntas() {
  const [pecas, setPecas] = useState<PecaPronta[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [materiaisModalOpen, setMateriaisModalOpen] = useState(false);
  const [selectedPecaId, setSelectedPecaId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'todas' | 'nao-vendidas'>('todas');
  const [filterTipo, setFilterTipo] = useState<'todas' | TipoPecaPronta>('todas');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState<number | null>(null);
  const [adicionandoMaterial, setAdicionandoMaterial] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    valor: '',
    descricao: '',
    tipo: TipoPecaPronta.Produzida,
    vendida: false,
  });
  const [materialForm, setMaterialForm] = useState<EditingMaterial>({
    materialId: '',
    quantidadeUsada: '',
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.pecasProntas.length === 0) {
        await carregarPecasProntas();
      }
      if(cache.material.materiais.length === 0) {
        await carregarMateriais();
      }
      setMateriais(cache.material.materiais);
      setPecas(cache.pecasProntas);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {    
    let filtered = cache.pecasProntas;
    if (filterStatus === 'nao-vendidas') {
      filtered = filtered.filter(p => !p.vendida);
    }
   
    if(filterTipo == TipoPecaPronta.Produzida) {
      filtered = filtered.filter(p => p.tipo === 0);
    }
    else if(filterTipo == TipoPecaPronta.Manutencao) {
      filtered = filtered.filter(p => p.tipo === 1);
    }
    setPecas(filtered);
  },[filterStatus, filterTipo]);

  const converterParaBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImagemSelecionada = async ( e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await converterParaBase64(file);

    setFormData(prev => ({
      ...prev,
      fotoUrl: base64,
    }));
  };

  async function criarOuAtualizar() {
    if (!formData.titulo || !formData.valor) {
      addToast('Título e Valor são obrigatórios', 'error');
      return;
    }
    setSalvando(true);
    try {
      const tipoMap: { [key: string]: TipoPecaPronta } = {
        '0': TipoPecaPronta.Produzida,
        '1': TipoPecaPronta.Manutencao,
      };

      const data = {
        titulo: formData.titulo,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao || undefined,
        tipo: tipoMap[formData.tipo],
        vendida: formData.vendida,
      };

      if (editingId) {
        await atualizarPecaPronta(editingId, {
          titulo: data.titulo,
          valor: data.valor,
          descricao: data.descricao,
          tipo: data.tipo,
          vendida: data.vendida,
        });
        addToast('Peça atualizada com sucesso!', 'success');
      } else {
        await criarPecaPronta(data);
        addToast('Peça criada com sucesso!', 'success');
      }
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
      limparFormulario();
      setModalOpen(false);
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao salvar peças', 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(id: number) {
    if (!confirm('Tem certeza que deseja deletar esta peça?')) return;
    setDeletando(id);
    try {
      await deletarPecaPronta(id);
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
      addToast('Peça deletada com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao deletar peças', 'error');
    } finally {
      setDeletando(null);
    }
  }

  async function adicionarMaterialAoPeca() {
    if (!selectedPecaId || !materialForm.materialId || !materialForm.quantidadeUsada) {
      addToast('Selecione um material e informe a quantidade', 'error');
      return;
    }
    setAdicionandoMaterial(true);
    try {
      await adicionarMaterial(
        selectedPecaId,
        parseInt(materialForm.materialId),
        parseInt(materialForm.quantidadeUsada)
      );
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
      setMaterialForm({ materialId: '', quantidadeUsada: '' });
      addToast('Material adicionado com sucesso!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.erro || error?.response?.data?.message || 'Erro ao adicionar material', 'error');
    } finally {
      setAdicionandoMaterial(false);
    }
  }

  function addToast(message: string, type: 'success' | 'error') {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  async function removerMaterialDaPeca(materialId: number) {
    if (!selectedPecaId) return;

    if (!confirm('Tem certeza que deseja remover este material?')) return;

    try {
      await removerMaterial(selectedPecaId, materialId);
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
    } catch (error) {
      console.error('Erro ao remover material:', error);
      alert('Erro ao remover material');
    }
  }

  function limparFormulario() {
    setFormData({
      titulo: '',
      valor: '',
      descricao: '',
      tipo: TipoPecaPronta.Produzida,
      vendida: false,
    });
    setEditingId(null);
  }

  function abrirEditar(peca: PecaPronta) {
    setFormData({
      titulo: peca.titulo,
      valor: peca.valor.toString(),
      descricao: peca.descricao || '',
      tipo: peca.tipo,
      vendida: peca.vendida,
    });
    setEditingId(peca.id);
    setModalOpen(true);
  }

  function fecharMateriaisModal() {
    setMateriaisModalOpen(false);
    setSelectedPecaId(null);
    setMaterialForm({ materialId: '', quantidadeUsada: '' });
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  const pecasFiltradas = pecas;

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      <ToastContainer messages={toasts} onClose={removeToast} />
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Peças Prontas" subtitle={`${pecasFiltradas.length} peça${pecasFiltradas.length !== 1 ? 's' : ''}`} />
        <button onClick={() => {
              limparFormulario();
              setModalOpen(true);
            }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
            shadow-md shadow-blue-500/20 transition-all active:scale-[0.97]">
          <Plus size={18}/> Nova Peça
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className={labelCls}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'todas' | 'nao-vendidas')}
            className={inputCls}
          >
            <option value="todas">Todas</option>
            <option value="nao-vendidas">Não Vendidas</option>
          </select>
        </div>
        <div className="flex-1">
          <label className={labelCls}>Tipo</label>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value as 'todas' | TipoPecaPronta)}
            className={inputCls}
          >
            <option value="todas">Todas</option>
            <option value={TipoPecaPronta.Produzida}>Produzida</option>
            <option value={TipoPecaPronta.Manutencao}>Manutenção</option>
          </select>
        </div>
      </div>

      {/* Grid de Peças */}
      {pecasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center mb-6">
          <Eye size={40} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">Nenhuma peça pronta encontrada</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {pecasFiltradas.map((peca) => (
            <div key={peca.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              
              {/* Conteúdo */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{peca.titulo}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(peca.dataCriacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {peca.vendida ? (
                    <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">Vendida</span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">Disponível</span>
                  )}
                </div>

                {peca.descricao && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{peca.descricao}</p>
                )}

                {/* Valor e Tipo */}
                <div className="flex items-center justify-between mb-3 pb-3 border-t border-gray-100">
                  <div>
                    <p className="mt-3 text-xs text-gray-500 uppercase tracking-wide">Valor</p>
                    <p className="text-lg font-bold text-blue-600">R$ {peca.valor.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <span className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                    peca.tipo === TipoPecaPronta.Produzida 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {peca.tipo === TipoPecaPronta.Produzida ? 'Produzida' : 'Manutenção'}
                  </span>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-2">
                  {peca.tipo === TipoPecaPronta.Produzida && (
                    <button
                      onClick={() => {
                        setSelectedPecaId(peca.id);
                        setMateriaisModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold
                        border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Gerenciar Materiais"
                    >
                      <Eye size={14} />
                      <span className="inline">Materiais</span>
                    </button>
                  )}
                  <button
                    onClick={() => abrirEditar(peca)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold
                      border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span className="inline">Editar</span>
                  </button>
                  <button
                    onClick={() => deletar(peca.id)}
                    disabled={deletando === peca.id}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold
                      border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {deletando === peca.id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-red-700 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    <span className="inline">{deletando === peca.id ? 'Deletando' : 'Deletar'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Peça */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Peça Pronta' : 'Nova Peça Pronta'}</h2>
          <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div><label className={labelCls}>Título *</label>
            <input type="text" value={formData.titulo} placeholder="Título da peça"
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className={inputCls}/>
          </div>

          <div><label className={labelCls}>Valor (R$) *</label>
            <input type="number" step="0.01" value={formData.valor} placeholder="0,00"
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })} className={inputCls}/>
          </div>

          <div><label className={labelCls}>Tipo *</label>
            <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as unknown as TipoPecaPronta})} className={inputCls}>
              <option value={TipoPecaPronta.Produzida}>Produzida</option>
              <option value={TipoPecaPronta.Manutencao}>Manutenção</option>
            </select>
          </div>

          <div><label className={labelCls}>Descrição</label>
            <textarea value={formData.descricao} placeholder="Descrição da peça"
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className={`${inputCls} h-20 resize-none`}/>
          </div>

          <div><label className={labelCls}>Vendida</label>
            <select value={formData.vendida ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, vendida: e.target.value === 'true' })} className={inputCls}>
              <option value="false">Não Vendida</option>
              <option value="true">Vendida</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={salvando}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Cancelar
            </button>
            <button onClick={criarOuAtualizar} disabled={salvando}
              className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm
                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
                flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed">
              {salvando ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando</>
              ) : (
                <><Save size={16}/> {editingId ? 'Atualizar' : 'Criar'}</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Gerenciar Materiais */}
      <Modal isOpen={materiaisModalOpen} onClose={fecharMateriaisModal}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Materiais</h2>
          <button onClick={fecharMateriaisModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="space-y-5">
          {/* Adicionar Material */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Adicionar Material</h3>
            <div className="flex flex-col gap-2">
              <select
                value={materialForm.materialId}
                onChange={(e) => setMaterialForm({ ...materialForm, materialId: e.target.value })}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="">Selecione um material</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.atelieId} - {m.nome} (Disponível: {m.quantidade})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={materialForm.quantidadeUsada}
                  onChange={(e) => setMaterialForm({ ...materialForm, quantidadeUsada: e.target.value })}
                  placeholder="Qtd"
                  className="w-full md:w-24 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  onClick={adicionarMaterialAoPeca}
                  disabled={adicionandoMaterial}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600
                    shadow-md shadow-green-500/20 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                  {adicionandoMaterial ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Materiais */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Materiais Adicionados</h3>
            {pecas.find((p) => p.id === selectedPecaId)?.materiais &&
              pecas.find((p) => p.id === selectedPecaId)!.materiais!.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pecas.find((p) => p.id === selectedPecaId)!.materiais!.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{pm.material.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Quantidade: {pm.quantidadeUsada}</p>
                    </div>
                    <button
                      onClick={() => removerMaterialDaPeca(pm.materialId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-sm">Nenhum material adicionado</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={fecharMateriaisModal}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  );
}
