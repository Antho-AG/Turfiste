// Les 7 critères de notation pour le trot attelé.
// Chaque critère est noté par l'utilisateur de 0 à 20 (convention "note scolaire",
// facile à lire d'un coup d'œil sur un programme de courses).
// Les poids doivent totaliser 1.0 — c'est vérifié au chargement (voir scoring.js).
//
// Ces poids sont des valeurs de départ issues de l'heuristique classique du turf.
// Ils sont volontairement modifiables ici : la Phase 3 (backtesting) consistera
// à les recalibrer sur des courses réelles.

export const CRITERIA = [
  {
    id: 'forme',
    label: 'Forme récente',
    hint: 'Régularité et tendance des 5-8 dernières courses (musique)',
    weight: 0.25,
  },
  {
    id: 'reductionKm',
    label: 'Réduction kilométrique',
    hint: 'Temps au km comparé au peloton du jour',
    weight: 0.20,
  },
  {
    id: 'placeDepart',
    label: 'Place au départ',
    hint: "Numéro de corde / autostart",
    weight: 0.15,
  },
  {
    id: 'driver',
    label: 'Driver',
    hint: 'Taux de réussite sur cet hippodrome / ce type de course',
    weight: 0.15,
  },
  {
    id: 'entraineur',
    label: 'Entraîneur',
    hint: "Forme de l'écurie",
    weight: 0.10,
  },
  {
    id: 'ferrage',
    label: 'Ferrage',
    hint: 'Changement de ferrage = signal à surveiller',
    weight: 0.05,
  },
  {
    id: 'niveauCourse',
    label: 'Niveau de la course',
    hint: 'Le cheval monte, descend ou reste à son niveau habituel',
    weight: 0.10,
  },
];

export const NOTE_MIN = 0;
export const NOTE_MAX = 20;

// Seuils de tier basés sur le z-score (écart à la moyenne du peloton, en
// écarts-types). Contrairement à des seuils absolus sur la note /100, ça
// fait que le tier reflète la position DANS CETTE COURSE précise : un
// cheval à 50/100 peut être S si tout le reste du peloton est sous 30,
// et un cheval à 80/100 peut n'être que B dans un peloton très relevé où
// tout le monde tourne autour de 85.
export const TIER_Z_THRESHOLDS = [
  { tier: 'S', minZ: 1.2, color: '#e8c468' },
  { tier: 'A', minZ: 0.4, color: '#8fd9c4' },
  { tier: 'B', minZ: -0.4, color: '#8fb8e8' },
  { tier: 'C', minZ: -1.2, color: '#b8a4d9' },
  { tier: 'D', minZ: -Infinity, color: '#d98f9c' },
];
