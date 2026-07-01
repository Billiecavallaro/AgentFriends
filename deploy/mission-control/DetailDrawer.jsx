/* global React, Icon, STATUS, KIND, SOURCE, SourceBadge, Sparkline, trend */
// Detail drawer — full step trace + per-step controls for one agent.
const { useState, useEffect, useRef } = React;

function GhostBtn({ icon, label, onClick, tone }) {
  const colors = tone === 'danger'
    ? { fg: '#a4483b', bd: '#e2c4bd' }
    : tone === 'primary'
    ? { fg: '#fff', bd: 'var(--ink)', bg: 'var(--ink)' }
    : { fg: 'var(--text-secondary)', bd: 'var(--border-default)' };
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500,
      padding: '7px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
      border: `1px solid ${colors.bd}`, background: colors.bg || '#fff', color: colors.fg,
      fontFamily: 'var(--font-sans)',
    }}>
      {icon && <Icon name={icon} size={14} />}{label}
    </button>
  );
}

function StepRow({ step, agent, onApprove, onReject, onOverride, onRollback }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(step.label);
  const isProposed = step.state === 'proposed';
  const isBlocked = step.state === 'blocked';
  const isDone = step.state === 'done';
  const isActive = step.state === 'active';
  const isNote = step.kind === 'note';

  const dot = {
    done: 'var(--accent)', active: 'var(--accent)', proposed: '#c68a2e',
    blocked: '#c05a48', pending: 'var(--gray-300)',
  }[step.state] || 'var(--gray-300)';

  if (isNote) {
    return (
      <div style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
        <div style={{ width: 24, display: 'flex', justifyContent: 'center', color: 'var(--purple-500)', paddingTop: 1 }}><Icon name="message" size={15} /></div>
        <div style={{ background: 'var(--purple-100)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
          <div style={{ fontSize: 10.5, color: 'var(--purple-500)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>You steered</div>
          {step.label}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, padding: '11px 0', position: 'relative' }} className="mc-step">
      {/* rail */}
      <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: isDone || isActive ? dot : '#fff', border: `2px solid ${dot}`, boxShadow: isActive ? '0 0 0 4px var(--accent-soft)' : 'none' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { onOverride(agent.id, step.id, draft); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
              style={{ flex: 1, font: 'inherit', fontSize: 13, padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', outline: 'none' }} />
            <GhostBtn label="Save" tone="primary" onClick={() => { onOverride(agent.id, step.id, draft); setEditing(false); }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 13.5, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: isActive || isProposed ? 500 : 400, textDecoration: 'none' }}>{step.label}</span>
            {isDone && (
              <button className="mc-rollback" onClick={() => onRollback(agent.id, step.id)} title="Roll back to here"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 120ms', flex: 'none' }}>
                <Icon name="rollback" size={13} /> Roll back
              </button>
            )}
          </div>
        )}

        {isActive && <div style={{ fontSize: 11.5, color: 'var(--accent-strong)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'mcPulse 1.6s ease-in-out infinite' }} /> in progress</div>}

        {isBlocked && (
          <div style={{ marginTop: 6, background: '#f3ddd8', border: '1px solid #e2c4bd', borderRadius: 'var(--radius-md)', padding: '8px 11px', fontSize: 12.5, color: '#8f3f33' }}>
            {agent.blockedReason || 'Blocked — needs input.'}
          </div>
        )}

        {isProposed && (
          <div style={{ marginTop: 8, background: '#faf5e9', border: '1px solid #e6d3a6', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#9a6b1c', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
              <Icon name="message" size={13} /> Proposed action — awaiting you
            </div>
            {step.risk && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10 }}>{step.risk}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <GhostBtn icon="check" label="Approve" tone="primary" onClick={() => onApprove(agent.id, step.id)} />
              <GhostBtn icon="x" label="Reject" tone="danger" onClick={() => onReject(agent.id, step.id)} />
              <GhostBtn icon="edit" label="Override" onClick={() => { setDraft(step.label); setEditing(true); }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailDrawer({ agent, onClose, onToggle, onApprove, onReject, onOverride, onRollback, onTakeover, onReturn, onNote }) {
  const [note, setNote] = useState('');
  const scrollRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  if (!agent) return null;
  const k = KIND[agent.kind];
  const s = STATUS[agent.status];
  const running = agent.status === 'running';
  const manual = agent.status === 'manual';
  const cur = agent.trust[agent.trust.length - 1];
  const d = trend(agent.trust);

  const send = () => { const t = note.trim(); if (!t) return; onNote(agent.id, t); setNote(''); };

  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(24,24,21,0.28)' }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, zIndex: 51, height: '100%', width: 'min(480px, 94vw)', background: 'var(--surface-card)', borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={k.icon} size={18} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{agent.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, flexWrap: 'wrap' }}>
                  <SourceBadge source={agent.source} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>· {k.label} · {agent.repo} · {agent.model} · {agent.elapsed}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-subtle)', background: '#fff', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}><Icon name="x" size={15} /></button>
          </div>

          {/* trust + status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: s.fg, background: s.bg, padding: '4px 10px', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{s.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Trust trend</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600 }}>{cur}</span>
                  <span style={{ fontSize: 12, color: d >= 0 ? 'var(--accent-strong)' : '#a4483b' }}>{d >= 0 ? '▲' : '▼'}{Math.abs(d)}</span>
                </div>
              </div>
              <Sparkline data={agent.trust} width={120} height={40} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* global controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 22px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-page)' }}>
          {(running || agent.status === 'paused') && <GhostBtn icon={running ? 'pause' : 'play'} label={running ? 'Pause' : 'Resume'} onClick={() => onToggle(agent.id)} />}
          {manual
            ? <GhostBtn icon="play" label="Return control to agent" tone="primary" onClick={() => onReturn(agent.id)} />
            : <GhostBtn icon="hand" label="Take over" onClick={() => onTakeover(agent.id)} />}
        </div>

        {manual && (
          <div style={{ margin: '14px 22px 0', background: 'var(--purple-100)', border: '1px solid #d9cef2', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12.5, color: 'var(--purple-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="hand" size={14} /> You have manual control. The agent is paused and will not act until you return control.
          </div>
        )}

        {/* step trace */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em', padding: '12px 0 2px' }}>Step trace</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11.5, top: 14, bottom: 14, width: 1, background: 'var(--border-subtle)' }} />
            {agent.steps.map((st) => (
              <StepRow key={st.id} step={st} agent={agent} onApprove={onApprove} onReject={onReject} onOverride={onOverride} onRollback={onRollback} />
            ))}
          </div>
        </div>

        {/* steer composer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 14, display: 'flex', gap: 8 }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Steer this agent — add a note or new instruction…"
            style={{ flex: 1, font: 'inherit', fontSize: 13, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', outline: 'none', background: 'var(--surface-page)' }} />
          <button onClick={send} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink)', color: '#fff', border: 'none', padding: '0 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Send</button>
        </div>
      </aside>
    </React.Fragment>
  );
}

window.DetailDrawer = DetailDrawer;
