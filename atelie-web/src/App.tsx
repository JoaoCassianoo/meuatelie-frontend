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
  const [showNotification, setShowNotification] = useState(true);

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

  // Calcular se o plano vence em 3 dias ou menos
  let planExpiringSoon = false;
  let daysUntilExpiration = 0;
  try {
    const dataVencimento = cache.atelie?.dataVencimento;
    console.log('Data de vencimento do plano:', dataVencimento);
    if (dataVencimento) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vencimento = new Date(dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      const diffTime = vencimento.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysUntilExpiration = diffDays;
      planExpiringSoon = diffDays > 0 && diffDays <= 3;
    }
  } catch {}

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

      {/* Aviso de plano vencendo em 3 dias */}
      {planExpiringSoon && showNotification && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-2xl relative">
            <button onClick={() => setShowNotification(false)}
              className="absolute top-3 right-3 p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-900 text-sm">Seu plano vence em {daysUntilExpiration} {daysUntilExpiration === 1 ? 'dia' : 'dias'}</h3>
                <p className="text-xs text-amber-700 mt-0.5">Renove sua assinatura para continuar usando todos os recursos.</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigateTo('upgrade')}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95">
                    Renovar agora
                  </button>
                  <button onClick={() => navigateTo('perfil')}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-all">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
