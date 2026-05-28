const { json, mapsKey, parseBody, preflight, secondsFromDuration } = require("./_shared");

const METERS_PER_MILE = 1609.344;
const MAX_INTERMEDIATES = 25;

exports.handler = async (event) => {
  const cors = preflight(event);
  if (cors) return cors;
  if (event.httpMethod !== "POST") return json(405, { error: "POST required" });

  const key = mapsKey();
  if (!key) {
    return json(503, {
      configured: false,
      error: "GOOGLE_MAPS_API_KEY is not configured on the backend.",
    });
  }

  const body = parseBody(event);
  const origin = waypointFrom(body?.origin);
  const stops = Array.isArray(body?.stops) ? body.stops.map(waypointFrom).filter(Boolean) : [];
  if (!origin || !stops.length) {
    return json(400, { configured: true, error: "Origin and stops with lat/lng are required." });
  }

  const chunks = chunkStops(stops);
  let currentOrigin = origin;
  let durationSeconds = 0;
  let staticSeconds = 0;
  let distanceMeters = 0;
  const legs = [];

  for (const chunk of chunks) {
    const destination = chunk[chunk.length - 1];
    const intermediates = chunk.slice(0, -1);
    const route = await computeRoute({
      key,
      origin: currentOrigin,
      destination,
      intermediates,
      trafficMode: body?.trafficMode,
    });

    durationSeconds += secondsFromDuration(route.duration);
    staticSeconds += secondsFromDuration(route.staticDuration);
    distanceMeters += route.distanceMeters || 0;
    legs.push({
      duration: route.duration,
      staticDuration: route.staticDuration,
      distanceMeters: route.distanceMeters || 0,
    });
    currentOrigin = destination;
  }

  return json(200, {
    configured: true,
    source: "google-routes-api",
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    staticDurationMinutes: Math.max(1, Math.round(staticSeconds / 60)),
    trafficDelayMinutes: Math.max(0, Math.round((durationSeconds - staticSeconds) / 60)),
    distanceMiles: Math.max(1, Math.round(distanceMeters / METERS_PER_MILE)),
    segmentCount: chunks.length,
    legs,
  });
};

function waypointFrom(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    address: String(value?.address || ""),
    lat,
    lng,
  };
}

function chunkStops(stops) {
  const chunks = [];
  for (let index = 0; index < stops.length; index += MAX_INTERMEDIATES + 1) {
    chunks.push(stops.slice(index, index + MAX_INTERMEDIATES + 1));
  }
  return chunks;
}

async function computeRoute({ key, origin, destination, intermediates, trafficMode }) {
  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: toRouteWaypoint(origin),
      destination: toRouteWaypoint(destination),
      intermediates: intermediates.map(toRouteWaypoint),
      travelMode: "DRIVE",
      routingPreference: trafficMode === "busy" ? "TRAFFIC_AWARE_OPTIMAL" : "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      units: "IMPERIAL",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.routes?.[0]) {
    throw new Error(data.error?.message || "Google Routes API did not return a route.");
  }
  return data.routes[0];
}

function toRouteWaypoint(point) {
  return {
    location: {
      latLng: {
        latitude: point.lat,
        longitude: point.lng,
      },
    },
  };
}
