import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDAPIOS_PRONTOS } from '../data/cardapios';
import { CARNES_FORNO } from '../data/forno';
import { TIPOS_DE_PRATO, buscarTipo } from '../data/tiposDePrato';
import { montarConsumoPorPessoa } from './consumo';
import { formatarMinutos, lerPreco } from './formato';
import { tempoDeForno } from './forno';
import { interpretarLinha } from './receita';

describe('tipos de prato', () => {
  it('ids únicos e valores positivos', () => {
    const ids = TIPOS_DE_PRATO.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TIPOS_DE_PRATO) {
      expect(t.porPessoa).toBeGreaterThan(0);
      expect(t.arredondamento).toBeGreaterThan(0);
    }
  });
});

describe('cardápios prontos do guia', () => {
  it('todo prato aponta para um tipo que existe', () => {
    for (const c of CARDAPIOS_PRONTOS) for (const p of c.pratos) expect(buscarTipo(p.tipo), p.nome).toBeDefined();
  });

  it('todas as linhas das receitas são entendidas pelo interpretador', () => {
    for (const c of CARDAPIOS_PRONTOS) {
      for (const p of c.pratos) {
        for (const texto of p.ingredientes) {
          const l = interpretarLinha(texto);
          expect(l, texto).not.toBeNull();
          // Só "a gosto" pode ficar sem quantidade.
          if (l!.quantidade === null) expect(l!.unidade, texto).toBe('a-gosto');
          expect(l!.ingrediente.length, texto).toBeGreaterThan(1);
        }
      }
    }
  });

  it('docs/consumo-por-pessoa.json está atualizado (rode npm run gerar:json)', () => {
    const arquivo = JSON.parse(readFileSync('docs/consumo-por-pessoa.json', 'utf8'));
    expect(arquivo).toEqual(JSON.parse(JSON.stringify(montarConsumoPorPessoa())));
  });
});

describe('forno (sem mudanças)', () => {
  const pernil = CARNES_FORNO.find((c) => c.id === 'pernil')!;
  it('usa a tabela do ebook e calcula o meio-termo', () => {
    expect(tempoDeForno(pernil, 3)).toEqual({ coberto: 160, descoberto: 40, total: 200 });
    expect(tempoDeForno(pernil, 2.5)).toEqual({ coberto: 140, descoberto: 40, total: 180 });
    expect(tempoDeForno(pernil, 8)).toEqual({ coberto: 360, descoberto: 50, total: 410 });
    expect(tempoDeForno(pernil, 0.5).coberto).toBe(60);
  });
});

describe('formatação', () => {
  it('preços e minutos', () => {
    expect(lerPreco('R$ 12,90')).toBe(12.9);
    expect(lerPreco('1.234,56')).toBe(1234.56);
    expect(lerPreco('abc')).toBeNull();
    expect(formatarMinutos(155)).toBe('2 h 35 min');
  });
});
