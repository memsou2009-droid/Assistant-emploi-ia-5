//////////////////////////////////////////////////////
// 🤖 ASSISTANT EMPLOI IA V2
//////////////////////////////////////////////////////

// 🔗 URL de ton Worker Cloudflare unique — regroupe désormais TOUTES les
// API : /api/jobs (offres), /api/apply (envoi de candidature), /api/cv et
// /api/letter (génération de documents). Laisse vide ("") tant qu'il n'est
// pas déployé — l'assistant utilisera alors les anciens circuits de secours.
// Une fois déployé, colle l'URL ici (SANS slash à la fin), ex :
// "https://assistant-emploi-worker.tonpseudo.workers.dev"

let URL_WORKER_API = "https://assistantemploi.memsou2009.workers.dev";

// Anciennes variables gardées pour compatibilité / secours si tu ne
// déploies pas encore le nouveau Worker unifié.
let URL_PROXY_EMPLOIGUINEE = "";
let URL_APPS_SCRIPT_EMAIL = "https://script.google.com/macros/s/AKfycbyefqdJ2iLSOt0rnK65C3lu6ZpHL3wxHD1dLfDQb5R4i1W9mA46uDfov1T7Kzo6h40B/exec";


// Base des offres (remplie ensuite par les offres Guinée statiques
// ci-dessous, puis par les offres réelles récupérées via l'API/Worker).
// ⚠️ Les anciennes offres d'essai/exemple ("Tech Guinée", "Africa Services",
// "Global Finance" avec contact factice exemple-recrutement.com) ont été
// retirées : ce n'étaient que des données de test.

let offres = [];


//////////////////////////////////////////////////////
// 🇬🇳 OFFRES GUINÉE / AFRIQUE
// Ces sites (JobGuinée, EmploiGuinée...) n'ont pas d'API publique.
// Liste recueillie manuellement le 13 juillet 2026 — à mettre à jour
// régulièrement en visitant les sites sources.
//////////////////////////////////////////////////////

let offresGuinee = [

{
    id:101,
    metier:"Stagiaire en Technologies de l'information (IT)",
    entreprise:"Recruteur via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    // Recherche Google restreinte au site (plus fiable que la recherche
    // interne du site, souvent capricieuse) : tombe directement sur
    // l'annonce exacte, ou à défaut sur les plus proches.
    contact:"https://www.google.com/search?q=" + encodeURIComponent('site:jobguinee-pro.com "Stagiaire en Technologies de l\'information"'),
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"informatique reseaux telecommunications cybersecurite stage",
    dateRepere:"2026-07-13"
},

{
    id:102,
    metier:"Stagiaire en Logistique & Approvisionnement",
    entreprise:"Secteur minier - via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.google.com/search?q=" + encodeURIComponent('site:jobguinee-pro.com "Stagiaire en Logistique"'),
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"logistique approvisionnement procurement stage mines",
    dateRepere:"2026-07-13"
},

{
    id:103,
    metier:"Stagiaire en Finance",
    entreprise:"Secteur minier - via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.google.com/search?q=" + encodeURIComponent('site:jobguinee-pro.com "Stagiaire en Finance"'),
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"finance comptabilite stage excel analyse financiere",
    dateRepere:"2026-07-13"
},

{
    id:104,
    metier:"Monteur Vidéo",
    entreprise:"Recruteur via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.google.com/search?q=" + encodeURIComponent('site:jobguinee-pro.com "Monteur Vidéo"'),
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"montage video capcut davinci resolve premiere pro publicite marketing",
    dateRepere:"2026-07-13"
},

{
    id:105,
    metier:"Développeur Commercial",
    entreprise:"INAB TravelTech Guinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    // Lien direct vers les résultats de recherche filtrés sur "commercial"
    // (au lieu de la page d'accueil) : l'utilisateur tombe directement sur
    // les annonces du secteur au lieu de devoir chercher lui-même.
    contact:"https://www.emploiguinee.com/recherche-jobs-guinee/commercial",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"developpement commercial prospection vente",
    dateRepere:"2026-07-13"
},

{
    id:106,
    metier:"Business Developer Junior",
    entreprise:"Palma Talents",
    lieu:"Conakry, Guinée",
    mode:"site",
    // Lien direct vers l'annonce (permalien vérifié).
    contact:"https://www.emploiguinee.com/offre-emploi-guinee/business-developer-junior-teletravail-273078",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"business developer commercial prospection opportunites",
    dateRepere:"2026-07-13"
},

{
    id:107,
    metier:"Commercial B2B",
    entreprise:"Palma Talents",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.emploiguinee.com/recherche-jobs-guinee/commercial",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"commercial vente negociation portefeuille clients",
    dateRepere:"2026-07-13"
},

{
    id:108,
    metier:"Responsable de Zone",
    entreprise:"Secteur Optique / Santé visuelle",
    lieu:"Guinée (toutes régions)",
    mode:"site",
    contact:"https://www.google.com/search?q=" + encodeURIComponent('site:jobguinee-pro.com "Responsable de Zone"'),
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"management equipe comptabilite finance",
    dateRepere:"2026-07-13"
}

];

offres = offres.concat(offresGuinee);

// 🕑 Au chargement de la page, on recharge aussi les offres dynamiques
// trouvées lors de recherches précédentes (persistées dans localStorage),
// à condition qu'elles aient moins de 2 semaines. Ainsi, recharger la page
// n'efface pas les offres déjà trouvées — elles apparaissent directement
// dans "Anciennes offres" sans attendre une nouvelle recherche.
(function chargerOffresDynamiquesInitiales(){
    let precedentes = JSON.parse(localStorage.getItem("offresDynamiques")) || [];
    let maintenant = Date.now();
    let duree = 14 * 24 * 60 * 60 * 1000;
    let encoreValides = precedentes.filter(o =>
        (maintenant - new Date(o.dateAjout).getTime()) < duree
    );
    offres = offres.concat(encoreValides.map(o => Object.assign({}, o, { nouvelle:false })));
})();


// Etat temporaire pour le suivi des documents manquants
let offreEnCours = null;
let documentsManquants = [];


//////////////////////////////////////////////////////
// 📍 REPÉRAGE : indiquer à l'utilisateur où se rendre
//////////////////////////////////////////////////////

// Affiche un bandeau cliquable juste sous le message de l'assistant,
// et fait défiler automatiquement la page vers la section concernée.
function signalerSection(idSection, texte){

    let zone = document.getElementById("repere");

    if(zone){
        zone.innerHTML = `
        <div class="repere-section">
        👉 ${texte}
        <button onclick="allerA('${idSection}')">📍 Aller à cette section</button>
        </div>
        `;
    }

    allerA(idSection);

}

// Fait défiler la page en douceur vers une section donnée
function allerA(idSection){

    afficherOnglet(idSection);

}


// ===========================================================
// 🗂️ NAVIGATION PAR ONGLETS
// ===========================================================
// Une seule section est visible à la fois (au lieu de tout empiler
// sur une seule page géante), pour réduire drastiquement le scroll.
// ===========================================================

const ONGLETS_VALIDES = [
    "assistant", "profilSection", "resultats",
    "documents", "candidatures", "notifications"
];

// ===========================================================
// 🔴 BADGES DE NOTIFICATION SUR LES ONGLETS
// ===========================================================
// Un chiffre s'affiche sur l'icône d'un onglet tant qu'un événement
// n'a pas été consulté (nouvelle offre, document généré, statut de
// candidature, notification). Le badge disparaît dès que l'onglet
// concerné est ouvert.
// ===========================================================

function lireBadges(){
    return JSON.parse(localStorage.getItem("badgesOnglets")) || {};
}

function incrementerBadge(idOnglet, n){

    n = n || 1;
    if(n <= 0) return;

    let badges = lireBadges();
    badges[idOnglet] = (badges[idOnglet] || 0) + n;

    localStorage.setItem("badgesOnglets", JSON.stringify(badges));
    majAffichageBadges();

}

function reinitialiserBadge(idOnglet){

    let badges = lireBadges();

    if(badges[idOnglet]){
        badges[idOnglet] = 0;
        localStorage.setItem("badgesOnglets", JSON.stringify(badges));
        majAffichageBadges();
    }

}

function majAffichageBadges(){

    let badges = lireBadges();

    document.querySelectorAll("#navOnglets button").forEach(bouton => {

        let id = bouton.dataset.onglet;
        let ancien = bouton.querySelector(".badge-onglet");
        if(ancien) ancien.remove();

        let n = badges[id] || 0;

        if(n > 0){
            bouton.insertAdjacentHTML(
                "beforeend",
                `<span class="badge-onglet">${n > 9 ? "9+" : n}</span>`
            );
        }

    });

}


function afficherOnglet(idSection){

    if(!ONGLETS_VALIDES.includes(idSection)) return;

    ONGLETS_VALIDES.forEach(id => {
        let section = document.getElementById(id);
        if(section){
            section.style.display = (id === idSection) ? "block" : "none";
        }
    });

    document.querySelectorAll("#navOnglets button").forEach(bouton => {
        bouton.classList.toggle("onglet-actif", bouton.dataset.onglet === idSection);
    });

    window.scrollTo({top:0, behavior:"instant"});

    reinitialiserBadge(idSection);

}

// Affiche l'onglet Assistant par défaut au chargement de la page, et
// restaure les badges en attente d'une session précédente.
document.addEventListener("DOMContentLoaded", () => {
    afficherOnglet("assistant");
    majAffichageBadges();
});


// Fonction principale de l'assistant

function assistantIA(){


let profil =
JSON.parse(localStorage.getItem("profil"));



if(!profil){


demarrerCreationProfil();

return;


}



document.getElementById("messageAssistant").innerHTML =

"🤖 J'analyse votre profil et je recherche les meilleures opportunités...";


setTimeout(()=>{

rechercherOffresAPI();

},1000);



}
//////////////////////////////////////////////////////
// 👤 CREATION DU PROFIL
//////////////////////////////////////////////////////

function demarrerCreationProfil(){

    document.getElementById("messageAssistant").innerHTML =
    "👋 Bienvenue ! Créons votre profil professionnel.<br><br>Quel est votre nom ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Votre nom">

    <button onclick="enregistrerNom()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerNom(){

    let nom =
    document.getElementById("reponseIA").value;


    if(nom===""){
        alert("Veuillez entrer votre nom.");
        return;
    }


    localStorage.setItem("nomTemp",nom);


    document.getElementById("messageAssistant").innerHTML =
    "Très bien "+nom+". Quel est votre email ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" type="email" placeholder="Exemple : nom@exemple.com">

    <button onclick="enregistrerEmail()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerEmail(){

    let email =
    document.getElementById("reponseIA").value;


    if(email===""){
        alert("Veuillez entrer votre email.");
        return;
    }


    localStorage.setItem("emailTemp",email);


    document.getElementById("messageAssistant").innerHTML =
    "Parfait. Quel est votre numéro de contact (téléphone) ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" type="tel" placeholder="Exemple : +224 6XX XX XX XX">

    <button onclick="enregistrerContact()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerContact(){

    let contact =
    document.getElementById("reponseIA").value;


    if(contact===""){
        alert("Veuillez entrer votre numéro de contact.");
        return;
    }


    localStorage.setItem("contactTemp",contact);


    document.getElementById("messageAssistant").innerHTML =
    "Quelle est votre ville ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Votre ville">

    <button onclick="enregistrerVille()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerVille(){

    let ville =
    document.getElementById("reponseIA").value;


    if(ville===""){
        alert("Veuillez entrer votre ville.");
        return;
    }


    localStorage.setItem("villeTemp",ville);


    document.getElementById("messageAssistant").innerHTML =
    "Parfait. Quel métier recherchez-vous ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Exemple : Développeur Web">

    <button onclick="enregistrerMetier()">
    Continuer ➡️
    </button>

    `;

}
//////////////////////////////////////////////////////
// 👤 SUITE CREATION PROFIL
//////////////////////////////////////////////////////

function enregistrerMetier(){

    let metier =
    document.getElementById("reponseIA").value;


    if(metier===""){
        alert("Veuillez entrer un métier.");
        return;
    }


    localStorage.setItem("metierTemp",metier);


    document.getElementById("messageAssistant").innerHTML =
    "Quelles sont vos compétences ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Exemple : HTML, CSS, JavaScript">

    <button onclick="enregistrerCompetence()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerCompetence(){

    let competence =
    document.getElementById("reponseIA").value;


    if(competence===""){
        alert("Veuillez entrer vos compétences.");
        return;
    }


    localStorage.setItem("competenceTemp",competence);


    document.getElementById("messageAssistant").innerHTML =
    "Quelle est votre formation ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Exemple : Licence informatique">

    <button onclick="enregistrerFormation()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerFormation(){

    let formation =
    document.getElementById("reponseIA").value;


    if(formation===""){
        alert("Veuillez entrer votre formation.");
        return;
    }


    localStorage.setItem("formationTemp",formation);


    document.getElementById("messageAssistant").innerHTML =
    "Avez-vous une expérience professionnelle ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <button onclick="avecExperienceIA()">
    ✅ Oui
    </button>

    <button onclick="sansExperienceIA()">
    ❌ Non
    </button>

    `;

}
//////////////////////////////////////////////////////
// 👤 FIN CREATION PROFIL
//////////////////////////////////////////////////////

