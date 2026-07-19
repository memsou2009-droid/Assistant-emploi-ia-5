// Service worker minimal — Assistant Emploi IA
// Rôle : rendre l'app reconnaissable comme PWA installable (condition
// technique obligatoire), et mettre en cache les fichiers statiques pour
// un chargement plus rapide et un minimum de résilience hors-ligne.
// ⚠️ Les appels à l'API du Worker Cloudflare (offres, traduction...) ne
// sont volontairement PAS mis en cache : ils doivent toujours aller
// chercher des données fraîches sur le réseau.

const NOM_CACHE = "assistant-emploi-v1";

const FICHIERS_A_METTRE_EN_CACHE = [
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(NOM_CACHE).then((cache) => cache.addAll(FICHIERS_A_METTRE_EN_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(
        cles.filter((cle) => cle !== NOM_CACHE).map((cle) => caches.delete(cle))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Jamais de cache pour les appels à l'API (offres, traduction, envoi de
  // candidature...) : toujours du réseau frais.
  if (url.hostname.includes("workers.dev") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Pour le reste (fichiers statiques du site) : on sert depuis le cache
  // si disponible, sinon on va sur le réseau.
  event.respondWith(
    caches.match(event.request).then((reponseEnCache) => {
      return reponseEnCache || fetch(event.request);
    })
  );
});
