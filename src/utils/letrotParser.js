import * as cheerio from 'cheerio';

/**
 * Stratégie de parsing : plutôt que de fixer des index de colonnes en dur
 * (fragile au moindre changement de mise en page), on lit les libellés du
 * <thead> pour construire une correspondance libellé → index de colonne,
 * puis on va chercher chaque donnée par libellé. Tant que LeTrot garde des
 * en-têtes de type "Musique", "Driver", "Entraîneur"..., le parseur
 * s'adapte même si l'ordre ou le nombre de colonnes change légèrement.
 *
 * Point de fragilité assumé : si LeTrot change complètement sa page (passage
 * en rendu JS, refonte totale de la table), ce parseur cessera de fonctionner
 * et devra être réécrit — c'est le risque inhérent à toute automatisation
 * basée sur du HTML non contractuel.
 */

const HEADER_KEYWORDS = {
  numero: ['n°', 'numero'],
  cheval: ['cheval'],
  ferrage: ['fer'],
  sexeAge: ['s/a', 'sa', 'age'],
  driver: ['driver', 'jockey'],
  entraineur: ['entra'],
  musique: ['musique'],
  record: ['record'],
  gainsMoyens: ['moyenne'], // à tester AVANT "gains" (sous-chaîne commune)
  gains: ['gains'],
};

function findHeaderMap($, table) {
  const headers = $(table).find('thead th, thead td');
  const map = {};

  headers.each((index, el) => {
    const label = $(el).text().trim().toLowerCase();
    for (const [field, keywords] of Object.entries(HEADER_KEYWORDS)) {
      if (field in map) continue; // premier match gagne (utile pour gainsMoyens avant gains)
      if (keywords.some((kw) => label.includes(kw))) {
        map[field] = index;
      }
    }
  });

  return map;
}

function findPartantsTable($) {
  let found = null;
  $('table').each((_, table) => {
    const headerText = $(table).find('thead').text().toLowerCase();
    if (headerText.includes('musique') && headerText.includes('cheval')) {
      found = table;
    }
  });
  return found;
}

function cellText($, row, headerMap, field) {
  const index = headerMap[field];
  if (index === undefined) return null;
  const cells = $(row).find('td');
  const cell = cells.eq(index);
  return cell.length ? cell.text().trim() : null;
}

function parseMoney(text) {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

/**
 * Parse la page HTML brute d'une course LeTrot.
 * @param {string} html
 * @returns {{ horses: Array<object>, warnings: string[] }}
 */
export function parseLeTrotRace(html) {
  const $ = cheerio.load(html);
  const warnings = [];

  const table = findPartantsTable($);
  if (!table) {
    return { horses: [], warnings: ['Table des partants introuvable sur la page.'] };
  }

  const headerMap = findHeaderMap($, table);
  const requiredFields = ['numero', 'cheval', 'driver', 'musique'];
  const missing = requiredFields.filter((f) => headerMap[f] === undefined);
  if (missing.length > 0) {
    warnings.push(`Colonnes non reconnues : ${missing.join(', ')}`);
  }

  const horses = [];
  $(table)
    .find('tbody tr')
    .each((_, row) => {
      const numero = cellText($, row, headerMap, 'numero');
      const cheval = cellText($, row, headerMap, 'cheval');
      if (!numero || !cheval) return; // ligne vide ou ligne d'en-tête répétée

      horses.push({
        numero: numero.replace(/\D/g, ''),
        nom: cheval.replace(/[^\p{L}\p{N}'\s-]/gu, '').trim(), // retire les émojis/icônes
        driverNom: cellText($, row, headerMap, 'driver') || '',
        entraineurNom: cellText($, row, headerMap, 'entraineur') || '',
        ferrageCode: cellText($, row, headerMap, 'ferrage'),
        musique: cellText($, row, headerMap, 'musique'),
        recordTime: cellText($, row, headerMap, 'record'),
        gains: parseMoney(cellText($, row, headerMap, 'gains')),
        gainsMoyens: parseMoney(cellText($, row, headerMap, 'gainsMoyens')),
      });
    });

  if (horses.length === 0) {
    warnings.push('Aucun partant extrait — la structure de la page a peut-être changé.');
  }

  return { horses, warnings };
}

/**
 * Extrait le libellé lisible de la course depuis la balise <title> de la
 * page, ex: "R7 LES SABLES D'OLONNE C4 PRIX BEAUSEJOUR II : partants...".
 * Best-effort — si le format ne correspond pas, on renvoie null et le
 * front garde les champs d'en-tête tels que l'utilisateur les a saisis.
 */
export function extractRaceTitle(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) return null;

  const raw = titleMatch[1].split(':')[0].trim();
  const parts = raw.match(/^(R\d+)\s+(.+?)\s+(C\d+)\s+(.+)$/);
  if (!parts) return null;

  const [, reunion, hippodrome, course, prix] = parts;
  return { reunion, hippodrome: hippodrome.trim(), course, prix: prix.trim() };
}

/**
 * Extrait date / code hippodrome / numéro de course depuis une URL LeTrot,
 * plus fiable que de scraper ces infos depuis le contenu de la page.
 * Format attendu : https://www.letrot.com/courses/2026-07-11/8503/4
 */
export function parseRaceUrl(url) {
  const match = url.match(/letrot\.com\/courses\/(\d{4}-\d{2}-\d{2})\/(\d+)\/(\d+)/);
  if (!match) return null;
  const [, date, hippodromeCode, courseNumero] = match;
  return { date, hippodromeCode, courseNumero };
}
