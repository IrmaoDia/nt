import type { CarneForno, LinhaForno } from '../data/forno';

export interface TempoForno {
  coberto: number;
  descoberto: number;
  total: number;
}

/** Arredonda para cima de 5 em 5 minutos (mais fácil de marcar no relógio). */
function cincoMin(min: number): number {
  return Math.max(5, Math.ceil(min / 5 - 1e-9) * 5);
}

function interpolar(tabela: LinhaForno[], kg: number, campo: 'coberto' | 'descoberto'): number {
  const linhas = [...tabela].sort((a, b) => a.kg - b.kg);
  // Escolhe o trecho da tabela que contém o peso (ou o primeiro/último, se estiver fora).
  let i = linhas.findIndex((l) => l.kg >= kg);
  if (i === -1) i = linhas.length - 1;
  if (i === 0) i = 1;
  const a = linhas[i - 1];
  const b = linhas[i];
  const ritmo = (b[campo] - a[campo]) / (b.kg - a.kg);
  return a[campo] + ritmo * (kg - a.kg);
}

export function tempoDeForno(carne: CarneForno, kg: number): TempoForno {
  const coberto = cincoMin(interpolar(carne.tabela, kg, 'coberto'));
  const descoberto = cincoMin(interpolar(carne.tabela, kg, 'descoberto'));
  return { coberto, descoberto, total: coberto + descoberto };
}
