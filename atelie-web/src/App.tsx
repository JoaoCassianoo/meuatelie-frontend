import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import Inicial from './pages/inicial';
import Financeiro from './pages/financeiro';
import Estoque from './pages/estoque';
import TodoList from './pages/todo';
import Vendas from './pages/vendas';
import Encomendas from './pages/encomendas';
import PecasProntas from './pages/pecasProntas';

export default function App() {
  const [currentPage, setCurrentPage] = useState('inicial');

  const renderPage = () => {
    switch (currentPage) {
      case 'inicial':
        return <Inicial setActivePage={setCurrentPage} />;
      case 'financeiro':
        return <Financeiro />;
      case 'estoque':
        return <Estoque />;
      case 'todo':
        return <TodoList />;
      case 'vendas':
        return <Vendas />;
      case 'encomendas':
        return <Encomendas />;
      case 'pecasProntas':
        return <PecasProntas />;
      default:
        return <Inicial />;
    }
  };

  return (
    <div className="flex">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
