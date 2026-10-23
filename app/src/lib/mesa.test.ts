import { describe, expect, it } from 'vitest';
import { arredondarParaCima, calcularMesa, fatorDoGrupo, pessoasEquivalentes, type PratoMesa } from './mesa';
import type { Apetite } from '../data/tipos';

let n = 0;
const prato = (tipo: string, nome = ''): PratoMesa => ({ id: `p${++n}`, tipo, nome });

function mesa(pratos: PratoMesa[], adultos: number, criancas = 0, apetite: Apetite = 'normal') {
  const r = calcularMesa(pratos, adultos, criancas, apetite);
  return (nome: string) => {
    const achado = r.find((x) => x.nome === nome);
    if (!achado) throw new Error(`Prato ${nome} não está na mesa`);
    return achado;
  };
}

// Mesa dos exemplos: pernil + chester, arroz, farofa, salpicão, pavê + pudim e refrigerante.
const MESA_EXEMPLO = () => [
  prato('carne-com-osso', 'Pernil'),
  prato('carne-com-osso', 'Chester'),
  prato('arroz', 'Arroz'),
  prato('farofa', 'Farofa'),
  prato('salada-fria', 'Salpicão'),
  prato('sobremesa', 'Pavê'),
  prato('sobremesa', 'Pudim'),
  prato('bebida-sem-alcool', 'Refrigerante'),
];

describe('pessoas', () => {
  it('crianças contam como meia porção', () => {
    expect(pessoasEquivalentes(2, 2, 'normal')).toBe(3);
  });
  it('apetite da turma', () => {
    expect(pessoasEquivalentes(10, 0, 'leve')).toBeCloseTo(8.5);
    expect(pessoasEquivalentes(10, 0, 'bem-servido')).toBeCloseTo(12);
  });
});

describe('regra de divisão no grupo', () => {
  it('1 prato: consumo cheio; 2 pratos: +15% dividido por 2; 3 pratos: +30% dividido por 3', () => {
    expect(fatorDoGrupo(1)).toBe(1);
    expect(fatorDoGrupo(2)).toBeCloseTo(0.575);
    expect(fatorDoGrupo(3)).toBeCloseTo(1.3 / 3);
  });

  it('pernil + chester para 15 pessoas não dão 400 g de cada: o total de carnes é dividido', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil'), prato('carne-com-osso', 'Chester')], 15);
    // 400 g × 15 × 1,15 = 6,9 kg de carne no total, metade para cada
    expect(p('Pernil').porPessoaEfetivo).toBeCloseTo(230);
    expect(p('Pernil').texto).toBe('3,5 kg'); // 3,45 kg → arredonda para cima em 0,1 kg
    expect(p('Chester').texto).toBe('3,5 kg');
  });

  it('a divisão segue a proporção do porPessoa de cada tipo (pernil 400 g × lombo 300 g)', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil'), prato('carne-sem-osso', 'Lombo')], 10);
    expect(p('Pernil').porPessoaEfetivo).toBeCloseTo(230);
    expect(p('Lombo').porPessoaEfetivo).toBeCloseTo(172.5);
    expect(p('Pernil').porPessoaEfetivo / p('Lombo').porPessoaEfetivo).toBeCloseTo(400 / 300);
  });

  it('pratos de grupos diferentes não se dividem', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil'), prato('arroz', 'Arroz')], 10);
    expect(p('Pernil').fatorGrupo).toBe(1);
    expect(p('Arroz').fatorGrupo).toBe(1);
  });
});

