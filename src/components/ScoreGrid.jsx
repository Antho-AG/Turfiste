import { useMemo, useState } from 'react'
import { CRITERIA, SCORE_MIN, SCORE_MAX, SCORE_STEP } from '../data/criteria.js'
import { calculateNote, getTier, calculateValue } from '../utils/scoring.js'

function clampScore(value) {
  if (Number.isNaN(value)) return SCORE_MIN
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value))
}

export default function ScoreGrid({ horses, onChangeCriteria, onChangeField, onRemoveHorse, onAddHorse }) {
  const [sortKey, setSortKey] = useState(null) // 'note' | 'value' | null
  const [sortDir, setSortDir] = useState('desc')

  const rows = useMemo(() => {
    const enriched = horses.map((h) => {
      const note = calculateNote(h)
      return { horse: h, note, tier: getTier(note), value: calculateValue(note, h.cote) }
    })
    if (!sortKey) return enriched
    const dir = sortDir === 'asc' ? 1 : -1
    return [...enriched].sort((a, b) => {
      const av = sortKey === 'note' ? a.note : a.value ?? -Infinity
      const bv = sortKey === 'note' ? b.note : b.value ?? -Infinity
      return (av - bv) * dir
    })
  }, [horses, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('desc')
    } else {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return ''
    return sortDir === 'desc' ? ' ↓' : ' ↑'
  }

  return (
    <div className="score-grid">
      <div className="score-grid__scroll">
        <table>
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-name">Cheval</th>
              {CRITERIA.map((c) => (
                <th key={c.id} title={c.label} className="col-crit">
                  {c.short}
                </th>
              ))}
              <th className="col-cote">Cote</th>
              <th className="col-sortable" onClick={() => toggleSort('note')}>
                Note{sortIndicator('note')}
              </th>
              <th className="col-tier">Tier</th>
              <th className="col-sortable" onClick={() => toggleSort('value')}>
                Value{sortIndicator('value')}
              </th>
              <th className="col-remove" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ horse, note, tier, value }) => (
              <tr key={horse.id}>
                <td className="col-num">
                  <input
                    type="text"
                    value={horse.numero}
                    onChange={(e) => onChangeField(horse.id, 'numero', e.target.value)}
                  />
                </td>
                <td className="col-name">
                  <input
                    type="text"
                    placeholder="Nom du cheval"
                    value={horse.nom}
                    onChange={(e) => onChangeField(horse.id, 'nom', e.target.value)}
                  />
                </td>
                {CRITERIA.map((c) => (
                  <td key={c.id} className="col-crit">
                    <input
                      type="number"
                      min={SCORE_MIN}
                      max={SCORE_MAX}
                      step={SCORE_STEP}
                      value={horse.criteria[c.id]}
                      onChange={(e) =>
                        onChangeCriteria(horse.id, c.id, clampScore(parseFloat(e.target.value)))
                      }
                    />
                  </td>
                ))}
                <td className="col-cote">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="—"
                    value={horse.cote ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      onChangeField(horse.id, 'cote', raw === '' ? null : parseFloat(raw))
                    }}
                  />
                </td>
                <td className="col-note">{note.toFixed(1)}</td>
                <td className="col-tier">
                  <span className={`tier-badge tier-badge--${tier}`}>{tier}</span>
                </td>
                <td className="col-value">{value === null ? '—' : value.toFixed(2)}</td>
                <td className="col-remove">
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Supprimer ce partant"
                    onClick={() => onRemoveHorse(horse.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn--primary score-grid__add" onClick={onAddHorse}>
        + Ajouter un partant
      </button>
    </div>
  )
}
