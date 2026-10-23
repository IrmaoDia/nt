import { buscarTipo } from './data/tiposDePrato';
import type { IdCarne } from './data/forno';
import type { Apetite } from './data/tipos';
import { ehObjeto } from './lib/armazenamento';
import type { IngredienteNaLista, ItemLivre, ReceitaNaLista, UnidadeLivre } from './lib/custo';
import { MAX_PESSOAS, type PratoMesa } from './lib/mesa';
import { UNIDADES_RECEITA, novoId, type LinhaReceita, type UnidadeReceita } from './lib/receita';

export type Aba = 'mesa' | 'receita' | 'custo' | 'forno';

/* Tudo aqui valida o que vem do armazenamento do aparelho: se algo estiver
   corrompido ou em formato antigo, o app usa o padrão em vez de quebrar. */

const texto = (v: unknown, padrao = '') => (typeof v === 'string' ? v : padrao);
const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function pessoas(v: unknown, padrao: number, minimo = 0): number {
  const n = numero(v);
  return n === null ? padrao : Math.min(MAX_PESSOAS, Math.max(minimo, Math.round(n)));
}

/* ------------------------------ Mesa ------------------------------ */

export interface Mesa {
  adultos: number;
  criancas: number;
  apetite: Apetite;
  pratos: PratoMesa[];
}

export const MESA_PADRAO: Mesa = { adultos: 6, criancas: 0, apetite: 'normal', pratos: [] };

const APETITES: Apetite[] = ['leve', 'normal', 'bem-servido'];

export function ajustarMesa(v: unknown): Mesa | undefined {
  if (!ehObjeto(v)) return undefined;
  const pratos: PratoMesa[] = [];
  for (const p of lista(v.pratos)) {
    if (!ehObjeto(p) || !buscarTipo(texto(p.tipo))) continue;
    const prato: PratoMesa = { id: texto(p.id) || novoId(), tipo: texto(p.tipo), nome: texto(p.nome) };
    if (typeof p.guia === 'string') prato.guia = p.guia;
    pratos.push(prato);
  }
  return {
    adultos: pessoas(v.adultos, MESA_PADRAO.adultos),
    criancas: pessoas(v.criancas, 0),
    apetite: APETITES.includes(v.apetite as Apetite) ? (v.apetite as Apetite) : 'normal',
    pratos,
  };
}

/* ------------------------------ Receitas ------------------------------ */

const IDS_UNIDADE = UNIDADES_RECEITA.map((u) => u.id);

function ajustarLinha(v: unknown): LinhaReceita | null {
  if (!ehObjeto(v)) return null;
  const unidade = IDS_UNIDADE.includes(v.unidade as UnidadeReceita) ? (v.unidade as UnidadeReceita) : 'unidade';
  return { id: texto(v.id) || novoId(), quantidade: numero(v.quantidade), unidade, ingrediente: texto(v.ingrediente) };
}

export interface Receita {
  id: string;
  nome: string;
  serve: number;
  linhas: LinhaReceita[];
}

export interface RascunhoReceita extends Receita {
  fazerPara: number;
  /** Prato da Mesa que abriu esta receita. */
  pratoMesaId?: string;
}

export function receitaVazia(fazerPara: number): RascunhoReceita {
  return { id: novoId(), nome: '', serve: 4, fazerPara: Math.max(1, fazerPara), linhas: [] };
}

function ajustarReceita(v: unknown): Receita | null {
  if (!ehObjeto(v)) return null;
  return {
    id: texto(v.id) || novoId(),
    nome: texto(v.nome),
    serve: pessoas(v.serve, 4, 1),
    linhas: lista(v.linhas).map(ajustarLinha).filter((l): l is LinhaReceita => l !== null),
  };
}

export function ajustarRascunho(v: unknown): RascunhoReceita | undefined {
  const r = ajustarReceita(v);
  if (!r || !ehObjeto(v)) return undefined;
  const rascunho: RascunhoReceita = { ...r, fazerPara: pessoas(v.fazerPara, 6, 1) };
  if (typeof v.pratoMesaId === 'string') rascunho.pratoMesaId = v.pratoMesaId;
  return rascunho;
}

export function ajustarReceitasSalvas(v: unknown): Receita[] | undefined {
  return Array.isArray(v) ? v.map(ajustarReceita).filter((r): r is Receita => r !== null) : undefined;
}

/* ------------------------------ Lista ------------------------------ */

export function ajustarReceitasNaLista(v: unknown): ReceitaNaLista[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const receitas: ReceitaNaLista[] = [];
  for (const r of v) {
    if (!ehObjeto(r)) continue;
    const itens = lista(r.itens)
      .map((i): IngredienteNaLista | null => {
        if (!ehObjeto(i)) return null;
        const unidade = IDS_UNIDADE.includes(i.unidade as UnidadeReceita) ? (i.unidade as UnidadeReceita) : 'sem';
        return { quantidade: numero(i.quantidade), unidade, ingrediente: texto(i.ingrediente) };
      })
      .filter((i): i is IngredienteNaLista => i !== null);
    const receita: ReceitaNaLista = { id: texto(r.id) || novoId(), nome: texto(r.nome), pessoas: pessoas(r.pessoas, 1, 1), itens };
    if (typeof r.pratoMesaId === 'string') receita.pratoMesaId = r.pratoMesaId;
    receitas.push(receita);
  }
  return receitas;
}

const UNIDADES_LIVRES: UnidadeLivre[] = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'lata', 'caixa', 'garrafa'];

export function ajustarItensLivres(v: unknown): ItemLivre[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v
    .map((i): ItemLivre | null => {
      if (!ehObjeto(i) || !texto(i.nome)) return null;
      const unidade = UNIDADES_LIVRES.includes(i.unidade as UnidadeLivre) ? (i.unidade as UnidadeLivre) : 'unidade';
      return { id: texto(i.id) || novoId(), nome: texto(i.nome), quantidade: numero(i.quantidade) ?? 1, unidade };
    })
    .filter((i): i is ItemLivre => i !== null);
}

/* ------------------------------ Forno ------------------------------ */

export interface ConfigForno {
  carne: IdCarne;
  peso: number;
}

export const FORNO_PADRAO: ConfigForno = { carne: 'pernil', peso: 3 };

export function ajustarForno(salvo: unknown): ConfigForno | undefined {
  if (!ehObjeto(salvo)) return undefined;
  const carnes: IdCarne[] = ['pernil', 'frango', 'tender', 'lombo'];
  return {
    carne: carnes.includes(salvo.carne as IdCarne) ? (salvo.carne as IdCarne) : 'pernil',
    peso: typeof salvo.peso === 'number' && salvo.peso >= 0.5 && salvo.peso <= 15 ? salvo.peso : 3,
  };
}

export function textoPessoas(n: number): string {
  return `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;
}
