// LeTrot affiche les noms "B. LE BELLER" (initiale + nom, parfois nom complet
// type "GUILLAUME MARTIN"). open-pmu-api renvoie "LE BELLER B." (nom + initiale).
// Pour croiser les deux sources, on normalise vers une clé commune : "NOM|INITIALE".
//
// Limite connue : les noms composés sans point ("GUILLAUME MARTIN") sont traités
// en supposant "premier mot = prénom, reste = nom" — un heuristique correct dans
// la majorité des cas observés, mais qui peut se tromper sur certains noms rares.

export function normalizeName(rawName) {
  if (!rawName) return null;
  const cleaned = rawName.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!cleaned) return null;

  const tokens = cleaned.split(' ');

  // Cas "B. LE BELLER" ou "RAFFIN E." — un token se termine par un point
  const initialIndex = tokens.findIndex((t) => /^[A-ZÀ-Ü]\.$/.test(t));

  if (initialIndex !== -1) {
    const initial = tokens[initialIndex][0];
    const lastName = tokens.filter((_, i) => i !== initialIndex).join(' ');
    return `${lastName}|${initial}`;
  }

  // Cas "GUILLAUME MARTIN" (pas de point) — on suppose prénom puis nom
  if (tokens.length >= 2) {
    const initial = tokens[0][0];
    const lastName = tokens.slice(1).join(' ');
    return `${lastName}|${initial}`;
  }

  // Un seul mot, rien à normaliser de plus
  return tokens[0];
}
