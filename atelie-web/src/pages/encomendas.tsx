import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { obterEncomendas, atualizarStatusEncomenda, deletarEncomenda, criarEncomenda, StatusEncomenda } from '../api/encomendas.api';
import { obterTodosMateriais } from '../api/materiais.api';
import type { Encomenda } from '../api/encomendas.api';
import type { Material } from '../api/materiais.api';
import { Trash2, Plus, X, Save } from 'lucide-react';
import { adicionarEncomenda, cache, carregarEncomendas, carregarMateriais } from '../api/cache.api';

const statusColors: Record<StatusEncomenda, { bg: string; text: string; label: string }> = {
  [StatusEncomenda.Pendente]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
  [StatusEncomenda.EmProducao]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Produção' },
  [StatusEncomenda.Finalizada]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Finalizada' },
  [StatusEncomenda.Cancelada]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
};

export default function Encomendas() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    materialId: '',
    valorOrcado: '',
    cliente: '',
    observacao: '',
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (cache.encomendas.length === 0) {
        await carregarEncomendas();
      }
      if (cache.material.materiais.length === 0) {
        await carregarMateriais();
      }
      setEncomendas(cache.encomendas);
      setMateriais(cache.material.materiais);
      setLoading(false);
    }
    init();
  }, []);

  async function criarNovaEncomenda() {
    if (!formData.descricao || !formData.materialId || !formData.valorOrcado || !formData.cliente) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      let encomenda = await criarEncomenda({
        descricao: formData.descricao,
        materialId: Number(formData.materialId),
        status: StatusEncomenda.Pendente,
        valorOrcado: Number(formData.valorOrcado),
        cliente: formData.cliente,
        observacao: formData.observacao,
      });
      setFormData({ descricao: '', materialId: '', valorOrcado: '', cliente: '', observacao: '' });
      setModalOpen(false);
      adicionarEncomenda(encomenda);
      alert('Encomenda criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar encomenda:', error);
      alert('Erro ao criar encomenda');
    }
  }

  async function mudarStatus(id: number, novoStatus: StatusEncomenda) {
    try {
      await atualizarStatusEncomenda(id, novoStatus);
      await carregarEncomendas();
      setEncomendas(cache.encomendas);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async function deletar(id: number) {
    if (!confirm('Deseja realmente deletar esta encomenda?')) return;
    try {
      await deletarEncomenda(id);
      await carregarEncomendas();
      setEncomendas(cache.encomendas);
    } catch (error) {
      console.error('Erro ao deletar encomenda:', error);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Encomendas" />
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Encomenda
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Nova Encomenda</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da encomenda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material *</label>
                <select
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um material</option>
                  {materiais.map(m => (
                    <option key={m.id} value={m.id}>{m.id} - {m.nome} - (Disponível: {m.quantidade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Orçado (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorOrcado}
                  onChange={(e) => setFormData({ ...formData, valorOrcado: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  placeholder="Observações adicionais"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
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
                  onClick={criarNovaEncomenda}
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
        <p className="text-gray-500">Carregando encomendas...</p>
      ) : encomendas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma encomenda registrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Valor Orçado</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {encomendas.map((enc) => {
                  const statusInfo = statusColors[enc.status || 1];
                  return (
                    <tr key={enc.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{enc.cliente}</td>
                      <td className="px-6 py-4 text-gray-700">{enc.descricao}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        R$ {enc.valorOrcado.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <select
                            value={enc.status || 1}
                            onChange={(e) => mudarStatus(enc.id!, Number(e.target.value) as StatusEncomenda)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <option value={1}>Pendente</option>
                            <option value={2}>Em Produção</option>
                            <option value={3}>Finalizada</option>
                            <option value={4}>Cancelada</option>
                          </select>
                          <button
                            onClick={() => deletar(enc.id!)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
