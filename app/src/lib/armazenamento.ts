import { useEffect, useState } from 'react';

/**
 * Tudo o que a usuária digita fica salvo só no aparelho dela (localStorage).
 * O acesso pode falhar (aba anônima, armazenamento cheio ou bloqueado),
 * então toda leitura e escrita fica protegida e o app continua funcionando.
 */
const PREFIXO = 'ceia-sem-erro:';

export function ler(chave: string): unknown {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave);
    return bruto === null ? undefined : JSON.parse(bruto);
  } catch {
    return undefined;
  }
}

export function salvar(chave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    // Sem armazenamento: o app segue funcionando, só não lembra na próxima vez.
  }
}

/** useState que lembra o valor entre aberturas do app. */
export function usePersistente<T>(chave: string, inicial: T, ajustar: (salvo: unknown) => T | undefined) {
  const [valor, setValor] = useState<T>(() => {
    const salvo = ler(chave);
    return salvo === undefined ? inicial : (ajustar(salvo) ?? inicial);
  });
  useEffect(() => salvar(chave, valor), [chave, valor]);
  return [valor, setValor] as const;
}

export function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Mantém só as entradas numéricas (ex.: preços). */
export function soNumeros(v: unknown): Record<string, number> | undefined {
  if (!ehObjeto(v)) return undefined;
  const r: Record<string, number> = {};
  for (const [k, n] of Object.entries(v)) if (typeof n === 'number' && Number.isFinite(n)) r[k] = n;
  return r;
}

export function soTextos(v: unknown): string[] | undefined {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined;
}
