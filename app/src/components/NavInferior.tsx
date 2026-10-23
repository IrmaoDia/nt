import type { ComponentType, SVGProps } from 'react';
import type { Aba } from '../estado';
import { IconeForno, IconeLista, IconeMesa, IconeReceita } from './Icones';

const ABAS: { id: Aba; rotulo: string; Icone: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'mesa', rotulo: 'Mesa', Icone: IconeMesa },
  { id: 'receita', rotulo: 'Ajustar Receita', Icone: IconeReceita },
  { id: 'custo', rotulo: 'Custo', Icone: IconeLista },
  { id: 'forno', rotulo: 'Forno', Icone: IconeForno },
];

export const ALTURA_NAV = 76;

export function NavInferior({ aba, onChange }: { aba: Aba; onChange: (a: Aba) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t-2 border-creme-escuro bg-white pb-[env(safe-area-inset-bottom)] print:hidden"
      aria-label="Abas do app"
    >
      <ul className="grid grid-cols-4">
        {ABAS.map(({ id, rotulo, Icone }) => {
          const ativa = aba === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={ativa ? 'page' : undefined}
                style={{ height: ALTURA_NAV }}
                className={`flex w-full flex-col items-center justify-center gap-0.5 px-1 text-center text-base font-bold leading-tight transition ${
                  ativa ? 'bg-oliva text-white' : 'text-grafite active:bg-creme'
                }`}
              >
                <Icone className="h-6 w-6 shrink-0" />
                {rotulo}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
