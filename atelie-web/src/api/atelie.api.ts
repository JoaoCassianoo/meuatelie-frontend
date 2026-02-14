import { api } from './http';

export interface Atelie {
  nomeAtelie: string;
  nomeDono: string;
  plano: string;
  status: string;
  dataVencimento: string;
}

export async function obterDadosAtelie() {
  const response = await api.get('/Atelie');
  return response.data;
}

export async function atualizarDadosAtelie(dados: Partial<Atelie>) {
  const response = await api.put('/Atelie', dados);
  return response.data;
}

export async function assinaturaAtiva() {
    const response = await api.get('/Atelie/assinatura-ativa');
    return response.data;
}