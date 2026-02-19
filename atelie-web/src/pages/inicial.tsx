import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { BarChart3, Package, CheckSquare, ShoppingCart, Truck, TrendingUp, TrendingDown, Eye, EyeOff, User, Sparkles } from 'lucide-react';
import { cache, carregarCacheDoLocalStorage, carregarResumo, verReceita } from '../api/cache.api';

const modules = [
  { id: 'financeiro',   label: 'Financeiro',    icon: BarChart3,    color: 'from-blue-500 to-blue-600',     desc: 'Entradas e saídas' },
  { id: 'estoque',      label: 'Estoque',        icon: Package,      color: 'from-emerald-500 to-emerald-600', desc: 'Controle de materiais' },
  { id: 'todo',         label: 'To-do List',     icon: CheckSquare,  color: 'from-violet-500 to-violet-600', desc: 'Tarefas e lembretes' },
  { id: 'vendas',       label: 'Vendas',         icon: ShoppingCart, color: 'from-orange-500 to-orange-600', desc: 'Registro de vendas' },
  { id: 'encomendas',   label: 'Encomendas',     icon: Truck,        color: 'from-red-500 to-rose-600',     desc: 'Pedidos e entregas' },
  { id: 'pecasProntas', label: 'Peças Prontas',  icon: Sparkles,     color: 'from-pink-500 to-pink-600',    desc: 'Produção finalizada' },
  { id: 'perfil',       label: 'Perfil',         icon: User,         color: 'from-slate-500 to-slate-600',  desc: 'Dados do Ateliê' },
];

export default function Inicial({ setActivePage }: { setActivePage?: (page: string) => void }) {
  const [resumoAnual, setResumoAnual]   = useState<any>(null);
  const [resumoMensal, setResumoMensal] = useState<any>(null);
  const [mostrarValores, setMostrarValores] = useState(false);
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  useEffect(() => {
    async function init() {
      carregarCacheDoLocalStorage();
      if (!cache.resumo.mensal || !cache.resumo.anual) await carregarResumo(anoAtual, mesAtual);
      setResumoMensal(cache.resumo.mensal);
      setResumoAnual(cache.resumo.anual);
      setMostrarValores(cache.mostrarValor);
    }
    init();
  }, []);

  async function toggleValores() {
    const v = !mostrarValores;
    setMostrarValores(v);
    await verReceita(v);
  }

  function fmt(val: number) {
    if (!mostrarValores) return '••• ••';
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  }

  const saldoAnual  = (resumoAnual?.totalEntradas  || 0) + (resumoAnual?.totalSaidas  || 0);
  const saldoMensal = (resumoMensal?.totalEntradas || 0) + (resumoMensal?.totalSaidas || 0);

  const stats = [
    { label: 'Saldo Anual',     valor: saldoAnual,                              trend: true,  color: 'from-violet-50 to-violet-100 border-violet-200' },
    { label: 'Entradas (mês)',  valor: resumoMensal?.totalEntradas || 0,        trend: null,  color: 'from-emerald-50 to-emerald-100 border-emerald-200' },
    { label: 'Saídas (mês)',    valor: Math.abs(resumoMensal?.totalSaidas || 0), trend: null, color: 'from-red-50 to-red-100 border-red-200' },
    { label: 'Saldo Mensal',    valor: saldoMensal,                             trend: true,  color: 'from-blue-50 to-blue-100 border-blue-200' },
  ];

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Visão Geral" subtitle={`Bem-vinda de volta! ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`} />
        <button onClick={toggleValores}
          className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all
            ${mostrarValores
              ? 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50'
              : 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'}`}>
          {mostrarValores ? <EyeOff size={14}/> : <Eye size={14}/>}
          {mostrarValores ? 'Ocultar' : 'Ver valores'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border bg-gradient-to-br ${s.color}`}>
            <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
            {s.trend !== null ? (
              <div className="flex items-center justify-between">
                <p className={`text-base md:text-lg font-bold ${s.valor >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmt(s.valor)}
                </p>
                {s.valor >= 0
                  ? <TrendingUp size={18} className="text-emerald-500 flex-shrink-0"/>
                  : <TrendingDown size={18} className="text-red-500 flex-shrink-0"/>}
              </div>
            ) : (
              <p className={`text-base md:text-lg font-bold ${i === 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                {fmt(s.valor)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="mb-2">
        <h2 className="text-base font-bold text-gray-800 mb-4">Módulos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button key={mod.id}
                onClick={() => setActivePage?.(mod.id)}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-center
                  hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5
                  transition-all duration-200 group text-left">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color}
                  flex items-center justify-center mb-3 shadow-sm
                  group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className="text-white"/>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{mod.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{mod.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
