import { formatarMassa, formatarNumero, formatarVolume, normalizar } from './formato';

/* =============================================================================
 *  AJUSTAR RECEITA — interpreta ingredientes em português e recalcula
 * ========================================================================== */

export type UnidadeReceita =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'xicara'
  | 'colher-sopa'
  | 'colher-cha'
  | 'unidade'
  | 'dente'
  | 'lata'
  | 'caixinha'
  | 'pacote'
  | 'pitada'
  | 'a-gosto'
  | 'sem';

/** Opções do seletor de unidade (na ordem em que aparecem). */
export const UNIDADES_RECEITA: { id: UnidadeReceita; rotulo: string }[] = [
  { id: 'unidade', rotulo: 'unidade' },
  { id: 'g', rotulo: 'g' },
  { id: 'kg', rotulo: 'kg' },
  { id: 'ml', rotulo: 'ml' },
  { id: 'l', rotulo: 'litro' },
  { id: 'xicara', rotulo: 'xícara' },
  { id: 'colher-sopa', rotulo: 'colher de sopa' },
  { id: 'colher-cha', rotulo: 'colher de chá' },
  { id: 'dente', rotulo: 'dente' },
  { id: 'lata', rotulo: 'lata' },
  { id: 'caixinha', rotulo: 'caixinha' },
  { id: 'pacote', rotulo: 'pacote' },
  { id: 'pitada', rotulo: 'pitada' },
  { id: 'a-gosto', rotulo: 'a gosto' },
  { id: 'sem', rotulo: 'sem quantidade' },
];

export const NOMES_UNIDADE: Record<UnidadeReceita, [string, string]> = {
  g: ['g', 'g'],
  kg: ['kg', 'kg'],
  ml: ['ml', 'ml'],
  l: ['litro', 'litros'],
  xicara: ['xícara', 'xícaras'],
  'colher-sopa': ['colher de sopa', 'colheres de sopa'],
  'colher-cha': ['colher de chá', 'colheres de chá'],
  unidade: ['unidade', 'unidades'],
  dente: ['dente', 'dentes'],
  lata: ['lata', 'latas'],
  caixinha: ['caixinha', 'caixinhas'],
  pacote: ['pacote', 'pacotes'],
  pitada: ['pitada', 'pitadas'],
  'a-gosto': ['a gosto', 'a gosto'],
  sem: ['', ''],
};

/** Unidades que não mudam ao recalcular. */
export const SEM_RECALCULO: UnidadeReceita[] = ['pitada', 'a-gosto', 'sem'];

export interface LinhaReceita {
  id: string;
  quantidade: number | null;
  unidade: UnidadeReceita;
  ingrediente: string;
}

