// Um Service Worker básico é necessário para que navegadores ativem a opção de instalação
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Apenas deixa as requisições passarem normalmente
});
