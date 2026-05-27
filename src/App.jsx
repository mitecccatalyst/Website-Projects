import { useState, useEffect, useRef } from 'react'
import { DEPOT, STOPS } from './data/addresses'
import { optimizeRoute } from './utils/routeOptimizer'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import StopList from './components/StopList'
import MapView from './components/MapView'

export default function App() {
  const [result, setResult] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(true)
  const [activeStopId, setActiveStopId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const mapRef = useRef(null)

  const runOptimize = () => {
    setIsOptimizing(true)
    // Defer to next tick so spinner renders before heavy computation
    setTimeout(() => {
      const r = optimizeRoute(DEPOT, STOPS)
      setResult(r)
      setIsOptimizing(false)
    }, 50)
  }

  useEffect(() => {
    runOptimize()
  }, [])

  const handleStopClick = (stop) => {
    setActiveStopId(stop.id)
    if (mapRef.current) {
      mapRef.current.focusStop(stop)
    }
  }

  const filteredRoute = result
    ? result.route.filter(
        (s) =>
          searchQuery === '' ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Header onReoptimize={runOptimize} isOptimizing={isOptimizing} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Left panel */}
        <div
          style={{
            width: '380px',
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <StatsBar result={result} isOptimizing={isOptimizing} />
            <input
              className="search-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', marginTop: '12px', fontSize: '13px' }}
              placeholder="Search stops…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            <StopList
              depot={DEPOT}
              route={result ? result.route : []}
              cumulativeDistances={result ? result.cumulativeDistances : []}
              filteredRoute={filteredRoute}
              searchQuery={searchQuery}
              activeStopId={activeStopId}
              onStopClick={handleStopClick}
            />
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapView
            ref={mapRef}
            depot={DEPOT}
            route={result ? result.route : []}
            activeStopId={activeStopId}
            onMarkerClick={(stop) => setActiveStopId(stop.id)}
            isReady={!isOptimizing && !!result}
          />
          {isOptimizing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10,10,15,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  className="spinner"
                  style={{
                    width: 48,
                    height: 48,
                    border: '3px solid rgba(59,130,246,0.2)',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                  }}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Optimizing route…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
