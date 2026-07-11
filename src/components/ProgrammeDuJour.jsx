import { useEffect, useState } from 'react';

function localISODate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function ProgrammeDuJour({ onResult }) {
  const [date, setDate] = useState(localISODate(0));
  const [meetings, setMeetings] = useState([]);
  const [loadingProgramme, setLoadingProgramme] = useState(false);
  const [programmeError, setProgrammeError] = useState(null);
  const [analysingUrl, setAnalysingUrl] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    loadProgramme(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function loadProgramme(d) {
    setLoadingProgramme(true);
    setProgrammeError(null);
    setMeetings([]);

    try {
      const res = await fetch(`/api/programme?date=${d}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      if (data.warning) setProgrammeError(data.warning);
      setMeetings(data.meetings || []);
    } catch (err) {
      setProgrammeError(err.message);
    } finally {
      setLoadingProgramme(false);
    }
  }

  async function handleAnalyser(courseUrl) {
    setAnalysingUrl(courseUrl);
    setAnalysisError(null);

    try {
      const res = await fetch(`/api/analyser-course?url=${encodeURIComponent(courseUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      if (data.horses.length === 0) {
        throw new Error(data.warnings?.[0] || 'Aucun partant trouvé pour cette course.');
      }
      onResult(data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalysingUrl(null);
    }
  }

  return (
    <section className="programme">
      <div className="programme__toolbar">
        <div className="programme__date-controls">
          <button className="btn-secondary" onClick={() => setDate(localISODate(0))}>
            Aujourd'hui
          </button>
          <button className="btn-secondary" onClick={() => setDate(localISODate(1))}>
            Demain
          </button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {loadingProgramme && <p className="programme__hint">Chargement du programme…</p>}
      {programmeError && <p className="programme__warning">{programmeError}</p>}
      {analysisError && <p className="analyse-course__error">{analysisError}</p>}

      {!loadingProgramme && meetings.length > 0 && (
        <div className="programme__meetings">
          {meetings.map((meeting) => (
            <div key={meeting.hippodromeCode} className="programme__meeting">
              <h3>{meeting.label}</h3>
              <div className="programme__courses">
                {meeting.courses.map((course) => (
                  <button
                    key={course.numero}
                    className="btn-course"
                    onClick={() => handleAnalyser(course.url)}
                    disabled={analysingUrl !== null}
                  >
                    {analysingUrl === course.url ? '…' : course.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
