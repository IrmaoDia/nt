import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Lista os arquivos da pasta public/ (ícones, manifest) para o modo offline. */
function arquivosPublicos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivosPublicos(caminho);
    return ['/' + relative('public', caminho).replace(/\\/g, '/')];
  });
}

/**
 * Gera o service worker (sw.js) no build, com a lista de todos os arquivos do app.
 * Assim, depois do primeiro acesso, o app abre mesmo sem internet (dentro do mercado).
 */
function serviceWorker(): Plugin {
  return {
    name: 'ceia-service-worker',
    apply: 'build',
    generateBundle(_opcoes, bundle) {
      const arquivos = [
        '/',
        ...Object.keys(bundle).map((f) => '/' + f),
        ...arquivosPublicos('public'),
        // .woff é só para navegadores muito antigos; os atuais usam .woff2.
      ].filter((f) => !f.endsWith('.map') && !f.endsWith('.woff'));
      const versao = createHash('sha1').update(arquivos.join('|')).digest('hex').slice(0, 10);
      const codigo = readFileSync('pwa/sw-modelo.js', 'utf8')
        .replace('__ARQUIVOS__', JSON.stringify(arquivos))
        .replace('__VERSAO__', versao);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: codigo });
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorker()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
