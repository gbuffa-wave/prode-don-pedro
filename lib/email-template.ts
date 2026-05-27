import { brand } from "@/lib/brand";

interface PendingMatch {
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  matchDate: string;
  group: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function flagUrl(code: string): string {
  const codeMap: Record<string, string> = {
    USA: "us", ARG: "ar", BRA: "br", MEX: "mx", CAN: "ca",
    MAR: "ma", NED: "nl", PER: "pe", UKR: "ua", AUS: "au",
    ECU: "ec", JPN: "jp", COL: "co", KOR: "kr", PAR: "py",
    ENG: "gb-eng", SEN: "sn", SRB: "rs", CHI: "cl", GER: "de",
    URU: "uy", TUR: "tr", CMR: "cm", FRA: "fr", IRN: "ir",
    CRC: "cr", NGA: "ng", ESP: "es", KSA: "sa", GHA: "gh",
    NZL: "nz", POR: "pt", DEN: "dk", PAN: "pa", SVN: "si",
    ITA: "it", BEL: "be", SUI: "ch", BOL: "bo", CRO: "hr",
    VEN: "ve", EGY: "eg", BHR: "bh", POL: "pl", CIV: "ci",
    WAL: "gb-wls", TRI: "tt", HON: "hn", RSA: "za", CZE: "cz",
    BIH: "ba", QAT: "qa", HAI: "ht", SCO: "gb-sct", CUW: "cw",
    SWE: "se", TUN: "tn", CPV: "cv", IRQ: "iq", NOR: "no",
    ALG: "dz", AUT: "at", JOR: "jo", COD: "cd", UZB: "uz",
  };
  const cc = codeMap[code] || code.toLowerCase();
  return `https://flagcdn.com/w40/${cc}.png`;
}

// Colors — alineados con globals.css de Don Pedro
const C = {
  bg:        "#0D1510",
  surface:   "#101E19",
  surfaceRaised: "#182C22",
  border:    "#1E3428",
  red:       "#FF4122",   // --color-teal (Don Pedro primary)
  gold:      "#DAFF3E",   // --color-gold
  textPrimary:   "#F9F9F9",
  textSecondary: "#A8B8B0",
  textMuted:     "#50605B",
};

// URL pública donde vive el logo (Vercel alias estable)
const LOGO_URL = "https://prode-don-pedro.vercel.app/logo-don-pedro.png";
const APP_URL  = brand.domain;

export function buildReminderEmail(userName: string, pendingMatches: PendingMatch[]): string {
  const safeUserName = escapeHtml(userName);
  const matchCount = pendingMatches.length;

  const matchRows = pendingMatches.map(m => {
    const homeTeam  = escapeHtml(m.homeTeam);
    const awayTeam  = escapeHtml(m.awayTeam);
    const homeCode  = escapeHtml(m.homeCode);
    const awayCode  = escapeHtml(m.awayCode);
    const matchDate = escapeHtml(m.matchDate);
    const group     = escapeHtml(m.group);

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.surfaceRaised};border-radius:8px;margin-bottom:8px;border:1px solid ${C.border};">
      <tr>
        <td style="padding:10px 14px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td colspan="3" style="padding-bottom:6px;color:${C.textMuted};font-size:10px;text-transform:uppercase;letter-spacing:1px;">
                Grupo ${group} &mdash; ${matchDate}
              </td>
            </tr>
            <tr>
              <td width="40%" align="right" style="padding-right:8px;">
                <span style="color:${C.textPrimary};font-size:13px;font-weight:600;">${homeTeam}</span>
                &nbsp;<img src="${flagUrl(m.homeCode)}" alt="${homeCode}" width="22" height="14" style="vertical-align:middle;border-radius:2px;" />
              </td>
              <td width="20%" align="center">
                <span style="color:${C.textMuted};font-size:11px;font-weight:700;">vs</span>
              </td>
              <td width="40%" align="left" style="padding-left:8px;">
                <img src="${flagUrl(m.awayCode)}" alt="${awayCode}" width="22" height="14" style="vertical-align:middle;border-radius:2px;" />&nbsp;
                <span style="color:${C.textPrimary};font-size:13px;font-weight:600;">${awayTeam}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:${C.bg};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${C.surface};padding:28px 24px 24px;border-radius:12px 12px 0 0;border-bottom:2px solid ${C.red};">
              <img src="${LOGO_URL}" alt="${brand.clientName}" width="140" height="40" style="height:32px;width:auto;display:block;margin:0 auto 16px;" />
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="font-size:24px;font-weight:900;color:${C.textPrimary};letter-spacing:-1px;">Prode</td>
                  <td style="font-size:24px;font-weight:900;color:${C.red};letter-spacing:-1px;padding-left:8px;">2026</td>
                </tr>
              </table>
              <p style="color:${C.textMuted};font-size:11px;margin:0;text-transform:uppercase;letter-spacing:2px;">Mundial FIFA 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${C.bg};padding:24px 20px;">
              <p style="color:${C.textPrimary};font-size:18px;font-weight:700;margin:0 0 6px;">¡Hola ${safeUserName}!</p>
              <p style="color:${C.textSecondary};font-size:14px;margin:0 0 24px;line-height:1.6;">
                Tenés <span style="color:${C.red};font-weight:700;">${matchCount} partido${matchCount !== 1 ? "s" : ""}</span> sin pronosticar. ¡No te quedes afuera del Prode!
              </p>

              <!-- Match cards -->
              ${matchRows}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/fixture" style="display:inline-block;background-color:${C.red};color:#FFFFFF;font-weight:700;font-size:14px;padding:14px 44px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                      ⚽ Cargar pronósticos
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:${C.textMuted};font-size:11px;text-align:center;margin:20px 0 0;">
                Si ya cargaste todos tus pronósticos, ignorá este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:${C.surface};padding:20px;border-radius:0 0 12px 12px;border-top:1px solid ${C.border};">
              <p style="color:${C.textMuted};font-size:10px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Prode Mundial 2026</p>
              <p style="color:${C.textMuted};font-size:10px;margin:0;">${brand.clientName}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
