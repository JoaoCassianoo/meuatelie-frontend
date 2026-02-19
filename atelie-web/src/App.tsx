import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import Inicial from './pages/inicial'
import Financeiro from './pages/financeiro'
import Estoque from './pages/estoque'
import TodoList from './pages/todo'
import Vendas from './pages/vendas'
import Encomendas from './pages/encomendas'
import PecasProntas from './pages/pecasProntas'
import Login from './pages/login'
import { useAuth } from './context/AuthContext'
import Perfil from './pages/perfil'
import { cache } from './api/cache.api'

export default function App() {
  const { session, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('inicial')
  let status = true;
  if(cache.atelie.status == 'ativo' || cache.atelie.status == 'cancelado')
  {
    status = false;
  }
  let dataExpiração = new Date(cache.atelie.dataVencimento).toLocaleDateString('pt-BR');

  if (loading) return <div>Carregando...</div>
  
  if (!session) return <Login />

  const renderPage = () => {
    switch (currentPage) {
      case 'inicial':
        return <Inicial setActivePage={setCurrentPage} />
      case 'financeiro':
        return <Financeiro />
      case 'estoque':
        return <Estoque />
      case 'todo':
        return <TodoList />
      case 'vendas':
        return <Vendas />
      case 'encomendas':
        return <Encomendas />
      case 'pecasProntas':
        return <PecasProntas />
      case 'perfil':
        return <Perfil email={session.user.email}/>
      default:
        return <Inicial />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        {renderPage()}
        {status && (
          <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white text-center py-3 font-semibold z-50 shadow-lg">
            ⚠️ Seu plano expirou em {dataExpiração}. Renove a assinatura para voltar a editar seus dados.
          </div>
        )}

      </main>
    </div>
  )
}
