const avis = document.getElementById("avis");
const conteneur = document.getElementById("cartes");
const bouton = document.getElementById("filtre-promo");

let activites = [];
let promosSeulement = false;

function formatPrix(montant) {
  return montant.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// petit outil pour créer une balise avec une classe et un texte
function creer(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte) element.textContent = texte;
  return element;
}

function creerCarte(activite) {
  const enPromo = activite.prixPromo != null;
  const carte = creer("article", enPromo ? "carte promo" : "carte");

  if (enPromo) {
    const reduction = Math.round((1 - activite.prixPromo / activite.prix) * 100);
    carte.appendChild(creer("span", "badge", "-" + reduction + " %"));
  }

  carte.appendChild(creer("h2", "", activite.nom));
  carte.appendChild(creer("p", "", activite.description));

  const prix = creer("p", "prix");
  if (enPromo) {
    prix.appendChild(creer("span", "ancien-prix", formatPrix(activite.prix)));
    prix.append(" ");
    prix.appendChild(creer("strong", "", formatPrix(activite.prixPromo)));
  } else {
    prix.appendChild(creer("strong", "", formatPrix(activite.prix)));
  }
  prix.append(" / personne");
  carte.appendChild(prix);

  return carte;
}

function afficher() {
  conteneur.innerHTML = "";
  const liste = promosSeulement
    ? activites.filter(function (a) { return a.prixPromo != null; })
    : activites;

  if (liste.length === 0) {
    conteneur.appendChild(creer("p", "", "Aucune activité à afficher pour le moment."));
    return;
  }
  liste.forEach(function (activite) {
    conteneur.appendChild(creerCarte(activite));
  });
}

bouton.addEventListener("click", function () {
  promosSeulement = !promosSeulement;
  bouton.textContent = promosSeulement
    ? "Voir toutes les activités"
    : "Voir uniquement les promotions";
  afficher();
});

function afficherAvis(texte) {
  avis.textContent = texte;
  avis.hidden = false;
}

// vérifie chaque activité du fichier et ignore celles qui sont incomplètes
function nettoyer(donnees) {
  return donnees
    .map(function (a) {
      const prix = Number(a.prix);
      let prixPromo = a.prixPromo === null || a.prixPromo === undefined || a.prixPromo === "" ? null : Number(a.prixPromo);
      if (prixPromo !== null && (isNaN(prixPromo) || prixPromo >= prix)) prixPromo = null;
      return {
        nom: String(a.nom || "").trim(),
        description: String(a.description || "").trim(),
        prix: prix,
        prixPromo: prixPromo,
      };
    })
    .filter(function (a) { return a.nom !== "" && !isNaN(a.prix); });
}

// charge la liste des activités depuis le fichier JSON
fetch("activites.json", { cache: "no-cache" })
  .then(function (reponse) {
    if (!reponse.ok) throw new Error("fichier introuvable");
    return reponse.json();
  })
  .then(function (donnees) {
    if (!Array.isArray(donnees)) throw new Error("format");
    activites = nettoyer(donnees);
    afficher();
  })
  .catch(function () {
    conteneur.innerHTML = "";
    afficherAvis("Impossible d'afficher les activités. Si tu viens de modifier activites.json, vérifie qu'il ne manque pas une virgule ou un guillemet.");
  });
