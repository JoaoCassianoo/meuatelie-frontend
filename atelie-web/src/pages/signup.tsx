import { useState } from "react"
import { supabase } from "../api/supabase"
import { registrarAtelie } from "../api/atelie.api"
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

export default function Signup() {
  const [name, setName] = useState("");
  const [atelieNome, setAtelieNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup() {
    setError("");
    
    // Validações
    if (!name || !atelieNome || !email || !telefone || !cpfCnpj || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      
      // Chamar API do backend para registrar
      await registrarAtelie(email, password, name, atelieNome, telefone, cpfCnpj);

      // Se registrou com sucesso, fazer login automático
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError || !loginData.session) {
        setError("Conta criada! Faça login com suas credenciais.");
        setTimeout(() => {
          window.location.hash = 'login';
          window.location.reload();
        }, 2000);
        return;
      }

      window.location.reload();
      await carregarAtelie();
      
    } catch (err: any) {
      setError(err.response?.data?.erro || "Erro ao criar conta. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const disabled = !name || !atelieNome || !email || !telefone || !cpfCnpj || !password || !confirmPassword || loading;

  const goToLogin = () => {
    window.location.hash = 'login';
    window.location.reload();
  };

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
          <p className="text-blue-100/70 text-sm mt-1.5">Crie sua conta agora</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}>

          {/* Gradient stripe */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)' }}/>

          <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registre-se</h2>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm p-3.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome completo</label>
              <input type="text" placeholder="Seu nome" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Atelie Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome do Ateliê</label>
              <input type="text" placeholder="Nome do seu ateliê" value={atelieNome}
                onChange={(e) => setAtelieNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telefone</label>
              <input type="text" placeholder="(00) 00000-0000" value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Cpf */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">CPF</label>
              <input type="text" placeholder="000.000.000-00" value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Senha</label>
              <input type="password" placeholder="Mín. 6 caracteres" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmar senha</label>
              <input type="password" placeholder="Confirme sua senha" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"/>
            </div>

            {/* Signup btn */}
            <button onClick={handleSignup} disabled={disabled}
              className={`w-full rounded-xl py-3 font-bold text-sm transition-all mt-1
                ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white active:scale-[0.98]'}`}
              style={disabled ? {} : {
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Criando conta...
                  </span>
                : 'Criar conta'}
            </button>

          </div>
        </div>

        <p className="text-center text-blue-100/70 text-xs mt-6">
          Já tem uma conta? <button onClick={goToLogin} className="text-blue-100 hover:text-white font-semibold underline">Faça login</button>
        </p>
        
        <p className="text-center text-blue-100/30 text-xs mt-3">© 2026 Ateliê Manager</p>
      </div>
    </div>
  );
}
