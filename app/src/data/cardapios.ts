/**
 * ============================================================================
 *  CARDÁPIOS PRONTOS DO GUIA — atalhos para preencher a mesa
 * ============================================================================
 *  Ao escolher um cardápio no app, os pratos dele entram na Mesa (e continuam
 *  editáveis). A QUANTIDADE de cada prato vem do seu tipo, em tiposDePrato.ts.
 *
 *  Cada prato tem:
 *    id ............ código interno (não mude depois de publicar)
 *    nome .......... nome do prato
 *    tipo .......... id de um tipo em tiposDePrato.ts (ex.: 'carne-com-osso')
 *    serve ......... para quantas pessoas é a receita abaixo
 *    ingredientes .. a receita, uma linha por ingrediente, escrita como se
 *                    escreve num caderno de receitas ("2 dentes de alho",
 *                    "sal a gosto"). É o que aparece em "Ajustar a receita
 *                    deste prato", já recalculado para a mesa.
 *
 *  ⚠️ Receitas-base para 10 pessoas, derivadas dos cardápios do ebook.
 *  Revise com quem cozinha antes de publicar.
 * ============================================================================
 */
import type { IdCardapio } from './tipos';

export interface PratoDoGuia {
  id: string;
  nome: string;
  tipo: string;
  serve: number;
  ingredientes: string[];
}

export interface CardapioPronto {
  id: IdCardapio;
  nome: string;
  resumo: string;
  pratos: PratoDoGuia[];
}

const PERNIL_CERVEJA_PRETA: string[] = [
  '4 kg de pernil suíno com osso',
  '800 ml de cerveja preta',
  '3 cebolas médias',
  '15 dentes de alho',
  'Suco de 3 laranjas',
  'Suco de 2 limões',
  '4 colheres de sopa de óleo',
  '2 colheres de sopa de sal',
  '1 colher de sopa de páprica doce',
  '1 colher de chá de pimenta-do-reino',
  '4 folhas de louro',
];

