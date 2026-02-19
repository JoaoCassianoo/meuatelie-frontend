interface Props {
  titulo: string;
  valor: string;
}

export function ResumoCard({ titulo, valor }: Props) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 hover:bg-gray-100/60 transition-colors">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{titulo}</p>
      <p className="text-base font-bold text-gray-900 tabular-nums">R$ {valor}</p>
    </div>
  );
}
