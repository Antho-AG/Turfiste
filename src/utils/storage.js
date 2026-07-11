// Persistance simple via localStorage. Pas de backend, pas de dépendance
// externe — cohérent avec un MVP 100% saisie manuelle.
//
// Deux clés distinctes :
// - CURRENT_KEY : la course en cours d'analyse (auto-save à chaque frappe,
//   pour ne rien perdre si tu fermes l'onglet par erreur)
// - HISTORY_KEY : la liste des "papiers" que tu as explicitement sauvegardés

const CURRENT_KEY = 'trot-score:current-race';
const HISTORY_KEY = 'trot-score:race-history';

export function saveCurrentRace(race) {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(race));
  } catch (err) {
    console.error('Impossible de sauvegarder la course en cours :', err);
  }
}

export function loadCurrentRace() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Impossible de charger la course en cours :', err);
    return null;
  }
}

export function getRaceHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Impossible de charger l'historique :", err);
    return [];
  }
}

/**
 * Ajoute (ou met à jour si même id) une course à l'historique permanent.
 * Distinct de l'auto-save : c'est une action volontaire de l'utilisateur
 * ("Archiver ce papier"), pour garder une trace propre des analyses faites.
 */
export function archiveRace(race) {
  const history = getRaceHistory();
  const existingIndex = history.findIndex((r) => r.id === race.id);
  const entry = { ...race, archivedAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
  } else {
    history.unshift(entry);
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Impossible d'archiver la course :", err);
  }
  return history;
}

export function deleteFromHistory(raceId) {
  const history = getRaceHistory().filter((r) => r.id !== raceId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}
