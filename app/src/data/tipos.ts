/**
 * Tipos compartilhados pelos dados da calculadora.
 * Para mudar quantidades, edite src/data/tiposDePrato.ts.
 */

/**
 * Seções da lista de compras. A ordem desta lista é a ordem em que aparecem.
 * "Pratos da mesa" são pratos que você prepara (ou compra prontos) e entram em porções ou peso pronto.
 * Frios e carnes vêm por último, para não esquentarem no carrinho.
 */
export const ORDEM_CATEGORIAS = [
  'Pratos da mesa',
  'Hortifrúti',
  'Mercearia',
  'Temperos',
  'Bebidas',
  'Frios e Laticínios',
  'Carnes',
] as const;

export type Categoria = (typeof ORDEM_CATEGORIAS)[number];

export type Apetite = 'leve' | 'normal' | 'bem-servido';

export type IdCardapio = 'economico' | 'tradicional' | 'caprichado';
