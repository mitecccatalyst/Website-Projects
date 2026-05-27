function StatCard({ label, value, unit, color }) {
  return (
    <div
      className="glass-card"
      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, minWidth: 0 }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="stat-value" style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        {unit && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function StatsBar({ result, isOptimizing }) {
  const totalKm = result ? Math.round(result.totalDistance) : null
  const hrs = result ? Math.floor(result.estimatedTime) : null
  const mins = result ? Math.round((result.estimatedTime % 1) * 60) : null
  const timeStr = result ? `${hrs}h ${mins}m` : null

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatCard label="Stops" value={isOptimizing ? '…' : 60} color="#10b981" />
      <StatCard label="Distance" value={isOptimizing ? '…' : totalKm} unit="km" color="#3b82f6" />
      <StatCard label="Est. Time" value={isOptimizing ? '…' : timeStr} color="#06b6d4" />
    </div>
  )
}
