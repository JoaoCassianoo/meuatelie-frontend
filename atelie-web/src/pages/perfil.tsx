import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  LogOut,
  User,
  Store,
  Calendar,
  CheckCircle,
  Crown,
  MailCheck,
  Pencil
} from "lucide-react";
import { supabase } from "../api/supabase";
import { cache, carregarAtelie, limparCache } from "../api/cache.api";
import { atualizarDadosAtelie, type Atelie } from "../api/atelie.api";

export default function Perfil( email: any ) {
  const [user, setUser] = useState<Atelie | null>(null);
  const [loading, setLoading] = useState(true);

  const [editandoAtelie, setEditandoAtelie] = useState(false);
  const [editandoDono, setEditandoDono] = useState(false);

  const [novoNomeAtelie, setNovoNomeAtelie] = useState("");
  const [novoNomeDono, setNovoNomeDono] = useState("");

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      await carregarAtelie();
      const atelie = cache.atelie;
      setUser(atelie);

      if (atelie) {
        setNovoNomeAtelie(atelie.nomeAtelie);
        setNovoNomeDono(atelie.nomeDono);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    limparCache();
    window.location.href = "/login";
  }

  function formatarData(data?: string | Date) {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  async function salvarAlteracoes() {
    if (!user) return;

    const atualizado = {
      ...user,
      nomeAtelie: novoNomeAtelie,
      nomeDono: novoNomeDono,
    };

    setEditandoAtelie(false);
    setEditandoDono(false);

    try{
      await atualizarDadosAtelie(atualizado);
      setUser(atualizado);
    }catch (error: any) {
      console.error('Erro ao editar perfil:', error);

      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao editar perfil';

      alert(mensagem);
    }
  }

  function cancelarEdicao() {
    if (!user) return;

    setNovoNomeAtelie(user.nomeAtelie);
    setNovoNomeDono(user.nomeDono);

    setEditandoAtelie(false);
    setEditandoDono(false);
  }

  if (loading) return <p className="p-6 text-gray-500">Carregando...</p>;

  return (
    <div className="p-6 lg:p-8 flex flex-col items-center">
      <PageHeader title="Perfil" />

      <div className="max-w-xl space-y-6 w-[300px] md:w-[500px]">

        {/* Card infos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">

          {/* Ateliê */}
          <div className="flex items-start gap-3">
            <Store size={20} className="text-blue-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Ateliê</p>
              <div className="flex items-center gap-2">
                {editandoAtelie ? (
                  <input
                    value={novoNomeAtelie}
                    onChange={(e) => setNovoNomeAtelie(e.target.value)}
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  <p className="font-semibold">{user?.nomeAtelie}</p>
                )}
                <button onClick={() => setEditandoAtelie(!editandoAtelie)}>
                  <Pencil size={14} className="text-gray-400 hover:text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div className="flex items-start gap-3">
            <User size={20} className="text-blue-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Nome</p>
              <div className="flex items-center gap-2">
                {editandoDono ? (
                  <input
                    value={novoNomeDono}
                    onChange={(e) => setNovoNomeDono(e.target.value)}
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                ) : (
                  <p className="font-semibold">{user?.nomeDono}</p>
                )}
                <button onClick={() => setEditandoDono(!editandoDono)}>
                  <Pencil size={14} className="text-gray-400 hover:text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <MailCheck size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{email.email}</p>
            </div>
          </div>

          {/* Plano */}
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Plano Atual</p>
              <p className="font-semibold">{user?.plano}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Status Assinatura</p>
              <p className="font-semibold">{user?.status}</p>
            </div>
          </div>

          {/* Vencimento */}
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Data de Vencimento</p>
              <p className="font-semibold">{formatarData(user?.dataVencimento)}</p>
            </div>
          </div>
        </div>

        {/* Botões de salvar/cancelar */}
        {(editandoAtelie || editandoDono) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
            <button
              onClick={salvarAlteracoes}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition"
            >
              Salvar alterações
            </button>

            <button
              onClick={cancelarEdicao}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-xl transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>

      </div>
    </div>
  );
}
