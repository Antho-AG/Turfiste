import { normalizeName } from './nameMatch.js';

/**
 * Musique : chaîne du type "1a 4a 4a 6a 7a" (place la plus récente en premier).
 * On convertit chaque place en points, puis on fait une moyenne pondérée
 * (les courses récentes comptent plus que les anciennes).
 */
const PLACE_POINTS = { 1: 20, 2: 17, 3: 14, 4: 11, 5: 9, 6: 7, 7: 5, 8: 3, 9: 2, 0: 1 };
const RECENCY_WEIGHTS = [0.3, 0.25, 0.2, 0.15, 0.1];

export function scoreMusique(musique) {
  if (!musique) return null;

  // Chaque performance est un chiffre (place) ou une lettre (D=distancé,
  // Ret=retiré, etc.) suivi de "a" (attelé) ou "m" (monté). On ignore les
  // parenthèses (ex: "(25)" = année de la saison précédente, pas une course).
  const tokens = musique
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return null;

  let weightedSum = 0;
  let weightTotal = 0;

  tokens.slice(0, RECENCY_WEIGHTS.length).forEach((token, i) => {
    const placeChar = token[0];
    const points = /[0-9]/.test(placeChar) ? PLACE_POINTS[Number(placeChar)] : 0;
    const weight = RECENCY_WEIGHTS[i];
    weightedSum += points * weight;
    weightTotal += weight;
  });

  if (weightTotal === 0) return null;
  return Math.round((weightedSum / weightTotal) * 10) / 10;
}

/**
 * Réduction kilométrique : compare le record du cheval (ex: "1'13\"2") au
 * meilleur et au pire temps du peloton du jour. Le plus rapide obtient 20,
 * le plus lent obtient 5 — jamais 0, un temps enregistré dans une course
 * qualificative reste une référence sérieuse.
 */
export function parseTimeToSeconds(timeStr) {
  const match = timeStr?.match(/(\d+)'(\d+)"(\d+)/);
  if (!match) return null;
  const [, min, sec, tenths] = match;
  return Number(min) * 60 + Number(sec) + Number(tenths) / 10;
}

export function scoreReductionKm(horseTimeSeconds, allTimesInRace) {
  const validTimes = allTimesInRace.filter((t) => t !== null);
  if (horseTimeSeconds === null || validTimes.length < 2) return null;

  const min = Math.min(...validTimes);
  const max = Math.max(...validTimes);
  if (max === min) return 15; // tout le monde pareil, score neutre-haut

  const ratio = (horseTimeSeconds - min) / (max - min); // 0 = plus rapide, 1 = plus lent
  return Math.round((20 - ratio * 15) * 10) / 10;
}

/**
 * Niveau de la course : proxy via les gains moyens du cheval comparés à la
 * moyenne du peloton. Un cheval habitué à des allocations plus élevées que
 * la course du jour est probablement supérieur à son lot ici.
 */
export function scoreNiveauCourse(horseGainsMoyens, allGainsMoyensInRace) {
  const validGains = allGainsMoyensInRace.filter((g) => g !== null && g > 0);
  if (!horseGainsMoyens || validGains.length < 2) return null;

  const max = Math.max(...validGains);
  if (max === 0) return 10;

  return Math.round(Math.min((horseGainsMoyens / max) * 20, 20) * 10) / 10;
}

/**
 * Place au départ : heuristique simple, à recalibrer en Phase 3 (l'avantage
 * réel varie selon hippodrome/distance/autostart vs élastique).
 */
export function scorePlaceDepart(numero) {
  if (!numero || isNaN(numero)) return null;
  return Math.max(20 - (Number(numero) - 1) * 1.2, 4);
}

/**
 * Driver / entraîneur : lookup dans le cache de stats hebdomadaire
 * (public/data/driver-entraineur-stats.json). Score = taux de réussite
 * pondéré victoires/places. Si le nom n'est pas dans le cache (jeune driver,
 * trop peu de courses récentes...), on renvoie null pour signaler "pas de
 * donnée" plutôt que d'inventer un score neutre silencieux.
 */
export function scoreFromStatsCache(rawName, statsCache) {
  const key = normalizeName(rawName);
  if (!key || !statsCache) return null;

  const entry = statsCache[key];
  if (!entry || entry.courses < 5) return null; // échantillon trop faible

  const winRate = entry.victoires / entry.courses;
  const placeRate = entry.places / entry.courses;
  // On pondère la place plus que la victoire seule : plus stable statistiquement.
  const score = winRate * 8 + placeRate * 12;
  return Math.round(Math.min(score, 20) * 10) / 10;
}

/**
 * Capture brute du code de ferrage — pas de score calculé automatiquement
 * (détecter un changement demande l'historique du cheval, pas dispo ici),
 * mais on remonte le code pour affichage et ajustement manuel.
 */
export function extractFerrageInfo(ferrageCode) {
  return ferrageCode?.trim() || null;
}