let contador = 0;
export function novoId(): string {
  contador = (contador + 1) % 1e6;
  return `${Date.now().toString(36)}-${contador.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------------------------- Quantidades ---------------------------- */

const FRACOES: Record<string, number> = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
  '⅕': 1 / 5,
};
const FR = '[½⅓⅔¼¾⅛⅜⅝⅞⅕]';
const NUM = '\\d+(?:[.,]\\d+)?';
// Depois de uma palavra-número, não pode vir outra letra ("um" sim, "uma" sim, "umbigo" não).
const FIM_PALAVRA = '(?![a-zà-úç])';

const PALAVRAS_NUMERO: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  doze: 12,
  meio: 0.5,
  meia: 0.5,
};

const decimal = (s: string) => Number(s.replace(',', '.'));

/**
 * Lê a quantidade no começo do texto. Entende "2", "2,5", "1/2", "½", "1½",
 * "1 1/2", "1 e 1/2", "1 e meia", "meia", "uma", "2 a 3" (usa o maior) e "1.000".
 */
export function lerQuantidade(texto: string): { valor: number; resto: string } | null {
  const s = texto.trim();
  const tentativas: [RegExp, (m: RegExpMatchArray) => number][] = [
    [/^(\d+)\s+e\s+(\d+)\s*\/\s*(\d+)/i, (m) => +m[1] + +m[2] / +m[3]],
    [new RegExp(`^(\\d+)\\s+e\\s+(${FR})`, 'i'), (m) => +m[1] + FRACOES[m[2]]],
    [new RegExp(`^(\\d+)\\s+e\\s+(meia|meio)${FIM_PALAVRA}`, 'i'), (m) => +m[1] + 0.5],
    [/^(\d+)\s+(\d+)\s*\/\s*(\d+)/, (m) => +m[1] + +m[2] / +m[3]],
    [new RegExp(`^(\\d+)\\s*(${FR})`), (m) => +m[1] + FRACOES[m[2]]],
    [/^(\d+)\s*\/\s*(\d+)/, (m) => +m[1] / +m[2]],
    [new RegExp(`^(${FR})`), (m) => FRACOES[m[1]]],
    [/^(\d{1,3}(?:\.\d{3})+)(?![\d,])/, (m) => Number(m[1].replace(/\./g, ''))],
    [new RegExp(`^(${NUM})\\s*(?:a|-|–|ou)\\s*(${NUM})(?![\\d/])`, 'i'), (m) => Math.max(decimal(m[1]), decimal(m[2]))],
    [new RegExp(`^(${NUM})`), (m) => decimal(m[1])],
  ];
  for (const [re, valor] of tentativas) {
    const m = s.match(re);
    if (m) return { valor: valor(m), resto: s.slice(m[0].length).trim() };
  }
  const palavra = s.match(new RegExp(`^(uma?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|doze|meia|meio)${FIM_PALAVRA}`, 'i'));
  if (palavra) {
    return { valor: PALAVRAS_NUMERO[normalizar(palavra[1])], resto: s.slice(palavra[0].length).trim() };
  }
  return null;
}

/* ------------------------------ Unidades ------------------------------ */

const FIM = '(?=[\\s.,;:()]|$)';
const PADROES_UNIDADE: [RegExp, UnidadeReceita][] = [
  [new RegExp(`^(?:quilogramas?|quilos?|kilos?|kgs?)\\.?${FIM}`, 'i'), 'kg'],
  [new RegExp(`^(?:gramas?|grs?|g)\\.?${FIM}`, 'i'), 'g'],
  [new RegExp(`^(?:mililitros?|ml)\\.?${FIM}`, 'i'), 'ml'],
  [new RegExp(`^(?:litros?|lts?|l)\\.?${FIM}`, 'i'), 'l'],
  [/^(?:colher(?:es)?|col\.?|c\.)\s*\(?\s*(?:de\s+)?(?:sopa|sobremesa)\s*\)?/i, 'colher-sopa'],
  [/^(?:colher(?:es)?|col\.?|c\.)\s*\(?\s*(?:de\s+)?ch[aá]\s*\)?/i, 'colher-cha'],
  [new RegExp(`^c\\.?\\s?s\\.?${FIM}`, 'i'), 'colher-sopa'],
  [new RegExp(`^c\\.?\\s?c\\.?${FIM}`, 'i'), 'colher-cha'],
  [new RegExp(`^colher(?:es)?${FIM}`, 'i'), 'colher-sopa'],
  [/^(?:x[ií]caras?|x[ií]c\.?)(?:\s*\(\s*(?:de\s+)?ch[aá]\s*\)|\s+de\s+ch[aá](?=\s+de\s))?/i, 'xicara'],
  [new RegExp(`^(?:unidades?|unid\\.?|und\\.?|un\\.?)${FIM}`, 'i'), 'unidade'],
  [new RegExp(`^dentes?${FIM}`, 'i'), 'dente'],
  [new RegExp(`^(?:latas?|latinhas?)${FIM}`, 'i'), 'lata'],
  [new RegExp(`^(?:caixinhas?|caixas?|cx\\.?)${FIM}`, 'i'), 'caixinha'],
  [new RegExp(`^(?:pacotes?|pacotinhos?|pct\\.?|sach[eê]s?|envelopes?)${FIM}`, 'i'), 'pacote'],
  [new RegExp(`^pitadas?${FIM}`, 'i'), 'pitada'],
];

const A_GOSTO = /\s*\b(?:a\s+gosto|q\.\s?b\.?|quanto\s+baste)(?=[\s.,;:()]|$)\s*/i;

function limparIngrediente(t: string): string {
  return t
    .replace(/^\s*\([^)]*\)\s*/, '') // "(395 g)" logo depois da unidade
    .replace(/^\s*(?:rasas?|cheias?|bem\s+cheias?)(?=[\s.,;:]|$)\s*/i, '')
    .replace(/^\s*(?:de|do|da|dos|das)\s+/i, '')
    .replace(/[\s.,;:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Interpreta uma linha de ingrediente. Devolve null para linhas vazias ou títulos ("Massa:"). */
export function interpretarLinha(texto: string): LinhaReceita | null {
  const s = texto
    .trim()
    .replace(/^[-–—•*·▪▢☐✓✔>]+\s*/, '')
    .replace(/^\d+\)\s+/, '')
    .trim();
  if (!s || /:$/.test(s) || /^ingredientes$/i.test(s)) return null;

  const aGosto = A_GOSTO.test(s);
  const semGosto = s.replace(A_GOSTO, ' ').replace(/\s+/g, ' ').trim();
  const q = lerQuantidade(semGosto);

  if (!q) {
    // "pitada de sal"
    const pit = semGosto.match(new RegExp(`^pitadas?${FIM}`, 'i'));
    if (pit) return { id: novoId(), quantidade: 1, unidade: 'pitada', ingrediente: limparIngrediente(semGosto.slice(pit[0].length)) };
    // "Suco de 2 limões", "Raspas de 1 laranja"
    const parte = semGosto.match(/^(suco|raspas?|casca)\s+de\s+(.+)$/i);
    const qParte = parte ? lerQuantidade(parte[2]) : null;
    if (parte && qParte) {
      return {
        id: novoId(),
        quantidade: qParte.valor,
        unidade: 'unidade',
        ingrediente: `${limparIngrediente(qParte.resto)} (${parte[1].toLocaleLowerCase('pt-BR')})`,
      };
    }
    return { id: novoId(), quantidade: null, unidade: aGosto ? 'a-gosto' : 'sem', ingrediente: limparIngrediente(semGosto || s) };
  }

  let valor = q.valor;
  let resto = q.resto;
  let unidade: UnidadeReceita = 'unidade';

  const duzia = resto.match(new RegExp(`^d[uú]zias?${FIM}`, 'i'));
  if (duzia) {
    valor *= 12;
    resto = resto.slice(duzia[0].length);
  } else {
    // "¾ de xícara de açúcar": o "de" pode vir antes da unidade.
    const semDe = resto.replace(/^de\s+/i, '');
    procura: for (const alvo of [resto, semDe]) {
      for (const [re, u] of PADROES_UNIDADE) {
        const m = alvo.match(re);
        if (m) {
          unidade = u;
          resto = alvo.slice(m[0].length);
          break procura;
        }
      }
    }
  }
  return { id: novoId(), quantidade: valor, unidade, ingrediente: limparIngrediente(resto) };
}

/** Interpreta o texto colado (uma linha por ingrediente). Para no "Modo de preparo". */
export function interpretarTexto(texto: string): LinhaReceita[] {
  const linhas: LinhaReceita[] = [];
  for (const bruta of texto.split(/\r?\n/)) {
    if (/^\s*modo\s+de\s+(preparo|fazer)/i.test(bruta)) break;
    const l = interpretarLinha(bruta);
    if (l && (l.ingrediente || l.quantidade !== null)) linhas.push(l);
  }
  return linhas;
}

/* ------------------------------ Plural ------------------------------ */

const PALAVRAS_FIXAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'com', 'sem', 'em', 'para', 'a', 'o', 'ao']);

function pluralizarPalavra(p: string): string {
  const l = p.toLocaleLowerCase('pt-BR');
  if (PALAVRAS_FIXAS.has(l) || /\d/.test(l)) return p;
  if (l.includes('-')) {
    const [primeira, ...resto] = p.split('-');
    return [pluralizarPalavra(primeira), ...resto].join('-');
  }
  if (l === 'pão') return p.slice(0, -2) + 'ães';
  if (/ês$/.test(l)) return p.slice(0, -2) + 'eses';
  if (/s$/.test(l)) return p;
  if (/ão$/.test(l)) return p.slice(0, -2) + 'ões';
  if (/[aeiouáéíóúâêôãõ]$/.test(l)) return p + 's';
  if (/[rz]$/.test(l)) return p + 'es';
  if (/m$/.test(l)) return p.slice(0, -1) + 'ns';
  if (/[aeou]l$/.test(l)) return p.slice(0, -1) + 'is';
  return p;
}

export function singularizarPalavra(p: string): string {
  const l = p.toLocaleLowerCase('pt-BR');
  if (PALAVRAS_FIXAS.has(l) || /\d/.test(l)) return p;
  if (l.includes('-')) {
    const [primeira, ...resto] = p.split('-');
    return [singularizarPalavra(primeira), ...resto].join('-');
  }
  if (/(ões|ães)$/.test(l)) return p.slice(0, -3) + 'ão';
  if (/eses$/.test(l)) return p.slice(0, -4) + 'ês';
  if (/ns$/.test(l)) return p.slice(0, -2) + 'm';
  if (/[rz]es$/.test(l)) return p.slice(0, -2);
  if (/[aeo]is$/.test(l)) return p.slice(0, -2) + 'l';
  if (/[aeiouáéíóúâêôã]s$/.test(l)) return p.slice(0, -1);
  return p;
}

/** Aplica nas palavras do nome, até o primeiro "de", vírgula ou parêntese: "cenoura média" → "cenouras médias". */
function trocarNumero(texto: string, fn: (p: string) => string): string {
  const corte = texto.search(/\s(?:de|do|da|dos|das|com|para)\s|[,(]/i);
  const cabeca = corte === -1 ? texto : texto.slice(0, corte);
  const cauda = corte === -1 ? '' : texto.slice(corte);
  return cabeca.split(' ').map(fn).join(' ') + cauda;
}

export function pluralizar(texto: string): string {
  return trocarNumero(texto, pluralizarPalavra);
}

export function singularizar(texto: string): string {
  return trocarNumero(texto, singularizarPalavra);
}

/** "3 ovos", "1 ovo", "5 cenouras médias". */
export function concordar(n: number, texto: string): string {
  return n >= 2 ? pluralizar(texto) : singularizar(texto);
}

/* ------------------------------ Recálculo ------------------------------ */

const FRACOES_AMIGAVEIS: [number, string][] = [
  [0, ''],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [1, ''],
];

/** Arredonda para a fração de cozinha mais próxima (¼, ⅓, ½, ⅔, ¾). Nunca menos que ¼. */
export function fracaoAmigavel(v: number): number {
  if (v >= 10) return Math.max(0.5, Math.round(v * 2) / 2);
  const inteiro = Math.floor(v);
  const resto = v - inteiro;
  let melhor = 0;
  for (const [f] of FRACOES_AMIGAVEIS) if (Math.abs(resto - f) <= Math.abs(resto - melhor) + 1e-9) melhor = f;
  return Math.max(1 / 4, inteiro + melhor);
}

/** 2.25 → "2 ¼"; 0.5 → "½"; 3 → "3"; 1.5 → "1 ½". */
export function formatarFracao(v: number): string {
  const inteiro = Math.floor(v + 1e-9);
  const resto = v - inteiro;
  const simbolo = FRACOES_AMIGAVEIS.find(([f]) => Math.abs(f - resto) < 0.01)?.[1];
  if (simbolo === undefined) return formatarNumero(Math.round(v * 100) / 100);
  if (!simbolo) return formatarNumero(resto > 0.5 ? inteiro + 1 : inteiro);
  return inteiro > 0 ? `${inteiro} ${simbolo}` : simbolo;
}

function multiplo(valor: number, passo: number): number {
  return Math.ceil(valor / passo - 1e-9) * passo;
}

const UNIDADES_FRACAO: UnidadeReceita[] = ['xicara', 'colher-sopa', 'colher-cha'];
const UNIDADES_INTEIRAS: UnidadeReceita[] = ['unidade', 'dente', 'lata', 'caixinha', 'pacote'];

/** Texto de uma linha: "4,17 kg de batata", "13 ovos", "2 ¼ xícaras de ervilha", "sal a gosto". */
export function textoDaLinha(quantidade: number | null, unidade: UnidadeReceita, ingrediente: string): string {
  if (unidade === 'a-gosto') return `${ingrediente} a gosto`;
  if (unidade === 'sem' || quantidade === null) return ingrediente;
  const de = ingrediente ? ` de ${ingrediente}` : '';
  if (unidade === 'g') return formatarMassa(quantidade) + de;
  if (unidade === 'kg') return formatarMassa(quantidade * 1000) + de;
  if (unidade === 'ml') return formatarVolume(quantidade) + de;
  if (unidade === 'l') return formatarVolume(quantidade * 1000) + de;
  if (unidade === 'unidade') return `${formatarNumero(quantidade)} ${concordar(quantidade, ingrediente)}`.trim();
  const [sing, plur] = NOMES_UNIDADE[unidade];
  const n = UNIDADES_FRACAO.includes(unidade) ? formatarFracao(quantidade) : formatarNumero(quantidade);
  return `${n} ${quantidade >= 2 ? plur : sing}${de}`;
}

export interface ResultadoLinha {
  quantidade: number | null;
  unidade: UnidadeReceita;
  ingrediente: string;
  texto: string;
  /** Como estava na receita original. */
  original: string;
}

export function recalcularLinha(l: LinhaReceita, fator: number): ResultadoLinha {
  const original = textoDaLinha(l.quantidade, l.unidade, l.ingrediente);
  const igual = { quantidade: l.quantidade, unidade: l.unidade, ingrediente: l.ingrediente, texto: original, original };
  if (l.quantidade === null || SEM_RECALCULO.includes(l.unidade)) return igual;

  const v = l.quantidade * fator;
  let quantidade: number;
  let unidade = l.unidade;
  let ingrediente = l.ingrediente;

  if (unidade === 'g' || unidade === 'kg' || unidade === 'ml' || unidade === 'l') {
    const base = unidade === 'kg' || unidade === 'l' ? v * 1000 : v;
    // Múltiplos de 10 (g ou ml); quantidades muito pequenas, de 1 em 1.
    quantidade = base < 10 ? multiplo(base, 1) : multiplo(base, 10);
    unidade = unidade === 'kg' || unidade === 'g' ? 'g' : 'ml';
  } else if (UNIDADES_FRACAO.includes(unidade)) {
    quantidade = fracaoAmigavel(v);
  } else if (UNIDADES_INTEIRAS.includes(unidade)) {
    quantidade = Math.max(1, multiplo(v, 1)); // ovos e unidades: sempre inteiros, para cima
    if (unidade === 'unidade') ingrediente = concordar(quantidade, ingrediente);
  } else {
    return igual;
  }
  return { quantidade, unidade, ingrediente, texto: textoDaLinha(quantidade, unidade, ingrediente), original };
}

export function fatorDaReceita(serve: number, fazerPara: number): number {
  return serve > 0 && fazerPara > 0 ? fazerPara / serve : 1;
}

export interface Aviso {
  id: 'sal' | 'forno' | 'grande';
  titulo?: string;
  texto: string;
}

export function avisosDaReceita(linhas: LinhaReceita[], fator: number): Aviso[] {
  const avisos: Aviso[] = [];
  const temSensivel = linhas.some((l) => /\b(sal|fermento|bicarbonato)\b/.test(normalizar(l.ingrediente)));
  if (fator > 3 && temSensivel) {
    avisos.push({
      id: 'sal',
      titulo: 'Sal, fermento e bicarbonato',
      texto: 'Ao multiplicar mais de 3 vezes, coloque um pouco menos e prove.',
    });
  }
  if (Math.abs(fator - 1) > 1e-9) {
    avisos.push({
      id: 'forno',
      texto: 'O tempo de forno não multiplica: depende do tamanho da forma ou da peça. Veja a aba Forno.',
    });
  }
  if (fator > 4) {
    avisos.push({ id: 'grande', texto: 'Para quantidades grandes, prefira fazer em mais de uma forma ou panela.' });
  }
  return avisos;
}

/** Texto da receita para o WhatsApp (sem emojis de 4 bytes, que o wa.me estraga). */
export function textoReceitaWhatsapp(
  nome: string,
  serve: number,
  fazerPara: number,
  resultados: ResultadoLinha[],
  avisos: Aviso[],
): string {
  const partes = [
    `★ *${nome || 'Receita'}* ★`,
    `Para ${fazerPara} ${fazerPara === 1 ? 'pessoa' : 'pessoas'} (a receita original serve ${serve})`,
    '',
    ...resultados.map((r) => `▢ ${r.texto}`),
  ];
  if (avisos.length) partes.push('', ...avisos.map((a) => `• ${a.titulo ? `${a.titulo}: ` : ''}${a.texto}`));
  partes.push('', '_Calculadora Ceia Sem Erro_');
  return partes.join('\n');
}
