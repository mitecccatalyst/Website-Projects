import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createMarkerIcon(label, isDepot, isActive) {
  const bgColor = isDepot ? '#10b981' : isActive ? '#06b6d4' : '#3b82f6'
  const size = isDepot ? 36 : 32
  const glowColor = isDepot
    ? 'rgba(16,185,129,0.6)'
    : isActive
    ? 'rgba(6,182,212,0.7)'
    : 'rgba(59,130,246,0.5)'
  const boxShadow = isActive
    ? `0 0 0 3px ${glowColor}, 0 0 16px ${glowColor}`
    : `0 0 8px ${glowColor}`

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${bgColor};
      border-radius:50%;
      border:2px solid rgba(255,255,255,0.35);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fff;
      font-weight:700;
      font-size:${isDepot ? 13 : 11}px;
      font-family:'Inter',sans-serif;
      box-shadow:${boxShadow};
      cursor:pointer;
      transition:transform 0.15s;
    ">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  })
}

const MapView = forwardRef(function MapView(
  { depot, route, activeStopId, onMarkerClick },
  ref
) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({}) // id → L.Marker
  const polylineRef = useRef(null)

  // Expose focusStop method to parent via ref
  useImperativeHandle(ref, () => ({
    focusStop(stop) {
      const map = mapInstanceRef.current
      if (!map) return
      map.setView([stop.lat, stop.lng], Math.max(map.getZoom(), 14), { animate: true })
      const marker = markersRef.current[stop.id]
      if (marker) marker.openPopup()
    },
  }))

  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current) return
    if (!mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [43.72, -79.45],
      zoom: 10,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers and polyline when route changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !depot || !route || route.length === 0) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    // Add depot marker
    const depotMarker = L.marker([depot.lat, depot.lng], {
      icon: createMarkerIcon('D', true, false),
      zIndexOffset: 1000,
    }).addTo(map)
    depotMarker.bindPopup(
      `<div style="min-width:180px">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#34d399">${depot.name}</div>
        <div style="font-size:11px;color:#94a3b8">${depot.address}</div>
        <div style="font-size:11px;color:#34d399;margin-top:4px">● Start / End Depot</div>
      </div>`
    )
    markersRef.current[depot.id] = depotMarker

    // Add stop markers
    route.forEach((stop, idx) => {
      const isActive = stop.id === activeStopId
      const marker = L.marker([stop.lat, stop.lng], {
        icon: createMarkerIcon(idx + 1, false, isActive),
        zIndexOffset: isActive ? 900 : 0,
      }).addTo(map)

      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#f1f5f9">Stop #${idx + 1}</div>
          <div style="font-size:12px;color:#93c5fd;margin-bottom:2px">${stop.name}</div>
          <div style="font-size:11px;color:#94a3b8">${stop.address}</div>
        </div>`
      )

      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(stop)
      })

      markersRef.current[stop.id] = marker
    })

    // Draw route polyline: depot → stops[0] → ... → stops[n-1] → depot
    const latlngs = [
      [depot.lat, depot.lng],
      ...route.map((s) => [s.lat, s.lng]),
      [depot.lat, depot.lng],
    ]
    polylineRef.current = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8,
      smoothFactor: 1,
      dashArray: null,
    }).addTo(map)

    // Fit map bounds to all markers
    const allLatLngs = [
      [depot.lat, depot.lng],
      ...route.map((s) => [s.lat, s.lng]),
    ]
    map.fitBounds(allLatLngs, { padding: [40, 40], animate: true })
  }, [depot, route]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update active marker icon when activeStopId changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !route) return

    route.forEach((stop, idx) => {
      const marker = markersRef.current[stop.id]
      if (!marker) return
      const isActive = stop.id === activeStopId
      marker.setIcon(createMarkerIcon(idx + 1, false, isActive))
      if (isActive) marker.setZIndexOffset(900)
      else marker.setZIndexOffset(0)
    })
  }, [activeStopId, route])

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '300px',
        background: '#0d1117',
      }}
    />
  )
})

export default MapView
