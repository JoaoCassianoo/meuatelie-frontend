export const CategoriaMaterial = {
  Peca: 1,
  Ferragem: 2,
  Pintura: 3,
  Papelaria: 4,
  Tesoura: 5,
  Outro: 6,
} as const;

export type CategoriaMaterial = typeof CategoriaMaterial[keyof typeof CategoriaMaterial];

export const StatusMaterial = {
  EmEstoque: 1,
  Vendida: 2,
  Reservada: 3,
  Descartada: 4,
} as const;

export type StatusMaterial = typeof StatusMaterial[keyof typeof StatusMaterial];

export const TipoMovimentacao = {
  Entrada: 1,
  Saida: 2,
} as const;

export type TipoMovimentacao = typeof TipoMovimentacao[keyof typeof TipoMovimentacao];

export interface resumoEstoque {
  quantidadeTotalPecas: number;
  valorTotalEstoque: number;
}