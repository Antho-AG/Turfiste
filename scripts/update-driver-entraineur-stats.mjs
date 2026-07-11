// Exécuté par .github/workflows/update-stats.yml, pas par l'app elle-même.
// Reconstitue un taux de réussite glissant par driver et par entraîneur à
// partir des résultats de courses de trot attelé des N derniers jours,
// via l'API communautaire open-pmu-api (https://open-pmu-api.vercel.app).
//
// Limite connue et assumée : l'API ne liste que les chevaux "classés" dans
// l'arrivée (champ arrivee_details), pas l'intégralité des partants d'une
// course. Un driver dont le cheval a terminé loin derrière ne sera donc pas
// compté dans son nombre total de courses pour certaines épreuves. Le taux
// obtenu est donc un indicateur de forme utile, pas une statistique exacte
// "victoires / total départs".

import { writeFileSync, mkdirSync } from 'node:fs';
import { normalizeName } from '../src/utils/nameMatch.js';

const DAYS_TO_SCAN = 60;
const MIN_COURSES = 3; // en dessous, on ne retient pas l'entrée (échantillon trop faible)
const API_BASE = 'https://open-pmu-api.vercel.app/api/arrivees';

function formatDateForApi(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function fetchDay(dateStr) {
  try {
    const res = await fetch(`${API_BASE}?date=${dateStr}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.error ? [] : data.message ?? [];
  } catch (err) {
    console.warn(`Échec fetch pour ${dateStr} : ${err.message}`);
    return [];
  }
}

function recordResult(table, rawName, rank) {
  const key = normalizeName(rawName);
  if (!key) return;

  if (!table[key]) {
    table[key] = { courses: 0, victoires: 0, places: 0 };
  }
  table[key].courses += 1;
  if (rank === 1) table[key].victoires += 1;
  if (rank <= 3) table[key].places += 1;
}

async function main() {
  const drivers = {};
  const entraineurs = {};
  let racesProcessed = 0;

  const today = new Date();

  for (let i = 1; i <= DAYS_TO_SCAN; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateForApi(date);

    const races = await fetchDay(dateStr);

    for (const race of races) {
      if (race.type !== 'Attelé') continue; // hors scope : mono-discipline trot attelé
      if (!race.arrivee || !race.arrivee_details) continue;

      race.arrivee.forEach((numero, idx) => {
        const details = race.arrivee_details[String(numero)];
        if (!details) return;
        const rank = idx + 1;
        recordResult(drivers, details.nom_jockey, rank);
        recordResult(entraineurs, details.nom_entraineur, rank);
      });

      racesProcessed += 1;
    }
  }

  // On élague les entrées sous le seuil de fiabilité avant d'écrire le fichier
  const prune = (table) =>
    Object.fromEntries(Object.entries(table).filter(([, v]) => v.courses >= MIN_COURSES));

  const output = {
    generatedAt: new Date().toISOString(),
    daysScanned: DAYS_TO_SCAN,
    racesProcessed,
    drivers: prune(drivers),
    entraineurs: prune(entraineurs),
  };

  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/driver-entraineur-stats.json', JSON.stringify(output, null, 2));

  console.log(
    `Terminé : ${racesProcessed} courses traitées, ${Object.keys(output.drivers).length} drivers, ${Object.keys(output.entraineurs).length} entraîneurs retenus.`
  );
}

main();
