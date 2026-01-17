interface Props {
  ano: number;
  mes: number;
  tipo: number;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number) => void;
  onTipoChange: (tipo: number) => void;
}

export function PeriodoSelector({ ano, mes, tipo, onAnoChange, onMesChange, onTipoChange}: Props) {
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

      <div>
        <label className="block text-sm">Tipo de Movimentação</label>
        <select
          value={tipo}
          onChange={e => onTipoChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
            <option key={0} value={1}>Entradas</option>
            <option key={1} value={2}>Saidas</option>
            <option key={2} value={3}>Todas</option>
        </select>
      </div>
    </div>
  );
}
