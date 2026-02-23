import { useState, useEffect } from 'react';
import { criarMovimentacao, atualizarMovimentacao } from '../../api/financeiro.api';
import { Modal } from '../Modal';
import { ContextoFinanceiro, MeioPagamento } from '../../types/financeiro';
import type { MovimentacaoFinanceira } from '../../types/financeiro';
import { X, Save } from 'lucide-react';

type Props = {
  isOpen: boolean;
  ano: number;
  mes: number;
  onClose: () => void;
  onSaved: () => void;
  movimentacao?: MovimentacaoFinanceira | null;
};

export function NovaMovimentacaoModal({
  isOpen,
  ano,
  mes,
  onClose,
  onSaved,
  movimentacao,
}: Props) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);
  const [data, setData] = useState('');
  const [contexto, setContexto] = useState<ContextoFinanceiro>(
    ContextoFinanceiro.Loja
  );

  const [meioPagamento, setMeioPagamento] = useState<MeioPagamento>(
    MeioPagamento.CartaoCredito
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (movimentacao) {
      setDescricao(movimentacao.descricao);
      setValor(movimentacao.valor);
      // Converte UTC para data local mantendo a data correta
      const dateObj = new Date(movimentacao.data);
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      setData(`${year}-${month}-${day}`);
      setContexto(movimentacao.contexto);
      setMeioPagamento(movimentacao.meioPagamento);
    } else if (isOpen) {
      // reset when opening for a new movimentação
      setDescricao('');
      setValor(0);
      // Set date to first day of current month/year (YYYY-MM-01)
      const dataAtual = new Date(ano, mes - 1, 1);
      const dataFormatada = dataAtual.toISOString().split('T')[0];
      setData(dataFormatada);
      setContexto(ContextoFinanceiro.Pessoal);
      setMeioPagamento(MeioPagamento.CartaoDebito);
    }
  }, [movimentacao, isOpen, ano, mes]);

  async function salvar() {
    setSalvando(true);
    try {
      // Converte data local para UTC ISO string
      const [year, month, day] = data.split('-');
      const dateUTC = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
      const dataISO = dateUTC.toISOString();
      
      if (movimentacao && movimentacao.id) {
        await atualizarMovimentacao(movimentacao.id, {
          id: movimentacao.id,
          descricao,
          valor,
          data: dataISO,
          contexto,
          meioPagamento,
        });
      } else {
        await criarMovimentacao({
          descricao,
          valor,
          data: dataISO,
          contexto,
          meioPagamento,
        });
      }
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar ou atualizar movimentação:', error);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {movimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descrição
          </label>
          <input
            disabled={salvando}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Ex: Compra de materiais"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valor (R$)
          </label>
          <input
            disabled={salvando}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            value={valor}
            onChange={e => setValor(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data
          </label>
          <input
            disabled={salvando}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            value={data}
            onChange={e => setData(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contexto
            </label>
            <select
              disabled={salvando}
              value={contexto}
              onChange={(e) =>
                setContexto(Number(e.target.value) as ContextoFinanceiro)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value={ContextoFinanceiro.Loja}>Loja</option>
              <option value={ContextoFinanceiro.Pessoal}>Pessoal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meio de Pagamento
            </label>
            <select
              disabled={salvando}
              value={meioPagamento}
              onChange={(e) =>
                setMeioPagamento(Number(e.target.value) as MeioPagamento)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value={MeioPagamento.CartaoCredito}>Cartão Crédito</option>
              <option value={MeioPagamento.CartaoDebito}>Cartão Débito</option>
              <option value={MeioPagamento.Pix}>Pix</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={salvando}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando</>
            ) : (
              <><Save size={18} /> Salvar</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
