// ==========================================================
// Assistant Emploi IA — Worker Cloudflare unifié
// ==========================================================
// Un seul Worker qui expose :
//   GET  /api/jobs    -> agrège Arbeitnow + RemoteOK + Jobicy + Guinée
//   POST /api/apply   -> envoie la candidature par email (MailChannels)
//   POST /api/cv      -> génère le HTML du CV à partir du profil
//   POST /api/letter  -> génère le HTML de la lettre de motivation
//
// Tout tourne côté serveur : aucun appel direct depuis le téléphone
// vers arbeitnow.com / remoteok.com / etc, donc aucun blocage CORS
// possible côté client. Le Worker répond toujours avec des en-têtes
// CORS ouverts.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

// --- Offres statiques Guinée (en attendant une vraie source/API) ---
// Ajoute/édite directement ce tableau ; c'est le seul endroit à modifier.
const OFFRES_GUINEE = [
  {
    metier: "Comptable",
    entreprise: "Cabinet Fidusoft",
    lieu: "Conakry",
    contact: "recrutement@fidusoft-gn.com",
    description: "Cabinet comptable recherche comptable expérimenté, envoyer CV à recrutement@fidusoft-gn.com",
  },
  {
    metier: "Développeur web",
    entreprise: "Guinée Tech Solutions",
    lieu: "Conakry",
    contact: "https://www.emploiguinee.com/",
    description: "Poste de développeur web junior, maîtrise HTML/CSS/JS exigée.",
  },
  {
    metier: "Commercial terrain",
    entreprise: "Distri Guinée",
    lieu: "Kankan",
    contact: "contact@distriguinee.com",
    description: "Recherche commercial terrain dynamique, envoi CV par email à contact@distriguinee.com",
  },
];

// Détecte une adresse email dans un texte ; sinon renvoie l'URL par défaut.
function detecterModeEnvoi(texte, urlParDefaut) {
  if (texte) {
    const trouve = texte.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (trouve) return { mode: "email", contact: trouve[0] };
  }
  return { mode: "site", contact: urlParDefaut };
}

function dedupliquer(offres) {
  const vues = new Set();
  return offres.filter((o) => {
    const cle = (o.metier + "|" + o.entreprise).toLowerCase().trim();
    if (vues.has(cle)) return false;
    vues.add(cle);
    return true;
  });
}

async function recupererArbeitnow() {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
  const data = await res.json();
  return (data.data || []).map((job) => {
    const { mode, contact } = detecterModeEnvoi(job.description, job.url);
    return {
      metier: job.title,
      entreprise: job.company_name,
      lieu: job.location || (job.remote ? "Télétravail" : "Non précisé"),
      remote: !!job.remote,
      mode, contact,
      documents: ["CV", "Lettre de motivation"],
      source: "Arbeitnow",
      tags: (job.tags || []).join(" "),
    };
  });
}

async function recupererRemoteOK() {
  // RemoteOK bloque (403) les requêtes dont l'en-tête User-Agent ne
  // ressemble pas à un navigateur classique. On envoie donc un User-Agent
  // de navigateur standard, ainsi qu'un Accept, pour éviter ce blocage
  // silencieux (c'est une API publique destinée à l'intégration, pas un
  // contenu protégé — voir leurs conditions d'usage de l'API).
  const res = await fetch("https://remoteok.com/api", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("RemoteOK HTTP " + res.status);
  }
  const data = await res.json();
  return data
    .filter((job) => job.id && job.position)
    .map((job) => {
      const urlOffre = job.url || "https://remoteok.com/remote-jobs/" + job.id;
      const { mode, contact } = detecterModeEnvoi(job.description, urlOffre);
      return {
        metier: job.position,
        entreprise: job.company,
        lieu: job.location || "Télétravail",
        remote: true,
        mode, contact,
        documents: ["CV", "Lettre de motivation"],
        source: "RemoteOK",
        tags: (job.tags || []).join(" "),
      };
    });
}

