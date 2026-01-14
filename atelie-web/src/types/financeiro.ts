export interface ResumoAnual {
  totalEntradas: number;
  totalSaidas: number;
  totalLoja: number;
  totalPessoal: number;
  totalDebito: number;
  totalCredito: number;
}

export const ContextoFinanceiro = {
  Pessoal: 1,
  Loja: 2,
} as const;

export type ContextoFinanceiro =
  (typeof ContextoFinanceiro)[keyof typeof ContextoFinanceiro];


export const MeioPagamento = {
  CartaoDebito: 1,
  CartaoCredito: 2
} as const;

export type MeioPagamento =
  (typeof MeioPagamento)[keyof typeof MeioPagamento];


export interface MovimentacaoFinanceira {
  id?: number;
  data: string;
  descricao: string;
  valor: number;
  contexto: ContextoFinanceiro;
  meioPagamento: MeioPagamento;
}
