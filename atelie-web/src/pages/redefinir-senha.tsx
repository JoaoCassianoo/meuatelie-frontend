import { useState } from 'react';
import { supabase } from '../api/supabase';

export default function RedefinirSenha() {
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function handleRedefinir() {
    if (!senha || senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setMensagem("Senha redefinida com sucesso!");
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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)' }}/>
          <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Redefinir senha</h2>

            {mensagem && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm p-3.5 rounded-xl">
                {mensagem}
              </div>
            )}

            {erro && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm p-3.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                {erro}
              </div>
            )}

            {!mensagem && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRedefinir()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleRedefinir}
                  disabled={loading || !senha}
                  className={`w-full rounded-xl py-3 font-bold text-sm transition-all
                    ${loading || !senha ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white active:scale-[0.98]'}`}
                  style={loading || !senha ? {} : {
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                  }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        Aguarde...
                      </span>
                    : 'Redefinir senha'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}