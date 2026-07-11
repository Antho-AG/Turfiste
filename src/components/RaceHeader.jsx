import { useState } from 'react'

export default function RaceHeader({ race, onFieldChange, onNewRace, onArchive, archives, onLoadArchive }) {
  const [archiveOpen, setArchiveOpen] = useState(false)

  return (
    <header className="race-header">
      <div className="race-header__fields">
        <input
          className="race-header__input race-header__input--name"
          type="text"
          placeholder="Nom de la course"
          value={race.courseName}
          onChange={(e) => onFieldChange('courseName', e.target.value)}
        />
        <input
          className="race-header__input"
          type="text"
          placeholder="Hippodrome"
          value={race.hippodrome}
          onChange={(e) => onFieldChange('hippodrome', e.target.value)}
        />
        <input
          className="race-header__input"
          type="date"
          value={race.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
        />
      </div>

      <div className="race-header__actions">
        <div className="race-header__archive-wrap">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setArchiveOpen((v) => !v)}
          >
            Archives ({archives.length})
          </button>
          {archiveOpen && (
            <div className="race-header__archive-list">
              {archives.length === 0 && (
                <p className="race-header__archive-empty">Aucun papier archivé.</p>
              )}
              {archives.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="race-header__archive-item"
                  onClick={() => {
                    onLoadArchive(a.id)
                    setArchiveOpen(false)
                  }}
                >
                  <span>{a.courseName || 'Course sans nom'}</span>
                  <span className="race-header__archive-meta">
                    {a.hippodrome} — {a.date}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={onArchive}>
          Archiver
        </button>
        <button type="button" className="btn btn--danger" onClick={onNewRace}>
          Nouvelle course
        </button>
      </div>
    </header>
  )
}
