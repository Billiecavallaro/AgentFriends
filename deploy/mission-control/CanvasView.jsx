/* global React, Icon, STATUS, COLUMNS, KIND, SOURCE, Sparkline, trend, TrustPill, StatusChip, SourceBadge, currentStep */
// Freeform board canvas — drag agent cards, drop notes / images / links.
const { useRef, useEffect, useState, useCallback } = React;

const CARD_W = 264;
const noteBg = { yellow: '#fbf3d0', green: 'var(--accent-soft)', purple: 'var(--purple-100)', blue: 'var(--blue-100)', plain: '#fff' };
const noteBd = { yellow: '#efe1a4', green: '#cfe6d2', purple: '#e0d6f5', blue: '#cfdcf7', plain: 'var(--border-default)' };

// default tiling for agents that have no saved position (kanban-like columns)
function defaultLayout(agents) {
  const colOf = (s) => (s === 'running' || s === 'paused' || s === 'manual') ? 0 : s === 'needs_review' ? 1 : s === 'blocked' ? 2 : 3;
  const counts = [0, 0, 0, 0];
  const out = {};
  agents.forEach((a) => {
    const c = colOf(a.status);
    out[a.id] = { x: 40 + c * (CARD_W + 34), y: 40 + counts[c] * 232 };
    counts[c] += 1;
  });
  return out;
}

