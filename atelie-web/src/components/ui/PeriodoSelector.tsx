interface Props {
  ano: number;
  mes: number;
  tipo: number;
  meio: number;
  contexto: number;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number) => void;
  onTipoChange: (tipo: number) => void;
  onMeioChange: (meio: number) => void;
  onContextoChange: (contexto: number) => void;
}

export function PeriodoSelector({ ano, mes, tipo, meio, contexto, onAnoChange, onMesChange, onTipoChange, onMeioChange, onContextoChange}: Props) {
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClasses = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div>
        <label className={labelClasses}>Ano</label>
        <input
          type="number"
          value={ano}
          onChange={e => onAnoChange(Number(e.target.value))}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Mês</label>
        <select
          value={mes}
          onChange={e => onMesChange(Number(e.target.value))}
          className={inputClasses}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {String(i + 1).padStart(2, '0')} - {new Date(2024, i).toLocaleString('pt-BR', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClasses}>Tipo</label>
        <select
          value={tipo}
          onChange={e => onTipoChange(Number(e.target.value))}
          className={inputClasses}
        >
            <option value={1}>Entradas</option>
            <option value={2}>Saídas</option>
            <option value={3}>Todas</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Contexto</label>
        <select
          value={contexto}
          onChange={e => onContextoChange(Number(e.target.value))}
          className={inputClasses}
        >
            <option value={1}>Loja</option>
            <option value={2}>Pessoal</option>
            <option value={3}>Todas</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Meio de Pagamento</label>
        <select
          value={meio}
          onChange={e => onMeioChange(Number(e.target.value))}
          className={inputClasses}
        >
            <option value={1}>Crédito</option>
            <option value={2}>Débito</option>
            <option value={3}>Pix</option>
            <option value={4}>Todas</option>
        </select>
      </div>
    </div>
  );
}
