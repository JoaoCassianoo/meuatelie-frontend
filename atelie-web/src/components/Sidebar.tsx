import { useState } from 'react';
import { Menu, X, BarChart3, Package, CheckSquare, ShoppingCart, Truck, Sparkles } from 'lucide-react';

type Props = {
  activePage: string;
  onNavigate: (page: string) => void;
};

export function Sidebar({ activePage, onNavigate }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'inicial', label: 'Dashboard', icon: BarChart3 },
    { id: 'financeiro', label: 'Financeiro', icon: BarChart3 },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'pecasProntas', label: 'Peças Prontas', icon: Sparkles },
    { id: 'todo', label: 'To-do List', icon: CheckSquare },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'encomendas', label: 'Encomendas', icon: Truck },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {isOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg transform transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Ateliê</h1>
          <p className="text-gray-400 text-sm">Gestão Completa</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full px-6 py-3 flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-blue-600 border-l-4 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">© 2026 Ateliê</p>
        </div>
      </aside>

      {/* Main content spacing */}
      <div className="lg:ml-64" />
    </>
  );
}
