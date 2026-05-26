const ADSB_BASE = 'https://api.adsb.lol/v2';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lamin = parseFloat(url.searchParams.get('lamin') ?? '');
  const lamax = parseFloat(url.searchParams.get('lamax') ?? '');
  const lomin = parseFloat(url.searchParams.get('lomin') ?? '');
  const lomax = parseFloat(url.searchParams.get('lomax') ?? '');

  if ([lamin, lamax, lomin, lomax].some((n) => Number.isNaN(n))) {
    return Response.json({ error: 'missing or invalid bbox params' }, { status: 400 });
  }

  const centerLat = (lamin + lamax) / 2;
  const centerLon = (lomin + lomax) / 2;
  const requestedNm = Math.ceil(bboxRadiusNm(lamin, lamax, lomin, lomax));
  const radiusNm = Math.max(5, Math.min(250, requestedNm));
  const capped = requestedNm > 250;

  const upstream = `${ADSB_BASE}/point/${centerLat}/${centerLon}/${radiusNm}`;
  const res = await fetch(upstream, {
    headers: { 'User-Agent': 'flappy-dev/0.1' },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[adsb proxy]', res.status, body.slice(0, 500));
    return Response.json(
      { error: `adsb ${res.status}`, upstream: body.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = await res.json();
  return Response.json(
    { ...data, queriedRadiusNm: radiusNm, capped },
    {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    },
  );
}

function bboxRadiusNm(lamin: number, lamax: number, lomin: number, lomax: number) {
  const latKm = (lamax - lamin) * 111;
  const meanLat = ((lamin + lamax) / 2) * (Math.PI / 180);
  const lonKm = (lomax - lomin) * 111 * Math.cos(meanLat);
  const halfDiagKm = Math.sqrt(latKm * latKm + lonKm * lonKm) / 2;
  return halfDiagKm * 0.539957;
}
