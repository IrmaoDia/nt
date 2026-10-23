import { ORDEM_CATEGORIAS, type Categoria } from '../data/tipos';
import { formatarMassa, formatarNumero, formatarReais, formatarVolume, normalizar, primeiraMaiuscula } from './formato';
import type { ResultadoPrato } from './mesa';
import { NOMES_UNIDADE, formatarFracao, singularizarPalavra, type UnidadeReceita } from './receita';

/* =============================================================================
 *  LISTA DE COMPRAS E CUSTO
 *  Junta os pratos da Mesa, os ingredientes das receitas adicionadas e os itens
 *  livres. Itens com o mesmo nome e a mesma unidade são somados.
 * ========================================================================== */

/** Unidade de um item da lista. */
export interface UnidadeLista {
  /** Identifica a unidade para somar: itens só se somam com a mesma chave. */
  chave: string;
  tipo: 'kg' | 'litro' | 'contagem' | 'texto';
  singular: string;
  plural: string;
  /** "kg", "lata"… O preço é "R$ por" isto. null = preço do item inteiro. */
  precoPor: string | null;
}

export const KG: UnidadeLista = { chave: 'kg', tipo: 'kg', singular: 'kg', plural: 'kg', precoPor: 'kg' };
export const LITRO: UnidadeLista = { chave: 'litro', tipo: 'litro', singular: 'litro', plural: 'litros', precoPor: 'litro' };
export const TEXTO: UnidadeLista = { chave: 'texto', tipo: 'texto', singular: '', plural: '', precoPor: null };

export function contagem(singular: string, plural: string, comPrecoPorUnidade: boolean): UnidadeLista {
  return { chave: singular, tipo: 'contagem', singular, plural, precoPor: comPrecoPorUnidade ? singular : null };
}

/** Uma contribuição para a lista (de um prato, de uma receita ou digitada). */
export interface Entrada {
  nome: string;
  /** kg, litros ou número de unidades/embalagens; null para "a gosto". */
  quantidade: number | null;
  unidade: UnidadeLista;
  categoria: Categoria;
  origem: string;
  /** Texto para itens sem quantidade ("a gosto", "1 pitada"). */
  textoFixo?: string;
  /** Id do item livre, para poder remover. */
  idLivre?: string;
}

export interface ItemLista {
  chave: string;
  nome: string;
  quantidade: number | null;
  unidade: UnidadeLista;
  categoria: Categoria;
  origens: string[];
  texto: string;
  rotuloPreco: string;
  /** Itens livres que formam esta linha (para o botão Remover). */
  idsLivres: string[];
  /** true quando a linha veio só de itens livres. */
  soLivre: boolean;
}

/* ------------------------- Nome e seção do mercado ------------------------- */

const PALAVRAS_DESCARTADAS = new Set([
  'medio', 'media', 'pequeno', 'pequena', 'grande', 'picado', 'picada', 'ralado', 'ralada',
  'maduro', 'madura', 'amanhecido', 'fresco', 'fresca', 'gelado', 'gelada',
]);

/** Chave para somar nomes iguais: sem acento, no singular, sem tamanho e sem parênteses. */
export function chaveNome(nome: string): string {
  return nome
    .replace(/\([^)]*\)/g, ' ')
    .toLocaleLowerCase('pt-BR')
    .replace(/[-–—]/g, ' ')
    .split(/\s+/)
    .map((p) => normalizar(singularizarPalavra(p))) // singulariza antes de tirar o acento: limões → limão → limao
    .filter((p) => p && !PALAVRAS_DESCARTADAS.has(p))
    .join(' ');
}

