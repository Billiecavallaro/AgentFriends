/* global React */
// ============================================================
// Agent Mission Control — data model, icons, status metadata
// ============================================================

// ---- Icons (thin-stroke line set; Lucide-style substitute) ----
const ICONS = {
  play:   '<path fill="currentColor" stroke="none" d="M8 5.5v13l11-6.5-11-6.5z"/>',
  pause:  '<rect fill="currentColor" stroke="none" x="7" y="5" width="3.4" height="14" rx="1"/><rect fill="currentColor" stroke="none" x="13.6" y="5" width="3.4" height="14" rx="1"/>',
  rollback: '<path d="M3 8V3M3 8h5"/><path d="M4 8a9 9 0 1 1-1.6 5"/>',
  takeover: '<path d="M5 3l14 8-6 1.5L9.5 19 5 3z"/>',
  check:  '<path d="M20 6 9 17l-5-5"/>',
  x:      '<path d="M18 6 6 18M6 6l12 12"/>',
  edit:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  message:'<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  flask:  '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M6.5 15h11"/>',
  file:   '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  box:    '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  activity:'<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
  chevron:'<path d="M9 6l6 6-6 6"/>',
  dot:    '<circle fill="currentColor" stroke="none" cx="12" cy="12" r="4"/>',
  pulse:  '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  layers: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M2 16l10 5 10-5M2 12l10 5 10-5"/>',
  columns:'<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="10" rx="1.5"/>',
  hand:   '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V6a1.5 1.5 0 0 1 3 0v9a5 5 0 0 1-5 5h-1a5 5 0 0 1-4-2l-3-4a1.6 1.6 0 0 1 2.4-2L8 13"/>',
  grid:   '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  note:   '<path d="M4 4h16v11l-5 5H4z"/><path d="M20 15h-5v5"/>',
  image:  '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><path d="M21 15l-5-4-8 7"/>',
  link:   '<path d="M9.5 14.5l5-5"/><path d="M11 7l1-1a4 4 0 0 1 6 6l-2 2"/><path d="M13 17l-1 1a4 4 0 0 1-6-6l2-2"/>',
  trash:  '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  grip:   '<circle fill="currentColor" stroke="none" cx="9" cy="6" r="1.4"/><circle fill="currentColor" stroke="none" cx="15" cy="6" r="1.4"/><circle fill="currentColor" stroke="none" cx="9" cy="12" r="1.4"/><circle fill="currentColor" stroke="none" cx="15" cy="12" r="1.4"/><circle fill="currentColor" stroke="none" cx="9" cy="18" r="1.4"/><circle fill="currentColor" stroke="none" cx="15" cy="18" r="1.4"/>',
  external:'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};

function Icon({ name, size = 16, style, ...rest }) {
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', flex: 'none', ...style },
    dangerouslySetInnerHTML: { __html: ICONS[name] || '' },
    ...rest,
  });
}

// ---- Status metadata ----
const STATUS = {
  running:      { label: 'Running',      fg: 'var(--accent-strong)', bg: 'var(--accent-soft)',   dot: 'var(--accent)' },
  needs_review: { label: 'Needs review', fg: '#9a6b1c',              bg: '#f4ecd8',              dot: '#c68a2e' },
  blocked:      { label: 'Blocked',      fg: '#a4483b',              bg: '#f3ddd8',              dot: '#c05a48' },
  paused:       { label: 'Paused',       fg: 'var(--text-muted)',    bg: 'var(--surface-subtle)',dot: 'var(--gray-400)' },
  manual:       { label: 'Manual',       fg: 'var(--purple-500)',    bg: 'var(--purple-100)',    dot: 'var(--purple-500)' },
  done:         { label: 'Done',         fg: 'var(--text-muted)',    bg: 'var(--surface-subtle)',dot: 'var(--gray-400)' },
};
const COLUMNS = ['running', 'needs_review', 'blocked', 'done'];

const KIND = {
  research:   { label: 'Research',      icon: 'search' },
  deep:       { label: 'Deep research', icon: 'activity' },
  prototype:  { label: 'Prototype',     icon: 'box' },
  test:       { label: 'Testing',       icon: 'flask' },
  docs:       { label: 'Docs',          icon: 'file' },
};

