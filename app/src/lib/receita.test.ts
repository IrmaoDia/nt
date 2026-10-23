import { describe, expect, it } from 'vitest';
import {
  avisosDaReceita,
  concordar,
  fatorDaReceita,
  formatarFracao,
  fracaoAmigavel,
  interpretarLinha,
  interpretarTexto,
  lerQuantidade,
  pluralizar,
  recalcularLinha,
  type UnidadeReceita,
} from './receita';

/** [linha, quantidade, unidade, ingrediente] */
const CASOS: [string, number | null, UnidadeReceita, string][] = [
  ['1 kg de batata', 1, 'kg', 'batata'],
  ['3 ovos', 3, 'unidade', 'ovos'],
  ['1 cenoura média', 1, 'unidade', 'cenoura média'],
  ['1/2 xícara de ervilha', 0.5, 'xicara', 'ervilha'],
  ['200 g de maionese', 200, 'g', 'maionese'],
  ['1 colher de sopa de suco de limão', 1, 'colher-sopa', 'suco de limão'],
  ['sal a gosto', null, 'a-gosto', 'sal'],
  ['meia xícara (chá) de óleo', 0.5, 'xicara', 'óleo'],
  ['2 dentes de alho picados', 2, 'dente', 'alho picados'],
  ['1 lata de leite condensado', 1, 'lata', 'leite condensado'],
  ['1 caixinha de creme de leite', 1, 'caixinha', 'creme de leite'],
  ['1 e 1/2 xícara de açúcar', 1.5, 'xicara', 'açúcar'],
  ['½ xícara de leite', 0.5, 'xicara', 'leite'],
  ['1 1/2 colher (sopa) de manteiga', 1.5, 'colher-sopa', 'manteiga'],
  ['2,5 kg de pernil', 2.5, 'kg', 'pernil'],
  ['500ml de leite integral', 500, 'ml', 'leite integral'],
  ['1 pacote de fermento em pó (10 g)', 1, 'pacote', 'fermento em pó (10 g)'],
  ['1 colher de chá de bicarbonato', 1, 'colher-cha', 'bicarbonato'],
  ['Uma pitada de noz-moscada', 1, 'pitada', 'noz-moscada'],
  ['4 c.s. de açúcar', 4, 'colher-sopa', 'açúcar'],
  ['1 c.c. de sal', 1, 'colher-cha', 'sal'],
  ['2 a 3 dentes de alho', 3, 'dente', 'alho'],
  ['Cheiro-verde a gosto', null, 'a-gosto', 'Cheiro-verde'],
  ['Azeite para regar', null, 'sem', 'Azeite para regar'],
  ['1 xícara de chá de farinha de trigo', 1, 'xicara', 'farinha de trigo'],
  ['1 lata (395 g) de leite condensado', 1, 'lata', 'leite condensado'],
  ['1 dúzia de ovos', 12, 'unidade', 'ovos'],
  ['- 3 colheres (sopa) rasas de amido de milho', 3, 'colher-sopa', 'amido de milho'],
  ['meio quilo de carne moída', 0.5, 'kg', 'carne moída'],
  ['1 l de água', 1, 'l', 'água'],
  ['Suco de 2 limões', 2, 'unidade', 'limões (suco)'],
  ['¾ de xícara de açúcar mascavo', 0.75, 'xicara', 'açúcar mascavo'],
  ['1 e meia xícara de leite', 1.5, 'xicara', 'leite'],
  ['200g de queijo parmesão ralado', 200, 'g', 'queijo parmesão ralado'],
  ['1 pitada de sal', 1, 'pitada', 'sal'],
  ['3 claras de ovo', 3, 'unidade', 'claras de ovo'],
  ['• 2 latas de milho verde', 2, 'lata', 'milho verde'],
  ['1 xíc. de leite de coco', 1, 'xicara', 'leite de coco'],
];

describe('interpretar ingredientes em português', () => {
  it.each(CASOS)('"%s"', (texto, quantidade, unidade, ingrediente) => {
    const l = interpretarLinha(texto);
    expect(l).not.toBeNull();
    expect(l!.quantidade === null ? null : Number(l!.quantidade.toFixed(4))).toBe(quantidade);
    expect(l!.unidade).toBe(unidade);
    expect(l!.ingrediente).toBe(ingrediente);
  });

  it('ignora linhas vazias e títulos, e para no "Modo de preparo"', () => {
    const linhas = interpretarTexto('Massa:\n\n2 ovos\n1 xícara de leite\nModo de preparo\n1. Bata tudo');
    expect(linhas.map((l) => l.ingrediente)).toEqual(['ovos', 'leite']);
  });

  it('quantidades com frações e palavras', () => {
    expect(lerQuantidade('1 1/2 xícara')?.valor).toBe(1.5);
    expect(lerQuantidade('1½ xícara')?.valor).toBe(1.5);
    expect(lerQuantidade('duas colheres')?.valor).toBe(2);
    expect(lerQuantidade('1.000 g')?.valor).toBe(1000);
    expect(lerQuantidade('um abacaxi')?.valor).toBe(1);
    expect(lerQuantidade('umbigo')).toBeNull();
    expect(lerQuantidade('farinha')).toBeNull();
  });
});