export const CARDAPIOS_PRONTOS: CardapioPronto[] = [
  // ══════════════════════════ ECONÔMICO ══════════════════════════
  {
    id: 'economico',
    nome: 'Econômico',
    resumo: 'Frango assado, arroz à grega, farofa, salpicão, pavê e refresco.',
    pratos: [
      {
        id: 'frango-assado-batatas',
        nome: 'Frango inteiro assado com batatas',
        tipo: 'carne-com-osso',
        serve: 10,
        ingredientes: [
          '4 kg de frango inteiro',
          '1,5 kg de batata',
          '4 cebolas médias',
          '12 dentes de alho',
          'Suco de 3 limões',
          '100 ml de óleo',
          '2 colheres de sopa de sal',
          '1 colher de sopa de páprica doce',
          '1 colher de chá de pimenta-do-reino',
        ],
      },
      {
        id: 'arroz-a-grega',
        nome: 'Arroz à grega',
        tipo: 'arroz',
        serve: 10,
        ingredientes: [
          '700 g de arroz',
          '2 cenouras médias',
          '1 lata de ervilha',
          '1 lata de milho verde',
          '1 pimentão vermelho',
          '1 cebola média',
          '4 dentes de alho',
          '3 colheres de sopa de óleo',
          '1 colher de sopa de sal',
        ],
      },
      {
        id: 'farofa-bacon',
        nome: 'Farofa de bacon',
        tipo: 'farofa',
        serve: 10,
        ingredientes: [
          '350 g de farinha de mandioca',
          '150 g de bacon em cubos',
          '1 cebola média',
          '3 colheres de sopa de manteiga',
          '3 dentes de alho',
          'Sal a gosto',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'salpicao-frango',
        nome: 'Salpicão de frango',
        tipo: 'salada-fria',
        serve: 10,
        ingredientes: [
          '700 g de peito de frango',
          '350 g de maionese',
          '2 cenouras médias',
          '1 caixinha de creme de leite',
          '1 lata de milho verde',
          '100 g de batata palha',
          '1 maçã',
          '1 cebola pequena',
          'Suco de 1/2 limão',
          'Sal a gosto',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'pave-bolacha',
        nome: 'Pavê de bolacha',
        tipo: 'sobremesa',
        serve: 10,
        ingredientes: [
          '1 lata de leite condensado',
          '600 ml de leite',
          '2 ovos',
          '2 colheres de sopa de amido de milho',
          '1 caixinha de creme de leite',
          '200 g de bolacha maisena',
          '2 colheres de sopa de chocolate em pó',
        ],
      },
      {
        id: 'refresco-natalino',
        nome: 'Refresco natalino de frutas',
        tipo: 'bebida-sem-alcool',
        serve: 10,
        ingredientes: [
          '1 litro de suco de uva concentrado',
          '4 litros de água gelada',
          '5 laranjas',
          '3 limões',
          '1 xícara de açúcar',
          '1,5 kg de gelo',
        ],
      },
    ],
  },

  // ══════════════════════════ TRADICIONAL ══════════════════════════
  {
    id: 'tradicional',
    nome: 'Tradicional',
    resumo: 'Pernil, arroz com passas, farofa, maionese, rabanada e pavê.',
    pratos: [
      {
        id: 'pernil-cerveja-preta',
        nome: 'Pernil na cerveja preta',
        tipo: 'carne-com-osso',
        serve: 10,
        ingredientes: PERNIL_CERVEJA_PRETA,
      },
      {
        id: 'arroz-com-passas',
        nome: 'Arroz com passas',
        tipo: 'arroz',
        serve: 10,
        ingredientes: [
          '700 g de arroz',
          '100 g de uva-passa',
          '1 cebola média',
          '3 dentes de alho',
          '3 colheres de sopa de óleo',
          '1 colher de sopa de manteiga',
          '1 colher de sopa de sal',
        ],
      },
      {
        id: 'farofa-bacon-ovos',
        nome: 'Farofa de bacon e ovos',
        tipo: 'farofa',
        serve: 10,
        ingredientes: [
          '350 g de farinha de mandioca',
          '150 g de bacon em cubos',
          '3 ovos',
          '1 cebola média',
          '3 colheres de sopa de manteiga',
          '3 dentes de alho',
          'Sal a gosto',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'maionese-batata',
        nome: 'Maionese de batata',
        tipo: 'salada-fria',
        serve: 10,
        ingredientes: [
          '1,1 kg de batata',
          '2 cenouras médias',
          '100 g de ervilha',
          '300 g de maionese',
          '3 ovos',
          '1/2 cebola',
          'Suco de 1/2 limão',
          '2 colheres de sopa de azeite',
          'Sal a gosto',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'rabanada-forno',
        nome: 'Rabanada de forno',
        tipo: 'sobremesa',
        serve: 10,
        ingredientes: [
          '5 pães franceses amanhecidos',
          '600 ml de leite',
          '1/2 lata de leite condensado',
          '3 ovos',
          '3/4 de xícara de açúcar',
          '1 colher de sopa de canela em pó',
          '3 colheres de sopa de manteiga',
        ],
      },
      {
        id: 'pave-chocolate',
        nome: 'Pavê de chocolate',
        tipo: 'sobremesa',
        serve: 10,
        ingredientes: [
          '1 lata de leite condensado',
          '600 ml de leite',
          '2 ovos',
          '2 colheres de sopa de amido de milho',
          '1/2 xícara de chocolate em pó',
          '2 caixinhas de creme de leite',
          '200 g de bolacha maisena',
          '50 g de chocolate granulado',
          '1 colher de sopa de manteiga',
        ],
      },
    ],
  },

  // ══════════════════════════ CAPRICHADO ══════════════════════════
  {
    id: 'caprichado',
    nome: 'Caprichado',
    resumo: 'Pernil e tender, arroz com castanhas, farofa de frutas, salada, torta e ponche.',
    pratos: [
      {
        id: 'pernil-cerveja-preta-caprichado',
        nome: 'Pernil na cerveja preta',
        tipo: 'carne-com-osso',
        serve: 10,
        ingredientes: PERNIL_CERVEJA_PRETA,
      },
      {
        id: 'tender-glaceado',
        nome: 'Tender glaceado com laranja',
        tipo: 'carne-sem-osso',
        serve: 10,
        ingredientes: [
          '3 kg de tender',
          'Suco de 4 laranjas',
          '1 xícara de açúcar mascavo',
          '1/2 xícara de mostarda',
          '1/2 xícara de mel',
          '1 colher de sopa de cravo-da-índia',
        ],
      },
      {
        id: 'arroz-natalino-castanhas',
        nome: 'Arroz natalino com castanhas',
        tipo: 'arroz',
        serve: 10,
        ingredientes: [
          '700 g de arroz',
          '100 g de castanha-de-caju',
          '50 g de uva-passa',
          '1 cenoura média',
          '1 cebola média',
          '3 dentes de alho',
          '3 colheres de sopa de manteiga',
          '1 colher de sopa de sal',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'farofa-frutas-secas',
        nome: 'Farofa de frutas secas',
        tipo: 'farofa',
        serve: 10,
        ingredientes: [
          '350 g de farinha de mandioca',
          '80 g de manteiga',
          '80 g de damasco seco',
          '60 g de uva-passa',
          '60 g de ameixa seca',
          '1 cebola média',
          'Sal a gosto',
          'Cheiro-verde a gosto',
        ],
      },
      {
        id: 'salada-folhas-manga',
        nome: 'Salada de folhas com manga',
        tipo: 'salada-folhas',
        serve: 10,
        ingredientes: [
          '2 pés de alface crespa',
          '1 maço de rúcula',
          '2 mangas',
          '250 g de tomate-cereja',
          '1 cebola roxa pequena',
          '80 ml de azeite',
          'Suco de 1 limão',
          'Sal a gosto',
        ],
      },
      {
        id: 'torta-limao',
        nome: 'Torta de limão',
        tipo: 'sobremesa',
        serve: 10,
        ingredientes: [
          '200 g de bolacha maisena',
          '100 g de manteiga',
          '1 lata de leite condensado',
          '1 caixinha de creme de leite',
          '5 limões',
          '3 claras de ovo',
          '6 colheres de sopa de açúcar',
        ],
      },
      {
        id: 'ponche-sem-alcool',
        nome: 'Ponche de frutas sem álcool',
        tipo: 'bebida-sem-alcool',
        serve: 10,
        ingredientes: [
          '2 litros de suco de uva integral',
          '2 litros de refrigerante soda limonada',
          '2 maçãs',
          '3 laranjas',
          '1 abacaxi',
          '1,5 kg de gelo',
        ],
      },
    ],
  },
];

export function buscarPratoDoGuia(id: string): PratoDoGuia | undefined {
  for (const c of CARDAPIOS_PRONTOS) {
    const p = c.pratos.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}
