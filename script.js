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


// Base temporaire des offres

let offres = [

{
    id:1,
    metier:"Développeur Web",
    entreprise:"Tech Guinée",
    lieu:"Conakry",
    mode:"email",
    contact:"memsou2009@gmail.com",
    documents:[
        "CV",
        "Lettre de motivation"
    ]
},


{
    id:2,
    metier:"Assistant administratif",
    entreprise:"Africa Services",
    lieu:"Conakry",
    mode:"site",
    contact:"https://exemple-recrutement.com",
    documents:[
        "CV",
        "Diplôme"
    ]
},


{
    id:3,
    metier:"Comptable",
    entreprise:"Global Finance",
    lieu:"Kindia",
    mode:"email",
    contact:"emploi@globalfinance.com",
    documents:[
        "CV",
        "Diplôme",
        "Attestation"
    ]
}

];


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
    contact:"https://jobguinee-pro.com/jobs",
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"informatique reseaux telecommunications cybersecurite stage"
},

{
    id:102,
    metier:"Stagiaire en Logistique & Approvisionnement",
    entreprise:"Secteur minier - via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://jobguinee-pro.com/jobs",
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"logistique approvisionnement procurement stage mines"
},

{
    id:103,
    metier:"Stagiaire en Finance",
    entreprise:"Secteur minier - via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://jobguinee-pro.com/jobs",
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"finance comptabilite stage excel analyse financiere"
},

{
    id:104,
    metier:"Monteur Vidéo",
    entreprise:"Recruteur via JobGuinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://jobguinee-pro.com/jobs",
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"montage video capcut davinci resolve premiere pro publicite marketing"
},

{
    id:105,
    metier:"Développeur Commercial",
    entreprise:"INAB TravelTech Guinée",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.emploiguinee.com/",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"developpement commercial prospection vente"
},

{
    id:106,
    metier:"Business Developer Junior",
    entreprise:"Palma Talents",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.emploiguinee.com/",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"business developer commercial prospection opportunites"
},

{
    id:107,
    metier:"Commercial B2B",
    entreprise:"Palma Talents",
    lieu:"Conakry, Guinée",
    mode:"site",
    contact:"https://www.emploiguinee.com/",
    documents:["CV","Lettre de motivation"],
    source:"EmploiGuinée",
    tags:"commercial vente negociation portefeuille clients"
},

{
    id:108,
    metier:"Responsable de Zone",
    entreprise:"Secteur Optique / Santé visuelle",
    lieu:"Guinée (toutes régions)",
    mode:"site",
    contact:"https://jobguinee-pro.com/jobs",
    documents:["CV","Lettre de motivation"],
    source:"JobGuinée",
    tags:"management equipe comptabilite finance"
}

];

