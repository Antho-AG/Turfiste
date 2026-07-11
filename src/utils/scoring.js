import { CRITERIA, NOTE_MAX, TIER_Z_THRESHOLDS } from '../data/criteria.js';

// Sécurité de dev : si les poids ne totalisent pas 1.0, on le signale fort
// plutôt que de laisser une note faussée passer inaperçue.
const totalWeight = CRITERIA.reduce((sum, c) => sum + c.weight, 0);
if (Math.abs(totalWeight - 1) > 0.001) {
  console.warn(
    `[scoring] Les poids des critères totalisent ${totalWeight}, attendu 1.0`
  );
}

/**
 * Calcule la note finale /100 d'un cheval à partir de ses scores par critère.
 * @param {Record<string, number>} criteriaScores - ex: { forme: 14, reductionKm: 16, ... }
 *        Chaque valeur est comprise entre 0 et 20. Un critère non renseigné vaut 0.
 * @returns {number} note arrondie sur 100
 */
export function calculateNote(criteriaScores) {
  let total = 0;
  for (const criterion of CRITERIA) {
    const raw = criteriaScores?.[criterion.id] ?? 0;
    const normalized = Math.min(Math.max(raw, 0), NOTE_MAX) / NOTE_MAX; // 0-1
    total += normalized * criterion.weight;
  }
  return Math.round(total * 100);
}

/**
 * Calcule le tier de CHAQUE cheval d'une course en fonction de sa position
 * relative dans le peloton du jour (z-score), pas d'un barème absolu.
 *
 * @param {number[]} notes - notes /100 de tous les chevaux de la course, dans
 *        n'importe quel ordre — le résultat est renvoyé dans le même ordre.
 * @returns {{tier: string, color: string, z: number}[]}
 */
export function getTiersForField(notes) {
  if (notes.length === 0) return [];

  const mean = notes.reduce((sum, n) => sum + n, 0) / notes.length;
  const variance = notes.reduce((sum, n) => sum + (n - mean) ** 2, 0) / notes.length;
  const stdev = Math.sqrt(variance);

  return notes.map((note) => {
    // Peloton trop homogène (ou un seul partant) : impossible de différencier
    // sérieusement, tout le monde reste en B plutôt que d'inventer un écart.
    if (stdev < 0.5) {
      const flat = TIER_Z_THRESHOLDS.find((t) => t.tier === 'B');
      return { ...flat, z: 0 };
    }

    const z = (note - mean) / stdev;
    const found = TIER_Z_THRESHOLDS.find((t) => z >= t.minZ);
    return { ...(found ?? TIER_Z_THRESHOLDS[TIER_Z_THRESHOLDS.length - 1]), z: Math.round(z * 100) / 100 };
  });
}

/**
 * Calcule la valeur d'un cheval : note normalisée × cote.
 *
 * Pourquoi la multiplication et pas la division :
 * diviser la note par la cote favoriserait mécaniquement les favoris
 * (cote basse), ce qui est l'inverse de la logique "value" — on cherche
 * les chevaux dont le marché sous-estime les chances par rapport à notre
 * propre lecture. Multiplier récompense un bon niveau ET une cote généreuse.
 *
 * @param {number} note - note /100
 * @param {number|null} cote - cote décimale saisie par l'utilisateur
 * @returns {number|null} value, ou null si aucune cote saisie
 */
export function calculateValue(note, cote) {
  if (!cote || cote <= 0) return null;
  return Math.round((note / 100) * cote * 100) / 100;
}

/**
 * Crée un objet cheval vierge avec un id unique.
 */
export function createEmptyHorse(numero = '') {
  return {
    id: crypto.randomUUID(),
    numero,
    nom: '',
    driverNom: '',
    entraineurNom: '',
    criteriaScores: {},
    cote: '',
    commentaire: '',
  };
}
