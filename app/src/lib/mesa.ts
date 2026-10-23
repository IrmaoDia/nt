import { AUMENTO_POR_PRATO_EXTRA, ORDEM_GRUPOS, buscarTipo, type TipoDePrato } from '../data/tiposDePrato';
import type { Apetite } from '../data/tipos';
import { formatarMassa, formatarNumero, formatarVolume } from './formato';

export const FATOR_APETITE: Record<Apetite, number> = {
  leve: 0.85,
  normal: 1,
  'bem-servido': 1.2,
};

/** Crianças de até 10 anos contam como meia porção. */
export const PESO_CRIANCA = 0.5;
export const MAX_PESSOAS = 500;

export function pessoasEquivalentes(adultos: number, criancas: number, apetite: Apetite): number {
  return (Math.max(0, adultos) + Math.max(0, criancas) * PESO_CRIANCA) * FATOR_APETITE[apetite];
}

/** Um prato que a usuária colocou na mesa. */
export interface PratoMesa {
  id: string;
  tipo: string;
  /** Nome livre (opcional), ex.: "Pernil da minha mãe". */
  nome: string;
  /** Prato de um cardápio pronto do guia (traz a receita-base). */
  guia?: string;
}

export interface ResultadoPrato {
  prato: PratoMesa;
  tipo: TipoDePrato;
  /** Nome para mostrar: o que ela escreveu ou o nome do tipo. */
  nome: string;
  pratosNoGrupo: number;
  /** Parte do consumo do grupo que fica com este prato (1 quando está sozinho). */
  fatorGrupo: number;
  porPessoaEfetivo: number;
  /** Quantas porções de adulto este prato precisa render na mesa. */
  porcoes: number;
  /** Na unidade do tipo (g, ml, porções ou unidades), já arredondada. */
  quantidade: number;
  texto: string;
  embalagens?: number;
  textoEmbalagem?: string;
}

/**
 * Regra de divisão (detalhes em src/data/tiposDePrato.ts):
 * com n pratos no mesmo grupo, cada um fica com (1 + 15% × (n − 1)) ÷ n do seu porPessoa.
 */
export function fatorDoGrupo(pratosNoGrupo: number): number {
  if (pratosNoGrupo <= 1) return 1;
  return (1 + AUMENTO_POR_PRATO_EXTRA * (pratosNoGrupo - 1)) / pratosNoGrupo;
}

export function arredondarParaCima(valor: number, passo: number): number {
  if (passo <= 0) return valor;
  return Math.round(Math.ceil(valor / passo - 1e-9) * passo * 1000) / 1000;
}

function plural(n: number, [singular, pluralTxt]: [string, string]): string {
  return n === 1 ? singular : pluralTxt;
}

function textoQuantidade(qtd: number, tipo: TipoDePrato): string {
  if (tipo.unidade === 'g') return formatarMassa(qtd);
  if (tipo.unidade === 'ml') return formatarVolume(qtd);
  const nomes = tipo.nomeUnidade ?? (['unidade', 'unidades'] as [string, string]);
  return `${formatarNumero(qtd)} ${plural(qtd, nomes)}`;
}

export function nomeDoPrato(prato: PratoMesa, tipo: TipoDePrato): string {
  return prato.nome.trim() || tipo.nome;
}

export function calcularMesa(
  pratos: PratoMesa[],
  adultos: number,
  criancas: number,
  apetite: Apetite,
): ResultadoPrato[] {
  const validos = pratos
    .map((prato) => ({ prato, tipo: buscarTipo(prato.tipo) }))
    .filter((x): x is { prato: PratoMesa; tipo: TipoDePrato } => x.tipo !== undefined);

  const porGrupo = new Map<string, number>();
  for (const { tipo } of validos) porGrupo.set(tipo.grupo, (porGrupo.get(tipo.grupo) ?? 0) + 1);

  const resultados = validos.map(({ prato, tipo }) => {
    const pratosNoGrupo = porGrupo.get(tipo.grupo) ?? 1;
    const fatorGrupo = fatorDoGrupo(pratosNoGrupo);
    const pessoas = tipo.soAdultos
      ? Math.max(0, adultos) * FATOR_APETITE[apetite]
      : pessoasEquivalentes(adultos, criancas, apetite);
    const porcoes = pessoas * fatorGrupo;
    const bruto = tipo.porPessoa * porcoes;
    const quantidade = bruto > 0 ? arredondarParaCima(bruto, tipo.arredondamento) : 0;

    const r: ResultadoPrato = {
      prato,
      tipo,
      nome: nomeDoPrato(prato, tipo),
      pratosNoGrupo,
      fatorGrupo,
      porPessoaEfetivo: tipo.porPessoa * fatorGrupo,
      porcoes,
      quantidade,
      texto: quantidade > 0 ? textoQuantidade(quantidade, tipo) : '—',
    };
    if (tipo.embalagem && bruto > 0) {
      // Embalagens: sempre inteiras, calculadas sobre o consumo (não sobre o valor já arredondado).
      r.embalagens = Math.max(1, Math.ceil(bruto / tipo.embalagem.tamanho - 1e-9));
      r.textoEmbalagem = `${r.embalagens} ${plural(r.embalagens, tipo.embalagem.nome)}`;
    }
    return r;
  });

  return resultados.sort(
    (a, b) => ORDEM_GRUPOS.indexOf(a.tipo.grupo) - ORDEM_GRUPOS.indexOf(b.tipo.grupo),
  );
}
