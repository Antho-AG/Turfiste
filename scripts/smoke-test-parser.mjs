// Test de fumée du parseur LeTrot et des fonctions de scoring.
//
// IMPORTANT : le HTML ci-dessous est reconstruit à la main à partir du texte
// visible d'une vraie page LeTrot (letrot.com/courses/2026-07-11/8503/4),
// mais SANS avoir pu inspecter le DOM réel (classes CSS, structure exacte
// des balises). Ce test valide donc la logique de parsing et de scoring,
// PAS que le parseur fonctionnera tel quel contre le vrai site.
//
// À faire en priorité une fois en Claude Code : fetcher une vraie URL
// LeTrot, comparer le HTML réel à la structure supposée ici, et ajuster
// HEADER_KEYWORDS / findPartantsTable dans src/utils/letrotParser.js si besoin.
//
// Lancer avec : node scripts/smoke-test-parser.mjs

import { parseLeTrotRace, extractRaceTitle, parseRaceUrl } from '../src/utils/letrotParser.js';
import {
  scoreReductionKm,
  parseTimeToSeconds,
} from '../src/utils/autoScoring.js';
import { normalizeName } from '../src/utils/nameMatch.js';

const mockHtml = `
<html><head><title>R7 LES SABLES D'OLONNE C4 PRIX BEAUSEJOUR II : partants, résultats et arrivée définitive | LETROT</title></head>
<body>
<table>
  <thead>
    <tr><th>N°</th><th>Cheval</th><th>au Partant</th><th>Fer</th><th>S/A</th><th>Dist.</th><th>Driver</th><th>Entraîneur</th><th>Musique</th><th>Record</th><th>Gains (€)</th><th>Moyenne Gains (€)</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>LUCIANO VET 🚀</td><td>5398</td><td>F4</td><td>H5</td><td>2650</td><td>B. LE BELLER</td><td>B. LE BELLER</td><td>1a 4a 4a 6a 7a</td><td>1'13"2</td><td>38 010 €</td><td>2 111 €</td></tr>
    <tr><td>2</td><td>LOLITA DES LANDES</td><td>4156</td><td>D4</td><td>F5</td><td>2650</td><td>S. HARDY</td><td>S. HARDY</td><td>7a 6a 5a 2a 6a</td><td>1'13"6</td><td>36 520 €</td><td>1 352 €</td></tr>
    <tr><td>8</td><td>L'ART DU SOLLIER</td><td>5332</td><td>D4</td><td>H5</td><td>2650</td><td>L. DELANOE</td><td>S.G. DUPONT</td><td>9a Da 1a 1a 3a</td><td>1'12"8</td><td>36 065 €</td><td>2 121 €</td></tr>
  </tbody>
</table>
</body></html>
`;

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
  console.log(`OK — ${message}`);
}

const urlInfo = parseRaceUrl('https://www.letrot.com/courses/2026-07-11/8503/4');
assert(urlInfo?.date === '2026-07-11', 'parseRaceUrl extrait la date');
assert(urlInfo?.hippodromeCode === '8503', 'parseRaceUrl extrait le code hippodrome');

const titleInfo = extractRaceTitle(mockHtml);
assert(titleInfo?.hippodrome === "LES SABLES D'OLONNE", 'extractRaceTitle extrait le nom hippodrome');

const { horses, warnings } = parseLeTrotRace(mockHtml);
assert(warnings.length === 0, 'parseLeTrotRace ne remonte aucun avertissement sur le HTML de test');
assert(horses.length === 3, 'parseLeTrotRace extrait les 3 lignes');
assert(horses[0].nom === 'LUCIANO VET', "parseLeTrotRace nettoie l'emoji du nom du cheval");
assert(horses[2].nom === "L'ART DU SOLLIER", "parseLeTrotRace préserve l'apostrophe dans le nom");

assert(
  normalizeName('B. LE BELLER') === normalizeName('LE BELLER B.'),
  'normalizeName unifie les deux formats de nom'
);

const times = horses.map((h) => parseTimeToSeconds(h.recordTime));
const fastestScore = scoreReductionKm(Math.min(...times), times);
assert(fastestScore === 20, 'scoreReductionKm donne 20 au temps le plus rapide du peloton');

console.log('\nTous les tests de fumée sont passés.');
