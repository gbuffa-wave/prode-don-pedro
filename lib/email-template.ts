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

export function buildReminderEmail(userName: string, pendingMatches: PendingMatch[]): string {
  const safeUserName = escapeHtml(userName);
  const matchCount = pendingMatches.length;

  const matchRows = pendingMatches.map(m => {
    const homeTeam = escapeHtml(m.homeTeam);
    const awayTeam = escapeHtml(m.awayTeam);
    const homeCode = escapeHtml(m.homeCode);
    const awayCode = escapeHtml(m.awayCode);
    const matchDate = escapeHtml(m.matchDate);
    const group = escapeHtml(m.group);

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A1A;border-radius:8px;margin-bottom:8px;">
      <tr>
        <td style="padding:8px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td colspan="3" style="padding-bottom:6px;color:#666666;font-size:10px;text-transform:uppercase;letter-spacing:1px;">
                Grupo ${group} &mdash; ${matchDate}
              </td>
            </tr>
            <tr>
              <td width="40%" align="right" style="padding-right:6px;">
                <span style="color:#F5F5F5;font-size:13px;font-weight:600;">${homeTeam}</span>
                &nbsp;<img src="${flagUrl(m.homeCode)}" alt="${homeCode}" width="22" height="14" style="vertical-align:middle;border-radius:2px;" />
              </td>
              <td width="20%" align="center">
                <span style="color:#666666;font-size:11px;font-weight:700;">vs</span>
              </td>
              <td width="40%" align="left" style="padding-left:6px;">
                <img src="${flagUrl(m.awayCode)}" alt="${awayCode}" width="22" height="14" style="vertical-align:middle;border-radius:2px;" />&nbsp;
                <span style="color:#F5F5F5;font-size:13px;font-weight:600;">${awayTeam}</span>
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
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0A1020;padding:28px 24px;border-bottom:2px solid #0c5cac;">
              <img src="https://prode-mundial-eight.vercel.app/logo-wave.png" alt="Wave Brands" width="80" height="22" style="height:18px;width:auto;display:block;margin:0 auto 14px;" />
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                <tr>
                  <td style="font-size:26px;font-weight:900;color:#F5F5F5;letter-spacing:-1px;">Prode</td>
                  <td style="font-size:26px;font-weight:900;color:#0c5cac;letter-spacing:-1px;padding-left:8px;">2026</td>
                </tr>
              </table>
              <img src="https://prode-mundial-eight.vercel.app/copa-mundial.png" alt="Copa del Mundo" width="40" height="77" style="height:60px;width:auto;display:block;margin:0 auto 8px;" />
              <p style="color:#A0A0A0;font-size:11px;margin:0;text-transform:uppercase;letter-spacing:2px;">Mundial FIFA 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#0A0A0A;padding:24px 20px;">
              <p style="color:#F5F5F5;font-size:18px;font-weight:700;margin:0 0 4px;">¡Hola ${safeUserName}!</p>
              <p style="color:#A0A0A0;font-size:14px;margin:0 0 24px;line-height:1.5;">
                Tenés <span style="color:#0c5cac;font-weight:700;">${matchCount} partido${matchCount !== 1 ? "s" : ""}</span> sin pronosticar. ¡No te quedes afuera!
              </p>

              <!-- Match cards -->
              ${matchRows}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="https://prode.wavebrands.com/fixture" style="display:inline-block;background-color:#0c5cac;color:#FFFFFF;font-weight:700;font-size:14px;padding:14px 40px;border-radius:8px;text-decoration:none;">
                      ⚽ Cargar pronósticos
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#666666;font-size:11px;text-align:center;margin:16px 0 0;">
                Si ya cargaste todos, ignorá este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0A0A0A;padding:20px;border-top:1px solid #222222;">
              <p style="color:#444444;font-size:10px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Prode Mundial 2026</p>
              <p style="color:#333333;font-size:10px;margin:0;">Wave Brands</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
