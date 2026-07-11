import { useEffect, useState } from 'react'
import RaceHeader from './components/RaceHeader.jsx'
import ScoreGrid from './components/ScoreGrid.jsx'
import { createEmptyHorse } from './utils/scoring.js'
import {
  loadCurrentRace,
  saveCurrentRace,
  clearCurrentRace,
  loadArchives,
  archiveCurrentRace,
  loadArchive,
} from './utils/storage.js'

function createEmptyRace() {
  return {
    id: `race_${Date.now()}`,
    courseName: '',
    hippodrome: '',
    date: new Date().toISOString().slice(0, 10),
    horses: [createEmptyHorse(1)],
  }
}

export default function App() {
  const [race, setRace] = useState(() => loadCurrentRace() ?? createEmptyRace())
  const [archives, setArchives] = useState(() => loadArchives())

  useEffect(() => {
    saveCurrentRace(race)
  }, [race])

  function handleFieldChange(field, value) {
    setRace((r) => ({ ...r, [field]: value }))
  }

  function handleAddHorse() {
    setRace((r) => ({
      ...r,
      horses: [...r.horses, createEmptyHorse(r.horses.length + 1)],
    }))
  }

  function handleRemoveHorse(id) {
    setRace((r) => ({ ...r, horses: r.horses.filter((h) => h.id !== id) }))
  }

  function handleChangeCriteria(horseId, criterionId, value) {
    setRace((r) => ({
      ...r,
      horses: r.horses.map((h) =>
        h.id === horseId ? { ...h, criteria: { ...h.criteria, [criterionId]: value } } : h,
      ),
    }))
  }

  function handleChangeHorseField(horseId, field, value) {
    setRace((r) => ({
      ...r,
      horses: r.horses.map((h) => (h.id === horseId ? { ...h, [field]: value } : h)),
    }))
  }

  function handleNewRace() {
    if (!window.confirm('Vider le papier en cours et démarrer une nouvelle course ?')) return
    clearCurrentRace()
    setRace(createEmptyRace())
  }

  function handleArchive() {
    const archived = archiveCurrentRace(race)
    setArchives((a) => [archived, ...a])
    setRace(createEmptyRace())
  }

  function handleLoadArchive(id) {
    const archived = loadArchive(id)
    if (!archived) return
    setRace({ ...archived, id: `race_${Date.now()}` })
  }

  return (
    <div className="app">
      <RaceHeader
        race={race}
        onFieldChange={handleFieldChange}
        onNewRace={handleNewRace}
        onArchive={handleArchive}
        archives={archives}
        onLoadArchive={handleLoadArchive}
      />
      <ScoreGrid
        horses={race.horses}
        onChangeCriteria={handleChangeCriteria}
        onChangeField={handleChangeHorseField}
        onRemoveHorse={handleRemoveHorse}
        onAddHorse={handleAddHorse}
      />
    </div>
  )
}
