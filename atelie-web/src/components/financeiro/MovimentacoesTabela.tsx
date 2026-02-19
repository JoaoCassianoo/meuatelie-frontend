import type { MovimentacaoFinanceira } from '../../types/financeiro';
import { Edit2, Trash2 } from 'lucide-react';

interface Props {
  dados: MovimentacaoFinanceira[];
  onEditar: (mov: MovimentacaoFinanceira) => void;
  onExcluir: (id: number) => void;
  esconderReceita?: (valor: string) => string;
}



export function MovimentacoesTabela({
  dados,
  onEditar,
  onExcluir,
  esconderReceita
}: Props) {
   function escondeReceita(valor: string) {
    return esconderReceita ? esconderReceita(valor) : valor;
  }
  return (
    <><div className="hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Contexto</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Meio</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma movimentação registrada
                </td>
              </tr>
            ) : (
              dados.map(m => (
                <tr
                  key={m.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </td>

                  <td className="max-w-[250px] px-4 py-3 text-sm font-medium text-gray-900">
                    {m.descricao}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-bold">
                    <span
                      className={`${m.valor < 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {m.valor < 0 ? '- ' : '+ '}R$ {escondeReceita(Math.abs(m.valor).toFixed(2).replace('.', ','))}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${m.contexto === 1
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'}`}
                    >
                      {m.contexto === 1 ? 'Loja' : 'Pessoal'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${m.meioPagamento === 1
                          ? 'bg-orange-100 text-orange-700'
                          : m.meioPagamento === 2
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-green-100 text-green-700'}`}
                    >
                      {m.meioPagamento === 1 ? 'Crédito' : m.meioPagamento === 2 ? 'Débito' : 'Pix'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEditar(m)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => onExcluir(m.id!)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
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
    <div className="md:hidden space-y-4">
        {dados.map(m => (
          <div
            key={m.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(m.data).toLocaleDateString('pt-BR')}
                </p>
                <p className="font-semibold text-gray-900 max-w-[165px]">
                  {m.descricao}
                </p>
              </div>

              <span
                className={`font-bold ${m.valor < 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {m.valor < 0 ? '- ' : '+ '}R$ {escondeReceita(Math.abs(m.valor).toFixed(2).replace('.', ','))}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {m.contexto === 1 ? 'Loja' : 'Pessoal'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  {m.meioPagamento === 1 ? 'Crédito' : m.meioPagamento === 2 ? 'Débito' : 'Pix'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditar(m)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <Edit2 size={18} />
                </button>

                <button
                  onClick={() => onExcluir(m.id!)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div></>

  );
}
