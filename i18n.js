/* =========================================================
   FR / EN — traduction légère
   - Le site est écrit en français ; le dictionnaire EN donne la traduction de chaque texte (clé = texte français exact).
   - Les textes ajoutés dynamiquement (dossiers, fiches, jeu, messenger) sont traduits automatiquement.
   - Pour ajouter un texte : une ligne  'texte français': 'English text',
   ========================================================= */
(function () {
  'use strict';
  const EN = {
    // --- bureau, menus, barre des tâches ---
    'démarrer': 'start', 'Projets': 'Projects', 'Galerie': 'Gallery', 'CV': 'Résumé', 'CV.txt': 'Resume.txt',
    'Contact': 'Contact', 'Contact.app': 'Contact.app', 'Corbeille': 'Recycle Bin', 'Musique': 'Music', 'Messenger': 'Messenger',
    'Démineur': 'Minesweeper', 'À propos': 'About', 'Mes documents': 'My Documents', 'Mes images': 'My Pictures',
    'Vidéo, graphisme, web': 'Video, graphic design, web', 'Se balader dans mes travaux': 'Wander through my work',
    'Formation et compétences': 'Education and skills', 'Un projet en tête ?': 'Got a project in mind?',
    'Discuter avec Justin': 'Chat with Justin', 'Ma playlist Spotify': 'My Spotify playlist', 'Une pause ?': 'Need a break?',
    'Redémarrer': 'Restart', 'Arrêter': 'Shut down', 'Actualiser': 'Refresh', 'Nouveau ▸ Message pour Justin': 'New ▸ Message for Justin',
    'Propriétés': 'Properties', 'Thème : Colline (bleu)': 'Theme: Hill (blue)', 'Thème : Désert (olive)': 'Theme: Desert (olive)', 'Thème : Nuit': 'Theme: Night',
    '✉ Me contacter': '✉ Contact me', 'Me contacter': 'Contact me', 'Disponible pour un stage dès le 15 avril': 'Available for an internship from April 15',
    'Bienvenue !': 'Welcome!', 'Mes travaux sont sur le bureau. Tu peux aussi les découvrir en te baladant dans la galerie.': 'My work is right on the desktop. You can also discover it by wandering through the gallery.',
    'Explorer la galerie': 'Explore the gallery', 'Portfolio de': 'Portfolio of', 'Portfolio Windows XP Edition': 'Windows XP Edition Portfolio',
    '@Menu Démarrer': 'Start menu', '@Réduire': 'Minimize', '@Agrandir': 'Maximize', '@Fermer': 'Close', '@Changer de langue': 'Change language',
    '@Couper le son': 'Mute sound', '@Couper ou activer le son': 'Mute or unmute sound', '@Ma playlist Spotify': 'My Spotify playlist', '@Nouvelle partie': 'New game',
    '@Galerie 2D : un couloir de tableaux, un par projet': '2D gallery: a corridor of paintings, one per project',
    '@Courir (maintenir)': 'Run (hold)', '@Interagir': 'Interact', '@Joystick de déplacement': 'Movement joystick', '@Sauter': 'Jump',
    'La corbeille est vide. Rien à supprimer ici !': 'The recycle bin is empty. Nothing to delete here!',
    'À propos de Windows XP': 'About Windows XP', 'Inspiré de l\'ambiance rétro et développé en Vanilla JS.': 'Inspired by the retro look and built with vanilla JS.',
    'Conçu par Justin Dejean — Étudiant en BUT MMI à l\'Université de Caen Normandie.': 'Designed by Justin Dejean — BUT MMI student at the University of Caen Normandie.',
    'Sprite du personnage : Universal LPC Spritesheet Character Generator (détails dans jeu/CREDITS.md).': 'Character sprite: Universal LPC Spritesheet Character Generator (details in jeu/CREDITS.md).',
    // --- navigateur ---
    'Navigateur Internet': 'Internet Browser', 'Internet': 'Internet', 'Naviguer sur le web': 'Browse the web',
    'Suivante ▶': 'Forward ▶', '🔄 Actualiser': '🔄 Refresh', '🏠 Accueil': '🏠 Home', 'Atteindre': 'Go', 'Terminé': 'Done', 'Ouverture de la page…': 'Opening page…',
    'Beaucoup de sites interdisent d\'être affichés dans une autre page. Si elle reste vide :': 'Many sites refuse to be displayed inside another page. If it stays blank:',
    'Ouvrir dans un nouvel onglet': 'Open in a new tab', 'Rechercher': 'Search', '@Rechercher sur le Web': 'Search the web', 'Rechercher sur le Web': 'Search the web', '@Page web': 'Web page', '@Adresse': 'Address',
    'Mon portfolio': 'My portfolio', 'Favoris': 'Favorites', '📁 Projets': '📁 Projects', '📄 CV': '📄 Résumé', '🖼 Galerie': '🖼 Gallery', '🎧 Musique': '🎧 Music', '💬 Messenger': '💬 Messenger', '✉ Contact': '✉ Contact',
    // --- explorateur / projets ---
    'Fichier': 'File', 'Edition': 'Edit', 'Affichage': 'View', 'Favoris': 'Favorites', 'Outils': 'Tools', 'Adresse': 'Address',
    '◀ Précédente': '◀ Back', '▲ Dossier parent': '▲ Parent folder', 'Gestion des fichiers': 'File tasks', 'Autres emplacements': 'Other places', 'Détails': 'Details',
    '📄 Voir mon CV': '📄 View my résumé', '📁 Projets': '📁 Projects', '🖼 Galerie': '🖼 Gallery',
    'Vidéo & Pub': 'Video & Ads', 'Graphisme': 'Graphic design', 'Web': 'Web', 'Dossier de fichiers': 'File folder', 'Fiche projet': 'Project sheet',
    'Visionneuse': 'Viewer', 'Voir le projet': 'View project', 'Un projet en tête ? Écris-moi': 'Got a project in mind? Write to me',
    'Spot Hinge': 'Hinge Ad Spot', 'Marée basse': 'Low Tide', 'Affiche Caen Jazz': 'Caen Jazz Poster', 'Café Mirabelle': 'Café Mirabelle',
    'Atelier Lumen': 'Atelier Lumen', 'Teaser association': 'Charity Teaser', 'Flyer Soirée étudiante': 'Student Party Flyer', 'Application Météo': 'Weather App',
    'Publicité de 30 s : scénario, storyboard, motion design sur After Effects et intégration sonore. (exemple fictif)': '30-second ad: script, storyboard, motion design in After Effects and sound integration. (sample project)',
    'Court-métrage de 8 minutes tourné sur la côte normande. (exemple fictif)': '8-minute short film shot on the Normandy coast. (sample project)',
    'Identité visuelle : logo, charte graphique et menus. (exemple fictif)': 'Visual identity: logo, brand guidelines and menus. (sample project)',
    'Site vitrine responsive en HTML, CSS et JavaScript. (exemple fictif)': 'Responsive showcase website in HTML, CSS and JavaScript. (sample project)',
    'Vidéo de 20 secondes pour les réseaux sociaux. (exemple fictif)': '20-second video for social media. (sample project)',
    'Flyer recto-verso pour le BDE. (exemple fictif)': 'Double-sided flyer for the student union. (sample project)',
    'Mini-application JavaScript consommant une API météo. (exemple fictif)': 'Small JavaScript app using a weather API. (sample project)',
    // --- contact ---
    'Discutons de vos projets !': 'Let\'s talk about your projects!', 'Stage, projet vidéo, graphisme ou web : écris-moi.': 'Internship, video, graphic or web project: write to me.',
    'Votre nom': 'Your name', 'Votre e-mail': 'Your email', 'Message': 'Message', 'Envoyer': 'Send', 'Ou directement :': 'Or directly:',
    'Envoi…': 'Sending…', 'Merci ! Ton message est bien parti, je te réponds vite.': 'Thanks! Your message has been sent, I\'ll reply soon.',
    'Envoi impossible, ouverture de ton application mail…': 'Could not send, opening your mail app…',
    'Ton application mail s\'ouvre avec le message prêt à envoyer.': 'Your mail app is opening with the message ready to send.',
    // --- CV ---
    'Justin DEJEAN': 'Justin DEJEAN', 'Recherche de stage — audiovisuel & infographie': 'Looking for an internship — audiovisual & graphic design',
    'Étudiant en BUT MMI, je cherche un stage de 8 à 10 semaines à partir du 15 avril. À l\'aise sur la suite Adobe (Illustrator, Photoshop, InDesign, Premiere Pro, After Effects), je suis prêt à m\'investir sur des projets concrets et à apporter une vraie valeur ajoutée à votre équipe.':
      'BUT MMI student (multimedia & internet), looking for an 8 to 10-week internship starting April 15. Comfortable with the Adobe suite (Illustrator, Photoshop, InDesign, Premiere Pro, After Effects), I am ready to commit to real projects and bring real added value to your team.',
    '⬇ Télécharger le CV (PDF)': '⬇ Download résumé (PDF)', 'Expériences': 'Experience', 'Formation': 'Education', 'Compétences': 'Skills',
    'Spot publicitaire Hinge': 'Hinge advertising spot', '— scénario, storyboard, motion design (After Effects) et intégration sonore.': '— script, storyboard, motion design (After Effects) and sound integration.',
    'Ce portfolio': 'This portfolio', '— bureau Windows XP et galerie 2D jouable, développés en HTML, CSS et JavaScript.': '— Windows XP desktop and playable 2D gallery, built with HTML, CSS and JavaScript.',
    '→ Voir tous mes projets': '→ See all my projects',
    'Agent de tri': 'Sorting operator', '(juillet – août 2026) — tri de déchets sélectif sur tapis roulant, enlèvement des déchets, nettoyage des machines.': '(July – August 2026) — selective waste sorting on a conveyor belt, waste removal, machine cleaning.',
    'Aide livreur': 'Delivery assistant', '(août 2026) — réception et tri des camions, préparation des commandes, livraison, pose et reprise, installation de nouveaux équipements chez les clients.': '(August 2026) — receiving and sorting trucks, order preparation, delivery, fitting and removal, installing new equipment at customers\' homes.',
    'Festival Beauregard': 'Beauregard Festival', '(juillet 2026) — contrôles et pose des bracelets, gestion des litiges.': '(July 2026) — wristband checks and fitting, dispute handling.',
    'Festival Bobital': 'Bobital Festival', '(juin 2026) — missions de montage et de logistique du festival.': '(June 2026) — festival set-up and logistics tasks.',
    'Membre du BDE': 'Student union member', '— participation à la vie associative et aux événements étudiants.': '— taking part in student life and events.',
    '2025 – en cours': '2025 – present', '— BUT Métiers du Multimédia et de l\'Internet — Université de Caen Normandie (IUT de Cherbourg)': '— BUT Multimedia & Internet Professions — University of Caen Normandie (IUT Cherbourg)',
    '2022 – 2025': '2022 – 2025', '— Baccalauréat STI2D, lycée Dumont d\'Urville': '— STI2D baccalaureate, Dumont d\'Urville high school',
    '2023': '2023', '— SNU (Service national universel) — PSC1 (secourisme)': '— SNU (national universal service) — PSC1 (first aid)',
    '2022': '2022', '— Diplôme national du brevet': '— National diploma (brevet)',
    'Logiciels :': 'Software:', 'Illustrator, Photoshop, InDesign, Premiere Pro, After Effects, CapCut, Canva': 'Illustrator, Photoshop, InDesign, Premiere Pro, After Effects, CapCut, Canva',
    'Web :': 'Web:', 'Qualités :': 'Strengths:', 'apprentissage rapide, adaptabilité, organisation et respect des procédures, sens du service et disponibilité': 'quick learner, adaptable, organised and rigorous, service-minded and available',
    'Langues :': 'Languages:', 'français (langue maternelle), anglais (niveau professionnel), espagnol (débutant)': 'French (native), English (professional level), Spanish (beginner)',
    'Permis B': 'Driving licence (B)', '— véhiculé': '— has a car',
    // --- messenger ---
    'Messenger — Justin Dejean': 'Messenger — Justin Dejean', 'En ligne': 'Online', 'CV — Justin Dejean': 'Résumé — Justin Dejean',
    'Salut ! 👋 Moi c\'est Justin.': 'Hi! 👋 I\'m Justin.', 'Qu\'est-ce que tu cherches ?': 'What are you looking for?', 'Autre chose ?': 'Anything else?',
    '🎬 Voir tes projets': '🎬 See your projects', '📄 Voir ton CV': '📄 See your résumé', '🖼 Visiter la galerie': '🖼 Visit the gallery',
    '🎧 Écouter ta playlist': '🎧 Listen to your playlist', '📅 Tu es dispo quand ?': '📅 When are you available?', '✉ Te contacter': '✉ Contact you',
    'Voir tes projets': 'See your projects', 'Voir ton CV': 'See your résumé', 'Visiter la galerie': 'Visit the gallery', 'Écouter ta playlist': 'Listen to your playlist',
    'Tu es dispo quand ?': 'When are you available?', 'Te contacter': 'Contact you',
    'Je t\'ouvre mes projets. Commence par le dossier Vidéo & Pub !': 'Opening my projects for you. Start with the Video & Ads folder!',
    'Voilà mon CV. Dis-moi si un profil comme le mien t\'intéresse.': 'Here\'s my résumé. Tell me if a profile like mine interests you.',
    'Bonne balade ! Regarde tous les tableaux.': 'Enjoy the walk! Look at every painting.', 'Voici ce que j\'écoute en travaillant.': 'Here\'s what I listen to while working.',
    'Avec plaisir ! Je t\'ouvre le formulaire.': 'With pleasure! Opening the form for you.', 'Disponible bientôt !': 'Available soon!', 'Écris-moi pour en parler !': 'Write to me to talk about it!',
    'Lecteur de musique': 'Music player', '🎵 Titres complets (YouTube)': '🎵 Full tracks (YouTube)', 'Spotify (extraits)': 'Spotify (previews)', 'Titres joués en entier · volume réglable dans le lecteur.': 'Tracks play in full · volume is adjustable in the player.', 'Extraits de 30 s, sauf si tu es connecté à Spotify.': '30-second previews, unless you are logged in to Spotify.', 'Le lecteur ne s\'affiche pas ?': 'Player not showing?', 'Ouvrir dans Spotify': 'Open in Spotify',
    // --- démineur, assistant, erreur, extinction ---
    '🚩 Mode drapeau': '🚩 Flag mode', 'Boum ! Rejoue avec 🙂.': 'Boom! Play again with 🙂.', 'Et si on travaillait ensemble ?': 'Shall we work together?',
    'Il semblerait que vous cherchiez un monteur vidéo… Voulez-vous de l\'aide ?': 'It looks like you\'re looking for a video editor… Would you like some help?',
    'Voir les vidéos': 'See the videos', 'Discuter': 'Chat', 'Non merci': 'No thanks', 'Oui': 'Yes', 'Non': 'No',
    'Une erreur est survenue : trop de talent détecté. Voulez-vous continuer ?': 'An error occurred: too much talent detected. Do you want to continue?',
    'Cette option n\'est pas disponible. Veuillez réessayer avec « Oui ».': 'This option is not available. Please try again with “Yes”.',
    'Arrêt de Windows…': 'Windows is shutting down…', 'Il est maintenant possible d\'éteindre votre ordinateur.': 'It is now safe to turn off your computer.',
    // --- jeu ---
    'Galerie — les travaux de Justin Dejean': 'Gallery — Justin Dejean\'s work', '@Joystick': 'Joystick',
    'pour marcher · maintenir': 'to walk · hold', 'pour courir ·': 'to run ·', 'pour sauter ·': 'to jump ·', 'pour interagir': 'to interact', 'ou': 'or', 'Maj': 'Shift', 'Espace': 'Space',
    'Bienvenue dans la galerie.': 'Welcome to the gallery.', 'Flèches ou ZQSD pour marcher, A devant un tableau pour ouvrir le projet.': 'Arrow keys or ZQSD to walk, A in front of a painting to open the project.',
    'Objectif : regarde tous les tableaux. Le couloir est infini, va où tu veux.': 'Goal: look at every painting. The corridor is endless, go wherever you like.',
    'Re-bonjour ! Appuie sur A devant un tableau pour ouvrir le projet.': 'Welcome back! Press A in front of a painting to open the project.',
    'Il n\'y a rien par ici.': 'Nothing here.', 'Tu refermes la porte du studio.': 'You close the studio door.',
    'Sur le bureau du Mac, tout ce que tu as trouvé ici est maintenant ouvrable.': 'On the desktop, everything you found here can now be opened.',
    'Tu as fait le tour de la galerie ! Un projet en tête ? Écris-moi.': 'You\'ve seen the whole gallery! Got a project in mind? Write to me.',
    '★ Tour terminé ! Un projet en tête ? Clique sur « Me contacter ».': '★ Tour complete! Got a project in mind? Click “Contact me”.',
    'Tour terminé — contacte-moi !': 'Tour complete — contact me!',
    'Spot Hinge — publicité vidéo': 'Hinge Ad Spot — video advertising', 'Scénario, storyboard et motion design sur After Effects. (exemple fictif)': 'Script, storyboard and motion design in After Effects. (sample project)',
    'Court-métrage « Marée basse »': 'Short film “Low Tide”', 'Huit minutes tournées sur la côte normande. (exemple fictif)': 'Eight minutes shot on the Normandy coast. (sample project)',
    'Affiche — Festival Caen Jazz': 'Poster — Caen Jazz Festival', 'Affiche A2 et déclinaisons réseaux sociaux. (exemple fictif)': 'A2 poster and social media versions. (sample project)',
    'Identité visuelle — Café Mirabelle': 'Visual identity — Café Mirabelle', 'Logo, charte graphique et menus. (exemple fictif)': 'Logo, brand guidelines and menus. (sample project)',
    'Site web — Atelier Lumen': 'Website — Atelier Lumen', 'Mon CV': 'My résumé', 'Formation, compétences et logiciels.': 'Education, skills and software.',
    'Écris-moi, je réponds vite.': 'Write to me, I reply quickly.'
  };
  const JOURS = { Dim: 'Sun', Lun: 'Mon', Mar: 'Tue', Mer: 'Wed', Jeu: 'Thu', Ven: 'Fri', Sam: 'Sat' };
  const RULES = [
    [/^(\d+) objets?$/, m => m[1] + ' item' + (m[1] === '1' ? '' : 's')],
    [/^(\d+) éléments?$/, m => m[1] + ' item' + (m[1] === '1' ? '' : 's')],
    [/^Tableaux vus (\d+)\/(\d+)$/, m => 'Paintings seen ' + m[1] + '/' + m[2]],
    [/^▶ Objectif : regarde tous les tableaux \((\d+)\/(\d+)\)$/, m => '▶ Goal: look at every painting (' + m[1] + '/' + m[2] + ')'],
    [/^Gagné en (\d+) s !/, m => 'Won in ' + m[1] + ' s!'],
    [/^(Dim|Lun|Mar|Mer|Jeu|Ven|Sam) (\d\d:\d\d)$/, m => JOURS[m[1]] + ' ' + m[2]],
    [/^(.+) — Visionneuse$/, m => tr(m[1]) + ' — Viewer'],
    [/^C:\\Mes documents\\Projets(?:\\(.+))?$/, m => 'C:\\My Documents\\Projects' + (m[1] ? '\\' + tr(m[1]) : '')]
  ];

  let L = 'fr';   // le site démarre TOUJOURS en français ; le bouton EN/FR change la langue jusqu'au prochain chargement
  try { localStorage.removeItem('lang'); } catch (e) {}

  function lookup(s) {
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2].replace(/\s+/g, ' ');   // les retours à la ligne du HTML ne comptent pas
    if (!core) return s;
    let r = Object.prototype.hasOwnProperty.call(EN, core) ? EN[core] : undefined;
    if (r === undefined) for (const [re, fn] of RULES) { const x = core.match(re); if (x) { r = fn(x); break; } }
    return r === undefined ? s : m[1] + r + m[3];
  }
  function tr(s) { return L === 'en' ? lookup(s) : s; }
  window.tr = tr;
  window.lang = () => L;

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT']);
  function syncText(n) {
    const p = n.parentElement;
    if (!p || SKIP.has(p.tagName) || p.closest('[data-en]')) return;
    const cur = n.nodeValue;
    if (n.__en === undefined || cur !== n.__en) n.__fr = cur;   // texte nouveau ou modifié par le site
    const target = L === 'en' ? lookup(n.__fr) : n.__fr;
    n.__en = target;
    if (target !== cur) n.nodeValue = target;
  }
  const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
  function syncAttrs(el) {
    ATTRS.forEach(a => {
      if (!el.hasAttribute(a)) return;
      el.__attr = el.__attr || {};
      const rec = el.__attr[a] = el.__attr[a] || { fr: el.getAttribute(a) };
      const cur = el.getAttribute(a);
      if (rec.en !== undefined && cur !== rec.en) rec.fr = cur;
      rec.en = L === 'en' ? lookup('@' + rec.fr).replace(/^@/, '') : rec.fr;
      if (rec.en !== cur) el.setAttribute(a, rec.en);
    });
    if (el.hasAttribute('data-en')) {
      if (el.dataset.fr === undefined) el.dataset.fr = el.textContent;
      el.textContent = L === 'en' ? el.dataset.en : el.dataset.fr;
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { syncText(root); return; }
    if (root.nodeType !== 1) return;
    syncAttrs(root);
    root.querySelectorAll('[aria-label],[title],[placeholder],[alt],[data-en]').forEach(syncAttrs);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) syncText(n);
  }
  function applyAll() {
    walk(document.body);
    document.documentElement.lang = L;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      if (!desc.dataset.fr) desc.dataset.fr = desc.content;
      desc.content = L === 'en'
        ? 'Interactive portfolio of Justin Dejean, BUT MMI student at the University of Caen Normandie: video, graphic design and web, in a playable Windows XP desktop.'
        : desc.dataset.fr;
    }
  }
  window.setLang = function (l) {
    L = l === 'en' ? 'en' : 'fr';
    applyAll();
    document.dispatchEvent(new CustomEvent('langchange'));
  };

  function init() {
    applyAll();
    new MutationObserver(recs => {
      recs.forEach(r => {
        if (r.type === 'characterData') syncText(r.target);
        else r.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
