/* =========================================================
   CONFIGURATION DU SITE — le seul fichier à modifier pour tes infos perso
   ========================================================= */
const SITE = {
  nom: 'Justin Dejean',
  email: 'dejeanjustin@icloud.com',   // adresse affichée et utilisée par le formulaire (secours mailto)
  formspree: '',                        // ex. 'xyzabcde' : l'identifiant de ton formulaire sur formspree.io (laisse vide = ouvre l'appli mail)
  cv: '',                               // ex. 'CV-Justin-Dejean.pdf' : dépose le PDF à côté de index.html, un bouton « Télécharger » apparaît
  spotify: '1sNe4yPF5y1HYkzMFbsUKF',    // identifiant de ta playlist Spotify (publique), vu dans le lien de partage
  youtube: '',                          // ex. 'PLxxxxxxxx' : identifiant d'une playlist YouTube (la partie après list= dans le lien). Titres joués EN ENTIER + volume dans le lecteur
  liens: [                              // favoris de la page d'accueil du navigateur (réseaux, site d'un ami, etc.)
    { titre: 'Wikipédia', url: 'https://fr.wikipedia.org' }
    // { titre: 'LinkedIn', url: 'https://www.linkedin.com/in/ton-profil' },
    // { titre: 'Instagram', url: 'https://www.instagram.com/ton-compte' }
  ],
  dispo: 'Disponible pour un stage dès le 15 avril',   // texte du badge dans la barre des tâches ('' pour le masquer)
  dispo_en: 'Available for an internship from April 15',
  plausible: '',                        // ex. 'justindejean.com' : statistiques sans cookies sur plausible.io (laisse vide = aucune statistique)
  chatApi: 'https://justin-chat.dejeanjustin14.workers.dev',                          // ex. 'https://justin-chat.TON-COMPTE.workers.dev' : adresse du relais IA (voir IA/LISEZMOI.md). Vide = chat guidé seulement
  photo: ''                             // ex. 'assets/photo.jpg' : ta photo (menu Démarrer + fenêtre Contact)
};
