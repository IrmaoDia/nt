/* Service worker da Calculadora Ceia Sem Erro.
   Este arquivo é um modelo: o build preenche a lista de arquivos e a versão e gera dist/sw.js. */
const CACHE = 'ceia-sem-erro-__VERSAO__';
const ARQUIVOS = __ARQUIVOS__;

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: tenta a internet primeiro (pega atualizações) e, sem sinal, usa a cópia salva.
  if (pedido.mode === 'navigate') {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put('/', copia));
          return resposta;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  // Arquivos do app (JS, CSS, fontes, ícones): usa a cópia salva e só busca se não tiver.
  evento.respondWith(
    caches.match(pedido).then(
      (salvo) =>
        salvo ||
        fetch(pedido).then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(CACHE).then((cache) => cache.put(pedido, copia));
          }
          return resposta;
        }),
    ),
  );
});
