import { type Material, obterTodosMateriais, obterResumo } from './materiais.api';
import { obterVendas, type Venda } from './vendas.api';
import { obterTodasPecasProntas, type PecaPronta } from './pecasProntas.api';
import { obterEncomendas, type Encomenda } from './encomendas.api';
import { obterResumoAnual, obterResumoMensal } from './financeiro.api';
import { obterTodasListas } from './todo.api';
import { obterMovimentacoes, type MovimentacaoEstoque } from './estoque.api';
import { obterDadosAtelie, type Atelie } from './atelie.api';

interface MateriaisInterface {
  materiais: Material[];
  valor: number;
  quantidade: number;
}

interface CacheState {
  atelie: Atelie;
  material: MateriaisInterface;
  resumo: { mensal?: any; anual?: any };
  pecasProntas: PecaPronta[];
  vendas: Venda[];
  encomendas: Encomenda[];
  listas: any[];
  movimentacoes: MovimentacaoEstoque[];
  mostrarValor: boolean;
}

// Cache em memória
export const cache: CacheState = {
  atelie: {nomeAtelie: '', nomeDono: '', plano: '', status: '', dataVencimento: ''} ,
  material: { materiais: [], valor: 0, quantidade: 0 },
  resumo: {},
  pecasProntas: [],
  vendas: [],
  encomendas: [],
  listas: [],
  movimentacoes: [],
  mostrarValor: false
};

// --- Funções de persistência ---
export function salvarCacheNoLocalStorage() {
  try {
    localStorage.setItem('appCache', JSON.stringify(cache));
  } catch (err) {
    console.error('Erro ao salvar cache no localStorage:', err);
  }
}

export function carregarCacheDoLocalStorage() {
  try {
    const data = localStorage.getItem('appCache');
    if (data) {
      const parsed = JSON.parse(data);
      Object.assign(cache, parsed); // atualiza o cache em memória
    }
  } catch (err) {
    console.error('Erro ao carregar cache do localStorage:', err);
  }
}

// --- Função para carregar tudo do backend e atualizar o cache ---
export async function carregarCache() {
  try {
    const [
      atelie,
      mats,
      resumoData,
      pecas,
      vendasData,
      encomendasData,
      resumoMensal,
      resumoAnual,
      listasData,
      movimentacoesData,
    ] = await Promise.all([
      obterDadosAtelie(),
      obterTodosMateriais(),
      obterResumo(),
      obterTodasPecasProntas(),
      obterVendas(),
      obterEncomendas(),
      obterResumoMensal(new Date().getFullYear(), new Date().getMonth() + 1),
      obterResumoAnual(new Date().getFullYear()),
      obterTodasListas(),
      obterMovimentacoes(),
    ]);

    cache.material = {
      materiais: mats || [],
      valor: resumoData?.valorTotalEstoque || 0,
      quantidade: resumoData?.quantidadeTotalPecas || 0,
    };
    cache.resumo = { mensal: resumoMensal || {}, anual: resumoAnual || {} };
    cache.pecasProntas = pecas || [];
    cache.vendas = vendasData || [];
    cache.encomendas = encomendasData || [];
    cache.listas = listasData || [];
    cache.movimentacoes = movimentacoesData || [];
    cache.atelie = atelie || {};

    salvarCacheNoLocalStorage();
  } catch (err) {
    console.error('Erro ao carregar cache do backend:', err);
  }
}

export async function carregarAtelie() {
  cache.atelie = await obterDadosAtelie();
  salvarCacheNoLocalStorage();
}

export async function verReceita(valor: boolean) {
  cache.mostrarValor = valor;
  salvarCacheNoLocalStorage();
}

// --- Funções específicas para atualizar partes do cache e persistir ---
export async function carregarMateriais() {
  const mats = await obterTodosMateriais();
  const resumoData = await obterResumo();
  cache.material.materiais = mats || [];
  cache.material.valor = resumoData?.valorTotalEstoque || 0;
  cache.material.quantidade = resumoData?.quantidadeTotalPecas || 0;
  salvarCacheNoLocalStorage();
}


export async function adicionarMaterialCache(material: Material) {
  cache.material.materiais.push(material);
  salvarCacheNoLocalStorage();
}

export async function carregarMovimentacoes() {
  cache.movimentacoes = await obterMovimentacoes() || [];
  salvarCacheNoLocalStorage();
}

export async function carregarResumo(ano?: number, mes?: number) {
  const resumoMensal = await obterResumoMensal(ano || new Date().getFullYear(), mes || new Date().getMonth() + 1);
  const resumoAnual = await obterResumoAnual(ano || new Date().getFullYear());
  cache.resumo = { mensal: resumoMensal || {}, anual: resumoAnual || {} };
  salvarCacheNoLocalStorage();
}

export async function carregarPecasProntas() {
  cache.pecasProntas = await obterTodasPecasProntas() || [];
  salvarCacheNoLocalStorage();
}

export async function carregarVendas() {
  cache.vendas = await obterVendas() || [];
  salvarCacheNoLocalStorage();
}

export async function carregarEncomendas() {
  cache.encomendas = await obterEncomendas() || [];
  salvarCacheNoLocalStorage();
}

export async function adicionarEncomenda(encomenda: Encomenda) {
  cache.encomendas.push(encomenda);
  salvarCacheNoLocalStorage();
}

export async function carregarListas() {
  cache.listas = await obterTodasListas() || [];
  salvarCacheNoLocalStorage();
}

export function limparCache() {
  localStorage.clear();
}

