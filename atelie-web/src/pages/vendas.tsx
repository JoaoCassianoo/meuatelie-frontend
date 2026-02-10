import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { obterVendas, deletarVenda, registrarVenda } from '../api/vendas.api';
import type { Venda } from '../api/vendas.api';
import { Plus, TrendingUp, Trash2, Edit2, X, Save, Eye, EyeOff } from 'lucide-react';
import { obterPecasNaoVendidas,  obterTodasPecasProntas,  type PecaPronta } from '../api/pecasProntas.api';

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pecasProntas, setPecasProntas] = useState<PecaPronta[]>([]);
  const [pecasProntasNV, setPecasProntasNV] = useState<PecaPronta[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVendas, setTotalVendas] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);

  function esconderReceita(valor: string) {
    return mostrarValores ? valor : "***,**";
  }

  const [formData, setFormData] = useState({
    cliente: '',
    pecaProntaId: '',
    valorVenda: '',
    observacao: '',
  });

  useEffect(() => {
    carregarDados();
  }, [modalOpen]);

  async function carregarDados() {
    try {
      setLoading(true);
      const [vend, pecas, pecasNV] = await Promise.all([
        obterVendas(),
        obterPecasNaoVendidas(),
        obterTodasPecasProntas(),
      ]);
      setVendas(vend || []);
      setPecasProntas(pecas || []);
      setPecasProntasNV(pecasNV || []);
      setTotalVendas((vend || []).reduce((sum: number, v: { valorVenda: number; quantidade: number; }) => sum + v.valorVenda * v.quantidade, 0));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function setValorPecaSelecionada(pecaId: string) {
    const peca = pecasProntas.find(p => p.id.toString() === pecaId);
    if (peca) {
      setFormData({ ...formData, valorVenda: peca.valor.toString(), pecaProntaId: pecaId });
    }
  }

  function abrirModalNova() {
    setVendaEditando(null);
    setFormData({ cliente: '', pecaProntaId: '', valorVenda: '', observacao: '' });
    setModalOpen(true);
  }

  function abrirModalEdicao(venda: Venda) {
    setVendaEditando(venda);
    setFormData({
      cliente: venda.cliente,
      pecaProntaId: venda.pecaProntaId.toString(),
      valorVenda: venda.valorVenda.toString(),
      observacao: venda.observacao || '',
    });
    setModalOpen(true);
  }

  async function salvarVenda() {
    if (!formData.cliente || !formData.pecaProntaId || !formData.valorVenda) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const dados = {
        cliente: formData.cliente,
        pecaProntaId: Number(formData.pecaProntaId),
        valorVenda: Number(formData.valorVenda),
        observacao: formData.observacao,
      };
      await registrarVenda(dados);
      setFormData({ cliente: '', pecaProntaId: '', valorVenda: '', observacao: '' });
      setModalOpen(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda');
    }
  }

  async function deletarVendaFunc(id: number) {
    if (!confirm('Deletar esta venda?')) return;
    try {
      await deletarVenda(id);
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  }

  const getPecaProntaNome = (id: number) => {
    return pecasProntasNV.find(m => m.id === id)?.titulo || `Peça Pronta #${id}`;
  };


  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col justify-between mb-6">
        <div className="flex items-center text-center justify-between">
          <PageHeader title="Vendas" />
          <button
            onClick={() => setMostrarValores(!mostrarValores)}
            className={`
              mb-6 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md border
              transition-all
              ${
                mostrarValores
                  ? 'text-gray-700 border-gray-300 hover:bg-gray-100'
                  : 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100'
              }
            `}
          >
            {mostrarValores ? <EyeOff size={16}/> : <Eye size={16} />}
            {mostrarValores ? 'Ocultar valores' : 'Mostrar valores'}
          </button>
        </div>
        <button
          onClick={abrirModalNova}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Venda
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {vendaEditando ? 'Editar Venda' : 'Nova Venda'}
              </h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Peça *</label>
                <select
                  value={formData.pecaProntaId}
                  onChange={(e) => setValorPecaSelecionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma peça pronta</option>
                  {pecasProntas.map(m => (
                    <option key={m.id} value={m.id}>{m.titulo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorVenda}
                  onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  placeholder="Observações"
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
                  onClick={salvarVenda}
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
        <>
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold opacity-90">Total de Vendas</p>
                <p className="text-4xl font-bold flex items-center gap-2 mt-2">
                  <TrendingUp size={32} />
                  R$ {esconderReceita(totalVendas.toFixed(2).replace('.', ','))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Peça</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Observação</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma venda registrada
                      </td>
                    </tr>
                  ) : (
                    vendas.map(venda => (
                      <tr key={venda.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{venda.cliente}</td>
                        <td className="px-6 py-4 text-gray-700">{getPecaProntaNome(venda.pecaProntaId)}</td>
                        <td className="px-6 py-4 text-gray-700">{venda.observacao}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          R$ {esconderReceita((venda.valorVenda).toFixed(2).replace('.', ','))}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => abrirModalEdicao(venda)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deletarVendaFunc(venda.id!)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
