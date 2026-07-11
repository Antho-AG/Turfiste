// Un User-Agent auto-déclaré "bot" (ex: TrotScoreApp/1.0) se fait quasi
// systématiquement bloquer par le WAF anti-scraping de LeTrot (403, vérifié
// en conditions réelles). On envoie donc les en-têtes d'un navigateur
// desktop standard. Partagé entre api/analyser-course.js et api/programme.js
// pour ne pas régresser ce fix sur l'un des deux à la prochaine évolution.
export const LETROT_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
}
