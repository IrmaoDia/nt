import type { ComponentType, SVGProps } from 'react';
import { Contador } from '../components/Contador';
import {
  IconeAlerta,
  IconeTermometro,
  IlustracaoFrango,
  IlustracaoLombo,
  IlustracaoTender,
  IlustracaoTradicional,
} from '../components/Icones';
import { CARNES_FORNO, PESO_PECA_GRANDE, type IdCarne } from '../data/forno';
import type { ConfigForno } from '../estado';
import { formatarMinutos } from '../lib/formato';
import { tempoDeForno } from '../lib/forno';

const ILUSTRACOES: Record<IdCarne, ComponentType<SVGProps<SVGSVGElement>>> = {
  pernil: IlustracaoTradicional,
  frango: IlustracaoFrango,
  tender: IlustracaoTender,
  lombo: IlustracaoLombo,
};

interface Props {
  forno: ConfigForno;
  setForno: (atualizar: (f: ConfigForno) => ConfigForno) => void;
}

export function AbaForno({ forno, setForno }: Props) {
  const carne = CARNES_FORNO.find((c) => c.id === forno.carne) ?? CARNES_FORNO[0];
  const tempo = tempoDeForno(carne, forno.peso);

  return (
    <div className="space-y-5">
      <section className="cartao">
        <h2 className="titulo-secao">Qual carne vai ao forno?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Carne">
          {CARNES_FORNO.map((c) => {
            const ativo = c.id === carne.id;
            const Ilustracao = ILUSTRACOES[c.id];
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setForno((f) => ({ ...f, carne: c.id }))}
                className={`flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-2xl border-[3px] p-3 text-center transition ${
                  ativo ? 'border-oliva bg-oliva-claro' : 'border-creme-escuro bg-creme'
                }`}
              >
                <Ilustracao className="h-12 w-12" />
                <span className="text-lg font-extrabold text-oliva-escuro">{c.nome}</span>
                <span className="text-base text-stone-600">{c.detalhe}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="cartao">
        <Contador
          id="peso"
          rotulo="Peso da peça"
          ajuda="Pese a peça crua, já descongelada."
          valor={forno.peso}
          min={0.5}
          max={15}
          passo={0.5}
          decimal
          sufixo="kg"
          onChange={(peso) => setForno((f) => ({ ...f, peso }))}
        />
      </section>

      {forno.peso > PESO_PECA_GRANDE && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-vermelho bg-[#FDECEA] p-4 text-lg font-semibold text-vermelho">
          <IconeAlerta className="mt-0.5 h-7 w-7 shrink-0" />
          Peças muito grandes: considere dividir em duas assadeiras.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl bg-oliva text-white shadow-cartao">
        <div className="bg-oliva-escuro px-5 py-4 text-center">
          <p className="text-lg">Forno preaquecido a</p>
          <p className="whitespace-nowrap text-5xl font-extrabold text-dourado-claro">{carne.temperatura} °C</p>
        </div>
        <dl className="divide-y divide-white/20 px-5">
          <div className="flex items-center justify-between gap-3 py-4">
            <dt className="text-lg">Coberto com papel-alumínio</dt>
            <dd className="whitespace-nowrap text-2xl font-extrabold">{formatarMinutos(tempo.coberto)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <dt className="text-lg">Descoberto, para dourar</dt>
            <dd className="whitespace-nowrap text-2xl font-extrabold">{formatarMinutos(tempo.descoberto)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <dt className="text-xl font-bold">Tempo total</dt>
            <dd className="whitespace-nowrap text-3xl font-extrabold text-dourado-claro">{formatarMinutos(tempo.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="cartao">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FDECEA] text-vermelho">
            <IconeTermometro className="h-7 w-7" />
          </span>
          <div>
            <h2 className="titulo-secao">Ponto seguro</h2>
            <p className="text-lg">
              Temperatura interna:{' '}
              <strong className="whitespace-nowrap text-2xl text-vermelho">{carne.pontoSeguro} °C</strong>
            </p>
          </div>
        </div>
        <p className="mt-3 text-base text-stone-700">{carne.textoPonto}</p>

        <h3 className="mt-5 text-xl font-bold text-oliva-escuro">Sem termômetro?</h3>
        <ul className="mt-2 space-y-2">
          {carne.sinais.map((s) => (
            <li key={s} className="flex gap-2 text-base leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-dourado" />
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-xl bg-creme px-4 py-3 text-base text-stone-700">
          Esses sinais ajudam, mas só o termômetro garante o ponto seguro.
        </p>
      </section>

      <p className="px-2 text-center text-base text-stone-600">
        Tempos para peça descongelada e forno preaquecido. Cada forno é diferente: confira antes de servir.
      </p>
    </div>
  );
}
