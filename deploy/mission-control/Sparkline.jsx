/* global React */
// Trust-trend sparkline. Green line, soft fill, optional endpoint dot.
function Sparkline({ data, width = 96, height = 30, stroke = 'var(--accent)', fill = true, dot = true, strokeWidth = 1.6 }) {
  if (!data || data.length < 2) return null;
  const lo = Math.min(...data), hi = Math.max(...data);
  const span = Math.max(hi - lo, 1);
  const pad = 3;
  const w = width - pad * 2, h = height - pad * 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - lo) / span) * h;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${height - pad} L${pad} ${height - pad} Z`;
  const last = pts[pts.length - 1];
  const gid = React.useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {dot && <circle cx={last[0]} cy={last[1]} r="2.4" fill={stroke} />}
    </svg>
  );
}

window.Sparkline = Sparkline;
