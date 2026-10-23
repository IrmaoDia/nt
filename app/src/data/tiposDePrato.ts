/**
 * ============================================================================
 *  TIPOS DE PRATO — quanto cada pessoa come de cada tipo de prato
 * ============================================================================
 *
 *  A quantidade de comida depende do TIPO de prato, não da receita. Um pernil
 *  "da minha mãe" ou "na cerveja preta" é sempre uma "Carne com osso".
 *
 *  ⚠️ São referências de consumo para uma ceia com vários pratos. Revise com
 *  quem cozinha antes de publicar.
 *
 *  CAMPOS DE CADA TIPO (não precisa saber programar):
 *    id .............. código interno. NÃO mude depois de publicar (as mesas
 *                      salvas no celular das usuárias usam esse código).
 *    nome ............ como aparece no app
 *    icone ........... emoji mostrado no card
 *    grupo ........... 'Carnes', 'Acompanhamentos', 'Saladas', 'Sobremesas' ou 'Bebidas'
 *                      (usado na regra de divisão, explicada abaixo)
 *    categoria ....... seção da lista de compras (ex.: 'Carnes', 'Mercearia')
 *    porPessoa ....... quanto UMA pessoa adulta consome, na unidade abaixo
 *    unidade ......... 'g' (gramas), 'ml' (mililitros), 'porcao' ou 'unidade'
 *    exibicao ........ palavra mostrada depois da quantidade: "crua", "pronta"…
 *    arredondamento .. de quanto em quanto arredondar PARA CIMA, na mesma unidade
 *                      (ex.: 100 = de 100 em 100 g; 1 = porções inteiras)
 *    embalagem ....... (opcional) como se compra: tamanho na mesma unidade e o
 *                      nome no singular e no plural. Ex.: pacote de 1 kg = 1000 g
 *    nomeUnidade ..... (opcional) nome da unidade/porção no singular e no plural
 *    soAdultos ....... (opcional) true = crianças não entram na conta (bebida alcoólica)
 *    nomeCompra ...... (opcional) nome do item na lista de compras. Pratos do
 *                      mesmo tipo com nomeCompra se somam (ex.: 2 arrozes = 1 linha "Arroz")
 *    exemplos ........ pratos de exemplo, mostrados para ajudar a escolher
 *
 *  Use PONTO como separador decimal: 0.125 (e não 0,125).
 *
 *  ── REGRA DE DIVISÃO ────────────────────────────────────────────────────────
 *  Quem tem pernil E chester na mesa não come 400 g de cada: come um pouco de
 *  cada um. Por isso, quando a mesa tem mais de um prato do mesmo GRUPO:
 *    1. o consumo total do grupo aumenta 15% para cada prato a mais
 *       (mais opções = as pessoas se servem um pouco mais);
 *    2. esse total é dividido entre os pratos do grupo, na proporção do
 *       porPessoa de cada tipo.
 *  Na prática, cada prato fica com:
 *       porPessoa × (1 + 0,15 × (pratos no grupo − 1)) ÷ pratos no grupo
 *  Exemplo: pernil + chester (2 carnes com osso de 400 g):
 *       400 × 1,15 ÷ 2 = 230 g de cada, por pessoa.
 *  Exemplo: pernil (400 g) + lombo (300 g):
 *       pernil 400 × 0,575 = 230 g; lombo 300 × 0,575 = 172,5 g por pessoa.
 *  O valor 15% fica em AUMENTO_POR_PRATO_EXTRA, logo abaixo.
 * ============================================================================
 */
import type { Categoria } from './tipos';

export const AUMENTO_POR_PRATO_EXTRA = 0.15;

export const ORDEM_GRUPOS = ['Carnes', 'Acompanhamentos', 'Saladas', 'Sobremesas', 'Bebidas'] as const;
export type Grupo = (typeof ORDEM_GRUPOS)[number];

export type UnidadeTipo = 'g' | 'ml' | 'porcao' | 'unidade';

export interface TipoDePrato {
  id: string;
  nome: string;
  icone: string;
  grupo: Grupo;
  categoria: Categoria;
  porPessoa: number;
  unidade: UnidadeTipo;
  exibicao: string;
  arredondamento: number;
  embalagem?: { tamanho: number; nome: [string, string] };
  nomeUnidade?: [string, string];
  soAdultos?: boolean;
  nomeCompra?: string;
  exemplos: string;
}

