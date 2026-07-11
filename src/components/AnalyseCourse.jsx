import { useState } from 'react';

export default function AnalyseCourse({ onResult }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState(null);

  async function handleAnalyser() {
    if (!url.trim()) return;
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`/api/analyser-course?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      if (data.horses.length === 0) {
        throw new Error(
          data.warnings?.[0] || "Aucun partant trouvé, vérifie l'URL ou saisis la course à la main."
        );
      }

      onResult(data);
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <section className="analyse-course">
      <div className="analyse-course__input-row">
        <input
          type="text"
          placeholder="Colle l'URL LeTrot de la course (letrot.com/courses/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyser()}
        />
        <button
          className="btn-primary"
          onClick={handleAnalyser}
          disabled={status === 'loading' || !url.trim()}
        >
          {status === 'loading' ? 'Analyse en cours…' : 'Analyser cette course'}
        </button>
      </div>
      {status === 'error' && <p className="analyse-course__error">{error}</p>}
      <p className="analyse-course__hint">
        Récupère automatiquement les partants, la musique, le record et les gains. Le driver,
        l'entraîneur et le ferrage restent à valider — les données auto-calculées sont toujours
        modifiables dans la grille.
      </p>
    </section>
  );
}
