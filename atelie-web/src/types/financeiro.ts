export interface ResumoAnual {
  totalEntradas: number;
  totalSaidas: number;
  totalEntradasLoja: number;
  totalSaidasLoja: number;
  totalLoja: number;
  totalEntradasPessoal: number;
  totalSaidasPessoal: number;   
  totalPessoal: number;
  totalDebito: number;
  totalCredito: number;
}

export const ContextoFinanceiro = {
  Loja: 1,
  Pessoal: 2,
} as const;

export type ContextoFinanceiro =
  (typeof ContextoFinanceiro)[keyof typeof ContextoFinanceiro];


export const MeioPagamento = {
  CartaoCredito: 1,
  CartaoDebito: 2,
  Pix: 3,
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
