import { useEffect, useState } from 'react';
import { lerPreco, precoParaTexto } from '../lib/formato';

interface Props {
  id: string;
  rotulo: string;
  valor: number | undefined;
  onChange: (valor: number | undefined) => void;
}

/** Campo de preço em reais: aceita "12,90", "12.90" ou "R$ 12,90". */
export function CampoPreco({ id, rotulo, valor, onChange }: Props) {
  const [texto, setTexto] = useState(precoParaTexto(valor));

  // Atualiza se o preço mudar por fora (ex.: "Limpar preços").
  useEffect(() => {
    setTexto((atual) => (lerPreco(atual) === (valor ?? null) ? atual : precoParaTexto(valor)));
  }, [valor]);

  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-stone-700">
        {rotulo}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-stone-500">
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={texto}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d,.]/g, '');
            setTexto(t);
            const n = lerPreco(t);
            onChange(n === null || n === 0 ? undefined : n);
          }}
          onBlur={() => setTexto(precoParaTexto(valor))}
          className="h-12 w-36 rounded-xl border-2 border-creme-escuro bg-creme pl-11 pr-3 text-lg font-bold text-grafite placeholder:text-stone-400 focus:border-oliva focus:outline-none"
        />
      </div>
    </div>
  );
}