/** Regras para descobrir a seção do mercado pelo nome (a primeira que combinar vale). */
const REGRAS_CATEGORIA: [RegExp, Categoria][] = [
  [/\bsuco de (limao|laranja)\b/, 'Hortifrúti'],
  [/\b(sal|pimenta do reino|pimenta|louro|cravo|canela|paprica|oregano|cominho|noz moscada|colorau|acafrao|curry|tempero|alecrim|tomilho|erva)\b/, 'Temperos'],
  [/\b(leite condensado|creme de leite|leite de coco|batata palha|uva passa|farinha|ameixa seca|damasco|pessego em calda|milho|ervilha|azeitona|maionese|mostarda|mel|oleo|azeite|vinagre|acucar|arroz|macarrao|massa|bolacha|biscoito|chocolate|amido|gelatina|fermento|bicarbonato|castanha|noz|panetone|chocotone|extrato|molho)\b/, 'Mercearia'],
  [/\b(refrigerante|suco|agua|vinho|espumante|cerveja|gelo|cha|ponche|sidra|bebida)\b/, 'Bebidas'],
  [/\b(leite|manteiga|margarina|queijo|requeijao|iogurte|presunto|bacon|mussarela|mucarela|parmesao|catupiry|nata|creme)\b/, 'Frios e Laticínios'],
  [/\b(pernil|chester|peru|frango|lombo|tender|picanha|file|lagarto|costela|carne|bacalhau|peixe|cacao|salmao|linguica|paleta|cupim|maminha|alcatra|coxa|sobrecoxa|peito|calabresa|pescada|tilapia)\b/, 'Carnes'],
  [/\b(batata|cebola|alho|cenoura|tomate|alface|rucula|agriao|cheiro verde|salsinha|cebolinha|coentro|limao|laranja|maca|manga|abacaxi|uva|banana|morango|pimentao|abobora|abobrinha|berinjela|chuchu|mandioquinha|mandioca|ovo|clara|gema|gengibre|hortela|manjericao|folha|couve|repolho|brocolis|vagem|pepino|mamao|kiwi|pessego|ameixa|fruta|legume|verdura|pe de alface)\b/, 'Hortifrúti'],
];

export function categorizar(nome: string): Categoria {
  const n = chaveNome(nome);
  for (const [re, categoria] of REGRAS_CATEGORIA) if (re.test(n)) return categoria;
  return 'Mercearia';
}

/* ------------------------------ Entradas ------------------------------ */

/** Pratos da Mesa → itens. Pratos cuja receita já foi adicionada à lista ficam de fora. */
export function entradasDaMesa(resultados: ResultadoPrato[], substituidos: Set<string>): Entrada[] {
  const entradas: Entrada[] = [];
  for (const r of resultados) {
    if (substituidos.has(r.prato.id) || r.quantidade <= 0) continue;
    const { tipo } = r;
    const base = { nome: tipo.nomeCompra ?? r.nome, categoria: tipo.categoria, origem: r.nome };
    if (tipo.embalagem && r.embalagens) {
      entradas.push({ ...base, quantidade: r.embalagens, unidade: contagem(tipo.embalagem.nome[0], tipo.embalagem.nome[1], true) });
    } else if (tipo.unidade === 'g') {
      entradas.push({ ...base, quantidade: r.quantidade / 1000, unidade: KG });
    } else if (tipo.unidade === 'ml') {
      entradas.push({ ...base, quantidade: r.quantidade / 1000, unidade: LITRO });
    } else {
      const [sing, plur] = tipo.nomeUnidade ?? ['unidade', 'unidades'];
      entradas.push({ ...base, quantidade: r.quantidade, unidade: contagem(sing, plur, true) });
    }
  }
  return entradas;
}

/** Ingrediente já recalculado de uma receita. */
export interface IngredienteNaLista {
  quantidade: number | null;
  unidade: UnidadeReceita;
  ingrediente: string;
}

export interface ReceitaNaLista {
  id: string;
  nome: string;
  pessoas: number;
  /** Prato da Mesa que esta receita detalha (ele sai da lista para não contar duas vezes). */
  pratoMesaId?: string;
  itens: IngredienteNaLista[];
}

const PRECO_POR_UNIDADE: UnidadeReceita[] = ['unidade', 'lata', 'caixinha', 'pacote'];