function avecExperienceIA(){

    document.getElementById("messageAssistant").innerHTML =
    "Décrivez votre expérience professionnelle.";


    document.getElementById("actionsAssistant").innerHTML = `

    <textarea id="reponseIA" placeholder="Exemple : Stage développeur web pendant 6 mois"></textarea>

    <button onclick="enregistrerExperienceIA()">
Continuer ➡️
    </button>

    `;

}



function sansExperienceIA(){

    localStorage.setItem(
        "experienceTemp",
        "Aucune expérience professionnelle"
    );


    demanderLangues();

}



function terminerProfilIA(){


let profil = {

nom: localStorage.getItem("nomTemp"),

email: localStorage.getItem("emailTemp"),

contact: localStorage.getItem("contactTemp"),

ville: localStorage.getItem("villeTemp"),

metier: localStorage.getItem("metierTemp"),

competence: localStorage.getItem("competenceTemp"),

formation: localStorage.getItem("formationTemp"),

experience:
localStorage.getItem("experienceTemp") || 
document.getElementById("reponseIA")?.value || 
"Aucune expérience",
langues: localStorage.getItem("languesTemp"),

loisirs: localStorage.getItem("loisirsTemp")

};



localStorage.setItem(
"profil",
JSON.stringify(profil)
);



document.getElementById("messageAssistant").innerHTML =

"🎉 Votre profil professionnel est terminé.<br><br>🤖 Je vais maintenant analyser les opportunités adaptées à votre profil.";



document.getElementById("actionsAssistant").innerHTML =

"🤖 Recherche des opportunités adaptées...";


setTimeout(()=>{

    rechercherOffresAPI();

},1500);



afficherProfilIA();

afficherRechercheExterne();


ajouterNotificationUnique(
    "✅ Votre profil professionnel a été créé.",
    "profilSection"
);


signalerSection(
    "profilSection",
    "Votre profil est prêt, rendez-vous dans la section 👤 Mon profil pour le consulter."
);


}
//////////////////////////////////////////////////////
// 👤 AFFICHER LE PROFIL
//////////////////////////////////////////////////////

function afficherProfilIA(){

    let profil =
    JSON.parse(localStorage.getItem("profil"));

    let zone = document.getElementById("profil");

    if(!profil){
        zone.innerHTML = "Aucun profil créé.";
        return;
    }

    zone.innerHTML = `
        <p><b>👤 ${profil.nom}</b></p>
        <p>📧 ${profil.email || "Non renseigné"}</p>
        <p>📞 ${profil.contact || "Non renseigné"}</p>
        <p>📍 ${profil.ville}</p>
        <p>💼 ${profil.metier}</p>
        <p>🛠 ${profil.competence}</p>
        <p>🎓 ${profil.formation}</p>
        <p>💻 ${profil.experience}</p>
        <p>🌍 ${profil.langues}</p>
        <p>🎯 ${profil.loisirs}</p>
        <button onclick="modifierProfil()">✏️ Modifier mon profil</button>
    `;

}

// Formulaire d'édition en une seule fois (plus rapide que de reprendre
// tout l'assistant question par question) — tous les champs déjà remplis
// avec les valeurs actuelles.
function modifierProfil(){

    let profil = JSON.parse(localStorage.getItem("profil"));

    if(!profil){
        demarrerCreationProfil();
        return;
    }

    document.getElementById("messageAssistant").innerHTML =
    "✏️ Modifiez les informations ci-dessous, puis validez. Le <b>métier recherché</b> est le champ le plus important : c'est lui qui détermine les offres qui vous seront proposées.";

    document.getElementById("actionsAssistant").innerHTML = `

    <label>Nom</label>
    <input id="modifNom" value="${profil.nom || ''}">

    <label>Email</label>
    <input id="modifEmail" type="email" value="${profil.email || ''}">

    <label>Contact (téléphone)</label>
    <input id="modifContact" value="${profil.contact || ''}">

    <label>Ville</label>
    <input id="modifVille" value="${profil.ville || ''}">

    <label>Métier recherché</label>
    <input id="modifMetier" value="${profil.metier || ''}">

    <label>Compétences</label>
    <input id="modifCompetence" value="${profil.competence || ''}">

    <label>Formation</label>
    <input id="modifFormation" value="${profil.formation || ''}">

    <label>Expérience</label>
    <input id="modifExperience" value="${profil.experience || ''}">

    <label>Langues parlées</label>
    <input id="modifLangues" value="${profil.langues || ''}">

    <label>Loisirs</label>
    <input id="modifLoisirs" value="${profil.loisirs || ''}">

    <button onclick="enregistrerModificationsProfil()">💾 Enregistrer les modifications</button>
    <button onclick="afficherProfilIA()">Annuler</button>

    `;

}

function enregistrerModificationsProfil(){

    let profil = JSON.parse(localStorage.getItem("profil")) || {};

    let champ = (id) => document.getElementById(id).value.trim();

    profil.nom = champ("modifNom");
    profil.email = champ("modifEmail");
    profil.contact = champ("modifContact");
    profil.ville = champ("modifVille");
    profil.metier = champ("modifMetier");
    profil.competence = champ("modifCompetence");
    profil.formation = champ("modifFormation");
    profil.experience = champ("modifExperience");
    profil.langues = champ("modifLangues");
    profil.loisirs = champ("modifLoisirs");

    if(!profil.nom || !profil.metier){
        alert("Le nom et le métier recherché sont obligatoires.");
        return;
    }

    localStorage.setItem("profil", JSON.stringify(profil));

    afficherProfilIA();

    document.getElementById("messageAssistant").innerHTML =
    "✅ Profil mis à jour. Relancez une recherche pour actualiser vos offres recommandées selon vos nouvelles informations.";

    document.getElementById("actionsAssistant").innerHTML = `
    <button onclick="assistantIA()">🔄 Relancer la recherche avec mon profil à jour</button>
    `;

}

// Efface complètement le profil et les offres accumulées en mémoire,
// puis recharge la page pour repartir d'un état propre (équivalent à
// remettre le compteur à zéro).
function effacerProfilIA(){

    if(!confirm("Effacer votre profil et recommencer à zéro ?")) return;

    localStorage.removeItem("profil");
    localStorage.removeItem("nomTemp");
    localStorage.removeItem("emailTemp");
    localStorage.removeItem("villeTemp");
    localStorage.removeItem("metierTemp");
    localStorage.removeItem("competenceTemp");
    localStorage.removeItem("formationTemp");
    localStorage.removeItem("experienceTemp");
    localStorage.removeItem("languesTemp");
    localStorage.removeItem("loisirsTemp");

    location.reload();

}
//////////////////////////////////////////////////////
// 🌐 RECHERCHE D'OFFRES RÉELLES VIA DES API GRATUITES
// (Arbeitnow = Europe/remote, RemoteOK = international/remote)
//////////////////////////////////////////////////////

// Détecte une adresse email dans un texte (description d'offre, etc.)
// Si trouvée, la candidature doit être envoyée par email plutôt que
// redirigée vers le site de l'offre.
function detecterModeEnvoi(texte, urlParDefaut){

    if(texte){
        let regexEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        let trouve = texte.match(regexEmail);

        if(trouve){
            return { mode: "email", contact: trouve[0] };
        }
    }

    return { mode: "site", contact: urlParDefaut };
}

// Construit l'URL à appeler pour une source donnée : si le Worker proxy
// (URL_PROXY_EMPLOIGUINEE) est configuré, on passe par lui avec ?source=xxx
// (aucun blocage CORS possible, l'appel est fait serveur-à-serveur côté
// Worker). Sinon, on retombe sur l'appel direct à l'API (avec repli via
// proxy CORS public géré par fetchAvecSecoursCORS).
function urlPourSource(nomSource, urlDirecte){

    if(URL_PROXY_EMPLOIGUINEE){
        let separateur = URL_PROXY_EMPLOIGUINEE.includes("?") ? "&" : "?";
        return URL_PROXY_EMPLOIGUINEE + separateur + "source=" + nomSource;
    }

    return urlDirecte;

}

// Essaie un fetch direct ; si ça échoue (souvent un blocage CORS de l'API
// depuis un navigateur mobile ou un hébergement statique), retente via un
// proxy CORS public gratuit avant d'abandonner.
async function fetchAvecSecoursCORS(url){

    try {

        let reponse = await fetch(url);

        if(!reponse.ok){
            throw new Error("HTTP " + reponse.status);
        }

        return await reponse.json();

    } catch(erreurDirecte){

        try {

            let reponseProxy = await fetch(
                "https://api.allorigins.win/raw?url=" + encodeURIComponent(url)
            );

            if(!reponseProxy.ok){
                throw new Error("HTTP " + reponseProxy.status + " (via proxy)");
            }

            return await reponseProxy.json();

        } catch(erreurProxy){

            throw new Error(
                "Direct: " + erreurDirecte.message + " | Proxy: " + erreurProxy.message
            );

        }

    }

}

// 🌐 Point d'entrée unique : si le Worker unifié est configuré, on ne fait
// plus qu'UN SEUL appel réseau (/api/jobs), qui remplace les 4 appels
// séparés d'avant. Sinon, on retombe sur l'ancien circuit (secours).
async function rechercherOffresAPI(){

    let profil = JSON.parse(localStorage.getItem("profil"));

    if(!profil){
        demarrerCreationProfil();
        return;
    }

    if(URL_WORKER_API){
        return rechercherOffresViaWorker(profil);
    }

    return rechercherOffresAPI_legacy(profil);
}

async function rechercherOffresViaWorker(profil){

    document.getElementById("messageAssistant").innerHTML =
    "🌐 Recherche d'offres réelles en cours (via le Worker unifié)...";

    let resultatsBruts = [];
    let ligneDiagnostic = "";
    let echecWorker = false;

    try {

        let reponse = await fetch(URL_WORKER_API + "/api/jobs");

        if(!reponse.ok){
            throw new Error("HTTP " + reponse.status);
        }

        let data = await reponse.json();
        resultatsBruts = data.jobs || [];

        console.log("[Worker] Offres reçues brutes :", resultatsBruts.length, data);

        ligneDiagnostic = (data.diagnostic || []).map(d =>
            d.erreur ?
            `${d.source} : ❌ échec (${d.erreur})` :
            `${d.source} : ✅ ${d.compte} offre(s)`
        ).join("<br>");

        ligneDiagnostic += (ligneDiagnostic ? "<br>" : "") + `Guinée : ✅ offres statiques incluses`;

    } catch(erreur){

        console.error("Erreur Worker /api/jobs :", erreur);
        echecWorker = true;

        ligneDiagnostic = `Worker unifié : ❌ échec (${erreur.message}) — repli sur le circuit direct`;

    }

    // 🔁 Repli automatique : si le Worker n'a rien renvoyé (en panne, mal
    // déployé, réponse vide...), on ne reste PAS bloqué sur les offres
    // statiques : on relance immédiatement l'ancien circuit multi-sources
    // (Arbeitnow, RemoteOK, Jobicy, EmploiGuinée) en appel direct.
    if(echecWorker || resultatsBruts.length === 0){

        console.warn("[Worker] Aucune offre exploitable, repli sur rechercherOffresAPI_legacy()");

        document.getElementById("messageAssistant").innerHTML =
        "⚠️ Le Worker n'a renvoyé aucune offre. Nouvelle tentative via le circuit direct...";

        return rechercherOffresAPI_legacy(profil, ligneDiagnostic);

    }

    genererResultatsRecherche(resultatsBruts, ligneDiagnostic, profil);

}

