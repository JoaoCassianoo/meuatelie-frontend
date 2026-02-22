import { useState } from 'react';
import { supabase } from '../api/supabase';

function ScissorsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
}

export default function RedefinirSenha() {
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function handleRedefinir() {
    setErro("");
    
    if (!senha || !confirmaSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setMensagem("Senha redefinida com sucesso!");
      setSenha("");
      setConfirmaSenha("");
      setTimeout(() => {
        window.location.hash = 'login';
        window.location.reload();
      }, 2000);
    } catch {
      setErro("Erro ao redefinir senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}>

      {/* Background blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}/>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}/>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <ScissorsIcon />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ateliê Manager</h1>
          <p className="text-blue-100/70 text-sm mt-1.5">Redefinir senha</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}>

          {/* Gradient stripe */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)' }}/>

          <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Defina sua nova senha</h2>

            {/* Success */}
            {mensagem && (
              <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 text-green-700 text-sm p-3.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"/>
                {mensagem}
              </div>
            )}

            {/* Error */}
            {erro && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm p-3.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                {erro}
              </div>
            )}

            {!mensagem && (
              <>
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRedefinir()}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmar Senha</label>
                  <input
                    type="password"
                    placeholder="Confirme sua senha"
                    value={confirmaSenha}
                    onChange={e => setConfirmaSenha(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRedefinir()}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50"
                  />
                </div>

                {/* Reset btn */}
                <button
                  onClick={handleRedefinir}
                  disabled={loading || !senha || !confirmaSenha}
                  className={`w-full rounded-xl py-3 font-bold text-sm transition-all mt-1
                    ${loading || !senha || !confirmaSenha ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white active:scale-[0.98]'}`}
                  style={loading || !senha || !confirmaSenha ? {} : {
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                  }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        Redefinindo...
                      </span>
                    : 'Redefinir Senha'}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-blue-100/70 text-xs mt-6">
          Lembrou a senha? <button onClick={() => { window.location.hash = 'login'; window.location.reload(); }} className="text-blue-100 hover:text-white font-semibold underline">Faça login</button>
        </p>
        
        <p className="text-center text-blue-100/30 text-xs mt-3">© 2026 Ateliê Manager</p>
      </div>
    </div>
  );
}