export function entradaDeIngrediente(i: IngredienteNaLista, origem: string): Entrada {
  // O nome fica como foi escrito ("Ovos"); a soma usa chaveNome, que já ignora plural e acentos.
  const nome = primeiraMaiuscula(i.ingrediente) || 'Item';
  const base = { nome, categoria: categorizar(nome), origem };
  const q = i.quantidade;
  switch (i.unidade) {
    case 'g':
      return { ...base, quantidade: (q ?? 0) / 1000, unidade: KG };
    case 'kg':
      return { ...base, quantidade: q ?? 0, unidade: KG };
    case 'ml':
      return { ...base, quantidade: (q ?? 0) / 1000, unidade: LITRO };
    case 'l':
      return { ...base, quantidade: q ?? 0, unidade: LITRO };
    case 'pitada':
      return { ...base, quantidade: null, unidade: TEXTO, textoFixo: `${q ?? 1} ${(q ?? 1) >= 2 ? 'pitadas' : 'pitada'}` };
    case 'a-gosto':
      return { ...base, quantidade: null, unidade: TEXTO, textoFixo: 'a gosto' };
    case 'sem':
      return { ...base, quantidade: null, unidade: TEXTO, textoFixo: '' };
    default: {
      const [sing, plur] = NOMES_UNIDADE[i.unidade];
      return { ...base, quantidade: q ?? 0, unidade: contagem(sing, plur, PRECO_POR_UNIDADE.includes(i.unidade)) };
    }
  }
}

export type UnidadeLivre = 'kg' | 'g' | 'litro' | 'ml' | 'unidade' | 'pacote' | 'lata' | 'caixa' | 'garrafa';

export const UNIDADES_LIVRES: { id: UnidadeLivre; rotulo: string }[] = [
  { id: 'unidade', rotulo: 'unidade' },
  { id: 'kg', rotulo: 'kg' },
  { id: 'g', rotulo: 'g' },
  { id: 'litro', rotulo: 'litro' },
  { id: 'ml', rotulo: 'ml' },
  { id: 'pacote', rotulo: 'pacote' },
  { id: 'lata', rotulo: 'lata' },
  { id: 'caixa', rotulo: 'caixa' },
  { id: 'garrafa', rotulo: 'garrafa' },
];

export interface ItemLivre {
  id: string;
  nome: string;
  quantidade: number;
  unidade: UnidadeLivre;
}

export function entradaLivre(item: ItemLivre): Entrada {
  const nome = primeiraMaiuscula(item.nome.trim()) || 'Item';
  const base = { nome, categoria: categorizar(nome), origem: 'Adicionado por você', idLivre: item.id };
  const q = item.quantidade;
  if (item.unidade === 'kg') return { ...base, quantidade: q, unidade: KG };
  if (item.unidade === 'g') return { ...base, quantidade: q / 1000, unidade: KG };
  if (item.unidade === 'litro') return { ...base, quantidade: q, unidade: LITRO };
  if (item.unidade === 'ml') return { ...base, quantidade: q / 1000, unidade: LITRO };
  const plurais: Record<string, string> = { unidade: 'unidades', pacote: 'pacotes', lata: 'latas', caixa: 'caixas', garrafa: 'garrafas' };
  return { ...base, quantidade: q, unidade: contagem(item.unidade, plurais[item.unidade], true) };
}

/* ------------------------------ Montagem ------------------------------ */

export function textoDoItem(quantidade: number | null, unidade: UnidadeLista, textoFixo = ''): string {
  if (quantidade === null || unidade.tipo === 'texto') return textoFixo;
  if (unidade.tipo === 'kg') return formatarMassa(Math.round(quantidade * 1000 * 100) / 100);
  if (unidade.tipo === 'litro') return formatarVolume(Math.round(quantidade * 1000 * 100) / 100);
  const n = Number.isInteger(Math.round(quantidade * 1000) / 1000) ? formatarNumero(quantidade) : formatarFracao(quantidade);
  return `${n} ${quantidade >= 2 ? unidade.plural : unidade.singular}`;
}

export function rotuloPreco(u: UnidadeLista): string {
  return u.precoPor ? `R$ por ${u.precoPor}` : 'R$ do item';
}