async function recupererJobicy() {
  // count=100 (max autorisé) au lieu de 50, pour avoir un vivier plus
  // large avant filtrage/interleaving.
  const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100");
  if (!res.ok) {
    throw new Error("Jobicy HTTP " + res.status);
  }
  const data = await res.json();
  return (data.jobs || []).map((job) => {
    const { mode, contact } = detecterModeEnvoi(job.jobDescription, job.url);
    return {
      metier: job.jobTitle,
      entreprise: job.companyName,
      lieu: job.jobGeo || "Télétravail",
      remote: true,
      mode, contact,
      documents: ["CV", "Lettre de motivation"],
      source: "Jobicy",
      tags: (job.jobIndustry || "") + " " + (job.jobExcerpt || ""),
    };
  });
}

function recupererGuinee() {
  return OFFRES_GUINEE.map((job) => {
    const { mode, contact } = detecterModeEnvoi(job.description, job.contact);
    return {
      metier: job.metier,
      entreprise: job.entreprise,
      lieu: job.lieu || "Guinée",
      remote: false,
      mode, contact,
      documents: ["CV", "Lettre de motivation"],
      source: "EmploiGuinée",
      tags: (job.description || "").toLowerCase(),
    };
  });
}

// Mélange plusieurs listes source par source, en alternance (round-robin),
// au lieu de les empiler bout à bout. Sans ça, une source qui renvoie
// beaucoup d'offres (ex. Arbeitnow, souvent des postes en Allemagne)
// occupe toute la tête de liste et écrase les autres sources (RemoteOK,
// Jobicy) une fois la liste tronquée côté site.
function entrelacer(listes) {
  const resultat = [];
  const max = Math.max(0, ...listes.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const liste of listes) {
      if (liste[i]) resultat.push(liste[i]);
    }
  }
  return resultat;
}

async function gererJobs(request, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);

  const enCache = await cache.match(cacheKey);
  if (enCache) return enCache;

  const resultats = await Promise.allSettled([
    recupererArbeitnow(),
    recupererRemoteOK(),
    recupererJobicy(),
  ]);

  const listesParSource = [];
  const diagnostic = [];
  const noms = ["Arbeitnow", "RemoteOK", "Jobicy"];

  resultats.forEach((r, i) => {
    if (r.status === "fulfilled") {
      listesParSource.push(r.value);
      diagnostic.push({ source: noms[i], compte: r.value.length, erreur: null });
    } else {
      listesParSource.push([]);
      diagnostic.push({ source: noms[i], compte: 0, erreur: String(r.reason) });
    }
  });

  // Le télétravail (RemoteOK, Jobicy) est prioritaire dans l'ordre
  // d'entrelacement, car c'est l'option la plus utile pour quelqu'un qui
  // veut travailler pour l'étranger depuis chez lui.
  let offres = entrelacer([
    listesParSource[1], // RemoteOK
    listesParSource[2], // Jobicy
    listesParSource[0], // Arbeitnow
  ]);

  offres = offres.concat(recupererGuinee());
  offres = dedupliquer(offres);

  const reponse = jsonResponse({
    genereLe: new Date().toISOString(),
    total: offres.length,
    diagnostic,
    jobs: offres,
  });

  // Cache 15 minutes sur le edge Cloudflare (pas de KV nécessaire)
  const reponseAvecCache = new Response(reponse.body, reponse);
  reponseAvecCache.headers.set("Cache-Control", "public, max-age=900");
  ctx.waitUntil(cache.put(cacheKey, reponseAvecCache.clone()));

  return reponseAvecCache;
}

