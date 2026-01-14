import type { MovimentacaoFinanceira } from '../../types/financeiro';

interface Props {
  dados: MovimentacaoFinanceira[];
  onEditar: (mov: MovimentacaoFinanceira) => void;
  onExcluir: (id: number) => void;
}

export function MovimentacoesTabela({
  dados,
  onEditar,
  onExcluir
}: Props) {
  return (
    <table className="w-full mt-6 border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Data</th>
          <th className="p-2">Descrição</th>
          <th className="p-2">Valor</th>
          <th className="p-2">Contexto</th>
          <th className="p-2">Meio</th>
          <th className="p-2">Ações</th>
        </tr>
      </thead>

      <tbody>
        {dados.map(m => (
          <tr key={m.id} className="border-t">
            <td className="p-2 text-center">
              {new Date(m.data).toLocaleDateString()}
            </td>

            <td className="p-2 text-left">{m.descricao}</td>

            <td
              className={`p-2 ${
                m.valor < 0 ? 'text-red-600' : 'text-green-600'
              } text-right`}
            >
              R$ {m.valor.toFixed(2)}
            </td>

            <td className="p-2 text-center">{m.contexto == 1 ? 'Loja' : 'Pessoal'}</td>
            <td className="p-2 text-center">{m.meioPagamento == 1 ? 'Crédito' : 'Débito'}</td>

            <td className="p-2 flex gap-2 justify-end">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => onEditar(m)}
              >
                Editar
              </button>

              <button
                className="text-red-600 hover:underline"
                onClick={() => onExcluir(m.id!)}
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