// ---- Source / host platform the agent runs on ----
const SOURCE = {
  claude:   { label: 'Claude',   mono: 'CL', tint: '#C96442' },
  codex:    { label: 'Codex',    mono: 'CX', tint: '#10a37f' },
  cursor:   { label: 'Cursor',   mono: 'CU', tint: '#1a1a1a' },
  openclaw: { label: 'OpenClaw', mono: 'OC', tint: '#6b4bd6' },
  gemini:   { label: 'Gemini',   mono: 'GE', tint: '#3b6fd4' },
};

// ---- helpers ----
let _sid = 0;
const sid = () => `s${++_sid}`;
const trend = (arr) => arr.length < 2 ? 0 : arr[arr.length - 1] - arr[arr.length - 2];
const clamp = (n, lo = 4, hi = 99) => Math.max(lo, Math.min(hi, n));
function synthTrust(start, n, drift) {
  const out = [start];
  for (let i = 1; i < n; i++) out.push(clamp(Math.round(out[i - 1] + drift + (Math.random() * 8 - 4))));
  return out;
}

// ---- Initial agents ----
const INITIAL = [
  {
    id: 'a1', kind: 'deep', title: 'Competitor pricing landscape', repo: 'market-intel',
    source: 'claude', model: 'Sonnet 4.6', status: 'running', elapsed: '14m',
    trust: synthTrust(48, 14, 2.4),
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Scope 8 competitors + pricing pages' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Extract tiers, limits, add-ons' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Normalize into comparison matrix' },
      { id: sid(), kind: 'action', state: 'active',  label: 'Cross-check 3 sources per data point' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Draft positioning summary' },
    ],
  },
  {
    id: 'a2', kind: 'prototype', title: 'Onboarding flow v2', repo: 'web-app',
    source: 'codex', model: 'Opus 4.6', status: 'needs_review', elapsed: '31m',
    trust: synthTrust(72, 14, -0.6),
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Read existing onboarding screens' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Draft 3-step welcome flow' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Wire routing + progress state' },
      { id: sid(), kind: 'proposed', state: 'proposed', label: 'Delete legacy OnboardingModal.tsx (−240 lines)', risk: 'Touches 6 imports across the app' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Add analytics events' },
    ],
  },
  {
    id: 'a3', kind: 'docs', title: 'Write ARCHITECTURE.md', repo: 'core',
    source: 'cursor', model: 'Sonnet 4.6', status: 'running', elapsed: '6m',
    trust: synthTrust(63, 14, 1.6),
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Map module boundaries from imports' },
      { id: sid(), kind: 'action', state: 'active',  label: 'Draft data-flow section' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Diagram request lifecycle' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Document deploy topology' },
    ],
  },
  {
    id: 'a4', kind: 'test', title: 'Auth module test suite', repo: 'core',
    source: 'openclaw', model: 'Haiku 4.6', status: 'blocked', elapsed: '22m',
    trust: synthTrust(58, 14, -3.2),
    blockedReason: 'Token refresh mock returns 401 — needs a real test credential.',
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Generate cases for login + refresh' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Add happy-path assertions' },
      { id: sid(), kind: 'action', state: 'blocked', label: 'Run suite in CI sandbox' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Cover expiry + revocation' },
    ],
  },
  {
    id: 'a5', kind: 'deep', title: 'RAG evaluation methods', repo: 'research',
    source: 'gemini', model: 'Opus 4.6', status: 'running', elapsed: '48m',
    trust: synthTrust(70, 14, 2.2),
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Survey 12 eval papers' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Cluster by metric family' },
      { id: sid(), kind: 'action', state: 'done',   label: 'Reproduce 2 benchmarks locally' },
      { id: sid(), kind: 'action', state: 'active',  label: 'Write comparison + recommendation' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Attach reproducible notebook' },
    ],
  },
  {
    id: 'a6', kind: 'prototype', title: 'Pricing page redesign', repo: 'web-app',
    source: 'claude', model: 'Sonnet 4.6', status: 'paused', elapsed: '9m',
    trust: synthTrust(55, 14, 0.4),
    steps: [
      { id: sid(), kind: 'action', state: 'done',   label: 'Pull brand tokens + components' },
      { id: sid(), kind: 'action', state: 'active',  label: 'Lay out 3-tier comparison' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Add annual/monthly toggle' },
      { id: sid(), kind: 'action', state: 'pending', label: 'Responsive pass' },
    ],
  },
];

Object.assign(window, { Icon, STATUS, COLUMNS, KIND, SOURCE, INITIAL, sid, trend, clamp });