// --- /api/apply : envoi d'email via MailChannels (gratuit sur Workers) ---
// ⚠️ Nécessite que ton domaine soit sur Cloudflare avec un enregistrement
// DNS TXT de "domain lockdown" MailChannels, sinon l'envoi est refusé.
// Voir les instructions fournies avec ce fichier.
async function gererApply(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ succes: false, erreur: "JSON invalide" }, 400);
  }

  const { destinataire, sujet, corps, pieces } = body;

  if (!destinataire || !sujet) {
    return jsonResponse({ succes: false, erreur: "Destinataire ou sujet manquant" }, 400);
  }

  const attachments = (pieces || [])
    .filter((p) => p.contenu && p.contenu.includes(","))
    .map((p) => ({
      filename: p.nom,
      content: p.contenu.split(",")[1], // partie base64 après "data:...;base64,"
      type: (p.contenu.match(/data:(.*?);base64/) || [])[1] || "application/pdf",
      encoding: "base64",
      disposition: "attachment",
    }));

  const messageMailChannels = {
    personalizations: [{ to: [{ email: destinataire }] }],
    from: {
      email: "candidatures@TON-DOMAINE.com", // ⚠️ à remplacer par ton domaine réel
      name: "Assistant Emploi IA",
    },
    subject: sujet,
    content: [{ type: "text/html", value: corps || "" }],
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    const envoi = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageMailChannels),
    });

    if (envoi.status === 202 || envoi.ok) {
      return jsonResponse({ succes: true });
    }

    const texteErreur = await envoi.text();
    return jsonResponse({ succes: false, erreur: "MailChannels: " + texteErreur }, 502);

  } catch (erreur) {
    return jsonResponse({ succes: false, erreur: String(erreur) }, 500);
  }
}

// --- /api/translate : traduction FR -> EN/ES/ZH via l'API gratuite ---
// MyMemory (aucune clé requise). On limite chaque appel à ~450 caractères
// (limite de l'API) : les textes plus longs sont découpés phrase par
// phrase puis rassemblés après traduction.
const CODES_LANGUE_MYMEMORY = {
  en: "fr|en",
  es: "fr|es",
  zh: "fr|zh-CN",
};

async function traduireMorceau(texte, langpair) {
  if (!texte || !texte.trim()) return texte;

  const url = "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(texte) + "&langpair=" + langpair;

  const res = await fetch(url);
  if (!res.ok) throw new Error("MyMemory HTTP " + res.status);

  const data = await res.json();
  const traduit = data?.responseData?.translatedText;

  // MyMemory renvoie parfois un message d'erreur dans le champ traduit
  // plutôt qu'une vraie traduction (ex: quota dépassé) -> on garde
  // l'original dans ce cas plutôt que d'afficher un message d'erreur API.
  if (!traduit || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(traduit)) {
    return texte;
  }

  return traduit;
}

function decouperEnMorceaux(texte, tailleMax) {
  if (texte.length <= tailleMax) return [texte];

  const phrases = texte.match(/[^.!?]+[.!?]*\s*/g) || [texte];
  const morceaux = [];
  let courant = "";

  for (const phrase of phrases) {
    if ((courant + phrase).length > tailleMax && courant) {
      morceaux.push(courant);
      courant = phrase;
    } else {
      courant += phrase;
    }
  }
  if (courant) morceaux.push(courant);

  return morceaux;
}

async function traduireTexteComplet(texte, langue) {
  const langpair = CODES_LANGUE_MYMEMORY[langue];
  if (!langpair) return texte;

  const morceaux = decouperEnMorceaux(texte, 450);
  const traduits = [];

  // Séquentiel plutôt qu'en parallèle : MyMemory (gratuit, sans clé)
  // limite le débit de requêtes simultanées par IP.
  for (const morceau of morceaux) {
    traduits.push(await traduireMorceau(morceau, langpair));
  }

  return traduits.join(" ");
}

