import { useState } from 'react';
import { Scissors } from 'lucide-react';
import { cache } from '../api/cache.api';
import { iniciarAssinatura } from '../api/atelie.api';

export default function UpgradePage() {
  const atelie = cache.atelie;
  const [loading, setLoading] = useState<string | null>(null);

  /*const handleAssinar = async (periodicidade: 'mensal' | 'trimestral' | 'anual') => {
    setLoading(periodicidade);
    try {
      const data = await iniciarAssinatura(periodicidade);
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.response?.data?.erro || 'Erro ao iniciar assinatura.');
    } finally {
      setLoading(null);
    }
  };*/
  const handleSelecionarPlano = (periodicidade: string) => {
    const mensagem = encodeURIComponent(
      `Olá! Tenho interesse em assinar o Plano ${periodicidade.charAt(0).toUpperCase() + periodicidade.slice(1)} do Meu Ateliê. Poderia me ajudar?`
    );
    window.open(`https://wa.me/5519993814025?text=${mensagem}`, '_blank');
  };

  const textoBotao = (periodicidade: 'mensal' | 'trimestral' | 'anual') => {
    if (loading === periodicidade) return 'Aguarde...';
    return atelie.plano === 'free' ? 'Fazer Upgrade →' : 'Renovar Plano →';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Scissors size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Meu Ateliê</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            {atelie.plano === 'free' ? 'Seu próximo passo é escolher um plano' : 'Escolha seu plano para renovar sua assinatura!'}
          </h1>
          <p className="text-xl text-gray-600">
            {atelie.plano === 'free' ? 'Faça upgrade para desbloquear todos os recursos!' : 'Renove seu plano para continuar aproveitando todos os recursos!'}
          </p>
          <p className="text-lg text-blue-600 font-semibold mt-2">
            {atelie.nomeAtelie}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* Plano Mensal */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all hover:border-blue-400">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-4">Plano Mensal</p>
            <div className="mb-5">
              <span className="text-5xl font-extrabold text-gray-900">R$40</span>
              <span className="text-gray-400 text-sm">/mês</span>
            </div>
            <p className="text-gray-600 text-sm mb-8">Cancele quando quiser.</p>
            <button
              onClick={() => handleSelecionarPlano('mensal')}
              disabled={loading !== null}
              className="w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {textoBotao('mensal')}
            </button>
            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">✓</span>
                Todos os recursos
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">✓</span>
                Suporte
              </li>
            </ul>
          </div>

          {/* Plano Anual */}
          <div className="rounded-2xl p-8 relative border-2 border-blue-500 shadow-xl" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
              ⭐ MAIS VANTAJOSO
            </div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-4">Plano Anual</p>
            <div className="mb-1">
              <span className="text-5xl font-extrabold text-white">R$360</span>
              <span className="text-blue-200 text-sm">/ano</span>
            </div>
            <p className="text-blue-200/70 text-sm mb-1">R$30/mês — <span className="text-white font-semibold">economize R$120</span></p>
            <p className="text-blue-200/50 text-xs mb-8">Equivale a 3 meses grátis</p>
            <button
              onClick={() => handleSelecionarPlano('anual')}
              disabled={loading !== null}
              className="w-full text-center bg-white text-blue-700 hover:bg-blue-50 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {textoBotao('anual')}
            </button>
            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-white">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
                Todos os recursos
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
                Suporte
              </li>
            </ul>
          </div>

          {/* Plano Trimestral */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all hover:border-blue-400">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-4">Plano Trimestral</p>
            <div className="mb-5">
              <span className="text-5xl font-extrabold text-gray-900">R$108</span>
              <span className="text-gray-400 text-sm">/a cada 3 meses</span>
            </div>
            <p className="text-gray-600 text-sm mb-8">Cancele quando quiser.</p>
            <button
              onClick={() => handleSelecionarPlano('trimestral')}
              disabled={loading !== null}
              className="w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {textoBotao('trimestral')}
            </button>
            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">✓</span>
                Todos os recursos
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">✓</span>
                Suporte
              </li>
            </ul>
          </div>

        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Dúvidas? <span className="text-blue-600 hover:underline font-semibold">Entre em contato</span> com nosso time de suporte.
          </p>
        </div>
      </div>
    </div>
  );
}