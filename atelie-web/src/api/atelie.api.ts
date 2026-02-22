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

export async function registrarAtelie(email: string, senha: string, nome: string, atelieNome: string, telefone: string, cpfCnpj: string) {
  const response = await api.post('/Atelie/registrar', {
    email,
    senha,
    nome,
    atelieNome,
    telefone,
    cpfCnpj
  });
  return response.data;
}

export async function iniciarAssinatura(periodicidade: 'mensal' | 'trimestral' | 'anual') {
  const response = await api.post('/assinatura/iniciar', { periodicidade });
  return response.data;
}