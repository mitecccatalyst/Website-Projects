import { DEPOT } from '../data/addresses'

function DepotRow({ depot }) {
  return (
    <div
      className="glass-card"
      style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <div className="stop-badge depot-badge">D</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#34d399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {depot.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {depot.address}
        </div>
      </div>
    </div>
  )
}

export default function StopList({ route, cumulativeDistances, filteredRoute, searchQuery, activeStopId, onStopClick }) {
  const displayRoute = searchQuery ? filteredRoute : route

  if (route.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        Computing route…
      </div>
    )
  }

  return (
    <div>
      <DepotRow depot={DEPOT} />

      {displayRoute.length === 0 && searchQuery && (
        <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          No stops match &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {displayRoute.map((stop) => {
        const orderIndex = route.findIndex((s) => s.id === stop.id)
        const cumDist = cumulativeDistances[orderIndex]
        const isActive = activeStopId === stop.id

        return (
          <div
            key={stop.id}
            className={`stop-item glass-card ${isActive ? 'active' : ''}`}
            onClick={() => onStopClick(stop)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--border)',
            }}
          >
            <div className="stop-badge">{orderIndex + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? '#60a5fa' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {stop.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {stop.address}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0, textAlign: 'right' }}>
              <span style={{ color: isActive ? '#06b6d4' : 'var(--text-secondary)' }}>
                {cumDist != null ? `${cumDist.toFixed(1)} km` : ''}
              </span>
            </div>
          </div>
        )
      })}

      {!searchQuery && (
        <div
          className="glass-card"
          style={{ padding: '10px 12px', borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}
        >
          <div className="stop-badge depot-badge">↩</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>Return to Depot</div>
        </div>
      )}
    </div>
  )
}
