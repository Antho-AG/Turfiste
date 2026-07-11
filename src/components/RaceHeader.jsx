export default function RaceHeader({ race, onChange }) {
  const update = (field) => (e) => onChange({ ...race, [field]: e.target.value });

  return (
    <section className="race-header">
      <div className="race-header__field race-header__field--wide">
        <label htmlFor="hippodrome">Hippodrome</label>
        <input
          id="hippodrome"
          type="text"
          placeholder="ex : Vincennes"
          value={race.hippodrome}
          onChange={update('hippodrome')}
        />
      </div>

      <div className="race-header__field">
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={race.date} onChange={update('date')} />
      </div>

      <div className="race-header__field race-header__field--small">
        <label htmlFor="reunion">Réunion</label>
        <input
          id="reunion"
          type="text"
          placeholder="R1"
          value={race.reunion}
          onChange={update('reunion')}
        />
      </div>

      <div className="race-header__field race-header__field--small">
        <label htmlFor="course">Course</label>
        <input
          id="course"
          type="text"
          placeholder="C3"
          value={race.course}
          onChange={update('course')}
        />
      </div>

      <div className="race-header__field race-header__field--wide">
        <label htmlFor="notes">Notes</label>
        <input
          id="notes"
          type="text"
          placeholder="Terrain lourd, autostart..."
          value={race.notes}
          onChange={update('notes')}
        />
      </div>
    </section>
  );
}
