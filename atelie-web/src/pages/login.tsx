import { useState } from "react"
import { supabase } from "../api/supabase"
import { carregarAtelie } from "../api/cache.api"

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

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin() {
    setError("");
    if (!email || !password) { setError("Preencha email e senha."); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Email ou senha incorretos."); return; }
      if (!data.session) { setError("Não foi possível iniciar sessão."); return; }
      await carregarAtelie();
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = !email || !password || loading;

  const goToSignup = () => {
    window.location.hash = 'signup';
    window.location.reload();
  };

  async function handleEsqueceuSenha() {
  if (!email) {
    setError("Digite seu e-mail antes de clicar em esqueci minha senha.");
    return;
  }
  try {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://meuatelie.vercel.app/#redefinir-senha'
    });
    if (error) throw error;
    setError("");
    alert("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
  } catch {
    setError("Erro ao enviar e-mail. Tente novamente.");
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
          <p className="text-blue-100/70 text-sm mt-1.5">Gestão completa do seu ateliê</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}>

          {/* Gradient stripe */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)' }}/>

          <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Entrar na conta</h2>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm p-3.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Senha</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            <div className="text-right -mt-1">
              <button onClick={handleEsqueceuSenha} className="text-xs text-blue-600 hover:underline font-medium">Esqueci minha senha</button>
            </div>

            {/* Login btn */}
            <button onClick={handleLogin} disabled={disabled}
              className={`w-full rounded-xl py-3 font-bold text-sm transition-all mt-1
                ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white active:scale-[0.98]'}`}
              style={disabled ? {} : {
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Entrando...
                  </span>
                : 'Entrar'}
            </button>


          </div>
        </div>

        <p className="text-center text-blue-100/70 text-xs mt-6">
          Ainda não tem conta? <button onClick={goToSignup} className="text-blue-100 hover:text-white font-semibold underline">Registre-se aqui</button>
        </p>

        <p className="text-center text-blue-100/30 text-xs mt-3">© 2026 Ateliê Manager</p>
      </div>
    </div>
  );
}
