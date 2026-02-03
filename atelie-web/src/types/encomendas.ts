export const StatusEncomenda = {
  Pendente: 1,
  EmProducao: 2,
  Finalizada: 3,
  Cancelada: 4,
} as const;

export type StatusEncomenda = typeof StatusEncomenda[keyof typeof StatusEncomenda];
