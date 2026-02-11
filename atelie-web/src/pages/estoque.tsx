import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { obterMovimentacoes, registrarEntrada, registrarSaida } from '../api/estoque.api';
import { obterTodosMateriais, criarMaterial, deletarMaterial, atualizarMaterial, obterResumo } from '../api/materiais.api';
import type { MovimentacaoEstoque } from '../api/estoque.api';
import type { Material } from '../api/materiais.api';
import { CategoriaMaterial, TipoMovimentacao } from '../types/estoque';
import { Plus, TrendingDown, Trash2, X, Save, Edit2, Eye, EyeOff } from 'lucide-react';

export default function Estoque() {
  const [tab, setTab] = useState<'materiais' | 'movimentacoes'>('materiais');
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialFilter, setMaterialFilter] = useState<number | undefined>(undefined);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [movimentacaoModalOpen, setMovimentacaoModalOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacao>(TipoMovimentacao.Entrada);
  const [resumo, setResumo] = useState<{ quantidadeTotalPecas: number; valorTotalEstoque: number } | null>(null);
  const [mostrarValores, setMostrarValores] = useState(false);

  function esconderReceita(valor: string) {
    return mostrarValores ? valor : "***,**";
  }

  
  const [formMaterial, setFormMaterial] = useState({
    nome: '',
    categoria: '',
    tamanho: '',
    quantidade: '',
    valor: '',
  });

  const [formMovimentacao, setFormMovimentacao] = useState({
    materialId: '',
    quantidade: '',
    observacao: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [movs, mats] = await Promise.all([
        obterMovimentacoes(materialFilter),
        obterTodosMateriais(1),
      ]);
      const resumoData = await obterResumo();
      setResumo(resumoData);
      setMovimentacoes(movs || []);
      setMateriais(mats || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalNovo() {
    setMaterialEditando(null);
    setFormMaterial({ nome: '', categoria: '1', tamanho: '', quantidade: '', valor: '' });
    setMaterialModalOpen(true);
  }

  function abrirModalEdicao(material: Material) {
    setMaterialEditando(material);
    setFormMaterial({
      nome: material.nome,
      categoria: material.categoria.toString(),
      tamanho: material.tamanho || '',
      quantidade: material.quantidade.toString(),
      valor: material.valor.toString(),
    });
    setMaterialModalOpen(true);
  }

  async function salvarMaterial() {
    if (!formMaterial.nome || !formMaterial.categoria) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    try {
      const dados = {
        nome: formMaterial.nome,
        categoria: Number(formMaterial.categoria) as typeof CategoriaMaterial[keyof typeof CategoriaMaterial],
        tamanho: formMaterial.tamanho,
        quantidade: Number(formMaterial.quantidade) || 0,
        valor: Number(formMaterial.valor) || 0,
      };

      if (materialEditando) {
        await atualizarMaterial(materialEditando.id!, dados);
        alert('Material atualizado com sucesso!');
      } else {
        await criarMaterial(dados);
        alert('Material criado com sucesso!');
      }

      setFormMaterial({ nome: '', categoria: '', tamanho: '', quantidade: '', valor: '' });
      setMaterialEditando(null);
      setMaterialModalOpen(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      alert('Erro ao salvar material');
    }
  }

  async function registrarMovimentacao() {
    if (!formMovimentacao.materialId || !formMovimentacao.quantidade) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (tipoMovimentacao === TipoMovimentacao.Entrada) {
        await registrarEntrada(
          Number(formMovimentacao.materialId),
          Number(formMovimentacao.quantidade),
          formMovimentacao.observacao
        );
      } else {
        await registrarSaida(
          Number(formMovimentacao.materialId),
          Number(formMovimentacao.quantidade),
          formMovimentacao.observacao
        );
      }
      setFormMovimentacao({ materialId: '', quantidade: '', observacao: '' });
      setMovimentacaoModalOpen(false);
      carregarDados();
      alert(`${tipoMovimentacao === TipoMovimentacao.Entrada ? 'Entrada' : 'Saída'} registrada com sucesso!`);
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert('Erro ao registrar movimentação');
    }
  }

  async function deletarMaterialFunc(id: number) {
    if (!confirm('Deletar este material?')) return;
    try {
      await deletarMaterial(id);
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  }

  const getMaterialNome = (id: number) => {
    return materiais.find(m => m.id === id)?.nome || `Material #${id}`;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col justify-between mb-6">
        <div className="flex items-center text-center justify-between">
          <PageHeader title="Estoque" />
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
        <div className="flex gap-2">
          <button
            onClick={() => setTab('materiais')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              tab === 'materiais'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Materiais
          </button>
          <button
            onClick={() => setTab('movimentacoes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              tab === 'movimentacoes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Movimentações
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-gray-600 text-sm">Valor Total Estoque</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {esconderReceita(Math.abs(resumo?.valorTotalEstoque || 0).toFixed(2).replace('.', ','))}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <p className="text-gray-600 text-sm">Quantidade de Peças</p>
          <p className="text-2xl font-bold text-red-600">
            {(resumo?.quantidadeTotalPecas || 0)}
          </p>
        </div>
      </div>

      {/* Modal Material */}
      {materialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{materiais.length + 1} - {materialEditando ? 'Editar Material' : 'Novo Material'}</h2>
              <button onClick={() => setMaterialModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                <input
                  autoFocus
                  type="text"
                  value={formMaterial.nome}
                  onChange={(e) => setFormMaterial({ ...formMaterial, nome: e.target.value })}
                  placeholder="Nome do material"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                <select
                  value={formMaterial.categoria}
                  onChange={(e) => setFormMaterial({ ...formMaterial, categoria: e.target.value })}
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
                  value={formMaterial.tamanho}
                  onChange={(e) => setFormMaterial({ ...formMaterial, tamanho: e.target.value })}
                  placeholder="Tamanho"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={formMaterial.quantidade}
                  onChange={(e) => setFormMaterial({ ...formMaterial, quantidade: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formMaterial.valor}
                  onChange={(e) => setFormMaterial({ ...formMaterial, valor: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setMaterialModalOpen(false);
                    setMaterialEditando(null);
                  }}
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

      {/* Modal Movimentação */}
      {movimentacaoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {tipoMovimentacao === TipoMovimentacao.Entrada ? 'Entrada' : 'Saída'} de Material
              </h2>
              <button onClick={() => setMovimentacaoModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoMovimentacao(TipoMovimentacao.Entrada)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                    tipoMovimentacao === TipoMovimentacao.Entrada
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Entrada
                </button>
                <button
                  onClick={() => setTipoMovimentacao(TipoMovimentacao.Saida)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                    tipoMovimentacao === TipoMovimentacao.Saida
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Saída
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material *</label>
                <select
                  value={formMovimentacao.materialId}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, materialId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um material</option>
                  {materiais.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade *</label>
                <input
                  type="number"
                  value={formMovimentacao.quantidade}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, quantidade: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label>
                <textarea
                  value={formMovimentacao.observacao}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, observacao: e.target.value })}
                  placeholder="Observações"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMovimentacaoModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarMovimentacao}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Registrar
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
          {tab === 'materiais' && (
            <>
              <button
                onClick={abrirModalNovo}
                className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Novo Material
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {materiais.map(mat => (
                  <div key={mat.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p>{mat.id}</p>
                        <h3 className="text-lg font-bold text-gray-900">{mat.nome}</h3>
                        <p className="text-sm text-gray-600">{mat.tamanho}</p>
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
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="font-bold text-gray-900">{mat.quantidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço Unit.:</span>
                        <span className="font-bold text-gray-900">R$ {esconderReceita(mat.valor.toFixed(2).replace('.', ','))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-green-600">
                          R$ {esconderReceita((mat.quantidade * mat.valor).toFixed(2).replace('.', ','))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'movimentacoes' && (
            <>
              <button
                onClick={() => setMovimentacaoModalOpen(true)}
                className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Registrar Movimentação
              </button>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Material</label>
                <select
                  value={materialFilter || ''}
                  onChange={(e) => setMaterialFilter(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  {materiais.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Material</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Tipo</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantidade</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimentacoes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Nenhuma movimentação registrada
                          </td>
                        </tr>
                      ) : (
                        movimentacoes.map((mov, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {new Date(mov.dataCriacao || '').toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{getMaterialNome(mov.materialId)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 w-fit mx-auto ${
                                mov.tipo === TipoMovimentacao.Entrada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {mov.tipo === TipoMovimentacao.Entrada ? <Plus size={14} /> : <TrendingDown size={14} />}
                                {mov.tipo === TipoMovimentacao.Entrada ? 'Entrada' : 'Saída'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">{mov.quantidade}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{mov.observacao || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
