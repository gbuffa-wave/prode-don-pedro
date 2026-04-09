interface PendingMatch {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  group: string;
}

export function buildReminderEmail(userName: string, pendingMatches: PendingMatch[]): string {
  const matchList = pendingMatches.map(m =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #222;color:#F5F5F5;font-size:14px;">${m.homeTeam} vs ${m.awayTeam}</td><td style="padding:8px 12px;border-bottom:1px solid #222;color:#A0A0A0;font-size:13px;">${m.matchDate}</td><td style="padding:8px 12px;border-bottom:1px solid #222;color:#666;font-size:12px;">Grupo ${m.group}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:20px 0;border-bottom:1px solid #222;">
      <span style="font-size:20px;font-weight:800;color:#F5F5F5;">Prode</span>
      <span style="font-size:20px;font-weight:800;color:#0c5cac;margin-left:6px;">2026</span>
    </div>
    <div style="padding:24px 0;">
      <p style="color:#F5F5F5;font-size:16px;margin:0 0 8px;">¡Hola ${userName}!</p>
      <p style="color:#A0A0A0;font-size:14px;margin:0 0 20px;">Tenés <strong style="color:#0c5cac;">${pendingMatches.length} partido${pendingMatches.length !== 1 ? "s" : ""}</strong> sin pronosticar:</p>
      <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;">
        ${matchList}
      </table>
      <div style="text-align:center;padding:24px 0;">
        <a href="https://prode.wavebrands.com/fixture" style="display:inline-block;background:#0c5cac;color:#0A0A0A;font-weight:700;font-size:14px;padding:12px 32px;border-radius:6px;text-decoration:none;">Cargar pronósticos</a>
      </div>
    </div>
    <div style="text-align:center;padding:16px 0;border-top:1px solid #222;">
      <p style="color:#666;font-size:11px;margin:0;">Prode Mundial 2026 — Wave Brands</p>
    </div>
  </div>
</body>
</html>`;
}
