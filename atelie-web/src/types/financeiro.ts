export interface ResumoAnual {
  totalEntradas: number;
  totalSaidas: number;
  totalLoja: number;
  totalPessoal: number;
  totalDebito: number;
  totalCredito: number;
}

export interface MovimentacaoFinanceira {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  contexto: 'Loja' | 'Pessoal';
  meioPagamento: 'CartaoDebito' | 'CartaoCredito';
}
