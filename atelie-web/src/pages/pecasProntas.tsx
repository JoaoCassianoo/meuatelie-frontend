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
import { Trash2, Plus, X, Save, Eye } from 'lucide-react';
import { cache, carregarMateriais, carregarPecasProntas } from '../api/cache.api';

interface FormData {
  titulo: string;
  valor: string;
  descricao: string;
  tipo: TipoPecaPronta;
  fotoUrl: string;
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
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    valor: '',
    descricao: '',
    tipo: TipoPecaPronta.Produzida,
    fotoUrl: '',
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
      alert('Título e Valor são obrigatórios');
      return;
    }

    try {
      // Converte tipo string para enum value
      const tipoMap: { [key: string]: TipoPecaPronta } = {
        '0': TipoPecaPronta.Produzida,
        '1': TipoPecaPronta.Manutencao,
      };

      const data = {
        titulo: formData.titulo,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao || undefined,
        tipo: tipoMap[formData.tipo],
        fotoUrl: formData.fotoUrl || undefined,
        vendida: formData.vendida,
      };

      console.log('Salvando peça com dados:', data);

      if (editingId) {
        await atualizarPecaPronta(editingId, {
          titulo: data.titulo,
          valor: data.valor,
          descricao: data.descricao,
          fotoUrl: data.fotoUrl,
          tipo: data.tipo,
          vendida: data.vendida,
        });
      } else {
        await criarPecaPronta(data);
      }
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
      limparFormulario();
      setModalOpen(false);
    }  catch (error: any) {
      alert('Erro ao salvar peças:');
      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao salvar peças';
      console.error(mensagem);
    }
  }

  async function deletar(id: number) {
    if (!confirm('Tem certeza que deseja deletar esta peça?')) return;

    try {
      await deletarPecaPronta(id);
      await carregarPecasProntas();
      await carregarMateriais();
      setPecas([...cache.pecasProntas]);
      setMateriais([...cache.material.materiais]);
    } catch (error: any) {
      alert('Erro ao deletar peça:');
      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao deletar peças';
      console.error(mensagem);
    }
  }

  async function adicionarMaterialAoPeca() {
    if (!selectedPecaId || !materialForm.materialId || !materialForm.quantidadeUsada) {
      alert('Selecione um material e informe a quantidade');
      return;
    }

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
    } catch (error: any) {
      alert('Erro ao adicionar material:');
      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao adicionar material';
      console.error(mensagem);
    }
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
      fotoUrl: '',
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
      fotoUrl: peca.fotoUrl || '',
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
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const pecasFiltradas = filterStatus === 'nao-vendidas' ? pecas.filter(p => !p.vendida) : pecas;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Peças Prontas" />

      <div className="">
        {/* Controles de Filtro e Ações */}
        <div className="flex flex-col gap-3 mb-3 md:mb-6">
          <div className="w-full flex flex-row justify-between gap-2 items-center">
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'todas' | 'nao-vendidas')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="nao-vendidas">Não Vendidas</option>
              </select>
            </div>

            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as 'todas' | TipoPecaPronta)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value={TipoPecaPronta.Produzida}>Produzida</option>
                <option value={TipoPecaPronta.Manutencao}>Manutenção</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              limparFormulario();
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Nova Peça
          </button>
        </div>

        {/* Lista de Peças */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pecasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Nenhuma peça pronta encontrada</div>
          ) : (
            pecasFiltradas.map((peca) => (
              <div key={peca.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-col md:items-start md:justify-between gap-4">
                  {/* Informações Principais */}
                  <div className="flex-1 w-full">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className='flex flex-row items-center justify-between'>
                          <h3 className="text-lg font-semibold text-gray-900">{peca.titulo}</h3>
                          <div className='text-gray-700'>
                            {new Date(peca.dataCriacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        {peca.descricao && <p className="text-sm text-gray-600 mt-1">{peca.descricao}</p>}
                      </div>
                    </div>

                    <img src={peca.fotoUrl} alt="" className="h-64 w-full object-cover rounded-md"/>
                  </div>

                  

                  {/* Ações */}
                  <div className="grid grid-cols-2 gap-2 md:w-full">
                    
                    {peca.tipo === TipoPecaPronta.Produzida && (
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm text-center"
                        title="Status"
                      >
                        PRODUZIDA
                      </button>
                    )}

                    {peca.tipo === TipoPecaPronta.Manutencao && (
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm text-center"
                        title="Status"
                      >
                        MANUTENÇÃO
                      </button>
                    )}
                    
                    {peca.tipo === TipoPecaPronta.Produzida && (
                      <button
                        onClick={() => {
                          setSelectedPecaId(peca.id);
                          setMateriaisModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors text-sm"
                        title="Gerenciar Materiais"
                      >
                        <Eye size={16} />
                        Materiais
                      </button>
                    )}

                    <button
                      onClick={() => abrirEditar(peca)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      title="Editar"
                    >
                      <Save size={16} />
                      Editar
                    </button>

                    <button
                      onClick={() => deletar(peca.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2 w-full justify-between">
                  <div>
                    <span className="font-medium">Valor:</span> R$ {peca.valor.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    {peca.vendida ? (
                      <span className="text-green-600">✓ Vendida</span>
                    ) : (
                      <span className="text-orange-600">Não Vendida</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Criar/Editar Peça */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Editar Peça Pronta' : 'Nova Peça Pronta'}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  limparFormulario();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as unknown as TipoPecaPronta})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={TipoPecaPronta.Produzida}>Produzida</option>
                  <option value={TipoPecaPronta.Manutencao}>Manutenção</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendida *</label>
                <select
                  value={formData.vendida ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, vendida: e.target.value === 'true' })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto</label>
                <input
                  type="file"
                  accept='image/*'
                  capture='environment'
                  onChange={handleImagemSelecionada}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setModalOpen(false);
                  limparFormulario();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={criarOuAtualizar}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Materiais */}
      {materiaisModalOpen && selectedPecaId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Gerenciar Materiais</h2>
              <button onClick={fecharMateriaisModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Adicionar Material */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Adicionar Material</h3>
                <div className="flex gap-3">
                  <select
                    value={materialForm.materialId}
                    onChange={(e) => setMaterialForm({ ...materialForm, materialId: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um material</option>
                    {materiais.map((m) => (
                      <option key={m.id} value={m.id}>
                       {m.id} {m.nome} (Disponível: {m.quantidade})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={materialForm.quantidadeUsada}
                    onChange={(e) => setMaterialForm({ ...materialForm, quantidadeUsada: e.target.value })}
                    placeholder="Quantidade"
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={adicionarMaterialAoPeca}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Lista de Materiais */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Materiais Adicionados</h3>
                {pecas.find((p) => p.id === selectedPecaId)?.materiais &&
                  pecas.find((p) => p.id === selectedPecaId)!.materiais!.length > 0 ? (
                  <div className="space-y-2">
                    {pecas.find((p) => p.id === selectedPecaId)!.materiais!.map((pm) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{pm.material.id} - {pm.material.nome}</p>
                          <p className="text-sm text-gray-600">Quantidade: {pm.quantidadeUsada}</p>
                        </div>
                        <button
                          onClick={() => removerMaterialDaPeca(pm.materialId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum material adicionado</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={fecharMateriaisModal}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
