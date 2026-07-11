const CURRENT_KEY = 'trotscore.current'
const ARCHIVES_KEY = 'trotscore.archives'

function safeParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function loadCurrentRace() {
  return safeParse(localStorage.getItem(CURRENT_KEY), null)
}

export function saveCurrentRace(race) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(race))
}

export function clearCurrentRace() {
  localStorage.removeItem(CURRENT_KEY)
}

export function loadArchives() {
  return safeParse(localStorage.getItem(ARCHIVES_KEY), [])
}

function saveArchives(archives) {
  localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives))
}

// Archive la course en cours (copie horodatée) puis vide la course en cours.
export function archiveCurrentRace(race) {
  const archives = loadArchives()
  const archived = { ...race, archivedAt: new Date().toISOString() }
  saveArchives([archived, ...archives])
  clearCurrentRace()
  return archived
}

export function loadArchive(id) {
  return loadArchives().find((a) => a.id === id) ?? null
}