export const TIPOS_DE_PRATO: TipoDePrato[] = [
  // ───────────── CARNES ─────────────
  {
    id: 'carne-com-osso',
    nome: 'Carne com osso',
    icone: '🍖',
    grupo: 'Carnes',
    categoria: 'Carnes',
    porPessoa: 400, // gramas de carne crua por pessoa
    unidade: 'g',
    exibicao: 'crua',
    arredondamento: 100, // de 100 em 100 g (0,1 kg)
    exemplos: 'pernil, costela, frango inteiro, chester, peru',
  },
  {
    id: 'carne-sem-osso',
    nome: 'Carne sem osso',
    icone: '🥩',
    grupo: 'Carnes',
    categoria: 'Carnes',
    porPessoa: 300,
    unidade: 'g',
    exibicao: 'crua',
    arredondamento: 100,
    exemplos: 'lombo, tender, picanha, filé, lagarto',
  },
  {
    id: 'peixe',
    nome: 'Peixe ou bacalhau',
    icone: '🐟',
    grupo: 'Carnes',
    categoria: 'Carnes',
    porPessoa: 300, // bacalhau já dessalgado
    unidade: 'g',
    exibicao: 'cru (bacalhau já dessalgado)',
    arredondamento: 100,
    exemplos: 'bacalhau, salmão, pescada',
  },

  // ───────────── ACOMPANHAMENTOS ─────────────
  {
    id: 'arroz',
    nome: 'Arroz',
    icone: '🍚',
    grupo: 'Acompanhamentos',
    categoria: 'Mercearia',
    porPessoa: 70, // gramas de arroz cru
    unidade: 'g',
    exibicao: 'de arroz cru',
    arredondamento: 100,
    embalagem: { tamanho: 1000, nome: ['pacote de 1 kg', 'pacotes de 1 kg'] },
    nomeCompra: 'Arroz',
    exemplos: 'arroz branco, à grega, com passas, com castanhas',
  },
  {
    id: 'massa',
    nome: 'Massa ou macarrão',
    icone: '🍝',
    grupo: 'Acompanhamentos',
    categoria: 'Mercearia',
    porPessoa: 80, // gramas de massa crua
    unidade: 'g',
    exibicao: 'de massa crua',
    arredondamento: 100,
    embalagem: { tamanho: 500, nome: ['pacote de 500 g', 'pacotes de 500 g'] },
    nomeCompra: 'Massa (macarrão)',
    exemplos: 'macarrão ao forno, lasanha, talharim',
  },
  {
    id: 'farofa',
    nome: 'Farofa',
    icone: '🥣',
    grupo: 'Acompanhamentos',
    categoria: 'Mercearia',
    porPessoa: 35, // gramas de farinha
    unidade: 'g',
    exibicao: 'de farinha',
    arredondamento: 100,
    embalagem: { tamanho: 500, nome: ['pacote de 500 g', 'pacotes de 500 g'] },
    nomeCompra: 'Farinha de mandioca',
    exemplos: 'farofa de bacon, de ovos, de frutas secas',
  },
  {
    id: 'acompanhamento-quente',
    nome: 'Acompanhamento quente',
    icone: '🥔',
    grupo: 'Acompanhamentos',
    categoria: 'Pratos da mesa',
    porPessoa: 150, // gramas do prato pronto
    unidade: 'g',
    exibicao: 'pronto',
    arredondamento: 100,
    exemplos: 'batata assada, legumes, purê, gratinado',
  },

  // ───────────── SALADAS ─────────────
  {
    id: 'salada-folhas',
    nome: 'Salada de folhas',
    icone: '🥬',
    grupo: 'Saladas',
    categoria: 'Hortifrúti',
    porPessoa: 50, // gramas de folhas
    unidade: 'g',
    exibicao: 'de folhas',
    arredondamento: 50,
    exemplos: 'alface, rúcula, agrião, mix de folhas',
  },
  {
    id: 'salada-fria',
    nome: 'Salada fria pronta',
    icone: '🥗',
    grupo: 'Saladas',
    categoria: 'Pratos da mesa',
    porPessoa: 150, // gramas da salada pronta
    unidade: 'g',
    exibicao: 'pronta',
    arredondamento: 100,
    exemplos: 'maionese, salpicão, salada de batata',
  },

  // ───────────── SOBREMESAS ─────────────
  {
    id: 'sobremesa',
    nome: 'Sobremesa',
    icone: '🍮',
    grupo: 'Sobremesas',
    categoria: 'Pratos da mesa',
    porPessoa: 1, // 1 porção por pessoa
    unidade: 'porcao',
    exibicao: '',
    arredondamento: 1,
    nomeUnidade: ['porção', 'porções'],
    exemplos: 'pavê, pudim, torta, mousse, rabanada',
  },
  {
    id: 'panetone',
    nome: 'Panetone ou chocotone',
    icone: '🍞',
    grupo: 'Sobremesas',
    categoria: 'Mercearia',
    porPessoa: 0.125, // 1 panetone de 500 g a cada 8 pessoas (1 ÷ 8)
    unidade: 'unidade',
    exibicao: '',
    arredondamento: 1,
    nomeUnidade: ['panetone de 500 g', 'panetones de 500 g'],
    exemplos: 'panetone, chocotone (1 de 500 g a cada 8 pessoas)',
  },
  {
    id: 'frutas',
    nome: 'Frutas da ceia',
    icone: '🍇',
    grupo: 'Sobremesas',
    categoria: 'Hortifrúti',
    porPessoa: 100, // gramas
    unidade: 'g',
    exibicao: '',
    arredondamento: 100,
    exemplos: 'uvas, frutas secas, nozes',
  },

  // ───────────── BEBIDAS ─────────────
  {
    id: 'bebida-sem-alcool',
    nome: 'Refrigerante, suco ou bebida sem álcool',
    icone: '🥤',
    grupo: 'Bebidas',
    categoria: 'Bebidas',
    porPessoa: 500, // ml por pessoa
    unidade: 'ml',
    exibicao: '',
    arredondamento: 500,
    embalagem: { tamanho: 2000, nome: ['garrafa de 2 litros', 'garrafas de 2 litros'] },
    exemplos: 'refrigerante, suco, água com gás, ponche sem álcool',
  },
  {
    id: 'espumante',
    nome: 'Espumante ou vinho',
    icone: '🍾',
    grupo: 'Bebidas',
    categoria: 'Bebidas',
    porPessoa: 187.5, // 1 garrafa de 750 ml a cada 4 adultos (750 ÷ 4)
    unidade: 'ml',
    exibicao: '',
    arredondamento: 750,
    embalagem: { tamanho: 750, nome: ['garrafa de 750 ml', 'garrafas de 750 ml'] },
    soAdultos: true,
    exemplos: '1 garrafa de 750 ml a cada 4 adultos (crianças não contam)',
  },
];

export function buscarTipo(id: string): TipoDePrato | undefined {
  return TIPOS_DE_PRATO.find((t) => t.id === id);
}
