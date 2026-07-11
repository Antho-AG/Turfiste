import { parseLeTrotRace, parseRaceUrl, extractRaceTitle } from '../src/utils/letrotParser.js';
import {
  scoreMusique,
  parseTimeToSeconds,
  scoreReductionKm,
  scoreNiveauCourse,
  scorePlaceDepart,
  scoreFromStatsCache,
  extractFerrageInfo,
} from '../src/utils/autoScoring.js';

const EMPTY_STATS = { drivers: {}, entraineurs: {} };

async function loadStatsCache(req) {
  try {
    const host = req.headers.host;
    const protocol = host?.startsWith('localhost') ? 'http' : 'https';
    const res = await fetch(`${protocol}://${host}/data/driver-entraineur-stats.json`);
    if (!res.ok) return EMPTY_STATS;
    return await res.json();
  } catch {
    // Pas bloquant : sans cache, driver/entraîneur repasseront en score null
    // (à saisir à la main), le reste du pipeline continue de fonctionner.
    return EMPTY_STATS;
  }
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'Paramètre "url" manquant.' });
    return;
  }

  const raceRef = parseRaceUrl(url);
  if (!raceRef) {
    res.status(400).json({
      error: "URL invalide — attendu un lien du type letrot.com/courses/AAAA-MM-JJ/code/numero",
    });
    return;
  }

  let html;
  try {
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrotScoreApp/1.0)' },
    });
    if (!pageRes.ok) {
      res.status(502).json({ error: `LeTrot a répondu ${pageRes.status}` });
      return;
    }
    html = await pageRes.text();
  } catch (err) {
    res.status(502).json({ error: `Impossible de contacter LeTrot : ${err.message}` });
    return;
  }

  const titleInfo = extractRaceTitle(html);
  const enrichedRaceRef = { ...raceRef, ...titleInfo };

  const { horses: rawHorses, warnings } = parseLeTrotRace(html);
  if (rawHorses.length === 0) {
    res.status(200).json({ horses: [], warnings, raceRef: enrichedRaceRef });
    return;
  }

  const statsCache = await loadStatsCache(req);

  // Références de champ nécessaires pour les scores relatifs au peloton
  const allTimes = rawHorses.map((h) => parseTimeToSeconds(h.recordTime));
  const allGainsMoyens = rawHorses.map((h) => h.gainsMoyens);

  const horses = rawHorses.map((h) => {
    const timeSeconds = parseTimeToSeconds(h.recordTime);

    return {
      id: crypto.randomUUID(),
      numero: h.numero,
      nom: h.nom,
      driverNom: h.driverNom,
      entraineurNom: h.entraineurNom,
      cote: '',
      criteriaScores: {
        forme: scoreMusique(h.musique),
        reductionKm: scoreReductionKm(timeSeconds, allTimes),
        niveauCourse: scoreNiveauCourse(h.gainsMoyens, allGainsMoyens),
        placeDepart: scorePlaceDepart(h.numero),
        driver: scoreFromStatsCache(h.driverNom, statsCache.drivers),
        entraineur: scoreFromStatsCache(h.entraineurNom, statsCache.entraineurs),
        ferrage: undefined, // pas de score auto, voir ferrageInfo ci-dessous
      },
      ferrageInfo: extractFerrageInfo(h.ferrageCode),
      musiqueSource: h.musique, // gardé pour affichage/vérif visuelle par l'utilisateur
    };
  });

  res.status(200).json({ horses, warnings, raceRef: enrichedRaceRef });
}
