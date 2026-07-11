import { CRITERIA, TIER_THRESHOLDS } from '../data/criteria.js'

// Note /100 = somme(score critère 0-10 * poids) * 10, poids somme = 1.0.
export function calculateNote(horse) {
  const weightedSum = CRITERIA.reduce((sum, c) => {
    const score = horse.criteria?.[c.id]
    return sum + (typeof score === 'number' ? score : 0) * c.weight
  }, 0)
  const note = weightedSum * 10
  return Math.round(note * 10) / 10
}

export function getTier(note) {
  const match = TIER_THRESHOLDS.find((t) => note >= t.min)
  return match ? match.tier : TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1].tier
}

// Formule value volontaire, ne pas modifier : (note/100) × cote.
export function calculateValue(note, cote) {
  if (typeof cote !== 'number' || !Number.isFinite(cote) || cote <= 0) return null
  return Math.round((note / 100) * cote * 100) / 100
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyHorse(numero) {
  return {
    id: generateId(),
    numero,
    nom: '',
    criteria: Object.fromEntries(CRITERIA.map((c) => [c.id, 0])),
    cote: null,
  }
}
