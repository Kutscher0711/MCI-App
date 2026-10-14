export function Ring({ value, max, label, sub, color = "var(--accent)", size = 120 }: { value: number; max: number; label: string; sub?: string; color?: string; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--card-2)" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={value > max ? "var(--orange)" : color}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .5s" }}
        />
      </svg>
      <div className="center">
        <div>
          <b>{label}</b>
          {sub && <span className="muted small">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="row between small">
        <span>{label}</span>
        <span className="muted">
          {Math.round(value)} / {max} g
        </span>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}
