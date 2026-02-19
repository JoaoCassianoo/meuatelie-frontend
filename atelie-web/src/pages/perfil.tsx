import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { LogOut, User, Store, Calendar, CheckCircle, Crown, MailCheck, Pencil, X, Check } from "lucide-react";
import { supabase } from "../api/supabase";
import { cache, carregarAtelie, limparCache } from "../api/cache.api";
import { atualizarDadosAtelie, type Atelie } from "../api/atelie.api";

const REATIVACAO_URL = "https://seusite.com.br/planos";

export default function Perfil({ email }: { email: any }) {
  const [user, setUser]             = useState<Atelie | null>(null);
  const [loading, setLoading]       = useState(true);
  const [editandoAtelie, setEditandoAtelie] = useState(false);
  const [editandoDono, setEditandoDono]     = useState(false);
  const [novoNomeAtelie, setNovoNomeAtelie] = useState("");
  const [novoNomeDono, setNovoNomeDono]     = useState("");
  const [salvando, setSalvando]     = useState(false);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      await carregarAtelie();
      const a = cache.atelie;
      setUser(a);
      if (a) { setNovoNomeAtelie(a.nomeAtelie); setNovoNomeDono(a.nomeDono); }
      setLoading(false);
    }
    carregar();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    limparCache();
    window.location.href = "/";
  }

  function fmt(data?: string | Date) {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  async function salvar() {
    if (!user) return;
    setSalvando(true);
    const atualizado = { ...user, nomeAtelie: novoNomeAtelie, nomeDono: novoNomeDono };
    try {
      await atualizarDadosAtelie(atualizado);
      setUser(atualizado);
      setEditandoAtelie(false);
      setEditandoDono(false);
    } catch (error: any) {
      alert(error?.response?.data?.erro || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    if (!user) return;
    setNovoNomeAtelie(user.nomeAtelie);
    setNovoNomeDono(user.nomeDono);
    setEditandoAtelie(false);
    setEditandoDono(false);
  }

  const editando = editandoAtelie || editandoDono;

  if (loading) return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-blue-100" /><div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>
      <p className="text-sm text-gray-400">Carregando...</p>
    </div>
  );

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <PageHeader title="Perfil" subtitle="Dados do seu ateliê e conta"/>

      {/* Avatar / brand area */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
          <Store size={28} className="text-white"/>
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-tight">{user?.nomeAtelie || '—'}</p>
          <p className="text-blue-100/70 text-sm">{user?.nomeDono}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-xs text-white font-medium">
            <CheckCircle size={10}/> {user?.status || '—'}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 mb-5">

        {/* Ateliê */}
        <div className="flex items-start gap-3 p-5">
          <Store size={18} className="text-blue-500 mt-0.5 flex-shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ateliê</p>
            {editandoAtelie ? (
              <input value={novoNomeAtelie} onChange={(e) => setNovoNomeAtelie(e.target.value)}
                className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
            ) : (
              <p className="font-semibold text-gray-900">{user?.nomeAtelie}</p>
            )}
          </div>
          <button onClick={() => setEditandoAtelie(!editandoAtelie)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Pencil size={14}/>
          </button>
        </div>

        {/* Nome */}
        <div className="flex items-start gap-3 p-5">
          <User size={18} className="text-blue-500 mt-0.5 flex-shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Responsável</p>
            {editandoDono ? (
              <input value={novoNomeDono} onChange={(e) => setNovoNomeDono(e.target.value)}
                className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
            ) : (
              <p className="font-semibold text-gray-900">{user?.nomeDono}</p>
            )}
          </div>
          <button onClick={() => setEditandoDono(!editandoDono)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Pencil size={14}/>
          </button>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 p-5">
          <MailCheck size={18} className="text-blue-500 flex-shrink-0"/>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="font-semibold text-gray-900 text-sm truncate">{email}</p>
          </div>
        </div>

        {/* Plano */}
        <div className="flex items-center gap-3 p-5">
          <Crown size={18} className="text-blue-500 flex-shrink-0"/>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Plano</p>
            <p className="font-semibold text-gray-900">{user?.plano || '—'}</p>
          </div>
        </div>

        {/* Vencimento */}
        <div className="flex items-center gap-3 p-5">
          <Calendar size={18} className="text-blue-500 flex-shrink-0"/>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vencimento</p>
            <p className="font-semibold text-gray-900">{fmt(user?.dataVencimento)}</p>
          </div>
        </div>
      </div>

      {/* Save / cancel */}
      {editando && (
        <div className="flex gap-3 mb-5">
          <button onClick={cancelar}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200
              text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
            <X size={16}/> Cancelar
          </button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm
              bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
              shadow-md shadow-blue-500/20 transition-all disabled:opacity-60">
            {salvando
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <><Check size={16}/> Salvar</>}
          </button>
        </div>
      )}

      {/* Botões de plano */}
      <div className="space-y-3">
        {user?.status === 'ativo' && (
          <a href={REATIVACAO_URL} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
              bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm
              hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
            Gerenciar assinatura
          </a>
        )}

        {user?.status !== 'ativo' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Plano expirado</p>
            <p className="text-sm text-amber-800 mb-4">Sua assinatura venceu em {fmt(user?.dataVencimento)}. Renove para continuar com seus dados intactos.</p>
            <a href={REATIVACAO_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm
                hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Renovar assinatura →
            </a>
          </div>
        )}

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
            bg-white border border-gray-200 text-gray-700 font-semibold text-sm
            hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          <LogOut size={17}/> Sair da conta
        </button>
      </div>
    </div>
  );
}
