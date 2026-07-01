/* global React, Icon, STATUS, COLUMNS, KIND, SOURCE, Sparkline, trend */
// Kanban board — agents grouped into columns by status.

function SourceBadge({ source, showLabel = true }) {
  const s = SOURCE[source];
  if (!s) return null;
  return (
    <span title={`Working on ${s.label}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flex: 'none' }}>
      <span style={{ width: 16, height: 16, borderRadius: 4.5, background: s.tint, color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-.03em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.mono}</span>
      {showLabel && <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>}
    </span>
  );
}

function TrustPill({ agent }) {
  const cur = agent.trust[agent.trust.length - 1];
  const d = trend(agent.trust);
  const up = d >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Sparkline data={agent.trust} width={72} height={26} />
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{cur}</div>
        <div style={{ fontSize: 10.5, color: up ? 'var(--accent-strong)' : '#a4483b', display: 'flex', alignItems: 'center', gap: 2 }}>
          {up ? '▲' : '▼'} {Math.abs(d)} trust
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const s = STATUS[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 500, color: s.fg, background: s.bg, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{s.label}
    </span>
  );
}

function currentStep(agent) {
  return agent.steps.find((x) => x.state === 'active' || x.state === 'proposed' || x.state === 'blocked')
    || agent.steps.filter((x) => x.state === 'done').slice(-1)[0]
    || agent.steps[0];
}

function AgentCard({ agent, onOpen, onToggle, compact }) {
  const k = KIND[agent.kind];
  const step = currentStep(agent);
  const running = agent.status === 'running';
  const proposed = agent.steps.find((s) => s.state === 'proposed');
  return (
    <div
      onClick={() => onOpen(agent.id)}
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', padding: 16,
        cursor: 'pointer', transition: 'box-shadow 140ms ease, border-color 140ms ease',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Icon name={k.icon} size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, marginTop: 2 }}>
              <SourceBadge source={agent.source} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {k.label} · {agent.repo}</span>
            </div>
          </div>
        </div>
        <StatusChip status={agent.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: running ? 'var(--accent)' : 'var(--gray-300)', flex: 'none', boxShadow: running ? '0 0 0 3px var(--accent-soft)' : 'none' }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step ? step.label : '—'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TrustPill agent={agent} />
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          {proposed && (
            <span title="Awaiting your approval" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9a6b1c', background: '#f4ecd8', padding: '4px 8px', borderRadius: 999 }}>
              <Icon name="message" size={12} /> review
            </span>
          )}
          {(agent.status === 'running' || agent.status === 'paused') && (
            <button
              onClick={() => onToggle(agent.id)}
              title={running ? 'Pause' : 'Resume'}
              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Icon name={running ? 'pause' : 'play'} size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanView({ agents, onOpen, onToggle }) {
  const titles = { running: 'Running', needs_review: 'Needs review', blocked: 'Blocked', done: 'Done' };
  return (
    <div className="mc-track" style={{ overflowX: 'auto', margin: '0 -4px', padding: '0 4px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(200px, 1fr))`, gap: 16, alignItems: 'start', padding: '4px 4px 40px', minWidth: 848 }}>
      {COLUMNS.map((col) => {
        const items = agents.filter((a) => (col === 'running' ? (a.status === 'running' || a.status === 'paused' || a.status === 'manual') : a.status === col));
        return (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS[col].dot }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{titles[col]}</span>
              <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{items.length}</span>
            </div>
            {items.map((a) => <AgentCard key={a.id} agent={a} onOpen={onOpen} onToggle={onToggle} />)}
            {items.length === 0 && (
              <div style={{ border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '18px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>None</div>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
}

Object.assign(window, { KanbanView, AgentCard, StatusChip, TrustPill, SourceBadge, currentStep });
