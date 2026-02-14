import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { LogOut, User, Store, Mail, Trash2, Plane, LucideKey, Calendar, CheckCircle, Crown, MailCheck } from "lucide-react";
import { supabase } from "../api/supabase"; // ajuste se seu caminho for outro
import { cache, carregarAtelie, limparCache } from "../api/cache.api"; // vamos limpar o cache no logout
import type { Atelie } from "../api/atelie.api";

export default function Perfil(email: any) {
  const [user, setUser] = useState<Atelie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    carregarAtelie();
    setUser(cache.atelie);
    setLoading(false);
  }, []);

  async function logout() { 
    await supabase.auth.signOut();
    limparCache();
    window.location.href = "/login";
  }

  function formatarData(data?: string | Date) {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR');
  }


  async function deletarConta() {
    const ok = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.");
    if (!ok) return;

    // aqui depois você cria endpoint no back pra deletar tudo
    alert("Implementar depois no backend 😉");
  }

  if (loading) return <p className="p-6 text-gray-500">Carregando...</p>;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Perfil" />

      <div className="max-w-xl space-y-6">

        {/* Card infos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Store size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Ateliê</p>
              <p className="font-semibold">{user?.nomeAtelie}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-semibold">{user?.nomeDono}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MailCheck size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{email.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Crown size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Plano Atual</p>
              <p className="font-semibold">{user?.plano}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Status Assinatura</p>
              <p className="font-semibold">{user?.status}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Data de Vencimento</p>
              <p className="font-semibold">{formatarData(user?.dataVencimento)}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Sair da conta
          </button>

          <button
            onClick={deletarConta}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold py-3 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
            Excluir conta
          </button>
        </div>
      </div>
    </div>
    );
}
