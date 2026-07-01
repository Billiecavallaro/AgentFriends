/* global React, ReactDOM, Icon, STATUS, INITIAL, KanbanView, TimelineView, CanvasView, DetailDrawer, sid */
const { useState, useEffect, useCallback, useRef } = React;

const clone = (x) => JSON.parse(JSON.stringify(x));
const loadLS = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };

function App() {
  const [agents, setAgents] = useState(() => clone(INITIAL));
  const [view, setView] = useState('canvas');
  const [selectedId, setSelectedId] = useState(null);
  const [live, setLive] = useState(true);
  const liveRef = useRef(live);
  liveRef.current = live;

  // canvas board state (persisted)
  const [layout, setLayout] = useState(() => loadLS('mc.layout', {}));
  const [extras, setExtras] = useState(() => loadLS('mc.extras', []));
  const dragActiveRef = useRef(false);
  useEffect(() => { try { localStorage.setItem('mc.layout', JSON.stringify(layout)); } catch (e) {} }, [layout]);
  useEffect(() => { try { localStorage.setItem('mc.extras', JSON.stringify(extras)); } catch (e) {} }, [extras]);

  const patch = useCallback((id, fn) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? fn(clone(a)) : a)));
  }, []);

  // ---- interactions ----
  const toggle = useCallback((id) => patch(id, (a) => {
    a.status = a.status === 'running' ? 'paused' : 'running'; return a;
  }), [patch]);

  const approve = useCallback((id, stepId) => patch(id, (a) => {
    const i = a.steps.findIndex((s) => s.id === stepId);
    if (i < 0) return a;
    a.steps[i].state = 'done'; a.steps[i].kind = 'action';
    const nxt = a.steps.find((s) => s.state === 'pending');
    if (nxt) nxt.state = 'active';
    a.status = 'running';
    a.trust = [...a.trust, Math.min(99, a.trust[a.trust.length - 1] + 5)].slice(-24);
    return a;
  }), [patch]);

  const reject = useCallback((id, stepId) => patch(id, (a) => {
    a.steps = a.steps.filter((s) => s.id !== stepId);
    const nxt = a.steps.find((s) => s.state === 'pending');
    if (nxt) nxt.state = 'active';
    a.status = 'running';
    a.trust = [...a.trust, Math.max(4, a.trust[a.trust.length - 1] - 3)].slice(-24);
    return a;
  }), [patch]);

  const override = useCallback((id, stepId, label) => patch(id, (a) => {
    const s = a.steps.find((x) => x.id === stepId);
    if (s && label.trim()) { s.label = label.trim(); s.overridden = true; }
    return a;
  }), [patch]);

  const rollback = useCallback((id, stepId) => patch(id, (a) => {
    const i = a.steps.findIndex((s) => s.id === stepId);
    if (i < 0) return a;
    a.steps = a.steps.filter((s) => s.kind !== 'note');
    const j = a.steps.findIndex((s) => s.id === stepId);
    a.steps.forEach((s, k) => { if (k < j) s.state = 'done'; else if (k === j) s.state = 'active'; else s.state = 'pending'; });
    a.status = 'running';
    a.trust = [...a.trust, a.trust[a.trust.length - 1]].slice(-24);
    return a;
  }), [patch]);

  const takeover = useCallback((id) => patch(id, (a) => { a.status = 'manual'; return a; }), [patch]);
  const returnControl = useCallback((id) => patch(id, (a) => { a.status = 'running'; return a; }), [patch]);

  const note = useCallback((id, text) => patch(id, (a) => {
    let idx = a.steps.findIndex((s) => s.state === 'active' || s.state === 'proposed' || s.state === 'blocked');
    if (idx < 0) idx = a.steps.length - 1;
    a.steps.splice(idx + 1, 0, { id: sid(), kind: 'note', state: 'done', label: text });
    return a;
  }), [patch]);

  // ---- gentle live simulation ----
  useEffect(() => {
    const t = setInterval(() => {
      if (!liveRef.current || dragActiveRef.current) return;
      setAgents((prev) => prev.map((a) => {
        if (a.status !== 'running') return a;
        const b = clone(a);
        const last = b.trust[b.trust.length - 1];
        const bias = b.kind === 'test' ? -1.4 : 1.3;
        b.trust = [...b.trust, Math.max(4, Math.min(99, Math.round(last + bias + (Math.random() * 6 - 3))))].slice(-24);
        if (Math.random() < 0.22) {
          const ai = b.steps.findIndex((s) => s.state === 'active');
          if (ai >= 0) {
            const nxt = b.steps[ai + 1];
            if (nxt && nxt.state === 'pending') { b.steps[ai].state = 'done'; nxt.state = 'active'; }
            else if (nxt && nxt.state === 'proposed') { b.steps[ai].state = 'done'; b.status = 'needs_review'; }
          }
        }
        return b;
      }));
    }, 3600);
    return () => clearInterval(t);
  }, []);

  const selected = agents.find((a) => a.id === selectedId) || null;
  const count = (st) => agents.filter((a) => a.status === st).length;

  const Seg = ({ id, icon, label }) => (
    <button onClick={() => setView(id)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500,
      padding: '6px 12px', borderRadius: 7, cursor: 'pointer', border: 'none',
      background: view === id ? '#fff' : 'transparent', color: view === id ? 'var(--text-primary)' : 'var(--text-muted)',
      boxShadow: view === id ? 'var(--shadow-xs)' : 'none', fontFamily: 'var(--font-sans)',
    }}><Icon name={icon} size={14} />{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'color-mix(in srgb, var(--surface-page) 88%, transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="assets/af-mark.png" alt="Agent Friends" width="34" height="34" style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border-default)', background: '#fff', objectFit: 'contain' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>Agent Friends</h1>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{agents.length} agents · {count('running')} running · {count('needs_review')} need review · {count('blocked')} blocked</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setLive((v) => !v)} title="Toggle live updates" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500,
              padding: '7px 12px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
              border: '1px solid var(--border-default)', background: '#fff', color: live ? 'var(--accent-strong)' : 'var(--text-muted)', fontFamily: 'var(--font-sans)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: live ? 'var(--accent)' : 'var(--gray-400)', boxShadow: live ? '0 0 0 3px var(--accent-soft)' : 'none', animation: live ? 'mcPulse 1.8s ease-in-out infinite' : 'none' }} />
              {live ? 'Live' : 'Paused'}
            </button>
            <div style={{ display: 'inline-flex', background: 'var(--surface-subtle)', borderRadius: 9, padding: 3, gap: 2 }}>
              <Seg id="canvas" icon="grid" label="Canvas" />
              <Seg id="kanban" icon="columns" label="Kanban" />
              <Seg id="timeline" icon="pulse" label="Timeline" />
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: view === 'canvas' ? 'none' : 1280, margin: '0 auto', padding: view === 'canvas' ? '16px 20px' : '24px 32px' }}>
        {view === 'kanban' && <KanbanView agents={agents} onOpen={setSelectedId} onToggle={toggle} />}
        {view === 'timeline' && <TimelineView agents={agents} onOpen={setSelectedId} onToggle={toggle} />}
        {view === 'canvas' && <CanvasView agents={agents} layout={layout} setLayout={setLayout} extras={extras} setExtras={setExtras} onOpen={setSelectedId} onToggle={toggle} dragActiveRef={dragActiveRef} />}
      </main>

      <DetailDrawer
        agent={selected}
        onClose={() => setSelectedId(null)}
        onToggle={toggle} onApprove={approve} onReject={reject} onOverride={override}
        onRollback={rollback} onTakeover={takeover} onReturn={returnControl} onNote={note}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