export function montarLista(entradas: Entrada[]): ItemLista[] {
  const mapa = new Map<string, ItemLista & { textoFixo?: string }>();
  for (const e of entradas) {
    const chave = `${chaveNome(e.nome)}|${e.unidade.chave}`;
    const atual = mapa.get(chave);
    if (!atual) {
      mapa.set(chave, {
        chave,
        nome: e.nome,
        quantidade: e.quantidade,
        unidade: e.unidade,
        categoria: e.categoria,
        origens: [e.origem],
        texto: '',
        rotuloPreco: rotuloPreco(e.unidade),
        idsLivres: e.idLivre ? [e.idLivre] : [],
        soLivre: Boolean(e.idLivre),
        textoFixo: e.textoFixo,
      });
      continue;
    }
    if (atual.quantidade !== null && e.quantidade !== null) {
      atual.quantidade = Math.round((atual.quantidade + e.quantidade) * 1e6) / 1e6;
    }
    if (!atual.origens.includes(e.origem)) atual.origens.push(e.origem);
    if (e.idLivre) atual.idsLivres.push(e.idLivre);
    atual.soLivre = atual.soLivre && Boolean(e.idLivre);
  }
  const itens = [...mapa.values()].map(({ textoFixo, ...item }) => ({
    ...item,
    texto: textoDoItem(item.quantidade, item.unidade, textoFixo),
  }));
  return itens.sort(
    (a, b) =>
      ORDEM_CATEGORIAS.indexOf(a.categoria) - ORDEM_CATEGORIAS.indexOf(b.categoria) ||
      a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

export function agruparPorCategoria(itens: ItemLista[]): { categoria: Categoria; itens: ItemLista[] }[] {
  return ORDEM_CATEGORIAS.map((categoria) => ({ categoria, itens: itens.filter((i) => i.categoria === categoria) })).filter(
    (g) => g.itens.length > 0,
  );
}

/* ------------------------------ Custo ------------------------------ */

export interface Custo {
  total: number;
  porPessoa: number;
  semPreco: number;
  subtotais: Record<string, number>;
}

/** Itens sem preço não entram no total. Preços salvos pela chave do item (nome + unidade). */
export function calcularCusto(itens: ItemLista[], precos: Record<string, number>, pessoas: number): Custo {
  const subtotais: Record<string, number> = {};
  let total = 0;
  let semPreco = 0;
  for (const item of itens) {
    const preco = precos[item.chave];
    if (preco && preco > 0) {
      const multiplicador = item.unidade.precoPor && item.quantidade !== null ? item.quantidade : 1;
      const sub = Math.round(preco * multiplicador * 100) / 100;
      subtotais[item.chave] = sub;
      total += sub;
    } else {
      semPreco++;
    }
  }
  total = Math.round(total * 100) / 100;
  return { total, porPessoa: pessoas > 0 ? total / pessoas : 0, semPreco, subtotais };
}

/** Lista para o WhatsApp (sem emojis de 4 bytes, que o wa.me estraga). */
export function textoListaWhatsapp(itens: ItemLista[], custo: Custo, resumo: string): string {
  const partes: string[] = ['★ *Lista de compras – Ceia Sem Erro* ★', resumo];
  for (const grupo of agruparPorCategoria(itens)) {
    partes.push('', `*${grupo.categoria}*`);
    for (const i of grupo.itens) {
      const sub = custo.subtotais[i.chave];
      const qtd = i.texto ? ` – ${i.texto}` : '';
      partes.push(`▢ ${i.nome}${qtd}${sub ? ` (${formatarReais(sub)})` : ''}`);
    }
  }
  if (custo.total > 0) {
    partes.push('', `*Total da ceia: ${formatarReais(custo.total)}*`, `Por pessoa: ${formatarReais(custo.porPessoa)}`);
    if (custo.semPreco > 0) partes.push(`(${custo.semPreco} ${custo.semPreco === 1 ? 'item sem preço' : 'itens sem preço'})`);
  }
  return partes.join('\n');
}

export function linkWhatsapp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