describe('plural', () => {
  it('concorda o ingrediente com a quantidade', () => {
    expect(concordar(5, 'cenoura média')).toBe('cenouras médias');
    expect(concordar(1, 'ovos')).toBe('ovo');
    expect(concordar(13, 'ovos')).toBe('ovos');
    expect(pluralizar('pão francês amanhecido')).toBe('pães franceses amanhecidos');
    expect(pluralizar('limão')).toBe('limões');
    expect(pluralizar('maçã')).toBe('maçãs');
    expect(pluralizar('clara de ovo')).toBe('claras de ovo');
    expect(pluralizar('pé de alface')).toBe('pés de alface');
  });
});

describe('frações amigáveis', () => {
  it('arredonda para ¼, ⅓, ½, ⅔, ¾', () => {
    expect(fracaoAmigavel(2.083)).toBe(2);
    expect(fracaoAmigavel(4.1667)).toBe(4.25);
    expect(fracaoAmigavel(1.3)).toBeCloseTo(4 / 3);
    expect(fracaoAmigavel(0.1)).toBe(0.25); // nunca zero
    expect(formatarFracao(2.25)).toBe('2 ¼');
    expect(formatarFracao(0.5)).toBe('½');
    expect(formatarFracao(4 / 3)).toBe('1 ⅓');
    expect(formatarFracao(3)).toBe('3');
  });
});

function recalcular(texto: string, serve: number, para: number) {
  return recalcularLinha(interpretarLinha(texto)!, fatorDaReceita(serve, para));
}

describe('recalcular', () => {
  it('receita de maionese de 6 para 25 pessoas', () => {
    const r = (t: string) => recalcular(t, 6, 25).texto;
    expect(r('1 kg de batata')).toBe('4,17 kg de batata');
    expect(r('3 ovos')).toBe('13 ovos'); // 12,5 → 13
    expect(r('1 cenoura média')).toBe('5 cenouras médias'); // 4,2 → 5
    expect(r('1/2 xícara de ervilha')).toBe('2 xícaras de ervilha'); // 2,08
    expect(r('200 g de maionese')).toBe('840 g de maionese'); // 833 → múltiplo de 10
    expect(r('1 colher de sopa de suco de limão')).toBe('4 ¼ colheres de sopa de suco de limão');
    expect(r('sal a gosto')).toBe('sal a gosto');
  });

  it('de 4 para 72 pessoas (18 vezes)', () => {
    const r = (t: string) => recalcular(t, 4, 72).texto;
    expect(r('3 ovos')).toBe('54 ovos');
    expect(r('1/2 xícara de leite')).toBe('9 xícaras de leite');
    expect(r('250 g de manteiga')).toBe('4,5 kg de manteiga');
    expect(r('300 ml de creme de leite')).toBe('5,4 litros de creme de leite');
    expect(r('2 dentes de alho')).toBe('36 dentes de alho');
    expect(r('1 lata de leite condensado')).toBe('18 latas de leite condensado');
    expect(r('1 pitada de sal')).toBe('1 pitada de sal'); // pitada fica como está
    expect(r('Cheiro-verde a gosto')).toBe('Cheiro-verde a gosto');
  });

  it('ovos e unidades sempre inteiros, para cima', () => {
    expect(recalcular('1 ovo', 4, 6).texto).toBe('2 ovos'); // 1,5 → 2
    expect(recalcular('2 ovos', 4, 3).texto).toBe('2 ovos'); // 1,5 → 2
    expect(recalcular('2 ovos', 8, 3).texto).toBe('1 ovo'); // 0,75 → 1
    expect(recalcular('1 lata de milho', 6, 7).texto).toBe('2 latas de milho');
  });

  it('gramas em múltiplos de 10 e kg a partir de 1000 g', () => {
    expect(recalcular('100 g de queijo', 3, 10).texto).toBe('340 g de queijo'); // 333
    expect(recalcular('300 g de queijo', 3, 10).texto).toBe('1 kg de queijo');
    expect(recalcular('5 g de fermento', 1, 1.5).texto).toBe('8 g de fermento'); // pequenas: de 1 em 1 g
  });
});

describe('avisos', () => {
  const linhas = ['1 kg de batata', 'sal a gosto'].map((t) => interpretarLinha(t)!);

  it('6 → 25 (4,2 vezes): sal, forno e quantidade grande', () => {
    expect(avisosDaReceita(linhas, fatorDaReceita(6, 25)).map((a) => a.id)).toEqual(['sal', 'forno', 'grande']);
  });
  it('4 → 10 (2,5 vezes): só o do forno', () => {
    expect(avisosDaReceita(linhas, fatorDaReceita(4, 10)).map((a) => a.id)).toEqual(['forno']);
  });
  it('sem multiplicar: nenhum aviso', () => {
    expect(avisosDaReceita(linhas, 1)).toEqual([]);
  });
  it('aviso de sal só aparece se tiver sal, fermento ou bicarbonato', () => {
    const semSal = [interpretarLinha('1 kg de batata')!];
    expect(avisosDaReceita(semSal, 5).map((a) => a.id)).toEqual(['forno', 'grande']);
  });
});
