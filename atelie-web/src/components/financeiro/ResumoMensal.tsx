interface Props {
  titulo: string;
  valor: number;
}

export function ResumoCard({ titulo, valor }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{titulo}</p>
      <p className="text-xl font-bold">
        R$ {valor.toFixed(2)}
      </p>
    </div>
  );
}
