import { useEffect, useState } from 'react';
import { formatarNumero } from '../lib/formato';
import { IconeMais, IconeMenos } from './Icones';

interface Props {
  id: string;
  rotulo: string;
  ajuda?: string;
  valor: number;
  onChange: (valor: number) => void;
  min: number;
  max: number;
  passo?: number;
  /** Aceita vírgula (ex.: peso em kg). */
  decimal?: boolean;
  sufixo?: string;
}

/** Campo grande com botões − e +, e que também aceita digitar. */
export function Contador({ id, rotulo, ajuda, valor, onChange, min, max, passo = 1, decimal, sufixo }: Props) {
  const [texto, setTexto] = useState(formatarNumero(valor));

  // Mantém o campo igual ao valor quando ele muda pelos botões.
  useEffect(() => {
    setTexto((atual) => (lerNumero(atual) === valor ? atual : formatarNumero(valor)));
  }, [valor]);

  const limitar = (n: number) => Math.min(max, Math.max(min, Math.round(n * 100) / 100));

  function lerNumero(t: string): number | null {
    const n = Number(t.replace(',', '.'));
    return t.trim() === '' || !Number.isFinite(n) ? null : n;
  }

  function digitar(t: string) {
    const limpo = decimal ? t.replace(/[^\d,.]/g, '') : t.replace(/\D/g, '');
    setTexto(limpo);
    const n = lerNumero(limpo);
    if (n !== null) onChange(limitar(decimal ? n : Math.round(n)));
  }

  const botao =
    'grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-oliva bg-white text-oliva transition active:scale-95 disabled:border-stone-300 disabled:text-stone-400';

  return (
    <div>
      <label htmlFor={id} className="block text-xl font-bold text-grafite">
        {rotulo}
      </label>
      {ajuda && <p className="mt-0.5 text-base text-stone-600">{ajuda}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className={botao}
          onClick={() => onChange(limitar(valor - passo))}
          disabled={valor <= min}
          aria-label={`Diminuir: ${rotulo}`}
        >
          <IconeMenos className="h-7 w-7" />
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={texto}
            onChange={(e) => digitar(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => setTexto(formatarNumero(valor))}
            className="h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme text-center text-3xl font-extrabold text-oliva-escuro focus:border-oliva focus:outline-none"
          />
          {sufixo && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-stone-500">
              {sufixo}
            </span>
          )}
        </div>
        <button
          type="button"
          className={botao}
          onClick={() => onChange(limitar(valor + passo))}
          disabled={valor >= max}
          aria-label={`Aumentar: ${rotulo}`}
        >
          <IconeMais className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
