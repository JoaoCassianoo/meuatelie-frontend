import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import Inicial from './pages/inicial'
import Financeiro from './pages/financeiro'
import Estoque from './pages/estoque'
import TodoList from './pages/todo'
import Vendas from './pages/vendas'
import Encomendas from './pages/encomendas'
import PecasProntas from './pages/pecasProntas'
import Login from './pages/login'
import LandingPage from './pages/landing'
import { useAuth } from './context/AuthContext'
import Perfil from './pages/perfil'
import { cache } from './api/cache.api'
import { LoadingScreen } from './components/LoadingScreen'

const VALID_PAGES = ['inicial','financeiro','estoque','pecasProntas','todo','vendas','encomendas','perfil','venda-rapida'];

function getPageFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  return VALID_PAGES.includes(hash) ? hash : 'inicial';
}

export default function App() {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  useEffect(() => {
    const handlePop = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#inicial');
    }
  }, []);

  const navigateTo = (page: string) => {
    if (page !== currentPage) {
      window.history.pushState(null, '', `#${page}`);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Verificar se está tentando ir para login (sem estar autenticado)
  const hash = window.location.hash.replace('#', '');
  const showLogin = hash === 'login';

  let statusExpirado = false;
  let dataExpiracao = '';
  try {
    const s = cache.atelie.status;
    statusExpirado = !!s && s !== 'ativo' && s !== 'cancelado';
    dataExpiracao = new Date(cache.atelie.dataVencimento).toLocaleDateString('pt-BR');
  } catch {}

  if (loading) return <LoadingScreen />;
  if (!session) {
    if (showLogin) return <Login />;
    return <LandingPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'inicial':      return <Inicial setActivePage={navigateTo} />;
      case 'financeiro':   return <Financeiro />;
      case 'estoque':      return <Estoque />;
      case 'todo':         return <TodoList />;
      case 'vendas':       return <Vendas />;
      case 'encomendas':   return <Encomendas />;
      case 'pecasProntas': return <PecasProntas />;
      case 'perfil':       return <Perfil email={session.user.email} />;
      default:             return <Inicial setActivePage={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar activePage={currentPage} onNavigate={navigateTo} />
      <main className="flex-1 min-h-screen overflow-x-hidden pb-4">
        {renderPage()}
      </main>
      {statusExpirado && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium shadow-2xl">
            <span>⚠️ Seu plano expirou em {dataExpiracao}.</span>
            <a href="/planos" className="bg-white text-red-600 font-bold px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-xs">
              Renovar assinatura →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
