import { useMemo } from 'react';
import { CRITERIA, NOTE_MAX } from '../data/criteria';
import { calculateNote, calculateValue, getTier } from '../utils/scoring';

export default function ScoreGrid({
  horses,
  onUpdateHorse,
  onUpdateCriteria,
  onRemoveHorse,
  onAddHorse,
  sortBy,
  onSortChange,
}) {
  // On dérive note / tier / value à l'affichage plutôt que de les stocker :
  // ça évite tout risque de désynchronisation si un critère ou une cote change.
  const rows = useMemo(() => {
    const withScores = horses.map((horse) => {
      const note = calculateNote(horse.criteriaScores);
      const tier = getTier(note);
      const value = calculateValue(note, parseFloat(horse.cote));
      return { horse, note, tier, value };
    });

    if (sortBy === 'value') {
      return [...withScores].sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
    }
    return [...withScores].sort((a, b) => b.note - a.note);
  }, [horses, sortBy]);

  const hasAnyCote = horses.some((h) => h.cote);

  return (
    <div className="score-grid-wrapper">
      <table className="score-grid">
        <thead>
          <tr>
            <th className="col-numero">N°</th>
            <th className="col-nom">Cheval</th>
            <th className="col-nom">Driver</th>
            <th className="col-nom">Entraîneur</th>
            {CRITERIA.map((c) => (
              <th key={c.id} className="col-critere" title={c.hint}>
                {c.label}
                <span className="col-critere__weight">{Math.round(c.weight * 100)}%</span>
              </th>
            ))}
            <th
              className="col-computed col-sortable"
              onClick={() => onSortChange('note')}
              aria-sort={sortBy === 'note' ? 'descending' : 'none'}
            >
              Note {sortBy === 'note' && '▾'}
            </th>
            <th className="col-tier">Tier</th>
            <th className="col-cote">Cote</th>
            <th
              className="col-computed col-sortable"
              onClick={() => onSortChange('value')}
              aria-sort={sortBy === 'value' ? 'descending' : 'none'}
            >
              Value {sortBy === 'value' && '▾'}
            </th>
            <th className="col-actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ horse, note, tier, value }) => (
            <tr key={horse.id}>
              <td className="col-numero">
                <input
                  type="text"
                  value={horse.numero}
                  onChange={(e) => onUpdateHorse(horse.id, 'numero', e.target.value)}
                  maxLength={2}
                />
              </td>
              <td className="col-nom">
                <input
                  type="text"
                  value={horse.nom}
                  onChange={(e) => onUpdateHorse(horse.id, 'nom', e.target.value)}
                  placeholder="Nom du cheval"
                />
              </td>
              <td className="col-nom">
                <input
                  type="text"
                  value={horse.driverNom}
                  onChange={(e) => onUpdateHorse(horse.id, 'driverNom', e.target.value)}
                />
              </td>
              <td className="col-nom">
                <input
                  type="text"
                  value={horse.entraineurNom}
                  onChange={(e) => onUpdateHorse(horse.id, 'entraineurNom', e.target.value)}
                />
              </td>
              {CRITERIA.map((c) => (
                <td key={c.id} className="col-critere">
                  <input
                    type="number"
                    min={0}
                    max={NOTE_MAX}
                    value={horse.criteriaScores[c.id] ?? ''}
                    onChange={(e) => onUpdateCriteria(horse.id, c.id, e.target.value)}
                  />
                </td>
              ))}
              <td className="col-computed col-note">{note}</td>
              <td className="col-tier">
                <span className="tier-badge" style={{ backgroundColor: tier.color }}>
                  {tier.tier}
                </span>
              </td>
              <td className="col-cote">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={horse.cote}
                  onChange={(e) => onUpdateHorse(horse.id, 'cote', e.target.value)}
                  placeholder="—"
                />
              </td>
              <td className="col-computed col-value">
                {value !== null ? value.toFixed(2) : '—'}
              </td>
              <td className="col-actions">
                <button
                  className="btn-icon"
                  onClick={() => onRemoveHorse(horse.id)}
                  aria-label={`Retirer ${horse.nom || 'ce partant'}`}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="score-grid__footer">
        <button className="btn-secondary" onClick={onAddHorse}>
          + Ajouter un partant
        </button>
        {!hasAnyCote && (
          <span className="score-grid__hint">
            Renseigne les cotes pour faire apparaître le classement value.
          </span>
        )}
      </div>
    </div>
  );
}