offres = offres.concat(offresGuinee);


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

    let element = document.getElementById(idSection);

    if(element){
        element.scrollIntoView({behavior:"smooth", block:"start"});
    }

}


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
function genererResultatsRecherche(resultatsBruts, ligneDiagnostic, profil){

    console.log("[Pipeline] Étape 1 — offres brutes reçues :", resultatsBruts.length);

    if(resultatsBruts.length === 0){
        document.getElementById("messageAssistant").innerHTML =
        "⚠️ Impossible de récupérer des offres en ligne pour le moment.<br><br>📋 Détail par source :<br>" + ligneDiagnostic;
        return;
    }

    // 🇫🇷/🇬🇧 Le mot-clé du profil peut être en français ("développeur")
    // alors que les offres internationales sont en anglais ("developer").
    // On tolère les deux en ajoutant quelques équivalents connus, pour
    // éviter de filtrer à zéro les offres internationales par mismatch
    // de langue.
    let equivalences = {
        "developpeur": ["developer", "dev", "engineer", "programmer"],
        "comptable": ["accountant", "accounting", "finance"],
        "commercial": ["sales", "business"],
        "assistant": ["assistant", "support", "admin"],
        "informatique": ["it", "software", "tech", "computer"],
        "marketing": ["marketing", "growth"],
        "design": ["designer", "design", "ui", "ux"],
        "ressources": ["hr", "recruiter", "recruitment"]
    };

    let motCle = (profil.metier || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

    let mots = motCle.split(" ").filter(m => m.length > 2);

    // Ajoute les équivalents anglais pour chaque mot-clé français reconnu
    let motsElargis = [...mots];
    mots.forEach(mot => {
        Object.keys(equivalences).forEach(cle => {
            if(mot.includes(cle) || cle.includes(mot)){
                motsElargis.push(...equivalences[cle]);
            }
        });
    });

    let filtrees = resultatsBruts;

    if(motsElargis.length > 0){
        filtrees = resultatsBruts.filter(o => {
            let texte = (o.metier + " " + (o.tags || ""))
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"");
            return motsElargis.some(mot => texte.includes(mot));
        });

        console.log("[Pipeline] Étape 2 — après filtrage mot-clé (" + motsElargis.join(",") + ") :", filtrees.length);

        if(filtrees.length === 0){
            filtrees = resultatsBruts.slice(0, 30);
            console.log("[Pipeline] Étape 2b — aucun match, repli sur les 30 premières offres brutes");
        }
    }

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

    filtrees.slice(0, 40).forEach(o => {

        let cle = cleUnique(o);
        let dejaPresente = clesExistantes.has(cle);

        if(!dejaPresente){
            o.id = idSuivant;
            idSuivant++;
            offres.push(o);
            clesExistantes.add(cle);
            nouvellesOffres++;
        } else {
            ignoreesDoublon++;
        }

    });

    console.log("[Pipeline] Étape 3 — nouvelles offres ajoutées :", nouvellesOffres, "| doublons ignorés :", ignoreesDoublon);

    document.getElementById("messageAssistant").innerHTML =
    `✅ ${nouvellesOffres} nouvelle(s) offre(s) réelle(s) récupérée(s) dans le monde entier.<br><br>📋 Détail par source :<br>${ligneDiagnostic}<br><br>Analyse en cours...`;

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


let texteProfil = (

profil.metier + " " +
profil.competence + " " +
profil.formation

)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");


let resultats = [];


for(let offre of offres){

let texteOffre =
(offre.metier + " " + (offre.tags || ""))
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");


let score = 0;


// Correspondance métier

let mots = texteProfil.split(" ");


for(let mot of mots){

if(
mot.length > 3 &&
texteOffre.includes(mot)
){

score += 20;

}

}


// Mots proches

if(
texteProfil.includes("informatique") &&
texteOffre.includes("developpeur")
){

score += 40;

}


if(
texteProfil.includes("web") &&
texteOffre.includes("developpeur")
){

score += 40;

}


if(score > 100){
score = 100;
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

afficherToutesLesOffres();

}



function afficherOffresRecommandees(resultats){


let zone =
document.getElementById("offresRecommandees");


if(resultats.length===0){


zone.innerHTML =
"😔 Aucune offre ne correspond précisément à votre profil pour le moment. Consultez toutes les offres ci-dessous pour élargir votre recherche.";


return;

}



let html =

"<h3>🤖 Offres recommandées pour vous :</h3>";



resultats.forEach((r,index)=>{


html += `

<div class="offre">

<h3>${r.offre.metier}</h3>

<p>🏢 ${r.offre.entreprise}</p>

<p>📍 ${r.offre.lieu}</p>

<p>⭐ Compatibilité : ${r.score}%</p>

${r.offre.source ? `<p>🌐 Source : ${r.offre.source}</p>` : ""}

<p><span class="mode-envoi">${r.offre.mode === "email" ? "📧 Réponse par email" : "🌐 Réponse via site web"}</span></p>


<button onclick="choisirOffre(${r.offre.id})">

🚀 Préparer cette candidature

</button>


</div>

`;


});



zone.innerHTML = html;


}
//////////////////////////////////////////////////////
// 🌐 AFFICHER TOUTES LES OFFRES (tous métiers et compétences)
// Permet à l'utilisateur d'élargir ses choix au-delà des
// recommandations basées sur son profil.
//////////////////////////////////////////////////////

function afficherToutesLesOffres(){

    let zone = document.getElementById("offresToutes");

    if(!zone){
        return;
    }

    if(offres.length === 0){

        zone.innerHTML = "Aucune offre disponible pour le moment.";

        return;

    }

    let LIMITE_AFFICHAGE = 60;
    let offresAAfficher = offres.slice(0, LIMITE_AFFICHAGE);

    let html = "";

    if(offres.length > LIMITE_AFFICHAGE){
        html += `<p>📋 ${offres.length} offres au total — affichage des ${LIMITE_AFFICHAGE} premières pour la fluidité.</p>`;
    }

    offresAAfficher.forEach(o => {

        html += `

        <div class="offre">

        <h3>${o.metier}</h3>

        <p>🏢 ${o.entreprise}</p>

        <p>📍 ${o.lieu}</p>

        ${o.source ? `<p>🌐 Source : ${o.source}</p>` : ""}

        <p><span class="mode-envoi">${o.mode === "email" ? "📧 Réponse par email" : "🌐 Réponse via site web"}</span></p>

        <button onclick="choisirOffre(${o.id})">
        🚀 Préparer cette candidature
        </button>

        </div>

        `;

    });

    zone.innerHTML = html;

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

        genererCVAutomatique();

        manquants = manquants.filter(d => d !== "CV");

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
// 📝 GENERATION LETTRE DE MOTIVATION
//////////////////////////////////////////////////////

function genererLettre(offre){


let profil =
JSON.parse(localStorage.getItem("profil"));



if(!profil){

alert("Profil introuvable");

return;

}



let lettre = `

<h2>📝 Lettre de motivation</h2>

<p>
${profil.nom}<br>
${profil.ville}<br>
📧 ${profil.email || "Non renseigné"} &nbsp;|&nbsp; 📞 ${profil.contact || "Non renseigné"}
</p>


<p>
Objet : Candidature au poste de ${offre.metier}
</p>


<p>
Madame, Monsieur,
</p>


<p>
Je vous adresse ma candidature pour le poste de 
${offre.metier} au sein de ${offre.entreprise}.
</p>


<p>
Grâce à ma formation de ${profil.formation}
et mes compétences en ${profil.competence},
je souhaite mettre mes capacités au service de votre entreprise.
</p>


<p>
Motivé(e), sérieux(se) et désireux(se) d'évoluer,
je serais heureux(se) de pouvoir échanger avec vous.
</p>


<p>
Cordialement,<br>
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

        let indicationEnvoi = offre.mode === "email" ?
        "📧 Votre messagerie s'est ouverte avec le message pré-rempli. Les documents (" + offre.documents.join(", ") + ") ont été téléchargés : pensez à les joindre manuellement avant l'envoi (un mailto ne peut pas les joindre automatiquement)." :
        "🌐 Le site s'est ouvert dans un nouvel onglet. Comme cette offre ne se fait pas par email, voici comment retrouver l'annonce et postuler :" +
        "<br>1️⃣ Utilisez la barre de recherche du site avec les mots-clés : <b>" + offre.metier + "</b>" + (offre.entreprise ? " / <b>" + offre.entreprise + "</b>" : "") +
        "<br>2️⃣ Repérez l'annonce correspondant à <b>" + (offre.lieu || "votre région") + "</b>" +
        "<br>3️⃣ Cliquez sur le bouton \"Postuler\" / \"Apply\" de l'annonce et déposez les documents déjà téléchargés (" + offre.documents.join(", ") + ")" +
        "<br><br>💡 Si vous ne retrouvez pas exactement cette annonce (offres parfois retirées rapidement), le site reste une bonne source pour repérer des offres similaires.";

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
function genererCVAutomatique(){
    let profil =
    JSON.parse(
        localStorage.getItem("profil")
    );


    if(!profil){

        alert("Profil introuvable.");
        return;

    }


    let cv = `

    <div class="cv">

    <h1>CURRICULUM VITAE</h1>


    <h2>${profil.nom}</h2>

    <p>📍 ${profil.ville}</p>

    <p>📧 ${profil.email || "Non renseigné"} &nbsp;|&nbsp; 📞 ${profil.contact || "Non renseigné"}</p>


    <hr>


    <h3>💼 Profil professionnel</h3>

    <p>
    ${profil.metier}
    </p>


    <h3>🛠 Compétences</h3>

    <p>
    ${profil.competence}
    </p>


    <h3>🎓 Formation</h3>

    <p>
    ${profil.formation}
    </p>


    <h3>💻 Expérience</h3>

    <p>
    ${profil.experience}
    </p>


    <h3>🌍 Langues</h3>

    <p>
    ${profil.langues}
    </p>


    <h3>🎯 Loisirs</h3>

    <p>
    ${profil.loisirs}
    </p>


    </div>

    `;


    document.getElementById("contenuDocument").innerHTML = `

    <div id="zoneDocumentActif" data-nom="CV_${profil.nom}">${cv}</div>

    <div id="boutonsDocumentActif">
    <button onclick="telechargerDocumentHTML('CV_${profil.nom}')">
    ⬇️ Télécharger le CV
    </button>
    <button onclick="modifierDocumentActif()">
    ✏️ Modifier avant envoi
    </button>
    </div>

    `;



    let documents =
    JSON.parse(
        localStorage.getItem("documents")
    ) || [];


    let existe =
    documents.some(
        doc => doc.type === "CV"
    );


    if(!existe){

        documents.push({

            nom:"CV_"+profil.nom,

            type:"CV",

            contenu:cv,

            date:new Date().toLocaleString()

        });


        localStorage.setItem(
            "documents",
            JSON.stringify(documents)
        );

    }


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

        html += `
        <div class="document">
        📄 ${d.nom} (${d.type})<br>
        <small>${d.date}</small>
        ${boutonTelecharger}
        <button onclick="supprimerDocument('${d.nom}')">🗑️ Supprimer</button>
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