import { useState } from 'react';
import { criarMovimentacao } from '../../api/financeiro.api';
import { Modal } from '../modal';
import { ContextoFinanceiro, MeioPagamento } from '../../types/financeiro';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function NovaMovimentacaoModal({
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);
  const [data, setData] = useState('');
  const [contexto, setContexto] = useState<ContextoFinanceiro>(
    ContextoFinanceiro.Pessoal
  );

  const [meioPagamento, setMeioPagamento] = useState<MeioPagamento>(
    MeioPagamento.CartaoDebito
  );


  async function salvar() {
    await criarMovimentacao({
      descricao,
      valor,
      data,
      contexto,
      meioPagamento
    });

    onSaved();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        Nova Movimentação
      </h2>

      <input
        className="border w-full mb-2 p-2"
        placeholder="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
      />

      <input
        type="number"
        className="border w-full mb-2 p-2"
        value={valor}
        onChange={e => setValor(Number(e.target.value))}
      />

      <input
        type="date"
        className="border w-full mb-2 p-2"
        value={data}
        onChange={e => setData(e.target.value)}
      />

      <select
        value={contexto}
        onChange={(e) =>
            setContexto(Number(e.target.value) as ContextoFinanceiro)
        }
        >
        <option value={ContextoFinanceiro.Pessoal}>Pessoal</option>
        <option value={ContextoFinanceiro.Loja}>Loja</option>
      </select>


      <select
        value={meioPagamento}
        onChange={(e) =>
            setMeioPagamento(Number(e.target.value) as MeioPagamento)
        }
        >
        <option value={MeioPagamento.CartaoDebito}>Cartão Débito</option>
        <option value={MeioPagamento.CartaoCredito}>Cartão Crédito</option>
      </select>



      <button
        onClick={salvar}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Salvar
      </button>
    </Modal>
  );
}