async function gererTranslate(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ erreur: "JSON invalide" }, 400);
  }

  const { textes, langue } = body;

  if (!Array.isArray(textes) || !langue) {
    return jsonResponse({ erreur: "Paramètres 'textes' (tableau) et 'langue' requis" }, 400);
  }

  if (!CODES_LANGUE_MYMEMORY[langue]) {
    return jsonResponse({ erreur: "Langue non supportée : " + langue }, 400);
  }

  try {
    const traductions = [];
    // Séquentiel également ici pour éviter de multiplier les requêtes
    // simultanées vers MyMemory (chaque texte peut lui-même être découpé
    // en plusieurs morceaux).
    for (const texte of textes) {
      traductions.push(await traduireTexteComplet(texte, langue));
    }
    return jsonResponse({ traductions });
  } catch (erreur) {
    return jsonResponse({ erreur: "Échec de traduction : " + String(erreur) }, 502);
  }
}

// --- /api/cv et /api/letter : génération de contenu à partir de gabarits ---
// (Aucun problème CORS ici : c'est juste de la mise en forme de texte.
// On le centralise côté serveur pour préparer une future génération par IA.)
function genererCV(profil) {
  return `
    <div class="cv">
    <h1>CURRICULUM VITAE</h1>
    <h2>${profil.nom}</h2>
    <p>📍 ${profil.ville}</p>
    <p>📧 ${profil.email || "Non renseigné"} &nbsp;|&nbsp; 📞 ${profil.contact || "Non renseigné"}</p>
    <hr>
    <h3>💼 Profil professionnel</h3><p>${profil.metier}</p>
    <h3>🛠 Compétences</h3><p>${profil.competence}</p>
    <h3>🎓 Formation</h3><p>${profil.formation}</p>
    <h3>💻 Expérience</h3><p>${profil.experience}</p>
    <h3>🌍 Langues</h3><p>${profil.langues}</p>
    <h3>🎯 Loisirs</h3><p>${profil.loisirs}</p>
    </div>
  `;
}

function genererLettre(profil, offre) {
  return `
    <h2>📝 Lettre de motivation</h2>
    <p>${profil.nom}<br>${profil.ville}<br>
    📧 ${profil.email || "Non renseigné"} &nbsp;|&nbsp; 📞 ${profil.contact || "Non renseigné"}</p>
    <p>Objet : Candidature au poste de ${offre.metier}</p>
    <p>Madame, Monsieur,</p>
    <p>Je vous adresse ma candidature pour le poste de ${offre.metier} au sein de ${offre.entreprise}.</p>
    <p>Grâce à ma formation de ${profil.formation} et mes compétences en ${profil.competence},
    je souhaite mettre mes capacités au service de votre entreprise.</p>
    <p>Motivé(e), sérieux(se) et désireux(se) d'évoluer, je serais heureux(se) de pouvoir échanger avec vous.</p>
    <p>Cordialement,<br>${profil.nom}</p>
  `;
}

async function gererGenerationDocument(request, type) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ erreur: "JSON invalide" }, 400);
  }

  const { profil, offre } = body;
  if (!profil) return jsonResponse({ erreur: "Profil manquant" }, 400);

  const html = type === "cv" ? genererCV(profil) : genererLettre(profil, offre || {});
  return jsonResponse({ html });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/jobs" && request.method === "GET") {
        return await gererJobs(request, ctx);
      }
      if (url.pathname === "/api/apply" && request.method === "POST") {
        return await gererApply(request);
      }
      if (url.pathname === "/api/cv" && request.method === "POST") {
        return await gererGenerationDocument(request, "cv");
      }
      if (url.pathname === "/api/letter" && request.method === "POST") {
        return await gererGenerationDocument(request, "letter");
      }
      if (url.pathname === "/api/translate" && request.method === "POST") {
        return await gererTranslate(request);
      }

      return jsonResponse({ erreur: "Route inconnue" }, 404);

    } catch (erreur) {
      return jsonResponse({ erreur: "Erreur serveur : " + String(erreur) }, 500);
    }
  },
};

