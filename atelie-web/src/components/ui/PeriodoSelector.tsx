interface Props {
  ano: number;
  mes: number;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number) => void;
}

export function PeriodoSelector({ ano, mes, onAnoChange, onMesChange }: Props) {
  return (
    <div className="flex gap-4 mb-6">
      <div>
        <label className="block text-sm">Ano</label>
        <input
          type="number"
          value={ano}
          onChange={e => onAnoChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm">Mês</label>
        <select
          value={mes}
          onChange={e => onMesChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
