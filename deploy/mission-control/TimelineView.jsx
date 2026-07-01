/* global React, Icon, STATUS, KIND, SOURCE, Sparkline, trend, StatusChip, SourceBadge */
// Timeline / swimlanes — one row per agent, steps flowing left → right.

function StepSeg({ step, onClick }) {
  const map = {
    done:     { bg: 'var(--surface-subtle)', bd: 'var(--border-subtle)', fg: 'var(--text-secondary)', ic: 'check' },
    active:   { bg: 'var(--accent-soft)',    bd: 'var(--accent)',        fg: 'var(--accent-strong)', ic: 'dot' },
    proposed: { bg: '#f4ecd8',               bd: '#d8b562',              fg: '#9a6b1c',              ic: 'message' },
    blocked:  { bg: '#f3ddd8',               bd: '#d79e93',              fg: '#a4483b',              ic: 'x' },
    pending:  { bg: 'transparent',           bd: 'var(--border-default)',fg: 'var(--text-faint)',    ic: null },
  };
  const m = map[step.state] || map.pending;
  const dashed = step.state === 'pending';
  return (
    <button
      onClick={onClick}
      title={step.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', maxWidth: 190,
        padding: '7px 11px', borderRadius: 999, cursor: 'pointer',
        background: m.bg, color: m.fg, font: 'inherit', fontSize: 12, fontWeight: 500,
        border: `1px ${dashed ? 'dashed' : 'solid'} ${m.bd}`,
        opacity: step.state === 'pending' ? 0.85 : 1,
      }}
    >
      {m.ic && <Icon name={m.ic} size={12} style={step.state === 'active' ? { animation: 'mcPulse 1.6s ease-in-out infinite' } : undefined} />}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.label}</span>
    </button>
  );
}

function Swimlane({ agent, onOpen, onToggle }) {
  const k = KIND[agent.kind];
  const running = agent.status === 'running';
  const cur = agent.trust[agent.trust.length - 1];
  const d = trend(agent.trust);
  const activeIdx = agent.steps.findIndex((s) => s.state === 'active' || s.state === 'proposed' || s.state === 'blocked');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr 132px', alignItems: 'center', gap: 16, padding: '14px 4px', borderTop: '1px solid var(--border-subtle)' }}>
      {/* label */}
      <div onClick={() => onOpen(agent.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', minWidth: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon name={k.icon} size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS[agent.status].dot, boxShadow: running ? '0 0 0 3px var(--accent-soft)' : 'none' }} />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{STATUS[agent.status].label}</span>
            </span>
            <SourceBadge source={agent.source} />
          </div>
        </div>
      </div>

      {/* track */}
      <div className="mc-track" style={{ position: 'relative', overflowX: 'auto', paddingBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {agent.steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <StepSeg step={s} onClick={() => onOpen(agent.id)} />
              {i < agent.steps.length - 1 && (
                <span style={{ flex: 'none', width: 14, height: 1, background: i < activeIdx ? 'var(--gray-300)' : 'var(--border-subtle)' }} />
              )}
              {i === activeIdx && (
                <span style={{ flex: 'none', alignSelf: 'stretch', width: 0, borderLeft: '2px dashed var(--accent)', margin: '-6px 2px', opacity: 0.5 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* trust + control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <Sparkline data={agent.trust} width={64} height={26} />
        <div style={{ textAlign: 'right', lineHeight: 1.05 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>{cur}</div>
          <div style={{ fontSize: 10, color: d >= 0 ? 'var(--accent-strong)' : '#a4483b' }}>{d >= 0 ? '▲' : '▼'}{Math.abs(d)}</div>
        </div>
        {(agent.status === 'running' || agent.status === 'paused') && (
          <button onClick={(e) => { e.stopPropagation(); onToggle(agent.id); }} title={running ? 'Pause' : 'Resume'}
            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
            <Icon name={running ? 'pause' : 'play'} size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineView({ agents, onOpen, onToggle }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', padding: '4px 20px 8px', marginBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr 132px', gap: 16, padding: '10px 4px 6px', fontSize: 11, fontWeight: 500, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        <span>Agent</span><span>Step trace</span><span style={{ textAlign: 'right' }}>Trust</span>
      </div>
      {agents.map((a) => <Swimlane key={a.id} agent={a} onOpen={onOpen} onToggle={onToggle} />)}
    </div>
  );
}

window.TimelineView = TimelineView;
