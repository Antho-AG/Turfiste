import * as cheerio from 'cheerio';
import { LETROT_FETCH_HEADERS } from '../src/utils/httpHeaders.js';

// On identifie les courses via les vrais liens <a href="/courses/date/code/num">
// plutôt que de parser le texte affiché — plus robuste, parce que ces liens
// contiennent directement les identifiants dont on a besoin (code hippodrome,
// numéro de course) sans avoir à les deviner depuis du texte mis en forme.
const COURSE_LINK_RE = /\/courses\/(\d{4}-\d{2}-\d{2})\/(\d+)\/(\d+)(?:[/?#]|$)/;
const MEETING_LINK_RE = /\/courses\/(\d{4}-\d{2}-\d{2})\/(\d+)(?:[/?#]|$)/;

export default async function handler(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Date invalide, format attendu AAAA-MM-JJ.' });
    return;
  }

  const targetUrl = `https://www.letrot.com/courses/${date}`;

  let html;
  try {
    const pageRes = await fetch(targetUrl, { headers: LETROT_FETCH_HEADERS });
    if (!pageRes.ok) {
      res.status(502).json({ error: `LeTrot a répondu ${pageRes.status}` });
      return;
    }
    html = await pageRes.text();
  } catch (err) {
    res.status(502).json({ error: `Impossible de contacter LeTrot : ${err.message}` });
    return;
  }

  const $ = cheerio.load(html);

  // Étape 1 : noms de réunion, portés par les liens "vers la réunion"
  // (mêmes liens que les courses mais sans numéro de course à la fin).
  const meetingNames = {};
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (COURSE_LINK_RE.test(href)) return; // c'est un lien de course, pas de réunion
    const m = href.match(MEETING_LINK_RE);
    if (!m) return;
    const [, linkDate, code] = m;
    if (linkDate !== date) return;
    const text = $(el).text().trim();
    if (text && !meetingNames[code]) meetingNames[code] = text;
  });

  // Étape 2 : les courses elles-mêmes, groupées par hippodrome
  const byMeeting = {};
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(COURSE_LINK_RE);
    if (!m) return;
    const [, linkDate, code, numero] = m;
    if (linkDate !== date) return;

    if (!byMeeting[code]) {
      byMeeting[code] = {
        hippodromeCode: code,
        label: meetingNames[code] || `Hippodrome ${code}`,
        courses: [],
      };
    }
    if (byMeeting[code].courses.some((c) => c.numero === numero)) return; // dédoublonnage

    byMeeting[code].courses.push({
      numero,
      label: $(el).text().trim() || `C${numero}`,
      url: `https://www.letrot.com${href.split(/[?#]/)[0]}`,
    });
  });

  const meetings = Object.values(byMeeting).map((m) => ({
    ...m,
    courses: m.courses.sort((a, b) => Number(a.numero) - Number(b.numero)),
  }));

  if (meetings.length === 0) {
    res.status(200).json({
      date,
      meetings: [],
      warning: "Aucune réunion trouvée pour cette date — programme pas encore publié, ou structure de page changée.",
    });
    return;
  }

  res.status(200).json({ date, meetings });
}
