import { CARDAPIOS_PRONTOS } from '../data/cardapios';
import { AUMENTO_POR_PRATO_EXTRA, TIPOS_DE_PRATO } from '../data/tiposDePrato';
import { FATOR_APETITE, PESO_CRIANCA } from './mesa';
import { interpretarLinha } from './receita';

/**
 * Conteúdo de docs/consumo-por-pessoa.json: os tipos de prato (consumo por pessoa)
 * e as receitas-base dos cardápios do guia, com os mesmos nomes usados no app.
 */
export function montarConsumoPorPessoa() {
  return {
    aviso:
      'Referências de consumo por pessoa adulta, para uma ceia com vários pratos. Devem ser revisadas por quem cozinha. Gerado a partir de src/data/tiposDePrato.ts e src/data/cardapios.ts (npm run gerar:json).',
    regras: {
      criancaAte10AnosContaComo: PESO_CRIANCA,
      fatorApetite: FATOR_APETITE,
      pessoasEquivalentes: '(adultos + crianças × 0,5) × fator de apetite (bebida alcoólica: só adultos)',
      divisaoNoGrupo: `com n pratos do mesmo grupo, cada um fica com porPessoa × (1 + ${AUMENTO_POR_PRATO_EXTRA} × (n − 1)) ÷ n`,
    },
    tiposDePrato: TIPOS_DE_PRATO,
    cardapiosProntos: CARDAPIOS_PRONTOS.map((c) => ({
      id: c.id,
      nome: c.nome,
      pratos: c.pratos.map((p) => ({
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        serve: p.serve,
        ingredientes: p.ingredientes.map((texto) => {
          const l = interpretarLinha(texto);
          return { texto, quantidade: l?.quantidade ?? null, unidade: l?.unidade ?? 'sem', ingrediente: l?.ingrediente ?? texto };
        }),
      })),
    })),
  };
}
