<div align="center">

<img src="docs/media/logo.png" width="96" alt="Framegen">

# Framegen

**Une vidéo d'une douceur de soie dans votre navigateur.** Une extension Chrome qui transforme
les vidéos de 24-30 fps en 60-240 fps en temps réel - avec un réseau de neurones fonctionnant
entièrement sur votre GPU. Pas de serveurs, pas de comptes, rien ne quitte votre ordinateur.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hpdpcjakhclhljfdkpjolonjlopbdhfk?label=chrome%20web%20store&color=19c37d)](https://chromewebstore.google.com/detail/framegen-frame-interpolat/hpdpcjakhclhljfdkpjolonjlopbdhfk)
[![License](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![npm](https://img.shields.io/npm/v/framegen?label=npm&color=cb3837)](https://www.npmjs.com/package/framegen)
[![Ko-fi](https://img.shields.io/badge/support-ko--fi-ff5e5b)](https://ko-fi.com/monzikxd)

<img src="docs/media/hero.gif" width="880" alt="15 fps source vs Framegen x4 interpolation, side by side">

*Rendu réel du modèle livré (v7 small), pas une maquette. Dans le navigateur
cela s'exécute en temps réel : 2.0 ms par image générée en 720p sur une RTX 4060 Ti.*

https://github.com/user-attachments/assets/87fe417d-e161-40d9-8007-ac83edafcbb1

Démo en direct : YouTube réel, le curseur de comparaison (original | Framegen), le HUD de
débogage - enregistrée à 60 fps sur une RTX 4060 Ti.
**[Version complète de 50 secondes](https://github.com/MONZikWasTaken/Framegen/releases/download/v1.0.0/framegen-live-demo.mp4)**.
*(Images : Sintel © Blender Foundation, CC-BY.)*

</div>

**🇫🇷 Français** · [🇬🇧 English](README.en.md)

## Ce qu'il fait

- **2× à 6× plus d'images** sur n'importe quel `<video>` - films, séries, sports, animés,
  enregistrements d'écran ; YouTube et la plupart des sites vidéo
- **Le mode automatique** choisit le facteur le plus élevé que votre GPU soutient réellement,
  et recule avant qu'une saccade n'apparaisse
- **Le mode animé** détecte l'animation dessinée « on twos » et interpole le vrai
  mouvement au lieu des images dupliquées
- **Le mode Hz de l'écran** suit votre moniteur avec une petite marge de récupération afin qu'une
  image occasionnellement en retard ne devienne pas une baisse permanente
- **Curseur de comparaison** - faites glisser un séparateur sur la vidéo : l'original à gauche,
  Framegen à droite
- **Privé par conception** - toute la chaîne de traitement s'exécute sur votre GPU ; nous ne collectons
  littéralement rien

Une image interpolée coûte ~2 ms sur un GPU de milieu de gamme (RTX 4060 Ti) - le
modèle et le moteur d'inférence ont été construits sur mesure pour ça (un réseau de
2.9 MB avec des noyaux WebGPU écrits à la main ; détails dans [docs/TECHNICAL.md](docs/TECHNICAL.md)).

## Installation

**[Ajouter à Chrome depuis le Web Store](https://chromewebstore.google.com/detail/framegen-frame-interpolat/hpdpcjakhclhljfdkpjolonjlopbdhfk)** - un clic.

Installation manuelle (si vous voulez la version la plus récente avant qu'elle ne passe la
validation de la boutique) : téléchargez `framegen-extension.zip` depuis la
[dernière version](https://github.com/MONZikWasTaken/Framegen/releases/latest),
extrayez-la, ouvrez `chrome://extensions`, activez le **Mode développeur**, cliquez sur
**Charger une extension non empaquetée** et sélectionnez le dossier extrait.

Prérequis : **Chrome 121+** sur une machine dotée d'un GPU (Windows, macOS avec
Apple Silicon, Linux). Firefox et Safari ne fournissent pas encore les fonctionnalités WebGPU dont
nous avons besoin.

### Installation pour le développement

Le dépôt conserve le moteur WebGPU et les fichiers de modèle publiés dans
`extension/`, si un clone fraîchement créé est donc directement chargeable sur macOS, Windows et
Linux. `tools/build_extension.ps1` valide ces fichiers et crée les deux
dispositions de ZIP de publication ; il échoue au lieu d'empaqueter un contenu de moteur manquant, incompatible ou
obsolète. Si des exports de modèle locaux existent dans le répertoire ignoré `assets/`,
leurs empreintes doivent correspondre au contenu suivi. Utilisez
`tools/build_extension.ps1 -PromoteLocalAssets` pour promouvoir délibérément ces
exports, puis examinez et commitez les modifications résultantes dans `extension/assets`.

Pour les lecteurs HTML5 classiques sans DRM, la superposition reproduit CSS `object-fit`
(`fill`, `contain`, `cover`, `none` et `scale-down`) et `object-position`.
Si une source non mise à l'échelle dépasse la limite de sécurité du canevas FHD, Framegen laisse la
vidéo brute visible au lieu d'afficher une superposition mal alignée.

Pour charger une copie de développement localement :

1. Clonez ou téléchargez ce dépôt.
2. Ouvrez `chrome://extensions` ou `edge://extensions`.
3. Activez le **Mode développeur**, choisissez **Charger une extension non empaquetée** et sélectionnez le
   dossier `extension` du dépôt.
4. Rechargez la page vidéo après avoir rechargé l'extension.

Le réglage Debug dans le menu d'engrenage de Framegen affiche le minutage des images source,
`requestVideoFrameCallback`, la boucle de rendu, l'inférence, la présentation et les
dimensions du canevas, pour le dépannage.

## Comment l'utiliser

1. Ouvrez n'importe quelle vidéo et survolez-la - un bouton rond **FC** apparaît sur le
   bord gauche du lecteur.
2. Cliquez dessus. Le bouton devient vert, un affichage d'fps apparaît, et la vidéo est
   désormais interpolée. Cliquez à nouveau pour l'éteindre.
3. Le bouton **engrenage** à côté garde les réglages rapides à l'intérieur du lecteur.
   Choisissez **Paramètres avancés** là-bas ou dans la fenêtre de l'extension quand vous voulez l'éditeur de
   profils plein écran.

| Réglage | Ce qu'il fait |
|---|---|
| **Fréquence de sortie** | `auto` convient à la plupart des gens et peut utiliser une limite de FPS facultative. Vous pouvez aussi choisir n'importe quelle FPS cible personnalisée, un facteur fixe de 2×-6×, ou `display Hz` pour cadencer juste en dessous de la limite mesurée de votre moniteur et garder une marge de récupération. Une cible personnalisée est maintenue entre 2× les FPS mesurées de la source et la limite réelle écran/GPU |
| **Qualité** | Résolution des images insérées. `480` est le meilleur compromis ; augmentez-la sur un GPU puissant |
| **Modèle** | `v7s` (actuel par défaut) ou `v6` (ancien ; conservé jusqu'à ce que v8 le remplace) |
| **Mode animé** | Laissez-le activé pour les animés ; inoffensif ailleurs |
| **SR 2×** | Mise à l'échelle neuronale des images insérées - coûte du GPU, résultat plus net |
| **Comparaison** | Le curseur de découpe, pour voir la différence vous-même |

La page complète des réglages vous permet de garder les réglages en direct tels quels ou d'enregistrer
autant de profils locaux que vous voulez, qui peuvent être créés, dupliqués, renommés, supprimés
et réinitialisés. Elle expose aussi
les contrôles de visibilité pris en charge, notamment le compteur de FPS, le petit
filigrane `framegen` et les avis de performance facultatifs. Les réglages existants
sont migrés sans perte de valeurs.

**Bon premier test :** tout ce qui est tourné à 24 fps - une bande-annonce, une scène
de film avec un panoramique lent, le générique d'un animé. C'est là que la différence se
fait le plus sentir. Sur un écran 60 Hz vous verrez 24→60 ; sur un écran 144-240 Hz,
nettement plus.

## FAQ

**Il indique « aucune vidéo trouvée » / le bouton n'apparaît pas.**
Assurez-vous que la vidéo est bien en lecture. Sur certains lecteurs le bouton n'apparaît
que quand la souris est sur la vidéo elle-même.

**Est-ce que ça marche sur Netflix / Crunchyroll ?**
Non, et c'est impossible : les vidéos protégées par DRM sont invisibles pour les extensions par conception -
le navigateur nous rend des images noires. YouTube et la plupart des autres sites fonctionnent.

**Mon compteur de fps affiche moins que le facteur promis.**
Le mode automatique s'adapte à la marge réelle de votre GPU - il ne saccadera jamais pour atteindre
un chiffre. Baissez le réglage de qualité ou le plafond du facteur si vous en voulez plus.

**Envoie-t-il des données à votre insu ?**
Non. Il n'y a pas de serveur, pas de télémétrie, pas d'analytiques. L'extension est une chaîne de
traitement locale sur GPU ; le code est juste ici à vérifier.

**Mon GPU est-il assez performant ?**
S'il parvient déjà à lire la vidéo, 2× en 480p convient presque certainement. Le HUD
affiche le coût par image en ms - le budget est grossièrement `(factor-1) × cost <
frame interval`.

## L'histoire

Framegen est plus ancien que ce dépôt. L'idée - et le premier prototype - re-
montent à six mois avant le premier commit ici. Ce prototype n'a jamais été
publié : il marchait beaucoup trop mal pour être montré à qui que ce soit. Mais l'idée refusait de
disparaître, et pendant six mois j'ai continué à surveiller le domaine - et personne ne l'a
livré correctement : l'interpolation neuronale d'images en temps réel, dans le navigateur, sur n'importe quelle
vidéo, pour tout le monde. J'ai donc décidé de le construire moi-même. C'est ainsi que Framegen
est né.

## Soutenir le projet

Framegen est construit par **une seule personne** avec un seul GPU de milieu de gamme. L'extension est
gratuite et le restera - mais les modèles qui l'animent ne sont pas gratuits à produire :
chaque expérience d'entraînement s'exécute sur des GPU cloud loués, payés de poche
($5-30 par run, et une génération de modèles en prend des dizaines avant qu'un
seul soit assez bon pour être publié). Le prochain modèle, plus grand, est conçu et attend -
surtout des heures-GPU.

Si Framegen a rendu votre vidéo plus fluide et que vous voulez que le prochain modèle existe
plus tôt :

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/monzikxd)

Mettre une étoile au dépôt aide aussi - la visibilité est l'autre monnaie d'échange.

## L'utiliser comme bibliothèque

Le moteur d'inférence est disponible sur npm sous le nom [`framegen`](https://www.npmjs.com/package/framegen)
(MIT) - l'interpolation neuronale d'images en temps réel pour votre propre projet en ~20
lignes, poids compris :

```js
import { createRT } from 'framegen';

const BASE = 'https://cdn.jsdelivr.net/npm/framegen@1.4.7/weights';
const rt = await createRT(device, {
  w: 1280, h: 720, textureInput: true, textureOutput: true,
  weightsBin: await fetch(`${BASE}/rt_v7s.bin`).then(r => r.arrayBuffer()),
  weightsManifest: await fetch(`${BASE}/rt_v7s.json`).then(r => r.json()),
});
rt.prepPair(frameA, frameB); // t-free trunk, once per pair
rt.runT(0.5, outTexture);    // any t in (0,1), ~1-2 ms each
```

API complète et notes : [packages/rt](packages/rt). Exemple fonctionnel : [framegen-fps-booster](https://github.com/MONZikWasTaken/framegen-fps-booster) ([en ligne](https://monzikwastaken.github.io/framegen-fps-booster/)).

## Sous le capot (la version courte)

Un étudiant de la famille RIFE distillé (2.9 MB) tourne sur un moteur WGSL écrit à la main -
des shaders de calcul WebGPU bruts, sans framework ML, qui reproduisent la référence PyTorch à
1 LSB près. La chaîne de traitement réside entièrement dans le GPU : les images ne traversent jamais le CPU. De
la première tentative naïve dans le navigateur à aujourd'hui, on a un **×500-980 de rapidité**
(1957 ms → 2.0-3.75 ms par image, 720p-1080p).

Histoire complète, chiffres, gamme de modèles et instructions d'entraînement :
**[docs/TECHNICAL.md](docs/TECHNICAL.md)**

## Licence

Code : **MIT** ([LICENSE](LICENSE)) - l'extension et le moteur d'inférence
([`framegen`](packages/rt) sur npm), intégrez-les dans n'importe quoi, usage commercial compris.
Poids du modèle : usage personnel et recherche non commerciale
([WEIGHTS_LICENSE.md](WEIGHTS_LICENSE.md)) - ils sont distillés à partir d'un
enseignant de la famille RIFE dont la chaîne de licences n'est pas encore assez propre pour les libérer.