// ---- draggable agent card (canvas variant) ----
function CanvasAgentCard({ agent, onToggle }) {
  const k = KIND[agent.kind];
  const step = currentStep(agent);
  const running = agent.status === 'running';
  const proposed = agent.steps.find((s) => s.state === 'proposed');
  return (
    <div style={{ width: CARD_W, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 15, display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={k.icon} size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, marginTop: 2 }}>
              <SourceBadge source={agent.source} />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {k.label} · {agent.repo}</span>
            </div>
          </div>
        </div>
        <StatusChip status={agent.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: running ? 'var(--accent)' : 'var(--gray-300)', flex: 'none' }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step ? step.label : '—'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TrustPill agent={agent} />
        <div style={{ display: 'flex', gap: 6 }} onPointerDown={(e) => e.stopPropagation()}>
          {proposed && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9a6b1c', background: '#f4ecd8', padding: '4px 8px', borderRadius: 999 }}><Icon name="message" size={12} /> review</span>}
          {(agent.status === 'running' || agent.status === 'paused') && (
            <button onClick={() => onToggle(agent.id)} title={running ? 'Pause' : 'Resume'} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name={running ? 'pause' : 'play'} size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- small drag handle used by extras ----
function Handle({ label, onDelete, extra }) {
  return (
    <div className="mc-handle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', padding: '2px 2px 6px', color: 'var(--text-faint)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}><Icon name="grip" size={13} />{label}</span>
      <span style={{ display: 'flex', gap: 2 }}>{extra}
        <button onClick={onDelete} onPointerDown={(e) => e.stopPropagation()} title="Delete" style={{ width: 20, height: 20, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="trash" size={13} /></button>
      </span>
    </div>
  );
}

function NoteCard({ item, onChange, onDelete }) {
  const cycle = () => { const ks = Object.keys(noteBg); const i = ks.indexOf(item.color || 'yellow'); onChange({ color: ks[(i + 1) % ks.length] }); };
  const c = item.color || 'yellow';
  return (
    <div style={{ width: item.w || 210, background: noteBg[c], border: `1px solid ${noteBd[c]}`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 12 }}>
      <Handle label="Note" onDelete={onDelete} extra={<button onClick={cycle} onPointerDown={(e) => e.stopPropagation()} title="Color" style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid rgba(0,0,0,.12)', background: noteBd[c], cursor: 'pointer' }} />} />
      <textarea value={item.text} onChange={(e) => onChange({ text: e.target.value })} onPointerDown={(e) => e.stopPropagation()} placeholder="Type a note…"
        style={{ width: '100%', minHeight: 74, resize: 'vertical', border: 'none', background: 'transparent', outline: 'none', font: 'inherit', fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.45, color: 'var(--text-primary)' }} />
    </div>
  );
}

function ImageCard({ item, onChange, onDelete }) {
  return (
    <div style={{ width: item.w || 240, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 10 }}>
      <Handle label="Image" onDelete={onDelete} />
      <image-slot id={`mc-slot-${item.id}`} shape="rounded" radius="8" style={{ display: 'block', width: '100%', height: (item.h || 150) + 'px' }} placeholder="Drop an image"></image-slot>
      <input value={item.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} onPointerDown={(e) => e.stopPropagation()} placeholder="Caption…"
        style={{ width: '100%', marginTop: 8, border: 'none', background: 'transparent', outline: 'none', font: 'inherit', fontSize: 12, color: 'var(--text-muted)' }} />
    </div>
  );
}

function LinkCard({ item, onChange, onDelete }) {
  return (
    <div style={{ width: item.w || 230, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 12 }}>
      <Handle label="Resource" onDelete={onDelete} extra={item.url ? <a href={/^https?:\/\//.test(item.url) ? item.url : `https://${item.url}`} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()} title="Open" style={{ width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Icon name="external" size={13} /></a> : null} />
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-subtle)', color: 'var(--accent-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="link" size={15} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={item.title || ''} onChange={(e) => onChange({ title: e.target.value })} onPointerDown={(e) => e.stopPropagation()} placeholder="Resource title"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }} />
          <input value={item.url || ''} onChange={(e) => onChange({ url: e.target.value })} onPointerDown={(e) => e.stopPropagation()} placeholder="paste a link…"
            style={{ width: '100%', marginTop: 2, border: 'none', background: 'transparent', outline: 'none', font: 'inherit', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--accent-strong)' }} />
        </div>
      </div>
    </div>
  );
}

function CanvasView({ agents, layout, setLayout, extras, setExtras, onOpen, onToggle, dragActiveRef }) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const nodes = useRef({});
  const drag = useRef(null);
  const pan = useRef(null);
  const zTop = useRef(20);
  const [, force] = useState(0);

  const posOf = (agent) => layout[agent.id] || defaultLayout(agents)[agent.id] || { x: 40, y: 40 };

  // commit + live drag via direct DOM
  useEffect(() => {
    const onMove = (e) => {
      if (drag.current) {
        const d = drag.current;
        const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
        if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
        d.nx = d.ox + dx; d.ny = d.oy + dy;
        const el = nodes.current[d.key];
        if (el) { el.style.left = d.nx + 'px'; el.style.top = d.ny + 'px'; }
      } else if (pan.current) {
        const c = containerRef.current;
        c.scrollLeft = pan.current.sl - (e.clientX - pan.current.sx);
        c.scrollTop = pan.current.st - (e.clientY - pan.current.sy);
      }
    };
    const onUp = () => {
      if (drag.current) {
        const d = drag.current;
        const z = ++zTop.current;
        if (d.kind === 'agent') {
          if (d.moved) setLayout((p) => ({ ...p, [d.key]: { x: d.nx, y: d.ny, z } }));
          else onOpen(d.agentId);
        } else {
          setExtras((p) => p.map((it) => it.id === d.key ? { ...it, x: d.nx, y: d.ny, z } : it));
        }
        drag.current = null;
        if (dragActiveRef) dragActiveRef.current = false;
      }
      if (pan.current) { pan.current = null; if (containerRef.current) containerRef.current.style.cursor = 'grab'; }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [setLayout, setExtras, onOpen, dragActiveRef]);

  const startDrag = (e, kind, key, x, y, agentId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    drag.current = { kind, key, agentId, ox: x, oy: y, sx: e.clientX, sy: e.clientY, nx: x, ny: y, moved: false };
    if (dragActiveRef) dragActiveRef.current = true;
    const el = nodes.current[key];
    if (el) el.style.zIndex = ++zTop.current;
  };

  const startPan = (e) => {
    if (e.button !== 0 || e.target.closest('[data-cvitem]')) return;
    const c = containerRef.current;
    pan.current = { sx: e.clientX, sy: e.clientY, sl: c.scrollLeft, st: c.scrollTop };
    c.style.cursor = 'grabbing';
  };

  // add helpers — drop near current viewport center
  const center = () => {
    const c = containerRef.current;
    const n = extras.length;
    const off = (n % 6) * 26;
    return { x: (c ? c.scrollLeft + c.clientWidth / 2 : 400) - 110 + off, y: (c ? c.scrollTop + 90 : 120) + off };
  };
  const addNote = () => { const p = center(); setExtras((x) => [...x, { id: 'n' + Date.now(), type: 'note', text: '', color: 'yellow', ...p, z: ++zTop.current }]); };
  const addImage = () => { const p = center(); setExtras((x) => [...x, { id: 'i' + Date.now(), type: 'image', caption: '', ...p, z: ++zTop.current }]); };
  const addLink = () => { const p = center(); setExtras((x) => [...x, { id: 'l' + Date.now(), type: 'link', title: '', url: '', ...p, z: ++zTop.current }]); };
  const patchExtra = (id, patch) => setExtras((x) => x.map((it) => it.id === id ? { ...it, ...patch } : it));
  const delExtra = (id) => setExtras((x) => x.filter((it) => it.id !== id));
  const reset = () => { setLayout({}); force((n) => n + 1); if (containerRef.current) containerRef.current.scrollTo({ left: 0, top: 0 }); };

  const ToolBtn = ({ icon, label, onClick, solid }) => (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500, padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid ' + (solid ? 'var(--ink)' : 'var(--border-default)'), background: solid ? 'var(--ink)' : '#fff', color: solid ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
      <Icon name={icon} size={14} />{label}
    </button>
  );

  return (
    <div style={{ position: 'relative', marginBottom: 40 }}>
      {/* toolbar — sits above the canvas, not over the cards */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 8 }}>
          <ToolBtn icon="note" label="Note" onClick={addNote} />
          <ToolBtn icon="image" label="Image" onClick={addImage} />
          <ToolBtn icon="link" label="Resource" onClick={addLink} />
          <span style={{ width: 1, height: 22, background: 'var(--border-subtle)' }} />
          <ToolBtn icon="grid" label="Re-tile" onClick={reset} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Drag cards & notes freely · drag the background to pan</div>
      </div>

      {/* scroll viewport */}
      <div ref={containerRef} onPointerDown={startPan} style={{ height: 'calc(100vh - 200px)', minHeight: 520, overflow: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-page)', cursor: 'grab' }}>
        <div ref={innerRef} style={{ position: 'relative', width: 2600, height: 1700, backgroundImage: 'radial-gradient(var(--gray-250) 1.1px, transparent 1.1px)', backgroundSize: '24px 24px' }}>
          {/* agent cards */}
          {agents.map((a) => {
            const p = posOf(a);
            return (
              <div key={a.id} data-cvitem ref={(el) => { nodes.current[a.id] = el; }}
                onPointerDown={(e) => startDrag(e, 'agent', a.id, p.x, p.y, a.id)}
                style={{ position: 'absolute', left: p.x, top: p.y, zIndex: p.z || 1, cursor: 'grab', touchAction: 'none' }}>
                <CanvasAgentCard agent={a} onToggle={onToggle} />
              </div>
            );
          })}
          {/* extras */}
          {extras.map((it) => (
            <div key={it.id} data-cvitem ref={(el) => { nodes.current[it.id] = el; }}
              onPointerDown={(e) => { if (e.target.closest('.mc-handle')) startDrag(e, 'extra', it.id, it.x, it.y); }}
              style={{ position: 'absolute', left: it.x, top: it.y, zIndex: it.z || 1, touchAction: 'none' }}>
              {it.type === 'note' && <NoteCard item={it} onChange={(patch) => patchExtra(it.id, patch)} onDelete={() => delExtra(it.id)} />}
              {it.type === 'image' && <ImageCard item={it} onChange={(patch) => patchExtra(it.id, patch)} onDelete={() => delExtra(it.id)} />}
              {it.type === 'link' && <LinkCard item={it} onChange={(patch) => patchExtra(it.id, patch)} onDelete={() => delExtra(it.id)} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.CanvasView = CanvasView;
