/**
 * Haversine distance formula — returns distance in kilometers between two lat/lng points.
 * @param {Object} a - { lat, lng }
 * @param {Object} b - { lat, lng }
 * @returns {number} distance in km
 */
export function haversineDistance(a, b) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Nearest-neighbor heuristic to build an initial TSP tour.
 * Starts at depot, greedily visits the closest unvisited stop.
 * @param {Object} depot
 * @param {Array}  stops
 * @returns {Array} ordered array of stops (NOT including depot at start/end)
 */
export function nearestNeighbor(depot, stops) {
  const unvisited = [...stops];
  const route = [];
  let current = depot;

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let bestDist = haversineDistance(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const d = haversineDistance(current, unvisited[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    current = unvisited[bestIdx];
    route.push(current);
    unvisited.splice(bestIdx, 1);
  }

  return route;
}

/**
 * Compute total round-trip distance: depot → route[0] → ... → route[n-1] → depot
 * @param {Object} depot
 * @param {Array}  route
 * @returns {number} total distance in km
 */
function routeDistance(depot, route) {
  let total = haversineDistance(depot, route[0]);
  for (let i = 0; i < route.length - 1; i++) {
    total += haversineDistance(route[i], route[i + 1]);
  }
  total += haversineDistance(route[route.length - 1], depot);
  return total;
}

/**
 * 2-opt improvement — iteratively reverses segments to reduce total route length.
 * Runs until no improvement is found or maxIterations is reached.
 * @param {Object} depot
 * @param {Array}  route  - mutable ordered stop array
 * @param {number} maxIterations
 * @returns {{ route: Array, improved: boolean }}
 */
export function twoOpt(depot, route, maxIterations = 500) {
  let bestRoute = [...route];
  let bestDistance = routeDistance(depot, bestRoute);
  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let j = i + 2; j < bestRoute.length; j++) {
        // Skip if i==0 and j==last (would just reverse the whole route)
        if (i === 0 && j === bestRoute.length - 1) continue;

        // Reverse the segment between i+1 and j
        const newRoute = [
          ...bestRoute.slice(0, i + 1),
          ...bestRoute.slice(i + 1, j + 1).reverse(),
          ...bestRoute.slice(j + 1)
        ];

        const newDistance = routeDistance(depot, newRoute);

        if (newDistance < bestDistance - 1e-10) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return { route: bestRoute, totalDistance: bestDistance };
}

/**
 * Full pipeline: nearest neighbor → 2-opt.
 * @param {Object} depot
 * @param {Array}  stops
 * @returns {{ route: Array, totalDistance: number, estimatedTime: number, cumulativeDistances: number[] }}
 */
export function optimizeRoute(depot, stops) {
  // Step 1: Build initial tour with nearest neighbor
  const nnRoute = nearestNeighbor(depot, stops);

  // Step 2: Improve with 2-opt
  const { route, totalDistance } = twoOpt(depot, nnRoute);

  // Step 3: Compute cumulative distances from depot for the sidebar
  const cumulativeDistances = [];
  let cumDist = haversineDistance(depot, route[0]);
  cumulativeDistances.push(cumDist);

  for (let i = 1; i < route.length; i++) {
    cumDist += haversineDistance(route[i - 1], route[i]);
    cumulativeDistances.push(cumDist);
  }

  // Estimated time at avg 40 km/h in city traffic
  const estimatedTime = totalDistance / 40;

  return {
    route,
    totalDistance,
    estimatedTime,
    cumulativeDistances
  };
}
