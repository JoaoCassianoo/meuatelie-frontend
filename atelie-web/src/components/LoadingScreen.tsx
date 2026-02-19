import { Scissors } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400 flex flex-col items-center justify-center gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Scissors size={36} className="text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Meu Ateliê</h1>
      </div>

      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>

      <p className="text-white/60 text-sm font-medium">Carregando seu ateliê...</p>
    </div>
  );
}