// Reprend la logique de filtrage/fusion qui existait déjà, désormais
// partagée entre le circuit Worker et le circuit de secours.
// Durée de validité d'une offre dynamique (récupérée via API) avant
// archivage automatique.
const DUREE_VALIDITE_OFFRE_MS = 14 * 24 * 60 * 60 * 1000; // 2 semaines

async function genererResultatsRecherche(resultatsBruts, ligneDiagnostic, profil){

    console.log("[Pipeline] Étape 1 — offres brutes reçues :", resultatsBruts.length);

    if(resultatsBruts.length === 0){
        document.getElementById("messageAssistant").innerHTML =
        "⚠️ Impossible de récupérer des offres en ligne pour le moment.<br><br>📋 Détail par source :<br>" + ligneDiagnostic;
        return;
    }

    // 🇫🇷/🇬🇧 Le mot-clé du profil peut être en français ("développeur")
    // alors que les offres internationales sont en anglais ("developer").
    // Un petit dictionnaire couvre les métiers les plus courants, complété
    // par une vraie traduction FR→EN (via le Worker) pour couvrir aussi
    // les métiers qui n'y figurent pas.
    let equivalences = {
        "developpeur": ["developer", "dev", "engineer", "programmer"],
        "comptable": ["accountant", "accounting", "finance"],
        "commercial": ["sales", "business"],
        "assistant": ["assistant", "support", "admin"],
        "informatique": ["it", "software", "tech", "computer"],
        "marketing": ["marketing", "growth"],
        "design": ["designer", "design", "ui", "ux"],
        "ressources": ["hr", "recruiter", "recruitment"],
        "professeur": ["teacher", "tutor", "education"],
        "infirmier": ["nurse", "nursing", "health"],
        "chauffeur": ["driver", "delivery"],
        "cuisinier": ["cook", "chef", "kitchen"],
        "electricien": ["electrician", "electrical"],
        "juriste": ["lawyer", "legal", "paralegal"],
        "traducteur": ["translator", "translation"],
        "redacteur": ["writer", "content", "copywriter"]
    };

    function normaliser(texte){
        return (texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");
    }

    function motsSignificatifs(texte){
        return normaliser(texte).split(" ").filter(m => m.length > 2);
    }

    let motsMetier = motsSignificatifs(profil.metier);
    let motsFormation = motsSignificatifs(profil.formation);

    // Élargit avec le petit dictionnaire connu...
    let motsElargisMetier = [...motsMetier];
    motsMetier.forEach(mot => {
        Object.keys(equivalences).forEach(cle => {
            if(mot.includes(cle) || cle.includes(mot)){
                motsElargisMetier.push(...equivalences[cle]);
            }
        });
    });

    // ...puis avec une vraie traduction anglaise du métier recherché, pour
    // couvrir les métiers absents du dictionnaire (ex: "boulanger",
    // "menuisier", "infographiste"...).
    if(profil.metier){
        let [metierEnglish] = await traduireTextes([profil.metier], "en");
        if(metierEnglish){
            motsElargisMetier.push(...motsSignificatifs(metierEnglish));
        }
    }

    function filtrerParMots(motsRecherches){
        if(motsRecherches.length === 0) return [];
        return resultatsBruts.filter(o => {
            let texte = normaliser(o.metier + " " + (o.tags || ""));
            return motsRecherches.some(mot => texte.includes(mot));
        });
    }

    // 1️⃣ On cherche d'abord selon le métier recherché.
    let filtrees = filtrerParMots(motsElargisMetier);
    console.log("[Pipeline] Étape 2 — après filtrage métier (" + motsElargisMetier.join(",") + ") :", filtrees.length);

    // 2️⃣ Si trop peu de résultats, on élargit avec les mots de la
    // formation (ex : "Gestion des Ressources Humaines" peut faire
    // remonter des offres RH même si le métier recherché est formulé
    // différemment), en les ajoutant à la liste plutôt qu'en remplaçant.
    if(filtrees.length < 5 && motsFormation.length > 0){
        let filtreesFormation = filtrerParMots(motsFormation);
        let idsDejaTrouves = new Set(filtrees.map(o => o.metier + o.entreprise + o.source));
        filtreesFormation.forEach(o => {
            let cle = o.metier + o.entreprise + o.source;
            if(!idsDejaTrouves.has(cle)){
                filtrees.push(o);
                idsDejaTrouves.add(cle);
            }
        });
        console.log("[Pipeline] Étape 2b — après ajout formation (" + motsFormation.join(",") + ") :", filtrees.length);
    }

    // 3️⃣ Si vraiment rien ne correspond (aucune offre internationale dans
    // ce domaine précis en ce moment), on le dit clairement plutôt que
    // d'afficher des offres sans rapport comme si elles étaient pertinentes.
    let aucuneCorrespondance = filtrees.length === 0;
    if(aucuneCorrespondance){
        console.log("[Pipeline] Étape 2c — aucune offre internationale ne correspond au métier/formation en ce moment");
    }

    // 🕑 On recharge les offres dynamiques (issues des API) trouvées lors
    // des recherches précédentes et persistées dans localStorage, pour ne
    // pas les perdre en rechargeant la page — puis on archive (retire)
    // automatiquement celles qui datent de plus de 2 semaines.
    let offresDynamiquesPrecedentes =
        JSON.parse(localStorage.getItem("offresDynamiques")) || [];

    let maintenant = Date.now();

    let offresEncoreValides = offresDynamiquesPrecedentes.filter(o =>
        (maintenant - new Date(o.dateAjout).getTime()) < DUREE_VALIDITE_OFFRE_MS
    );

    let nombreArchivees = offresDynamiquesPrecedentes.length - offresEncoreValides.length;

    // 🔁 Base propre : offres Guinée statiques (permanentes, ne s'archivent
    // jamais) + offres dynamiques encore valides, reclassées "anciennes".
    offres = JSON.parse(JSON.stringify(offresGuinee)).concat(
        offresEncoreValides.map(o => Object.assign({}, o, { nouvelle:false }))
    );

    let idSuivant = Math.max(0, ...offres.map(o => o.id)) + 1;
    let nouvellesOffres = 0;
    let ignoreesDoublon = 0;

    // 🔑 Clé de déduplication robuste : on ne se fie plus seulement à
    // "contact", car deux offres différentes peuvent toutes les deux avoir
    // un contact vide/undefined et se faire éliminer à tort l'une l'autre.
    // On combine plusieurs champs, et on n'utilise "contact" comme critère
    // que s'il est réellement renseigné.
    function cleUnique(o){
        let base = (o.metier || "") + "|" + (o.entreprise || "") + "|" + (o.source || "");
        return o.contact ? base + "|" + o.contact : base;
    }

    let clesExistantes = new Set(offres.map(cleUnique));

    // ⚠️ Plus de plafond artificiel à 40 : chaque API (Arbeitnow, RemoteOK,
    // Jobicy) peut renvoyer jusqu'à 100 offres, donc jusqu'à ~300 au total.
    // On les ajoute TOUTES (après filtrage mot-clé et déduplication) plutôt
    // que d'en tronquer une partie arbitrairement.
    filtrees.forEach(o => {

        let cle = cleUnique(o);
        let dejaPresente = clesExistantes.has(cle);

        if(!dejaPresente){
            o.id = idSuivant;
            idSuivant++;
            o.dateAjout = new Date().toISOString();
            o.nouvelle = true;
            offres.push(o);
            clesExistantes.add(cle);
            nouvellesOffres++;
        } else {
            ignoreesDoublon++;
        }

    });

    // 💾 On persiste toutes les offres dynamiques (nouvelles + anciennes
    // encore valides) pour la prochaine recherche. Les offres Guinée
    // statiques n'ont pas de "dateAjout" : elles ne sont donc jamais
    // incluses ici, ni jamais archivées.
    let offresDynamiquesAPersister = offres.filter(o => o.dateAjout);
    localStorage.setItem("offresDynamiques", JSON.stringify(offresDynamiquesAPersister));

    console.log(
        "[Pipeline] Étape 3 — nouvelles :", nouvellesOffres,
        "| anciennes encore valides :", offresEncoreValides.length,
        "| doublons ignorés :", ignoreesDoublon,
        "| archivées (> 2 semaines) :", nombreArchivees
    );

    document.getElementById("messageAssistant").innerHTML =
    (aucuneCorrespondance ?
        `⚠️ Aucune offre internationale ne correspond précisément à "${profil.metier}" pour le moment (les résultats ci-dessous sont les offres Guinée et celles déjà trouvées auparavant).<br>💡 Essayez de reformuler le métier dans votre profil (ex: un métier plus général) si vous voulez élargir la recherche.<br><br>`
        :
        `✅ ${nouvellesOffres} nouvelle(s) offre(s) réelle(s) récupérée(s) dans le monde entier` +
        (offresEncoreValides.length ? `, en plus des ${offresEncoreValides.length} offre(s) déjà trouvée(s) toujours valables.` : `.`) +
        (nombreArchivees ? `<br>🗄️ ${nombreArchivees} offre(s) de plus de 2 semaines ont été archivées automatiquement.` : ``) +
        `<br><br>`
    ) +
    `📋 Détail par source :<br>${ligneDiagnostic}<br><br>Analyse en cours...`;

    if(nouvellesOffres > 0){
        incrementerBadge("resultats", nouvellesOffres);
    }

    analyserOffres();

}

// 🔁 Ancien circuit multi-appels, gardé comme secours si le Worker unifié
// (URL_WORKER_API) n'est pas configuré.
async function rechercherOffresAPI_legacy(profil, diagnosticPrefixe){

    document.getElementById("messageAssistant").innerHTML =
    "🌐 Recherche d'offres réelles en cours, partout dans le monde (pas seulement en Guinée)...";

    let resultatsBruts = [];

    // Diagnostic visible : pour chaque source, on garde trace du nombre
    // d'offres récupérées ou de l'erreur rencontrée, affiché à l'utilisateur
    // à la fin (utile sur mobile, où la console développeur n'est pas
    // accessible facilement).
    let diagnosticSources = [];

    // --- Arbeitnow (pas de clé, CORS généralement activé) ---
    try {
        let data = await fetchAvecSecoursCORS(
            urlPourSource("arbeitnow", "https://www.arbeitnow.com/api/job-board-api")
        );
        let compteAvant = resultatsBruts.length;

        (data.data || []).forEach(job => {

            let { mode, contact } = detecterModeEnvoi(job.description, job.url);

            resultatsBruts.push({
                metier: job.title,
                entreprise: job.company_name,
                lieu: job.location || (job.remote ? "Télétravail" : "Non précisé"),
                mode: mode,
                contact: contact,
                documents: ["CV", "Lettre de motivation"],
                source: "Arbeitnow",
                tags: (job.tags || []).join(" ")
            });
        });

        diagnosticSources.push({ nom: "Arbeitnow", compte: resultatsBruts.length - compteAvant, erreur: null });

    } catch(erreur){
        console.error("Erreur API Arbeitnow :", erreur);
        diagnosticSources.push({ nom: "Arbeitnow", compte: 0, erreur: erreur.message });
    }

    // --- RemoteOK (pas de clé) ---
    try {
        let data2 = await fetchAvecSecoursCORS(
            urlPourSource("remoteok", "https://remoteok.com/api")
        );
        let compteAvant = resultatsBruts.length;

        data2.forEach(job => {
            // Le tout premier élément du tableau est une mention légale, pas une offre
            if(!job.id || !job.position) return;

            let urlOffre = job.url || ("https://remoteok.com/remote-jobs/" + job.id);
            let { mode, contact } = detecterModeEnvoi(job.description, urlOffre);

            resultatsBruts.push({
                metier: job.position,
                entreprise: job.company,
                lieu: job.location || "Télétravail",
                mode: mode,
                contact: contact,
                documents: ["CV", "Lettre de motivation"],
                source: "RemoteOK",
                tags: (job.tags || []).join(" ")
            });
        });

        diagnosticSources.push({ nom: "RemoteOK", compte: resultatsBruts.length - compteAvant, erreur: null });

    } catch(erreur){
        console.error("Erreur API RemoteOK :", erreur);
        diagnosticSources.push({ nom: "RemoteOK", compte: 0, erreur: erreur.message });
    }

    // --- Jobicy (pas de clé) : diversifie au-delà du remote/tech pur,
    // avec des offres de nombreux secteurs (marketing, santé, RH, design...)
    // et régions (USA, Europe, Amérique latine, etc.) ---
    try {
        let data4 = await fetchAvecSecoursCORS(
            urlPourSource("jobicy", "https://jobicy.com/api/v2/remote-jobs?count=50")
        );
        let compteAvant = resultatsBruts.length;

        (data4.jobs || []).forEach(job => {

            let { mode, contact } = detecterModeEnvoi(job.jobDescription, job.url);

            resultatsBruts.push({
                metier: job.jobTitle,
                entreprise: job.companyName,
                lieu: job.jobGeo || "Télétravail",
                mode: mode,
                contact: contact,
                documents: ["CV", "Lettre de motivation"],
                source: "Jobicy",
                tags: (job.jobIndustry || "") + " " + (job.jobExcerpt || "")
            });
        });

        diagnosticSources.push({ nom: "Jobicy", compte: resultatsBruts.length - compteAvant, erreur: null });

    } catch(erreur){
        console.error("Erreur API Jobicy :", erreur);
        diagnosticSources.push({ nom: "Jobicy", compte: 0, erreur: erreur.message });
    }

    // --- EmploiGuinée via ton Worker Cloudflare (si déployé) ---
    if(URL_PROXY_EMPLOIGUINEE){
        try {
            let res3 = await fetch(URL_PROXY_EMPLOIGUINEE);
            let data3 = await res3.json();

            (data3.jobs || []).forEach(job => {

                let { mode, contact } = detecterModeEnvoi(
                    job.description,
                    "https://www.emploiguinee.com/"
                );

                resultatsBruts.push({
                    metier: job.metier,
                    entreprise: job.entreprise,
                    lieu: job.lieu || "Guinée",
                    mode: mode,
                    contact: contact,
                    documents: ["CV", "Lettre de motivation"],
                    source: "EmploiGuinée (auto)",
                    tags: (job.description || "").toLowerCase()
                });
            });

        } catch(erreur){
            console.error("Erreur proxy EmploiGuinée :", erreur);
        }
    }

    // 📋 Ligne de diagnostic visible sur l'écran (pas seulement en console),
    // pour comprendre directement depuis le téléphone quelle(s) source(s)
    // ont échoué et pourquoi.
    let ligneDiagnostic = diagnosticSources.map(d =>
        d.erreur ?
        `${d.nom} : ❌ échec (${d.erreur})` :
        `${d.nom} : ✅ ${d.compte} offre(s)`
    ).join("<br>");

    if(diagnosticPrefixe){
        ligneDiagnostic = diagnosticPrefixe + "<br>" + ligneDiagnostic;
    }

    console.log("[Legacy] Offres brutes récupérées avant filtrage :", resultatsBruts.length);

    genererResultatsRecherche(resultatsBruts, ligneDiagnostic, profil);

}

//////////////////////////////////////////////////////
// 🤖 ANALYSE INTELLIGENTE DES OFFRES
//////////////////////////////////////////////////////

function analyserOffres(){

let profil =
JSON.parse(localStorage.getItem("profil"));


if(!profil){
    alert("Aucun profil trouvé.");
    return;
}


function normaliser(texte){
    return (texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}

// 🎯 Priorité explicite : le métier recherché compte le plus, la
// formation ensuite, et la ville en dernier (bonus, pas obligatoire —
// beaucoup d'offres internationales sont en télétravail et n'ont pas de
// ville guinéenne).
let motsMetier = normaliser(profil.metier).split(" ").filter(m => m.length > 3);
let motsFormation = normaliser(profil.formation).split(" ").filter(m => m.length > 3);
let motsCompetence = normaliser(profil.competence).split(" ").filter(m => m.length > 3);
let ville = normaliser(profil.ville);

let resultats = [];


for(let offre of offres){

let texteOffre = normaliser(offre.metier + " " + (offre.tags || ""));
let texteLieu = normaliser(offre.lieu);

let score = 0;

// 1️⃣ Métier recherché — poids le plus fort (jusqu'à 60 pts)
let pointsMetier = 0;
for(let mot of motsMetier){
    if(texteOffre.includes(mot)) pointsMetier += 20;
}
score += Math.min(60, pointsMetier);

// Mots proches liés au métier (informatique/web -> développeur...)
if(motsMetier.some(m => "informatique".includes(m) || m.includes("informatique")) && texteOffre.includes("developpeur")){
    score += 15;
}
if(motsMetier.some(m => "web".includes(m) || m.includes("web")) && texteOffre.includes("developpeur")){
    score += 15;
}

// 2️⃣ Formation — poids intermédiaire (jusqu'à 25 pts)
let pointsFormation = 0;
for(let mot of motsFormation){
    if(texteOffre.includes(mot)) pointsFormation += 10;
}
score += Math.min(25, pointsFormation);

// 2bis️⃣ Compétences — petit bonus complémentaire (jusqu'à 15 pts)
let pointsCompetence = 0;
for(let mot of motsCompetence){
    if(texteOffre.includes(mot)) pointsCompetence += 5;
}
score += Math.min(15, pointsCompetence);

// 3️⃣ Ville — bonus le plus faible, seulement si le métier ou la
// formation a déjà obtenu des points (une offre à Conakry sans rapport
// avec le métier recherché ne doit pas remonter en premier).
if(ville && texteLieu.includes(ville) && (pointsMetier > 0 || pointsFormation > 0)){
    score += 10;
}

if(score > 100){
score = 100;
}


// 🌍 Petit bonus pour les offres en télétravail : elles permettent de
// travailler pour l'étranger depuis la Guinée, ce qui est l'un des
// objectifs principaux de l'assistant.
if(offre.remote && score > 0){
score = Math.min(100, score + 10);
}


if(score > 0){

resultats.push({

offre:offre,
score:score

});

}


}


// Tri : les offres les mieux notées d'abord
resultats.sort((a,b) => b.score - a.score);

afficherOffresRecommandees(resultats);

afficherOffresRemote();

afficherToutesLesOffres(resultats);

}



function construireCarteOffre(offre, score){

    let badgeNouveau = offre.nouvelle ? `<span class="badge-nouveau">🆕 Nouveau</span>` : "";

    let indicationExpiration = "";
    if(offre.dateAjout){
        let joursRestants = Math.ceil(
            (new Date(offre.dateAjout).getTime() + DUREE_VALIDITE_OFFRE_MS - Date.now())
            / (24 * 60 * 60 * 1000)
        );
        if(joursRestants > 0){
            indicationExpiration = `<p><small>⏳ Offre valable encore ${joursRestants} jour(s)</small></p>`;
        }
    }

    return `
    <div class="offre">
    <h3>${offre.metier} ${badgeNouveau}</h3>
    <p>🏢 ${offre.entreprise}</p>
    <p>📍 ${offre.lieu}</p>
    ${offre.remote ? `<p><span class="badge-remote">🌍 Télétravail</span></p>` : ""}
    ${(typeof score === "number") ? `<p>⭐ Compatibilité : ${score}%</p>` : ""}
    ${offre.source ? `<p>🌐 Source : ${offre.source}</p>` : ""}
    <p><span class="mode-envoi">${offre.mode === "email" ? "📧 Réponse par email" : "🌐 Réponse via site web"}</span></p>
    ${indicationExpiration}
    <button onclick="choisirOffre(${offre.id})">
    🚀 Préparer cette candidature
    </button>
    </div>
    `;

}

const NOMBRE_INITIAL_PAR_SECTION = 3;

function rendreSectionRepliable(idConteneur, items, construireCarte, messageVide){

    let zone = document.getElementById(idConteneur);

    if(!zone) return;

    if(!items || items.length === 0){
        zone.innerHTML = messageVide || "Aucune offre pour le moment.";
        return;
    }

    let visibles = items.slice(0, NOMBRE_INITIAL_PAR_SECTION);
    let cachees = items.slice(NOMBRE_INITIAL_PAR_SECTION);

    let html = visibles.map(construireCarte).join("");

    if(cachees.length > 0){

        let idReste = idConteneur + "_reste";
        let texteBouton = `▼ Voir ${cachees.length} offre(s) de plus (${items.length} au total)`;

        html += `<div id="${idReste}" style="display:none;">${cachees.map(construireCarte).join("")}</div>`;
        html += `<button type="button" class="bouton-voir-plus" data-texte-ouvert="${texteBouton}" onclick="basculerAffichage('${idReste}', this)">${texteBouton}</button>`;

    }

    zone.innerHTML = html;

}

function basculerAffichage(idZone, bouton){

    let zone = document.getElementById(idZone);

    if(!zone) return;

    let estMasque = (zone.style.display === "none");

    zone.style.display = estMasque ? "block" : "none";

    if(bouton){
        bouton.textContent = estMasque ? "▲ Réduire" : bouton.dataset.texteOuvert;
    }

}

function afficherOffresRecommandees(resultats){

    if(resultats.length === 0){
        rendreSectionRepliable(
            "offresRecommandees",
            [],
            null,
            "😔 Aucune offre ne correspond précisément à votre profil pour le moment. Consultez les autres offres ci-dessous pour élargir votre recherche."
        );
        return;
    }

    rendreSectionRepliable(
        "offresRecommandees",
        resultats,
        (r) => construireCarteOffre(r.offre, r.score)
    );

}

//////////////////////////////////////////////////////
// 🌍 TÉLÉTRAVAIL — offres marquées remote:true
//////////////////////////////////////////////////////

function afficherOffresRemote(){

    let offresRemote = offres.filter(o => o.remote);

    rendreSectionRepliable(
        "offresRemote",
        offresRemote,
        (o) => construireCarteOffre(o),
        "Aucune offre en télétravail pour le moment — relancez une recherche pour en récupérer de nouvelles."
    );

}

//////////////////////////////////////////////////////
// 📂 TOUTES LES AUTRES OFFRES — séparées en deux sections :
// les nouvelles offres de la dernière recherche, et les anciennes offres
// (récupérées lors de recherches précédentes, toujours dans leur délai
// de validité de 2 semaines). Sans limite de nombre, seul l'affichage
// initial est replié.
//////////////////////////////////////////////////////

function afficherToutesLesOffres(resultats){

    let idsRecommandees = new Set((resultats || []).map(r => r.offre.id));

    let reste = offres.filter(o => !o.remote && !idsRecommandees.has(o.id));

    let nouvelles = reste.filter(o => o.nouvelle);
    let anciennes = reste.filter(o => !o.nouvelle);

    rendreSectionRepliable(
        "offresNouvelles",
        nouvelles,
        (o) => construireCarteOffre(o),
        "Aucune nouvelle offre pour le moment — relancez une recherche."
    );

    rendreSectionRepliable(
        "offresAnciennes",
        anciennes,
        (o) => construireCarteOffre(o),
        "Aucune autre offre disponible pour le moment."
    );

}

//////////////////////////////////////////////////////
// 🔎 RECHERCHE LIBRE — filtre en direct sur toutes les offres chargées.
//////////////////////////////////////////////////////

function filtrerRechercheOffres(texteSaisi){

    let zone = document.getElementById("offresRecherche");

    if(!zone) return;

    let requete = (texteSaisi || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

    if(requete.length === 0){
        zone.innerHTML = "";
        return;
    }

    let resultatsRecherche = offres.filter(o => {
        let texte = (
            (o.metier || "") + " " +
            (o.entreprise || "") + " " +
            (o.lieu || "") + " " +
            (o.tags || "") + " " +
            (o.source || "")
        )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");

        return texte.includes(requete);
    });

    rendreSectionRepliable(
        "offresRecherche",
        resultatsRecherche,
        (o) => construireCarteOffre(o),
        `😔 Aucune offre ne correspond à "${texteSaisi}".`
    );

}
//////////////////////////////////////////////////////
// 📋 CHOIX ET PREPARATION D'UNE OFFRE
//////////////////////////////////////////////////////

function choisirOffre(id){


let offre = offres.find(
o => o.id === id
);


if(!offre){

alert("Offre introuvable.");

return;

}



localStorage.setItem(
"offreSelectionnee",
JSON.stringify(offre)
);



document.getElementById("messageAssistant").innerHTML =

"🤖 Vous avez choisi : " 
+ offre.metier 
+ " chez "
+ offre.entreprise
+ "<br><br>Je prépare votre candidature...";



preparerCandidature(offre);



}



function preparerCandidature(offre){

let candidatures =
JSON.parse(
localStorage.getItem("candidatures")
) || [];



let existe =
candidatures.some(
c => c.id === offre.id
);



if(!existe){


candidatures.push({

id:offre.id,

metier:offre.metier,

entreprise:offre.entreprise,

date:new Date().toLocaleString(),

statut:"Préparée",

archivee:false

});


localStorage.setItem(
"candidatures",
JSON.stringify(candidatures)
);


}



afficherCandidatures();



verifierDocumentsCandidature(offre);



}
//////////////////////////////////////////////////////
// 📂 VERIFICATION DES DOCUMENTS
//////////////////////////////////////////////////////

function verifierDocumentsCandidature(offre){

    let documents =
    JSON.parse(
        localStorage.getItem("documents")
    ) || [];


    let manquants = [];


    for(let demande of offre.documents){

        if(demande === "Lettre de motivation"){
            continue;
        }

        let trouve = documents.some(
            doc => doc.type === demande
        );

        if(!trouve){
            manquants.push(demande);
        }

    }


    // Le CV est généré automatiquement s'il manque
    if(manquants.includes("CV")){

        manquants = manquants.filter(d => d !== "CV");

        // S'il manque d'autres documents (diplôme, attestation...), on les
        // réclame d'abord ; sinon on garde l'offre en attente et on laisse
        // l'utilisateur voir/traduire son CV avant de continuer.
        if(manquants.length > 0){
            genererCVAutomatique();
            demanderDocumentsManquants(offre, manquants);
            return;
        }

        offreEnAttenteLettre = offre;
        genererCVAutomatique();

        signalerSection(
            "documents",
            "Votre CV a été généré. Vous pouvez le traduire ci-dessous, puis appuyez sur \"Continuer vers la lettre de motivation\"."
        );

        return;

    }


    // S'il manque d'autres documents (diplôme, attestation...), on les réclame
    if(manquants.length > 0){

        demanderDocumentsManquants(offre, manquants);

        return;

    }


    document.getElementById("messageAssistant").innerHTML =
    "✅ Tous les documents nécessaires sont réunis.<br><br>🤖 Génération de la lettre de motivation...";

    genererLettre(offre);

    afficherApprobationCandidature(offre);

}
//////////////////////////////////////////////////////
// 📎 RECLAMATION DES DOCUMENTS MANQUANTS
//////////////////////////////////////////////////////

function demanderDocumentsManquants(offre, manquants){

    offreEnCours = offre;
    documentsManquants = manquants;

    afficherProchainDocumentManquant();

}



function afficherProchainDocumentManquant(){

    if(documentsManquants.length === 0){

        verifierDocumentsCandidature(offreEnCours);

        return;

    }


    let doc = documentsManquants[0];


    document.getElementById("messageAssistant").innerHTML =
    "⚠️ Il manque un document pour cette candidature : <b>" + doc + "</b>." +
    "<br><br>Merci de l'ajouter pour continuer.";


    document.getElementById("actionsAssistant").innerHTML = `

    <input type="file" id="fichierManquant" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">

    <button onclick="ajouterDocumentManquant('${doc}')">
    ➕ Ajouter ce document
    </button>

    `;

}



function ajouterDocumentManquant(type){

    let input = document.getElementById("fichierManquant");
    let fichier = input.files[0];


    if(!fichier){
        alert("Veuillez sélectionner un fichier avant de continuer.");
        return;
    }


    let lecteur = new FileReader();

    lecteur.onload = function(e){

        let documents =
        JSON.parse(localStorage.getItem("documents")) || [];

        documents.push({
            nom: fichier.name,
            type: type,
            contenu: e.target.result,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("documents", JSON.stringify(documents));

        afficherDocuments();

        ajouterNotificationUnique("📎 Document ajouté : " + type, "documents");

        documentsManquants.shift();

        afficherProchainDocumentManquant();

    };

    lecteur.readAsDataURL(fichier);

}
//////////////////////////////////////////////////////
// 📋 AFFICHER LES CANDIDATURES
//////////////////////////////////////////////////////

function afficherCandidatures(){

let zone = document.getElementById("listeCandidatures");


let candidatures =
JSON.parse(localStorage.getItem("candidatures")) || [];


if(candidatures.length === 0){

zone.innerHTML = "Aucune candidature.";

return;

}


let actives = candidatures.filter(c => !c.archivee);
let archivees = candidatures.filter(c => c.archivee);


let html = "";


if(actives.length === 0){

html += "Aucune candidature active.";

}else{

actives.forEach(c => {

html += `

<div class="candidature">

<b>${c.metier}</b><br>

🏢 ${c.entreprise}<br>

📅 Préparée le : ${c.date}<br>

📌 Statut : ${c.statut}

${c.dateEnvoi ? "<br>📨 Envoyée le : " + c.dateEnvoi : ""}

<br><button onclick="archiverCandidature(${c.id})">📦 Archiver</button>

</div>

`;

});

}


if(archivees.length > 0){

html += `

<details class="apercu-document">
<summary>📦 Candidatures archivées (${archivees.length})</summary>

`;

archivees.forEach(c => {

html += `

<div class="candidature">

<b>${c.metier}</b><br>

🏢 ${c.entreprise}<br>

📅 Préparée le : ${c.date}<br>

📌 Statut : ${c.statut}

${c.dateEnvoi ? "<br>📨 Envoyée le : " + c.dateEnvoi : ""}

<br><button onclick="desarchiverCandidature(${c.id})">♻️ Désarchiver</button>

</div>

`;

});

html += `</details>`;

}


zone.innerHTML = html;

}



function archiverCandidature(id){

let candidatures =
JSON.parse(localStorage.getItem("candidatures")) || [];

candidatures = candidatures.map(c => {

if(c.id === id){
c.archivee = true;
}

return c;

});

localStorage.setItem("candidatures", JSON.stringify(candidatures));

afficherCandidatures();

}



function desarchiverCandidature(id){

let candidatures =
JSON.parse(localStorage.getItem("candidatures")) || [];

candidatures = candidatures.map(c => {

if(c.id === id){
c.archivee = false;
}

return c;

});

localStorage.setItem("candidatures", JSON.stringify(candidatures));

afficherCandidatures();

}
//////////////////////////////////////////////////////
// 🌐 TRADUCTION DES DOCUMENTS (CV / Lettre) — EN / ES / ZH
//
// La traduction passe par le Worker Cloudflare (route /api/translate),
// qui appelle une API de traduction gratuite côté serveur (pas de clé,
// pas de souci CORS). Si le Worker n'est pas joignable, on retombe
// simplement sur le texte français d'origine plutôt que de bloquer.
//////////////////////////////////////////////////////

const LANGUES_DISPONIBLES = [
    { code:"fr", libelle:"🇫🇷 Français" },
    { code:"en", libelle:"🇬🇧 English" },
    { code:"es", libelle:"🇪🇸 Español" },
    { code:"zh", libelle:"🇨🇳 中文" }
];

async function traduireTextes(liste, langue){

    if(langue === "fr" || !URL_WORKER_API){
        return liste;
    }

    try{

        let reponse = await fetch(URL_WORKER_API + "/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ textes: liste, langue: langue })
        });

        let data = await reponse.json().catch(() => null);

        if(!reponse.ok){
            let detail = data && data.erreur ? data.erreur : ("HTTP " + reponse.status);
            throw new Error(detail);
        }

        if(!data){
            throw new Error("Réponse du serveur illisible (pas du JSON valide)");
        }

        if(data.erreur){
            throw new Error(data.erreur);
        }

        return (data.traductions && data.traductions.length === liste.length) ?
        data.traductions : liste;

    }catch(erreur){

        console.error("Erreur de traduction :", erreur);
        alert("⚠️ La traduction n'a pas pu être effectuée.\n\nDétail technique : " + erreur.message + "\n\nLe document reste affiché en français.");
        return liste;

    }

}

// Génère la barre de boutons de langue. `gabaritAppel` doit contenir le
// texte "LANGUE" à l'endroit où le code de langue doit être injecté,
// ex : "genererCVAutomatique('LANGUE')".
function genererBoutonsLangue(gabaritAppel, langueActive){

    return `
    <div class="boutons-langue">
    ${LANGUES_DISPONIBLES.map(l => `
        <button
        class="${l.code === langueActive ? 'langue-active' : ''}"
        onclick="${gabaritAppel.replace('LANGUE', l.code)}">
        ${l.libelle}
        </button>
    `).join("")}
    </div>
    `;

}

//////////////////////////////////////////////////////
// 📝 GENERATION LETTRE DE MOTIVATION
//////////////////////////////////////////////////////

// Mémorise la dernière offre pour laquelle une lettre a été générée, afin
// de pouvoir la re-générer dans une autre langue depuis les boutons de
// traduction (qui ne peuvent passer que des valeurs simples en onclick).
let derniereOffreLettre = null;

// Mémorise l'offre en attente pendant que l'utilisateur consulte/traduit
// son CV, avant de passer à la génération de la lettre de motivation.
let offreEnAttenteLettre = null;

// Étape 2 du flux automatique : appelée quand l'utilisateur clique sur
// "Continuer vers la lettre de motivation" après avoir eu le temps de
// voir/traduire son CV (au lieu d'enchaîner immédiatement, ce qui
// écrasait l'affichage du CV avant que l'utilisateur ait pu le voir).
function continuerVersLettre(){

    if(!offreEnAttenteLettre){
        return;
    }

    let offre = offreEnAttenteLettre;
    offreEnAttenteLettre = null;

    document.getElementById("messageAssistant").innerHTML =
    "✅ Tous les documents nécessaires sont réunis.<br><br>🤖 Génération de la lettre de motivation...";

    genererLettre(offre);

    afficherApprobationCandidature(offre);

}

const LIBELLES_LETTRE = {
    fr: { titre:"📝 Lettre de motivation", attention:"À l'attention du service recrutement", objet:"Objet : Candidature au poste de", nonRenseigne:"Non renseigné" },
    en: { titre:"📝 Cover Letter", attention:"Attn: Recruitment Department", objet:"Subject: Application for the position of", nonRenseigne:"Not provided" },
    es: { titre:"📝 Carta de presentación", attention:"A la atención del departamento de selección", objet:"Asunto: Candidatura para el puesto de", nonRenseigne:"No especificado" },
    zh: { titre:"📝 求职信", attention:"致招聘部门", objet:"主题：应聘", nonRenseigne:"未填写" }
};

async function genererLettre(offre, langue){

langue = langue || "fr";
derniereOffreLettre = offre;

let profil =
JSON.parse(localStorage.getItem("profil"));



if(!profil){

alert("Profil introuvable");

return;

}


let libelles = LIBELLES_LETTRE[langue] || LIBELLES_LETTRE.fr;

let dateAujourdhui = new Date().toLocaleDateString(
    langue === "fr" ? "fr-FR" : langue === "es" ? "es-ES" : langue === "zh" ? "zh-CN" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
);

let lieuOffre = offre.lieu || profil.ville;

// Les paragraphes en français sont toujours générés d'abord (base fiable,
// sans dépendance réseau), puis envoyés à la traduction si une langue
// autre que le français est demandée.
let paragraphesFr = [
    "Madame, Monsieur,",
    `C'est avec un vif intérêt que je vous soumets ma candidature pour le poste de ${offre.metier} au sein de ${offre.entreprise}. Votre entreprise occupe une place reconnue dans son secteur, et je suis convaincu(e) que mon profil correspond aux compétences que vous recherchez pour ce poste.`,
    `Ma formation en ${profil.formation} m'a permis d'acquérir des bases solides, que j'ai pu consolider grâce à mon expérience : ${profil.experience}. Je maîtrise notamment ${profil.competence}, des compétences que je saurais mettre à profit pour contribuer efficacement aux objectifs de votre équipe.`,
    `Rigoureux(se), motivé(e) et animé(e) par la volonté constante de progresser, je souhaite aujourd'hui mettre mon énergie et mon sérieux au service d'un projet professionnel stimulant au sein de votre structure. Je serais heureux(se) de pouvoir vous exposer plus en détail ma motivation lors d'un entretien.`,
    "Je vous remercie de l'attention que vous porterez à ma candidature et reste à votre disposition pour toute information complémentaire.",
    "Dans l'attente d'un retour de votre part, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
];

let paragraphes = paragraphesFr;

if(langue !== "fr"){

    document.getElementById("contenuDocument").innerHTML =
    `<p>🌐 Traduction de la lettre en cours...</p>`;

    paragraphes = await traduireTextes(paragraphesFr, langue);

}

let lettre = `

<h2>${libelles.titre}</h2>

<p>
<strong>${profil.nom}</strong><br>
${profil.ville}<br>
📧 ${profil.email || libelles.nonRenseigne} &nbsp;|&nbsp; 📞 ${profil.contact || libelles.nonRenseigne}
</p>

<p style="text-align:right;">${lieuOffre}, ${dateAujourdhui}</p>

<p>
${libelles.attention}<br>
<strong>${offre.entreprise}</strong>
</p>

<p>
<strong>${libelles.objet} ${offre.metier}</strong>
</p>

<p>${paragraphes[0]}</p>

<p>${paragraphes[1]}</p>

<p>${paragraphes[2]}</p>

<p>${paragraphes[3]}</p>

<p>${paragraphes[4]}</p>

<p>${paragraphes[5]}</p>

<p style="margin-top:20px;">
${profil.nom}
</p>

`;



// On enregistre la lettre comme document téléchargeable
let documentsExistants =
JSON.parse(localStorage.getItem("documents")) || [];

documentsExistants = documentsExistants.filter(
d => !(d.type === "Lettre de motivation" && d.offreId === offre.id)
);

documentsExistants.push({
nom: "Lettre_" + offre.entreprise,
type: "Lettre de motivation",
contenu: lettre,
offreId: offre.id,
date: new Date().toLocaleString()
});

localStorage.setItem("documents", JSON.stringify(documentsExistants));

afficherDocuments();


document.getElementById("contenuDocument").innerHTML = `

<div id="zoneDocumentActif" data-nom="Lettre_${offre.entreprise}">${lettre}</div>

<div id="boutonsDocumentActif">
<button onclick="telechargerDocumentHTML('Lettre_${offre.entreprise}')">
⬇️ Télécharger la lettre
</button>
<button onclick="modifierDocumentActif()">
✏️ Modifier avant envoi
</button>
${genererBoutonsLangue("genererLettre(derniereOffreLettre,'LANGUE')", langue)}
</div>

`;


ajouterNotificationUnique(
    "📝 Votre lettre de motivation pour " + offre.entreprise + " a été générée.",
    "documents"
);


signalerSection(
    "documents",
    "Votre lettre de motivation a été générée. Rendez-vous dans la section 📂 Mes documents pour la télécharger, ou vérifiez-la juste au-dessus avant l'envoi."
);


}
//////////////////////////////////////////////////////
// ✅ APPROBATION ET ENVOI DE LA CANDIDATURE
//////////////////////////////////////////////////////

function afficherApprobationCandidature(offre){

    document.getElementById("messageAssistant").innerHTML =

    "📋 Votre candidature pour <b>" + offre.metier + "</b> chez <b>" + offre.entreprise + "</b> est prête." +
    "<br>Vérifiez la lettre ci-dessus (bouton ✏️ Modifier avant envoi si besoin), puis approuvez l'envoi.";


    document.getElementById("actionsAssistant").innerHTML = `

    <button onclick="envoyerCandidature(${offre.id})">
    ✅ Approuver et envoyer
    </button>

    <button onclick="annulerEnvoiCandidature()">
    ❌ Annuler
    </button>

    `;

}



//////////////////////////////////////////////////////
// ✏️ MODIFICATION DU CV / LETTRE AVANT ENVOI
//
// Rend éditable la zone du document actuellement affiché (CV ou lettre)
// dans #contenuDocument, avant l'approbation finale de la candidature.
// En cas d'enregistrement, la version modifiée est aussi sauvegardée
// dans localStorage("documents") pour que le PDF téléchargé/envoyé en
// pièce jointe reflète bien les modifications.
//////////////////////////////////////////////////////

let contenuOriginalDocumentActif = null;

function modifierDocumentActif(){

    let zone = document.getElementById("zoneDocumentActif");

    if(!zone) return;

    contenuOriginalDocumentActif = zone.innerHTML;

    zone.contentEditable = "true";
    zone.style.border = "2px dashed #1565C0";
    zone.style.padding = "10px";
    zone.style.background = "#fffbe6";
    zone.focus();

    document.getElementById("boutonsDocumentActif").innerHTML = `

    <button onclick="enregistrerDocumentActif()">
    💾 Enregistrer les modifications
    </button>

    <button onclick="annulerModificationDocumentActif()">
    ❌ Annuler la modification
    </button>

    `;

}



function annulerModificationDocumentActif(){

    let zone = document.getElementById("zoneDocumentActif");

    if(!zone) return;

    zone.innerHTML = contenuOriginalDocumentActif;
    zone.contentEditable = "false";
    zone.style.border = "";
    zone.style.padding = "";
    zone.style.background = "";

    restaurerBoutonsDocumentActif(zone.dataset.nom);

}



function enregistrerDocumentActif(){

    let zone = document.getElementById("zoneDocumentActif");

    if(!zone) return;

    let nom = zone.dataset.nom;
    let nouveauContenu = zone.innerHTML;

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    documents = documents.map(d => {

        if(d.nom === nom){
            d.contenu = nouveauContenu;
        }

        return d;

    });

    localStorage.setItem("documents", JSON.stringify(documents));

    zone.contentEditable = "false";
    zone.style.border = "";
    zone.style.padding = "";
    zone.style.background = "";

    restaurerBoutonsDocumentActif(nom);

    afficherDocuments();

    alert("✅ Modifications enregistrées. Le document mis à jour sera utilisé pour le téléchargement et l'envoi.");

}



function restaurerBoutonsDocumentActif(nom){

    document.getElementById("boutonsDocumentActif").innerHTML = `

    <button onclick="telechargerDocumentHTML('${nom}')">
    ⬇️ Télécharger
    </button>

    <button onclick="modifierDocumentActif()">
    ✏️ Modifier avant envoi
    </button>

    `;

}



function annulerEnvoiCandidature(){

    document.getElementById("messageAssistant").innerHTML =
    "❌ Envoi annulé. Vous pouvez relancer l'assistant quand vous serez prêt.";


    document.getElementById("actionsAssistant").innerHTML = `

    <button onclick="assistantIA()">
    🚀 Relancer l'assistant IA
    </button>

    `;

}



//////////////////////////////////////////////////////
// 📧 ENVOI RÉEL D'EMAIL AVEC PIÈCES JOINTES (via Apps Script)
// Convertit les documents en base64 en mémoire, sans déclencher
// de téléchargement local, pour un envoi automatique complet.
//////////////////////////////////////////////////////

function documentEnBase64(doc){

    return new Promise((resolve, reject) => {

        if(doc.contenu && doc.contenu.startsWith("data:")){

            // Fichier déjà en base64 (document uploadé par l'utilisateur)
            let separateur = doc.contenu.indexOf(",");
            let entete = doc.contenu.slice(0, separateur);
            let base64 = doc.contenu.slice(separateur + 1);
            let correspondance = entete.match(/data:(.*);base64/);
            let type = correspondance ? correspondance[1] : "application/octet-stream";

            resolve({ nom: doc.nom, base64: base64, type: type });

        }else{

            // Document généré par l'assistant (CV, lettre) : conversion en PDF en mémoire
            let { overlay, zone } = creerZoneCapture(doc.contenu);

            let options = {
                margin: 10,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
            };

            html2pdf()
                .set(options)
                .from(zone)
                .outputPdf("datauristring")
                .then((dataUri) => {
                    nettoyerZoneCapture(overlay, zone);
                    let base64 = dataUri.split(",")[1];
                    resolve({ nom: doc.nom + ".pdf", base64: base64, type: "application/pdf" });
                })
                .catch((erreur) => {
                    nettoyerZoneCapture(overlay, zone);
                    reject(erreur);
                });

        }

    });

}



// Rassemble en base64 tous les documents requis par l'offre, sans les
// télécharger localement (utilisé pour l'envoi automatique par email).
async function collecterDocumentsBase64(offre){

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    let pieces = [];

    for(let typeDemande of offre.documents){

        let doc;

        if(typeDemande === "Lettre de motivation"){
            doc = documents.find(
                d => d.type === "Lettre de motivation" && d.offreId === offre.id
            );
        }else{
            doc = documents.find(d => d.type === typeDemande);
        }

        if(doc){
            let piece = await documentEnBase64(doc);
            pieces.push(piece);
        }

    }

    return pieces;

}



// Rassemble les documents requis par l'offre et les télécharge un par un
// (CV/lettre générés en PDF, documents uploadés tels quels), puis appelle
// callback() une fois que tout est prêt à être joint/envoyé manuellement.
function telechargerDocumentsRequis(offre, callback){

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    let aTelecharger = [];

    offre.documents.forEach(typeDemande => {

        let doc;

        if(typeDemande === "Lettre de motivation"){
            doc = documents.find(
                d => d.type === "Lettre de motivation" && d.offreId === offre.id
            );
        }else{
            doc = documents.find(d => d.type === typeDemande);
        }

        if(doc){
            aTelecharger.push(doc);
        }

    });

    let index = 0;

    function telechargerSuivant(){

        if(index >= aTelecharger.length){
            callback(aTelecharger);
            return;
        }

        let doc = aTelecharger[index];
        index++;

        if(doc.contenu && doc.contenu.startsWith("data:")){

            // Fichier réel déjà uploadé par l'utilisateur : téléchargement direct
            let lien = document.createElement("a");
            lien.href = doc.contenu;
            lien.download = doc.nom;
            document.body.appendChild(lien);
            lien.click();
            document.body.removeChild(lien);

            // Petit délai pour laisser le navigateur traiter le téléchargement
            // avant de déclencher le suivant.
            setTimeout(telechargerSuivant, 600);

        }else{

            // Document généré par l'assistant (CV, lettre) : conversion en PDF
            telechargerDocumentHTML(doc.nom, telechargerSuivant);

        }

    }

    telechargerSuivant();

}



function envoyerCandidature(id){

    let offre = offres.find(o => o.id === id);

    if(!offre){
        alert("Offre introuvable.");
        return;
    }


    let zoneActiveEnvoi = document.getElementById("zoneDocumentActif");

    let texteLettre = zoneActiveEnvoi ?
    zoneActiveEnvoi.innerText :
    document.getElementById("contenuDocument").innerText;


    // ✅ Envoi automatique réel (email + pièces jointes), en priorité via
    // le Worker unifié (/api/apply, MailChannels), sinon via Google Apps
    // Script s'il est configuré.
    let urlEnvoi = URL_WORKER_API ? (URL_WORKER_API + "/api/apply") :
                   (URL_APPS_SCRIPT_EMAIL || "");

    if(offre.mode === "email" && urlEnvoi !== ""){

        document.getElementById("messageAssistant").innerHTML =
        "📤 Envoi de votre candidature en cours (avec pièces jointes)...";

        document.getElementById("actionsAssistant").innerHTML = "";

        collecterDocumentsBase64(offre)
            .then((pieces) => {

                return fetch(urlEnvoi, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        destinataire: offre.contact,
                        sujet: "Candidature - " + offre.metier,
                        corps: texteLettre,
                        pieces: pieces
                    })
                });

            })
            .then(reponse => reponse.json())
            .then(resultat => {

                if(resultat.succes){

                    finaliserCandidature(
                        offre,
                        "📧 Votre candidature a été envoyée automatiquement par email à " + offre.contact + ", avec les documents (" + offre.documents.join(", ") + ") en pièces jointes."
                    );

                }else{

                    console.error("Échec de l'envoi :", resultat.erreur);
                    alert("L'envoi automatique a échoué (" + (resultat.erreur || "erreur inconnue") + "). On bascule sur la méthode de secours (mailto).");
                    envoyerCandidatureSecours(offre, texteLettre);

                }

            })
            .catch((erreur) => {

                console.error("Erreur réseau lors de l'envoi :", erreur);
                alert("Impossible de contacter le service d'envoi. On bascule sur la méthode de secours (mailto).");
                envoyerCandidatureSecours(offre, texteLettre);

            });

        return;

    }


    // 🔁 Méthode de secours : mailto (email) ou téléchargement + ouverture du site
    envoyerCandidatureSecours(offre, texteLettre);

}



// Méthode de secours : télécharge les documents localement puis ouvre
// mailto: (email) ou le site de l'entreprise (site), sans envoi automatique.
function envoyerCandidatureSecours(offre, texteLettre){

    document.getElementById("messageAssistant").innerHTML =
    "📥 Préparation des documents (" + offre.documents.join(", ") + ")...";

    document.getElementById("actionsAssistant").innerHTML = "";

    telechargerDocumentsRequis(offre, () => {

        if(offre.mode === "email"){

            let sujet = encodeURIComponent(
                "Candidature - " + offre.metier
            );

            let corps = encodeURIComponent(
                texteLettre +
                "\n\n---\n📎 Documents à joindre : " + offre.documents.join(", ") +
                "\n(Ils viennent d'être téléchargés sur votre appareil, dans le dossier Téléchargements.)"
            );

            window.location.href =
            "mailto:" + offre.contact + "?subject=" + sujet + "&body=" + corps;

        }else if(offre.mode === "site"){

            window.open(offre.contact, "_blank");

        }

        let indicationEnvoi;

        if(offre.mode === "email"){

            indicationEnvoi = "📧 Votre messagerie s'est ouverte avec le message pré-rempli. Les documents (" + offre.documents.join(", ") + ") ont été téléchargés : pensez à les joindre manuellement avant l'envoi (un mailto ne peut pas les joindre automatiquement).";

        }else{

            // Trois cas de figure selon le type de lien "contact" :
            // 1. Permalien direct vers l'annonce ou résultats filtrés sur le
            //    site source ("/offre-emploi-guinee/", "/recherche-jobs-guinee/")
            // 2. Recherche Google restreinte au site (site:...) : l'utilisateur
            //    atterrit sur des résultats de recherche externes, pas sur le
            //    site lui-même — le message doit refléter ça.
            // 3. Lien générique vers la page d'accueil d'un site : on doit
            //    donner les mots-clés exacts à utiliser dans SA recherche interne.
            let lienDirect = offre.contact && (
                offre.contact.includes("/offre-emploi-guinee/") ||
                offre.contact.includes("/recherche-jobs-guinee/")
            );

            let rechercheGoogle = offre.contact && offre.contact.includes("google.com/search");

            let avertissementFraicheur = "";
            if(offre.dateRepere){
                let joursDepuisRepere = Math.floor(
                    (Date.now() - new Date(offre.dateRepere).getTime()) / (24*60*60*1000)
                );
                if(joursDepuisRepere > 7){
                    avertissementFraicheur =
                    "<br>⚠️ Cette annonce a été repérée il y a " + joursDepuisRepere + " jours : elle est peut-être déjà pourvue ou retirée. Si vous ne la trouvez plus, regardez les offres similaires les plus récentes sur le même site.";
                }
            }

            if(lienDirect){

                indicationEnvoi =
                "🌐 Le site s'est ouvert directement sur l'annonce (ou sur les résultats filtrés pour ce type de poste)." +
                "<br>1️⃣ Repérez l'offre <b>" + offre.metier + "</b> chez <b>" + offre.entreprise + "</b>" +
                "<br>2️⃣ Cliquez sur \"Postuler\" / \"Apply\" et déposez les documents déjà téléchargés (" + offre.documents.join(", ") + ")" +
                avertissementFraicheur;

            }else if(rechercheGoogle){

                indicationEnvoi =
                "🔎 Une page de résultats Google s'est ouverte, déjà filtrée pour retrouver cette annonce précise (plus fiable que la recherche interne du site, qui fonctionne mal)." +
                "<br>1️⃣ Cliquez sur le résultat correspondant à <b>" + offre.metier + "</b> chez <b>" + offre.entreprise + "</b>" +
                "<br>2️⃣ Sur la page de l'annonce, cliquez sur \"Postuler\" / \"Apply\" et déposez les documents déjà téléchargés (" + offre.documents.join(", ") + ")" +
                avertissementFraicheur +
                "<br><br>💡 Si aucun résultat ne correspond exactement, l'annonce a probablement été retirée entre-temps — les résultats Google montreront alors des offres similaires plus récentes du même site.";

            }else{

                indicationEnvoi =
                "🌐 Le site s'est ouvert dans un nouvel onglet. Comme cette offre ne se fait pas par email, voici comment retrouver l'annonce et postuler :" +
                "<br>1️⃣ Utilisez la barre de recherche du site avec exactement ces mots-clés : <b>" + offre.metier + "</b>" + (offre.entreprise ? " (ou l'entreprise : <b>" + offre.entreprise + "</b>)" : "") +
                "<br>2️⃣ Repérez l'annonce correspondant à <b>" + (offre.lieu || "votre région") + "</b>" +
                "<br>3️⃣ Cliquez sur le bouton \"Postuler\" / \"Apply\" de l'annonce et déposez les documents déjà téléchargés (" + offre.documents.join(", ") + ")" +
                avertissementFraicheur +
                "<br><br>💡 Si vous ne retrouvez pas exactement cette annonce, le site reste une bonne source pour repérer des offres similaires dans le même domaine.";

            }

        }

        finaliserCandidature(offre, indicationEnvoi);

    });

}



// Met à jour le statut de la candidature, les notifications et le message
// final — commun aux deux méthodes d'envoi (automatique et secours).
function finaliserCandidature(offre, indicationEnvoi){

    let candidatures =
    JSON.parse(localStorage.getItem("candidatures")) || [];

    candidatures = candidatures.map(c => {

        if(c.id === offre.id){
            c.statut = "Envoyée";
            c.dateEnvoi = new Date().toLocaleString();
        }

        return c;

    });

    localStorage.setItem("candidatures", JSON.stringify(candidatures));

    afficherCandidatures();


    ajouterNotificationUnique(
        "📨 Candidature envoyée pour " + offre.metier + " chez " + offre.entreprise,
        "candidatures"
    );


    document.getElementById("messageAssistant").innerHTML =

    "🎉 Votre candidature pour <b>" + offre.metier + "</b> chez <b>" + offre.entreprise + "</b> est prête !<br><br>" + indicationEnvoi;


    document.getElementById("actionsAssistant").innerHTML = `

    <button onclick="assistantIA()">
    🚀 Chercher une autre offre
    </button>

    `;


    signalerSection(
        "candidatures",
        "Suivi mis à jour : rendez-vous dans la section 📋 Mes candidatures pour voir le statut."
    );

}
//////////////////////////////////////////////////////
// 🌍 LANGUES ET LOISIRS
//////////////////////////////////////////////////////

function demanderLangues(){

    document.getElementById("messageAssistant").innerHTML =
    "🌍 Quelles langues parlez-vous ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Exemple : Français, Anglais">

    <button onclick="enregistrerLangues()">
    Continuer ➡️
    </button>

    `;

}



function enregistrerLangues(){

    let langues =
    document.getElementById("reponseIA").value;


    if(langues===""){
        langues = "Non renseigné";
    }


    localStorage.setItem(
    "languesTemp",
    langues
    );


    document.getElementById("messageAssistant").innerHTML =
    "🎨 Quels sont vos loisirs ou centres d'intérêt ?";


    document.getElementById("actionsAssistant").innerHTML = `

    <input id="reponseIA" placeholder="Exemple : Football, lecture, informatique">

    <button onclick="enregistrerLoisirs()">
    Terminer mon profil ✅
    </button>

    `;

}



function enregistrerLoisirs(){

    let loisirs =
    document.getElementById("reponseIA").value;


    if(loisirs===""){
        loisirs = "Non renseigné";
    }


    localStorage.setItem(
    "loisirsTemp",
    loisirs
    );


    terminerProfilIA();

}
function enregistrerExperienceIA(){

    let experience =
    document.getElementById("reponseIA").value;


    localStorage.setItem(
        "experienceTemp",
        experience
    );


    demanderLangues();

}
//////////////////////////////////////////////////////
// 📄 GENERATION AUTOMATIQUE DU CV
//////////////////////////////////////////////////////
const LIBELLES_CV = {
    fr: { titre:"CURRICULUM VITAE", profil:"💼 Profil professionnel", competences:"🛠 Compétences", formation:"🎓 Formation", experience:"💻 Expérience", langues:"🌍 Langues", loisirs:"🎯 Loisirs", nonRenseigne:"Non renseigné" },
    en: { titre:"CURRICULUM VITAE", profil:"💼 Professional Profile", competences:"🛠 Skills", formation:"🎓 Education", experience:"💻 Experience", langues:"🌍 Languages", loisirs:"🎯 Interests", nonRenseigne:"Not provided" },
    es: { titre:"CURRÍCULUM VITAE", profil:"💼 Perfil profesional", competences:"🛠 Competencias", formation:"🎓 Formación", experience:"💻 Experiencia", langues:"🌍 Idiomas", loisirs:"🎯 Aficiones", nonRenseigne:"No especificado" },
    zh: { titre:"简历", profil:"💼 职业简介", competences:"🛠 技能", formation:"🎓 教育背景", experience:"💻 工作经验", langues:"🌍 语言", loisirs:"🎯 兴趣爱好", nonRenseigne:"未填写" }
};

async function genererCVAutomatique(langue){

    langue = langue || "fr";

    let profil =
    JSON.parse(
        localStorage.getItem("profil")
    );


    if(!profil){

        alert("Profil introuvable.");
        return;

    }


    let libelles = LIBELLES_CV[langue] || LIBELLES_CV.fr;

    // Les 6 champs libres du profil (saisis en français par l'utilisateur)
    // sont ceux qu'on envoie à la traduction. Les intitulés de sections
    // (Compétences, Formation...) utilisent le dictionnaire ci-dessus,
    // plus fiable et instantané qu'une traduction automatique pour du
    // vocabulaire fixe.
    let champsFr = [
        profil.metier || "",
        profil.competence || "",
        profil.formation || "",
        profil.experience || "",
        profil.langues || "",
        profil.loisirs || ""
    ];

    let champs = champsFr;

    if(langue !== "fr"){

        document.getElementById("contenuDocument").innerHTML =
        `<p>🌐 Traduction du CV en cours...</p>`;

        champs = await traduireTextes(champsFr, langue);

    }

    let nomDocument = "CV_" + profil.nom + (langue !== "fr" ? "_" + langue.toUpperCase() : "");

    let cv = `

    <div class="cv">

    <h1>${libelles.titre}</h1>


    <h2>${profil.nom}</h2>

    <p>📍 ${profil.ville}</p>

    <p>📧 ${profil.email || libelles.nonRenseigne} &nbsp;|&nbsp; 📞 ${profil.contact || libelles.nonRenseigne}</p>


    <hr>


    <h3>${libelles.profil}</h3>

    <p>
    ${champs[0]}
    </p>


    <h3>${libelles.competences}</h3>

    <p>
    ${champs[1]}
    </p>


    <h3>${libelles.formation}</h3>

    <p>
    ${champs[2]}
    </p>


    <h3>${libelles.experience}</h3>

    <p>
    ${champs[3]}
    </p>


    <h3>${libelles.langues}</h3>

    <p>
    ${champs[4]}
    </p>


    <h3>${libelles.loisirs}</h3>

    <p>
    ${champs[5]}
    </p>


    </div>

    `;


    document.getElementById("contenuDocument").innerHTML = `

    <div id="zoneDocumentActif" data-nom="${nomDocument}">${cv}</div>

    <div id="boutonsDocumentActif">
    <button onclick="telechargerDocumentHTML('${nomDocument}')">
    ⬇️ Télécharger le CV
    </button>
    <button onclick="modifierDocumentActif()">
    ✏️ Modifier avant envoi
    </button>
    ${genererBoutonsLangue("genererCVAutomatique('LANGUE')", langue)}
    ${offreEnAttenteLettre ? `
    <button onclick="continuerVersLettre()">
    ➡️ Continuer vers la lettre de motivation
    </button>
    ` : ""}
    </div>

    `;



    let documents =
    JSON.parse(
        localStorage.getItem("documents")
    ) || [];

    // On remplace la version existante du CV dans CETTE langue plutôt que
    // d'empiler des doublons à chaque nouvelle génération.
    documents = documents.filter(doc => doc.nom !== nomDocument);

    documents.push({

        nom: nomDocument,

        type:"CV",

        contenu:cv,

        date:new Date().toLocaleString()

    });


    localStorage.setItem(
        "documents",
        JSON.stringify(documents)
    );


    ajouterNotificationUnique(
        "📄 Votre CV a été généré.",
        "documents"
    );

    afficherDocuments();

    signalerSection(
        "documents",
        "Votre CV a été généré. Rendez-vous dans la section 📂 Mes documents pour le télécharger."
    );

}
//////////////////////////////////////////////////////
// 🔔 NOTIFICATIONS
//////////////////////////////////////////////////////

function ajouterNotificationUnique(message, section){

    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    let existe = notifications.some(
        n => n.message === message
    );

    if(!existe){

        notifications.push({
            message: message,
            date: new Date().toLocaleString(),
            section: section || null
        });

        localStorage.setItem(
            "notifications",
            JSON.stringify(notifications)
        );

        incrementerBadge("notifications");

        if(section && section !== "notifications"){
            incrementerBadge(section);
        }

    }

    afficherNotifications();

}



function afficherNotifications(){

    let zone = document.getElementById("listeNotifications");

    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    if(notifications.length === 0){
        zone.innerHTML = "Aucune notification.";
        return;
    }

    let html = `
    <button onclick="effacerToutesNotifications()">🧹 Tout effacer</button>
    `;

    notifications.forEach((n, index) => {
        html += `
        <div class="notification">
        ${n.message}<br>
        <small>${n.date}</small>
        ${n.section ? `<br><button onclick="allerA('${n.section}')">📍 Aller à cette section</button>` : ""}
        <button onclick="supprimerNotification(${index})">🗑️ Effacer</button>
        </div>
        `;
    });

    zone.innerHTML = html;

}



function supprimerNotification(index){

    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    notifications.splice(index, 1);

    localStorage.setItem("notifications", JSON.stringify(notifications));

    afficherNotifications();

}



function effacerToutesNotifications(){

    localStorage.setItem("notifications", JSON.stringify([]));

    afficherNotifications();

}
//////////////////////////////////////////////////////
// 📂 AFFICHER LES DOCUMENTS
//////////////////////////////////////////////////////

function afficherDocuments(){

    let zone = document.getElementById("listeDocuments");

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    if(documents.length === 0){
        zone.innerHTML = "Aucun document.";
        return;
    }

    let html = "";

    documents.forEach(d => {

        let boutonTelecharger;

        if(d.contenu && d.contenu.startsWith("data:")){
            // Document envoyé par l'utilisateur (fichier réel)
            boutonTelecharger = `<a href="${d.contenu}" download="${d.nom}"><button type="button">⬇️ Télécharger</button></a>`;
        }else{
            // Document généré par l'assistant (CV, lettre...)
            boutonTelecharger = `<button onclick="telechargerDocumentHTML('${d.nom}')">⬇️ Télécharger</button>`;
        }

        let apercu = "";

        if(d.contenu && !d.contenu.startsWith("data:")){
            // Document généré par l'assistant (CV, lettre...) : on peut
            // afficher son contenu directement, sans avoir à télécharger le PDF.
            apercu = `
            <details class="apercu-document">
            <summary>👁️ Voir le contenu</summary>
            <div class="apercu-contenu">${d.contenu}</div>
            </details>
            `;
        }

        // Pour un CV déjà généré (existant depuis une session précédente),
        // on propose aussi les boutons de traduction ici, car le flux
        // automatique ne les affiche que juste après la génération initiale.
        let boutonsLangueCV = "";
        if(d.type === "CV" && d.contenu && !d.contenu.startsWith("data:")){
            boutonsLangueCV = genererBoutonsLangue("genererCVAutomatique('LANGUE')", "fr");
        }

        html += `
        <div class="document">
        📄 ${d.nom} (${d.type})<br>
        <small>${d.date}</small>
        ${boutonTelecharger}
        <button onclick="supprimerDocument('${d.nom}')">🗑️ Supprimer</button>
        ${boutonsLangueCV}
        ${apercu}
        </div>
        `;
    });

    zone.innerHTML = html;

}



function supprimerDocument(nom){

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    documents = documents.filter(d => d.nom !== nom);

    localStorage.setItem("documents", JSON.stringify(documents));

    afficherDocuments();

}
//////////////////////////////////////////////////////
// ⬇️ TELECHARGEMENT DES DOCUMENTS GENERES (CV, LETTRE)
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// 🖼️ ZONE DE CAPTURE POUR html2canvas / html2pdf
//
// IMPORTANT : sur mobile (Android Chrome/WebView), un élément masqué
// via position:fixed + z-index négatif n'est jamais réellement "affiché"
// par le moteur de rendu -> html2canvas capture alors une zone vide,
// ce qui produisait des PDF blancs à chaque téléchargement.
//
// Solution : on garde la zone à capturer bien VISIBLE et dans le flux
// normal du document (ce qu'html2canvas sait toujours capturer
// correctement), mais on la recouvre entièrement avec un écran de
// chargement opaque au premier plan. L'utilisateur ne voit donc jamais
// le contenu brut, juste un message "Génération en cours...".
//////////////////////////////////////////////////////

function creerZoneCapture(contenuHTML){

    let overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "white";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.style.fontSize = "16px";
    overlay.style.color = "#1565C0";
    overlay.textContent = "⏳ Génération du document en cours...";

    let zone = document.createElement("div");
    zone.innerHTML = contenuHTML;

    // Position "static" = flux normal, PAS de fixed/absolute avec z-index négatif.
    zone.style.width = "700px";
    zone.style.maxWidth = "700px";
    zone.style.margin = "0 auto";
    zone.style.padding = "25px";
    zone.style.background = "white";
    zone.style.color = "black";

    document.body.appendChild(zone);
    document.body.appendChild(overlay);

    return { overlay: overlay, zone: zone };

}

function nettoyerZoneCapture(overlay, zone){

    if(zone && zone.parentNode) document.body.removeChild(zone);
    if(overlay && overlay.parentNode) document.body.removeChild(overlay);

}



function telechargerDocumentHTML(nom, callback){

    let documents =
    JSON.parse(localStorage.getItem("documents")) || [];

    let doc = documents.find(d => d.nom === nom);

    if(!doc){
        alert("Document introuvable.");
        if(callback) callback();
        return;
    }

    let { overlay, zone } = creerZoneCapture(doc.contenu);

    let options = {

        margin: 10,

        filename: nom + ".pdf",

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }

    };

    html2pdf()
        .set(options)
        .from(zone)
        .save()
        .then(() => {
            nettoyerZoneCapture(overlay, zone);
            if(callback) callback();
        })
        .catch((erreur) => {
            console.error("Erreur lors de la génération du PDF :", erreur);
            alert("Le téléchargement a échoué. Vérifiez la console pour plus de détails.");
            nettoyerZoneCapture(overlay, zone);
            if(callback) callback();
        });

}
//////////////////////////////////////////////////////
// 🔎 RECHERCHE SUR D'AUTRES PLATEFORMES (Facebook, Google, LinkedIn, Indeed)
//
// Facebook et Google n'ont pas d'API publique gratuite permettant de
// récupérer automatiquement leurs offres d'emploi depuis une appli comme
// celle-ci (ça demande un compte développeur validé, souvent payant, et
// c'est contraire à leurs conditions d'utilisation de le faire sans ça).
//
// À la place, on génère des liens de recherche DIRECTS et PRÉ-REMPLIS avec
// le métier et la ville du profil : un clic ouvre directement les
// résultats pertinents sur chaque plateforme, sans que l'utilisateur ait à
// retaper sa recherche.
//////////////////////////////////////////////////////

function afficherRechercheExterne(){

    let zone = document.getElementById("rechercheExterne");

    if(!zone) return;

    let profil = JSON.parse(localStorage.getItem("profil"));

    if(!profil){
        zone.innerHTML = "Créez votre profil pour générer des liens de recherche personnalisés.";
        return;
    }

    let metier = profil.metier || "emploi";
    let ville = profil.ville || "";

    let requete = (metier + " " + ville).trim();
    let requeteEncodee = encodeURIComponent(requete);

    zone.innerHTML = `

    <button onclick="window.open('https://www.google.com/search?q=${requeteEncodee}&ibp=htl;jobs','_blank')">
    🔎 Google Emplois : "${requete}"
    </button>

    <button onclick="window.open('https://www.facebook.com/jobs/search/?q=${requeteEncodee}','_blank')">
    🔎 Facebook Emplois : "${requete}"
    </button>

    <button onclick="window.open('https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(metier)}&location=${encodeURIComponent(ville)}','_blank')">
    🔎 LinkedIn : "${requete}"
    </button>

    <button onclick="window.open('https://www.indeed.com/jobs?q=${encodeURIComponent(metier)}&l=${encodeURIComponent(ville)}','_blank')">
    🔎 Indeed : "${requete}"
    </button>

    <p><small>💡 Ces boutons ouvrent une recherche déjà pré-remplie sur chaque plateforme. L'appli ne peut pas y récupérer les offres automatiquement (Facebook et Google ne le permettent pas sans accord commercial), mais vous atterrissez directement sur les résultats.</small></p>

    `;

}
//////////////////////////////////////////////////////
// 🔄 INITIALISATION AU CHARGEMENT DE LA PAGE
//////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {

    afficherProfilIA();
    afficherCandidatures();
    afficherDocuments();
    afficherNotifications();
    afficherToutesLesOffres();
    afficherRechercheExterne();

});