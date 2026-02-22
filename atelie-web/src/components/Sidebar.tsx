import { useState } from 'react';
import { Menu, X, BarChart3, Package, CheckSquare, ShoppingCart, Truck, Sparkles, HouseIcon, User, Zap } from 'lucide-react';
import { cache } from '../api/cache.api';

type Props = {
  activePage: string;
  onNavigate: (page: string) => void;
};

export function Sidebar({ activePage, onNavigate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isFreePlan = cache.atelie?.plano === 'free';

  const menuItems = [
    { id: 'inicial',      label: 'Visão Geral',   icon: HouseIcon },
    { id: 'financeiro',   label: 'Financeiro',     icon: BarChart3 },
    { id: 'estoque',      label: 'Estoque',        icon: Package },
    { id: 'pecasProntas', label: 'Peças Prontas',  icon: Sparkles },
    { id: 'todo',         label: 'To-do List',     icon: CheckSquare },
    { id: 'vendas',       label: 'Vendas',         icon: ShoppingCart },
    { id: 'encomendas',   label: 'Encomendas',     icon: Truck },
    { id: 'perfil',       label: 'Perfil',         icon: User },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-50 lg:hidden flex items-center h-14 bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg px-2 gap-2">
        <button onClick={() => setIsOpen(true)} className="p-2 text-white rounded-xl hover:bg-white/10 transition-colors">
          <Menu size={22} />
        </button>
        <span className="text-white font-bold text-lg tracking-tight">Meu Ateliê</span>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 z-50 flex flex-col
        bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500
        text-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        lg:sticky lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Meu Ateliê</h1>
            <p className="text-blue-100/60 text-xs mt-0.5">Gestão Completa</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                className={`
                  w-full px-5 py-3 flex items-center gap-3 text-sm font-medium transition-all relative
                  ${active ? 'bg-white/15 text-white' : 'text-blue-100/75 hover:bg-white/10 hover:text-white'}
                `}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-blue-100/30 text-center">Reporte bugs ou dê sugestões de melhorias: joaobrito.cassiano@gmail.com</p>
          <p className="text-xs text-blue-100/30 text-center">© 2026 Meu Ateliê</p>
        </div>
      </aside>
    </>
  );
}
