import type { MovimentacaoFinanceira } from '../../types/financeiro';

interface Props {
  dados: MovimentacaoFinanceira[];
}

export function MovimentacoesTabela({ dados }: Props) {
  return (
    <table className="w-full mt-6 border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Data</th>
          <th className="p-2">Descrição</th>
          <th className="p-2">Valor</th>
          <th className="p-2">Contexto</th>
          <th className="p-2">Meio</th>
        </tr>
      </thead>
      <tbody>
        {dados.map(m => (
          <tr key={m.id} className="border-t">
            <td className="p-2">
              {new Date(m.data).toLocaleDateString()}
            </td>
            <td className="p-2">{m.descricao}</td>
            <td className={`p-2 ${m.valor < 0 ? 'text-red-600' : 'text-green-600'}`}>
              R$ {m.valor.toFixed(2)}
            </td>
            <td className="p-2">{m.contexto}</td>
            <td className="p-2">{m.meioPagamento}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
