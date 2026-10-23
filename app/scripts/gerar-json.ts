/** Gera docs/consumo-por-pessoa.json a partir de src/data/cardapios.ts. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { montarConsumoPorPessoa } from '../src/lib/consumo';

mkdirSync('docs', { recursive: true });
writeFileSync('docs/consumo-por-pessoa.json', JSON.stringify(montarConsumoPorPessoa(), null, 2) + '\n', 'utf8');
console.log('docs/consumo-por-pessoa.json atualizado.');
