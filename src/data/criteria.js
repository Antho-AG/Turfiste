// Critères de notation trot attelé — poids figés, somme = 1.0 (zone protégée, cf. consignes projet).
export const SCORE_MIN = 0
export const SCORE_MAX = 10
export const SCORE_STEP = 0.5

export const CRITERIA = [
  { id: 'forme', label: 'Forme récente', short: 'Forme', weight: 0.20 },
  { id: 'regularite', label: 'Régularité (musique)', short: 'Régul.', weight: 0.15 },
  { id: 'driver', label: 'Driver', short: 'Driver', weight: 0.15 },
  { id: 'entraineur', label: 'Entraîneur', short: 'Entr.', weight: 0.10 },
  { id: 'classe', label: 'Classe / niveau', short: 'Classe', weight: 0.15 },
  { id: 'terrain', label: 'Affinité terrain / distance', short: 'Terrain', weight: 0.15 },
  { id: 'ferrage', label: 'Ferrage / équipement', short: 'Ferrage', weight: 0.10 },
]

// Seuils de tier sur la note /100, du meilleur au moins bon.
export const TIER_THRESHOLDS = [
  { tier: 'S', min: 85 },
  { tier: 'A', min: 70 },
  { tier: 'B', min: 55 },
  { tier: 'C', min: 40 },
  { tier: 'D', min: 0 },
]
