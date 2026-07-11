import { useEffect, useState } from 'react';
import RaceHeader from './components/RaceHeader';
import ScoreGrid from './components/ScoreGrid';
import AnalyseCourse from './components/AnalyseCourse';
import { createEmptyHorse } from './utils/scoring';
import {
  archiveRace,
  deleteFromHistory,
  getRaceHistory,
  loadCurrentRace,
  saveCurrentRace,
} from './utils/storage';
import './App.css';

function createEmptyRace() {
  return {
    id: crypto.randomUUID(),
    hippodrome: '',
    date: new Date().toISOString().slice(0, 10),
    reunion: '',
    course: '',
    notes: '',
    horses: [createEmptyHorse('1'), createEmptyHorse('2')],
  };
}

export default function App() {
  const [race, setRace] = useState(() => loadCurrentRace() ?? createEmptyRace());
  const [sortBy, setSortBy] = useState('note');
  const [history, setHistory] = useState(() => getRaceHistory());
  const [showHistory, setShowHistory] = useState(false);

  // Auto-save à chaque changement — c'est la course "en cours", distincte
  // de l'archivage volontaire.
  useEffect(() => {
    saveCurrentRace(race);
  }, [race]);

  function updateHorse(horseId, field, value) {
    setRace((r) => ({
      ...r,
      horses: r.horses.map((h) => (h.id === horseId ? { ...h, [field]: value } : h)),
    }));
  }

  function updateCriteria(horseId, criteriaId, value) {
    const num = value === '' ? undefined : Math.min(Math.max(Number(value), 0), 20);
    setRace((r) => ({
      ...r,
      horses: r.horses.map((h) =>
        h.id === horseId
          ? { ...h, criteriaScores: { ...h.criteriaScores, [criteriaId]: num } }
          : h
      ),
    }));
  }

  function addHorse() {
    setRace((r) => ({
      ...r,
      horses: [...r.horses, createEmptyHorse(String(r.horses.length + 1))],
    }));
  }

  function removeHorse(horseId) {
    setRace((r) => ({ ...r, horses: r.horses.filter((h) => h.id !== horseId) }));
  }

  function handleAnalysisResult({ horses, raceRef, warnings }) {
    setRace((r) => ({
      ...r,
      hippodrome: raceRef?.hippodrome || r.hippodrome,
      date: raceRef?.date || r.date,
      reunion: raceRef?.reunion || r.reunion,
      course: raceRef?.course || r.course,
      notes: raceRef?.prix ? `${raceRef.prix}${r.notes ? ' — ' + r.notes : ''}` : r.notes,
      horses,
    }));
    if (warnings?.length) {
      console.warn('Avertissements analyse LeTrot :', warnings);
    }
  }

  function handleNewRace() {
    if (race.horses.some((h) => h.nom) && !confirm('Repartir sur une course vierge ? Le papier actuel non archivé sera perdu.')) {
      return;
    }
    setRace(createEmptyRace());
  }

  function handleArchive() {
    const updated = archiveRace(race);
    setHistory(updated);
  }

  function handleLoadFromHistory(entry) {
    setRace({ ...entry, id: crypto.randomUUID() }); // copie : on ne modifie pas l'archive
    setShowHistory(false);
  }

  function handleDeleteHistory(id) {
    setHistory(deleteFromHistory(id));
  }

  return (
    <div className="app">
      <header className="app__topbar">
        <div className="app__brand">
          <span className="app__brand-mark">🐴</span>
          <div>
            <h1>Trot Score</h1>
            <p>Ton papier de course, chiffré</p>
          </div>
        </div>
        <div className="app__actions">
          <button className="btn-secondary" onClick={() => setShowHistory((s) => !s)}>
            Papiers archivés ({history.length})
          </button>
          <button className="btn-secondary" onClick={handleNewRace}>
            Nouvelle course
          </button>
          <button className="btn-primary" onClick={handleArchive}>
            Archiver ce papier
          </button>
        </div>
      </header>

      {showHistory && (
        <aside className="history-panel">
          {history.length === 0 && <p className="history-panel__empty">Aucun papier archivé pour l'instant.</p>}
          {history.map((entry) => (
            <div key={entry.id} className="history-panel__item">
              <div>
                <strong>{entry.hippodrome || 'Sans nom'}</strong>{' '}
                <span className="history-panel__meta">
                  {entry.date} · {entry.reunion}{entry.course}
                </span>
              </div>
              <div className="history-panel__item-actions">
                <button className="btn-link" onClick={() => handleLoadFromHistory(entry)}>
                  Charger
                </button>
                <button className="btn-link btn-link--danger" onClick={() => handleDeleteHistory(entry.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </aside>
      )}

      <main>
        <AnalyseCourse onResult={handleAnalysisResult} />
        <RaceHeader race={race} onChange={setRace} />
        <ScoreGrid
          horses={race.horses}
          onUpdateHorse={updateHorse}
          onUpdateCriteria={updateCriteria}
          onRemoveHorse={removeHorse}
          onAddHorse={addHorse}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </main>
    </div>
  );
}
