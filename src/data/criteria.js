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

// Seuils de tier sur la note finale /100.
// En Phase 1 ce sont des seuils fixes (pas de percentile historique — on n'a
// pas encore de base de courses passées). À réviser en Phase 3 une fois que
// le backtesting donne une vraie distribution de référence.
export const TIER_THRESHOLDS = [
  { tier: 'S', min: 85, color: '#e8c468' },
  { tier: 'A', min: 70, color: '#8fd9c4' },
  { tier: 'B', min: 55, color: '#8fb8e8' },
  { tier: 'C', min: 40, color: '#b8a4d9' },
  { tier: 'D', min: 0, color: '#d98f9c' },
];
