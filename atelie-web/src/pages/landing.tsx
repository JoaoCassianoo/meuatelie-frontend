import { Scissors, BarChart3, Package, Truck, CheckSquare, ShoppingCart, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const goToLogin = () => {
    window.location.hash = 'login';
    window.location.reload(); // Forçar recarregamento para resetar estado
  };

  const features = [
    { icon: BarChart3,   title: 'Controle Financeiro',   desc: 'Entradas, saídas e saldo em tempo real. Separe finanças pessoais da loja.' },
    { icon: Package,     title: 'Gestão de Estoque',      desc: 'Nunca mais fique sem material. Controle quantidades e receba alertas.' },
    { icon: Truck,       title: 'Encomendas',             desc: 'Registre pedidos com cliente, prazo e valor. Do recebimento à entrega.' },
    { icon: ShoppingCart,title: 'Vendas',                 desc: 'Registre vendas e saiba quais produtos estão vendendo mais.' },
    { icon: CheckSquare, title: 'To-do List',             desc: 'Organize tarefas, lembretes e pendências em listas simples.' },
    { icon: Sparkles,    title: 'Peças Prontas',          desc: 'Acompanhe cada peça da produção até ficar pronta para venda.' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Scissors size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg">Meu Ateliê</span>
          </div>
          <div className="hidden md:flex gap-7 text-sm font-medium text-blue-100/70">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-white transition-colors">Preços</a>
          </div>
          <button onClick={goToLogin} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95">
            Entrar
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(59,130,246,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(37,99,235,0.25) 0%, transparent 60%), linear-gradient(165deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)' }}
      >
        <div className="absolute top-1/3 right-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-blue-200 mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" /></span>
            Sistema completo para micro empreendedoras
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6">
            Pare de perder pedidos.<br/>
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Profissionalize seu ateliê.
            </span>
          </h1>

          <p className="text-blue-100/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Controle financeiro, estoque, encomendas e produção em um único sistema.
            Feito para quem trabalha com amor — e quer resultados reais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#precos" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 text-base w-full sm:w-auto text-center">
              Começar por R$40/mês →
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="text-center"><p className="text-2xl font-bold">100%</p><p className="text-xs text-blue-200/50 mt-1">Online</p></div>
            <div className="text-center border-x border-white/10"><p className="text-2xl font-bold">6+</p><p className="text-xs text-blue-200/50 mt-1">Módulos</p></div>
            <div className="text-center"><p className="text-2xl font-bold">R$40</p><p className="text-xs text-blue-200/50 mt-1">Por mês</p></div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 bg-gray-950 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl md:text-5xl font-bold">Tudo que você precisa,<br/><span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>em um só lugar</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.04] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preços ── */}
      <section id="precos" className="py-28 bg-[#0a1628] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-4xl md:text-5xl font-bold">Preço justo, sem surpresas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:-translate-y-1 transition-all">
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-4">Mensal</p>
              <div className="mb-5"><span className="text-5xl font-extrabold">R$40</span><span className="text-gray-400 text-sm">/mês</span></div>
              <p className="text-gray-500 text-sm mb-7">Cancele quando quiser.</p>
              <a href="#" className="block text-center border border-blue-500/30 hover:bg-blue-500/10 py-3 rounded-xl font-semibold text-sm transition-all">Assinar</a>
            </div>

            <div className="rounded-2xl p-8 relative" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 24px 64px rgba(37,99,235,0.45)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">⭐ MAIS VANTAJOSO</div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-4">Anual</p>
              <div className="mb-1"><span className="text-5xl font-extrabold">R$360</span><span className="text-blue-200 text-sm">/ano</span></div>
              <p className="text-blue-200/70 text-sm mb-1">R$30/mês — <span className="text-white font-semibold">economize R$120</span></p>
              <p className="text-blue-200/50 text-xs mb-7">Equivale a 3 meses grátis</p>
              <a href="#" className="block text-center bg-white text-blue-700 hover:bg-blue-50 py-3 rounded-xl font-bold text-sm transition-all shadow-lg">Garantir desconto →</a>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:-translate-y-1 transition-all">
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-4">Trimestral</p>
              <div className="mb-5"><span className="text-5xl font-extrabold">R$108</span><span className="text-gray-400 text-sm">/trimestre</span></div>
              <p className="text-gray-500 text-sm mb-7">R$36/mês.</p>
              <a href="#" className="block text-center border border-blue-500/30 hover:bg-blue-500/10 py-3 rounded-xl font-semibold text-sm transition-all">Assinar</a>
            </div>
          </div>

          <p className="text-center text-gray-600 text-xs mt-8">🔒 Pagamento seguro &nbsp;·&nbsp;  Dados protegidos</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center px-4" style={{ background: 'linear-gradient(165deg, #1d4ed8 0%, #2563eb 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Pronta para transformar<br/>seu ateliê?</h2>
          <p className="text-blue-100/60 mb-10 text-lg">Comece agora e organize seu negócio de verdade.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#precos" className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-blue-50 transition-all active:scale-95 text-base">Começar agora →</a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 border-t border-white/5 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"><Scissors size={12} className="text-white" /></div>
          <span className="font-bold text-sm">Meu Ateliê</span>
        </div>
        <p className="text-gray-600 text-xs">© 2026 Meu Ateliê — Todos os direitos reservados</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <button onClick={goToLogin} className="text-blue-500 hover:underline">Já tenho conta — Entrar</button>
        </div>
      </footer>
    </div>
  );
}
