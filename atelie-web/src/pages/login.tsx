import { useState } from "react"
import { supabase } from "../api/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    console.log("clicou login 🔥")

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    console.log({ data, error })
    }


  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80 space-y-3">
        <input
          placeholder="email"
          className="border w-full p-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="senha"
          className="border w-full p-2"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
