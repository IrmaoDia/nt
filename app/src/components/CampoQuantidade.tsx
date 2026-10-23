import { useEffect, useState } from 'react';
import { formatarNumero } from '../lib/formato';
import { formatarFracao, lerQuantidade } from '../lib/receita';

interface Props {
  id: string;
  valor: number | null;
  fracao: boolean;
  desativado?: boolean;
  onChange: (v: number | null) => void;
}

function paraTexto(v: number | null, fracao: boolean): string {
  if (v === null) return '';
  return fracao ? formatarFracao(v) : formatarNumero(v);
}

/** Campo de quantidade que entende "1/2", "½", "1,5" e "meia". */
export function CampoQuantidade({ id, valor, fracao, desativado, onChange }: Props) {
  const [texto, setTexto] = useState(paraTexto(valor, fracao));

  useEffect(() => {
    setTexto((atual) => (lerQuantidade(atual)?.valor === valor ? atual : paraTexto(valor, fracao)));
  }, [valor, fracao]);

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label="Quantidade"
      disabled={desativado}
      value={desativado ? '' : texto}
      placeholder={desativado ? '—' : '0'}
      onChange={(e) => {
        setTexto(e.target.value);
        const q = lerQuantidade(e.target.value);
        if (q && !q.resto) onChange(q.valor);
        else if (!e.target.value.trim()) onChange(null);
      }}
      onBlur={() => setTexto(paraTexto(valor, fracao))}
      className="h-12 w-20 shrink-0 rounded-xl border-2 border-creme-escuro bg-creme px-2 text-center text-lg font-bold text-grafite focus:border-oliva focus:outline-none disabled:bg-stone-100"
    />
  );
}
