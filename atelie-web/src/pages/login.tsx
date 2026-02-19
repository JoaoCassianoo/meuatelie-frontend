import { useState } from "react"
import { supabase } from "../api/supabase"
import { carregarAtelie } from "../api/cache.api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError("Email ou senha incorretos.");
        return;
      }

      if (!data.session) {
        setError("Não foi possível iniciar sessão.");
        return;
      }

      await carregarAtelie();

    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }



  const disabled = !email || !password || loading;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Ateliê Manager</h1>
          <p className="text-sm text-gray-500">Entre para continuar</p>
        </div>

        <div className="space-y-4">

          {/* ERRO */}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full rounded-xl border border-gray-200 px-3 py-2 text-sm
              focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none
            "
          />

          {/* Senha */}
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full rounded-xl border border-gray-200 px-3 py-2 text-sm
              focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none
            "
          />

          {/* Esqueci senha */}
          <div className="text-right">
            <button className="text-xs text-blue-600 hover:underline">
              Esqueci minha senha
            </button>
          </div>

          {/* Botão */}
          <button
            onClick={handleLogin}
            disabled={disabled}
            className={`
              w-full rounded-xl py-2.5 font-medium text-sm transition
              ${
                disabled
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
              }
            `}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
