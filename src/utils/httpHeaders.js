// Un User-Agent auto-déclaré "bot" (ex: TrotScoreApp/1.0) se fait quasi
// systématiquement bloquer par le WAF anti-scraping de LeTrot (403, vérifié
// en conditions réelles). On envoie donc l'ensemble des en-têtes qu'un vrai
// Chrome desktop enverrait, y compris les sec-ch-ua/sec-fetch-* (certains
// WAF les vérifient en plus de l'UA). Partagé entre api/analyser-course.js
// et api/programme.js pour ne pas régresser ce fix sur l'un des deux à la
// prochaine évolution.
//
// Limite connue : si le blocage est basé sur la réputation IP/ASN du
// datacenter Vercel ou sur le fingerprint TLS (JA3/JA4) plutôt que sur les
// en-têtes HTTP, aucun réglage d'en-têtes ne suffira — testé en conditions
// réelles le 2026-07-12, le 403 persiste après ce fix. Si ça se confirme,
// la suite ne peut pas être "encore un header" : il faudra soit un service
// de proxy/rendu (nouvelle dépendance, hors scope tant que non validé avec
// l'utilisateur), soit renoncer au scraping direct de cette page.
export const LETROT_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  Referer: 'https://www.letrot.com/',
}
