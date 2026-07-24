// Service worker — Assistant Emploi IA
// Rôle : rendre l'app reconnaissable comme PWA installable (condition
// technique obligatoire), et fournir un minimum de résilience hors-ligne.
//
// ⚠️ Stratégie RÉSEAU D'ABORD pour les fichiers de l'app (html/css/js) :
// à chaque chargement, si le téléphone est en ligne, on va TOUJOURS
// chercher la dernière version déployée sur Cloudflare Pages, et on met
// à jour le cache au passage. Le cache ne sert que de secours si jamais
// il n'y a pas de connexion internet.
// (Avant : stratégie "cache d'abord" avec un nom de cache fixe -> une
// ancienne version restait servie indéfiniment après chaque mise à jour,
// obligeant à vider le cache du navigateur pour voir les changements.)
//
// Les appels à l'API du Worker Cloudflare (offres, traduction...) ne sont
// jamais mis en cache : ils doivent toujours aller chercher des données
// fraîches sur le réseau.

const NOM_CACHE = "assistant-emploi-v2";

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
    caches.open(NOM_CACHE).then((cache) =>
      // On met en cache fichier par fichier : si un seul fichier échoue
      // (404, réseau lent...), ça ne doit pas empêcher l'installation du
      // service worker pour les autres fichiers.
      Promise.all(
        FICHIERS_A_METTRE_EN_CACHE.map((url) =>
          fetch(url)
            .then((reponse) => {
              if (reponse.ok) return cache.put(url, reponse);
            })
            .catch(() => {})
        )
      )
    )
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

  // Réseau d'abord : on va chercher la dernière version en ligne, et on
  // met à jour le cache avec la réponse fraîche. Si le réseau échoue
  // (hors-ligne), on retombe sur la dernière version connue en cache.
  event.respondWith(
    fetch(event.request)
      .then((reponseFraiche) => {
        const copie = reponseFraiche.clone();
        caches.open(NOM_CACHE).then((cache) => cache.put(event.request, copie));
        return reponseFraiche;
      })
      .catch(() => caches.match(event.request))
  );
});
