import { describe, expect, it } from 'vitest';
import {
  calcularCusto,
  categorizar,
  entradaDeIngrediente,
  entradaLivre,
  entradasDaMesa,
  montarLista,
  textoListaWhatsapp,
  type ItemLista,
} from './custo';
import { calcularMesa, type PratoMesa } from './mesa';
import { fatorDaReceita, interpretarLinha, recalcularLinha } from './receita';

/** Ingredientes de uma receita, recalculados, como entradas da lista. */
function daReceita(nome: string, linhas: string[], serve = 1, para = 1) {
  return linhas.map((t) => entradaDeIngrediente(recalcularLinha(interpretarLinha(t)!, fatorDaReceita(serve, para)), nome));
}

function item(itens: ItemLista[], nome: string) {
  const achados = itens.filter((i) => i.nome.toLowerCase().startsWith(nome.toLowerCase()));
  expect(achados).toHaveLength(1);
  return achados[0];
}

describe('soma de itens iguais', () => {
  it('mesmo nome e mesma unidade se somam (g e kg viram a mesma unidade)', () => {
    const lista = montarLista([
      ...daReceita('Farofa', ['200 g de manteiga', '3 ovos']),
      ...daReceita('Pavê', ['0,3 kg de manteiga', '2 ovos']),
    ]);
    expect(item(lista, 'Manteiga').texto).toBe('500 g');
    expect(item(lista, 'Manteiga').origens).toEqual(['Farofa', 'Pavê']);
    expect(item(lista, 'Ovos').texto).toBe('5 unidades');
  });

  it('plural, acento e tamanho não atrapalham a soma', () => {
    const lista = montarLista([...daReceita('A', ['1 cebola média', '2 limões']), ...daReceita('B', ['2 cebolas', '1 limão'])]);
    expect(item(lista, 'Cebola').texto).toBe('3 unidades');
    expect(item(lista, 'Limõ').texto).toBe('3 unidades');
  });

  it('unidades diferentes não se somam', () => {
    const lista = montarLista(daReceita('A', ['1 lata de milho verde', '200 g de milho verde']));
    expect(lista.filter((i) => i.nome === 'Milho verde')).toHaveLength(2);
  });

  it('item livre se soma com o da receita', () => {
    const lista = montarLista([
      ...daReceita('Pavê', ['600 ml de leite']),
      entradaLivre({ id: 'x', nome: 'leite', quantidade: 1, unidade: 'litro' }),
    ]);
    expect(item(lista, 'Leite').texto).toBe('1,6 litro');
    expect(item(lista, 'Leite').soLivre).toBe(false);
  });

  it('"a gosto" aparece uma vez só', () => {
    const lista = montarLista(daReceita('A', ['sal a gosto', 'Sal a gosto']));
    expect(item(lista, 'Sal').texto).toBe('a gosto');
  });
});

describe('Mesa na lista de compras', () => {
  const pratos: PratoMesa[] = [
    { id: 'p1', tipo: 'carne-com-osso', nome: 'Pernil' },
    { id: 'p2', tipo: 'arroz', nome: 'Arroz com passas' },
    { id: 'p3', tipo: 'arroz', nome: 'Arroz branco' },
    { id: 'p4', tipo: 'salada-fria', nome: 'Maionese' },
  ];
  const resultados = calcularMesa(pratos, 10, 0, 'normal');

  it('carnes em kg, arroz em pacotes (dois arrozes somam na mesma linha)', () => {
    const lista = montarLista(entradasDaMesa(resultados, new Set()));
    expect(item(lista, 'Pernil').texto).toBe('4 kg');
    expect(item(lista, 'Pernil').categoria).toBe('Carnes');
    expect(item(lista, 'Arroz').texto).toBe('2 pacotes de 1 kg');
    expect(item(lista, 'Arroz').rotuloPreco).toBe('R$ por pacote de 1 kg');
  });

  it('quando a receita de um prato vai para a lista, ela substitui a linha do prato', () => {
    const lista = montarLista([
      ...entradasDaMesa(resultados, new Set(['p4'])),
      ...daReceita('Maionese', ['1 kg de batata', '3 ovos']),
    ]);
    expect(lista.find((i) => i.nome === 'Maionese')).toBeUndefined();
    expect(item(lista, 'Batata').texto).toBe('1 kg');
  });
});

describe('seção do mercado', () => {
  it.each([
    ['Pernil suíno', 'Carnes'],
    ['Peito de frango', 'Carnes'],
    ['Cebolas médias', 'Hortifrúti'],
    ['Ovos', 'Hortifrúti'],
    ['Batata palha', 'Mercearia'],
    ['Leite condensado', 'Mercearia'],
    ['Leite integral', 'Frios e Laticínios'],
    ['Manteiga', 'Frios e Laticínios'],
    ['Sal', 'Temperos'],
    ['Noz-moscada', 'Temperos'],
    ['Pimenta-do-reino', 'Temperos'],
    ['Pimentão vermelho', 'Hortifrúti'],
    ['Suco de limão', 'Hortifrúti'],
    ['Refrigerante', 'Bebidas'],
    ['Uva-passa', 'Mercearia'],
    ['Coisa desconhecida', 'Mercearia'],
  ])('%s → %s', (nome, categoria) => {
    expect(categorizar(nome)).toBe(categoria);
  });
});

describe('custo', () => {
  const lista = montarLista([
    ...daReceita('A', ['2 kg de batata', '1 lata de leite condensado', 'sal a gosto']),
  ]);
  const chave = (nome: string) => item(lista, nome).chave;

  it('preço por kg, por lata e preço do item inteiro', () => {
    const custo = calcularCusto(lista, { [chave('Batata')]: 5.5, [chave('Leite')]: 7, [chave('Sal')]: 3 }, 4);
    expect(custo.subtotais[chave('Batata')]).toBe(11);
    expect(custo.subtotais[chave('Leite')]).toBe(7);
    expect(custo.subtotais[chave('Sal')]).toBe(3);
    expect(custo.total).toBe(21);
    expect(custo.porPessoa).toBe(5.25);
    expect(custo.semPreco).toBe(0);
  });

  it('itens sem preço ficam fora do total e são contados', () => {
    const custo = calcularCusto(lista, { [chave('Batata')]: 5.5 }, 4);
    expect(custo.total).toBe(11);
    expect(custo.semPreco).toBe(2);
  });

  it('WhatsApp: agrupado, com total e sem emojis que o wa.me estraga', () => {
    const custo = calcularCusto(lista, { [chave('Batata')]: 5.5 }, 4);
    const texto = textoListaWhatsapp(lista, custo, 'Ceia para 4 pessoas');
    expect(texto).toContain('*Hortifrúti*');
    expect(texto).toContain('▢ Batata – 2 kg (R$ 11,00)');
    expect(texto).toContain('Total da ceia: R$ 11,00');
    expect([...texto].every((c) => c.codePointAt(0)! <= 0xffff)).toBe(true);
  });
});