describe('mesas de exemplo', () => {
  it('1 pessoa', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil'), prato('arroz', 'Arroz'), prato('sobremesa', 'Pavê')], 1);
    expect(p('Pernil').texto).toBe('400 g');
    expect(p('Arroz').texto).toBe('100 g');
    expect(p('Arroz').textoEmbalagem).toBe('1 pacote de 1 kg');
    expect(p('Pavê').texto).toBe('1 porção');
  });

  it('7 pessoas', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil'), prato('arroz', 'Arroz'), prato('bebida-sem-alcool', 'Suco')], 7);
    expect(p('Pernil').texto).toBe('2,8 kg'); // 400 × 7, sem virar 2,9 por erro de arredondamento
    expect(p('Arroz').texto).toBe('500 g');
    expect(p('Suco').texto).toBe('3,5 litros');
    expect(p('Suco').textoEmbalagem).toBe('2 garrafas de 2 litros');
  });

  it('15 pessoas (mesa do exemplo)', () => {
    const p = mesa(MESA_EXEMPLO(), 15);
    expect(p('Pernil').texto).toBe('3,5 kg');
    expect(p('Chester').texto).toBe('3,5 kg');
    expect(p('Arroz').texto).toBe('700 g'); // 70 × 0,575 × 15 = 604 g
    expect(p('Arroz').textoEmbalagem).toBe('1 pacote de 1 kg');
    expect(p('Farofa').texto).toBe('400 g'); // 35 × 0,575 × 15 = 302 g
    expect(p('Farofa').textoEmbalagem).toBe('1 pacote de 500 g');
    expect(p('Salpicão').texto).toBe('2,3 kg');
    expect(p('Pavê').texto).toBe('9 porções'); // 0,575 × 15 = 8,6
    expect(p('Pudim').texto).toBe('9 porções');
    expect(p('Refrigerante').texto).toBe('7,5 litros');
    expect(p('Refrigerante').textoEmbalagem).toBe('4 garrafas de 2 litros');
  });

  it('72 pessoas (mesa do exemplo)', () => {
    const p = mesa(MESA_EXEMPLO(), 72);
    expect(p('Pernil').texto).toBe('16,6 kg');
    expect(p('Arroz').texto).toBe('2,9 kg');
    expect(p('Arroz').textoEmbalagem).toBe('3 pacotes de 1 kg');
    expect(p('Farofa').textoEmbalagem).toBe('3 pacotes de 500 g');
    expect(p('Salpicão').texto).toBe('10,8 kg');
    expect(p('Pavê').texto).toBe('42 porções');
    expect(p('Refrigerante').textoEmbalagem).toBe('18 garrafas de 2 litros');
  });

  it('crianças contam meia porção', () => {
    const p = mesa([prato('carne-com-osso', 'Pernil')], 4, 4); // 6 porções
    expect(p('Pernil').texto).toBe('2,4 kg');
  });

  it('apetite da turma', () => {
    expect(mesa([prato('carne-com-osso', 'Pernil')], 10, 0, 'leve')('Pernil').texto).toBe('3,4 kg');
    expect(mesa([prato('carne-com-osso', 'Pernil')], 10, 0, 'bem-servido')('Pernil').texto).toBe('4,8 kg');
  });

  it('espumante conta só os adultos (1 garrafa a cada 4)', () => {
    const p = mesa([prato('espumante', 'Espumante')], 8, 10);
    expect(p('Espumante').textoEmbalagem).toBe('2 garrafas de 750 ml');
    const soCriancas = mesa([prato('espumante', 'Espumante')], 0, 6);
    expect(soCriancas('Espumante').quantidade).toBe(0);
    expect(mesa([prato('espumante', 'Espumante')], 15)('Espumante').textoEmbalagem).toBe('4 garrafas de 750 ml');
  });

  it('panetone: 1 de 500 g a cada 8 pessoas', () => {
    expect(mesa([prato('panetone', 'Panetone')], 15)('Panetone').texto).toBe('2 panetones de 500 g');
    expect(mesa([prato('panetone', 'Panetone')], 8)('Panetone').texto).toBe('1 panetone de 500 g');
  });

  it('nome livre ou, sem nome, o nome do tipo', () => {
    const r = calcularMesa([prato('carne-com-osso', 'Pernil da minha mãe'), prato('arroz')], 5, 0, 'normal');
    expect(r.map((x) => x.nome)).toEqual(['Pernil da minha mãe', 'Arroz']);
  });
});

describe('arredondamentos', () => {
  it('sempre para cima, no passo do tipo', () => {
    expect(arredondarParaCima(2800.0000001, 100)).toBe(2800);
    expect(arredondarParaCima(2801, 100)).toBe(2900);
    expect(arredondarParaCima(8.625, 1)).toBe(9);
  });

  it('funciona de 1 a 500 pessoas em todos os tipos', () => {
    const todos = MESA_EXEMPLO().concat([prato('peixe', 'Bacalhau'), prato('panetone', 'Panetone'), prato('espumante', 'Espumante')]);
    for (const adultos of [1, 2, 3, 13, 72, 199, 500]) {
      for (const r of calcularMesa(todos, adultos, 0, 'normal')) {
        expect(r.quantidade).toBeGreaterThan(0);
        expect(r.texto).not.toMatch(/NaN|undefined|Infinity/);
      }
    }
  });
});
