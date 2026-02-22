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
import Signup from './pages/signup'
import Upgrade from './pages/upgrade'
import LandingPage from './pages/landing'
import { useAuth } from './context/AuthContext'
import Perfil from './pages/perfil'
import { cache } from './api/cache.api'
import { LoadingScreen } from './components/LoadingScreen'

const VALID_PAGES = ['inicial','financeiro','estoque','pecasProntas','todo','vendas','encomendas','perfil','venda-rapida','upgrade'];

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

  // Verificar se está tentando ir para login ou signup (sem estar autenticado)
  const hash = window.location.hash.replace('#', '');
  const showLogin = hash === 'login';
  const showSignup = hash === 'signup';

  if (loading) return <LoadingScreen />;
  if (!session) {
    if (showSignup) return <Signup />;
    if (showLogin) return <Login />;
    return <LandingPage />;
  }

  // Verificar se usuário está no plano free e tentando acessar landing
const isFreePlan = cache.atelie?.plano === 'free';
if (isFreePlan) return <Upgrade />;

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
      case 'upgrade':      return <Upgrade />;
      default:             return <Inicial setActivePage={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar activePage={currentPage} onNavigate={navigateTo} />
      <main className="flex-1 min-h-screen overflow-x-hidden pb-4">
        {renderPage()}
      </main>
    </div>
  );
}
