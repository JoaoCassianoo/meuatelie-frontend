import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { obterTodosMateriais, criarMaterial, atualizarMaterial, deletarMaterial, obterResumo } from '../api/materiais.api';
import type { Material } from '../api/materiais.api';
import { CategoriaMaterial } from '../types/estoque';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const categoriasMap: Record<typeof CategoriaMaterial[keyof typeof CategoriaMaterial], string> = {
  [CategoriaMaterial.Peca]: 'Peça',
  [CategoriaMaterial.Ferragem]: 'Ferragem',
  [CategoriaMaterial.Pintura]: 'Pintura',
  [CategoriaMaterial.Papelaria]: 'Papelaria',
  [CategoriaMaterial.Tesoura]: 'Tesoura',
  [CategoriaMaterial.Outro]: 'Outro',
};

export default function Materiais() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    tamanho: '',
    quantidade: '',
    valor: '',
  });

  useEffect(() => {
    carregarMateriais();
  }, []);

  async function carregarMateriais() {
    try {
      setLoading(true);
      const mats = await obterTodosMateriais();
      setMateriais(mats || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalNovo() {
    setMaterialEditando(null);
    setFormData({ nome: '', categoria: '', tamanho: '', quantidade: '', valor: '' });
    setModalOpen(true);
  }

  function abrirModalEdicao(material: Material) {
    setMaterialEditando(material);
    setFormData({
      nome: material.nome,
      categoria: material.categoria?.toString() || '',
      tamanho: material.tamanho || '',
      quantidade: material.quantidade?.toString() || '',
      valor: material.valor?.toString() || '',
    });
    setModalOpen(true);
  }

  async function salvarMaterial() {
    if (!formData.nome || !formData.categoria) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    try {
      const dados = {
        nome: formData.nome,
        categoria: Number(formData.categoria) as typeof CategoriaMaterial[keyof typeof CategoriaMaterial],
        tamanho: formData.tamanho,
        quantidade: Number(formData.quantidade) || 0,
        valor: Number(formData.valor) || 0,
      };

      if (materialEditando) {
        await atualizarMaterial(materialEditando.id!, dados);
        alert('Material atualizado com sucesso!');
      } else {
        await criarMaterial(dados);
        alert('Material criado com sucesso!');
      }

      setFormData({ nome: '', categoria: '', tamanho: '', quantidade: '', valor: '' });
      setModalOpen(false);
      carregarMateriais();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      alert('Erro ao salvar material');
    }
  }

  async function deletarMaterialFunc(id: number) {
    if (!confirm('Deletar este material?')) return;
    try {
      await deletarMaterial(id);
      carregarMateriais();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Materiais" />
        <button
          onClick={abrirModalNovo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Material
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {materialEditando ? 'Editar Material' : 'Novo Material'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do material"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value={CategoriaMaterial.Peca}>Peça</option>
                  <option value={CategoriaMaterial.Ferragem}>Ferragem</option>
                  <option value={CategoriaMaterial.Pintura}>Pintura</option>
                  <option value={CategoriaMaterial.Papelaria}>Papelaria</option>
                  <option value={CategoriaMaterial.Tesoura}>Tesoura</option>
                  <option value={CategoriaMaterial.Outro}>Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tamanho</label>
                <textarea
                  value={formData.tamanho}
                  onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                  placeholder="Tamanho"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarMaterial}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map(mat => (
            <div key={mat.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{mat.nome}</h3>
                  <p className="text-xs font-semibold text-blue-600 mt-1">
                    {categoriasMap[mat.categoria || 0] || 'Sem categoria'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalEdicao(mat)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletarMaterialFunc(mat.id!)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {mat.tamanho && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mat.tamanho}</p>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-bold text-gray-900">{mat.quantidade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preço Unit.:</span>
                  <span className="font-bold text-gray-900">R$ {mat.valor.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-green-600">
                    R$ {(mat.quantidade * mat.valor).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
