export default function Header({ onReoptimize, isOptimizing }) {
  return (
    <header
      className="header-gradient"
      style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🚚
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            RouteIQ <span style={{ color: '#3b82f6' }}>GTA</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
            Optimized delivery routing · Greater Toronto Area
          </div>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={onReoptimize}
        disabled={isOptimizing}
        style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, cursor: isOptimizing ? 'not-allowed' : 'pointer' }}
      >
        {isOptimizing ? (
          <>
            <span
              className="spinner"
              style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }}
            />
            Optimizing…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Re-optimize
          </>
        )}
      </button>
    </header>
  )
}
