const MAX_STOPS = 60;
const STORAGE_KEY = "routePilotPlan";

const state = {
  traffic: "normal",
  selectedRouteId: null,
  routes: [],
};

const districtCoords = {
  central: { x: 50, y: 50 },
  north: { x: 48, y: 18 },
  east: { x: 82, y: 47 },
  south: { x: 52, y: 82 },
  west: { x: 18, y: 48 },
};

const districtOrder = ["north", "central", "east", "south", "west"];

const sampleStops = [
  ["Union Station, Toronto", "central"],
  ["80 Front St E, Toronto", "central"],
  ["100 Queen St W, Toronto", "central"],
  ["220 Yonge St, Toronto", "central"],
  ["3401 Dufferin St, Toronto", "north"],
  ["5150 Yonge St, Toronto", "north"],
  ["25 The West Mall, Etobicoke", "west"],
  ["650 Dixon Rd, Etobicoke", "west"],
  ["300 Borough Dr, Scarborough", "east"],
  ["1900 Eglinton Ave E, Scarborough", "east"],
  ["30 The Queensway, Toronto", "south"],
  ["125 The Queensway, Toronto", "south"],
];

const el = {
  slotGrid: document.querySelector("#slotGrid"),
  slotTemplate: document.querySelector("#slotTemplate"),
  startAddress: document.querySelector("#startAddress"),
  bulkAddresses: document.querySelector("#bulkAddresses"),
  tripDays: document.querySelector("#tripDays"),
  maxHours: document.querySelector("#maxHours"),
  serviceMinutes: document.querySelector("#serviceMinutes"),
  departTime: document.querySelector("#departTime"),
  returnToStart: document.querySelector("#returnToStart"),
  assistantMessage: document.querySelector("#assistantMessage"),
  assistantList: document.querySelector("#assistantList"),
  routeOptions: document.querySelector("#routeOptions"),
  dayPlan: document.querySelector("#dayPlan"),
  routeMode: document.querySelector("#routeMode"),
  mapPreview: document.querySelector("#mapPreview"),
  googlePreview: document.querySelector("#googlePreview"),
  mapStatus: document.querySelector("#mapStatus"),
  stopCounter: document.querySelector("#stopCounter"),
  dayCounter: document.querySelector("#dayCounter"),
  routeCounter: document.querySelector("#routeCounter"),
  toast: document.querySelector("#toast"),
};

function init() {
  renderSlots();
  bindEvents();
  loadPlan();
  updateCounters();
  renderEmptyRoutes();
}

function renderSlots() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < MAX_STOPS; index += 1) {
    const node = el.slotTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.querySelector(".slot-number").textContent = String(index + 1).padStart(2, "0");
    node.querySelector(".slot-input").dataset.index = String(index);
    node.querySelector(".slot-zone").dataset.index = String(index);
    fragment.appendChild(node);
  }

  el.slotGrid.appendChild(fragment);
}

function bindEvents() {
  document.querySelector("#optimizeButton").addEventListener("click", optimizeRoutes);
  document.querySelector("#importButton").addEventListener("click", importBulkAddresses);
  document.querySelector("#clearButton").addEventListener("click", clearPlan);
  document.querySelector("#sampleButton").addEventListener("click", fillSample);
  document.querySelector("#compactButton").addEventListener("click", compactStops);
  document.querySelector("#exportButton").addEventListener("click", exportCsv);
  document.querySelector("#savePlanButton").addEventListener("click", savePlan);
  document.querySelector("#openSelectedGoogle").addEventListener("click", openSelectedGoogle);
  document.querySelector("#copySelected").addEventListener("click", copySelectedManifest);

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.traffic = button.dataset.traffic;
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      setAssistant(state.traffic === "busy"
        ? "Busy traffic selected. I will keep choices tight and show only the top two routes."
        : "Normal traffic selected. I can compare three strong routes for the driver.");
      if (state.routes.length) optimizeRoutes();
    });
  });

  el.slotGrid.addEventListener("input", (event) => {
    if (event.target.matches(".slot-input, .slot-zone")) updateCounters();
  });

  el.slotGrid.addEventListener("click", (event) => {
    const up = event.target.closest(".move-up");
    const down = event.target.closest(".move-down");
    if (!up && !down) return;

    const row = event.target.closest(".slot-row");
    const index = Number(row.dataset.index);
    moveStop(index, up ? -1 : 1);
  });
}

function getStops() {
  return [...document.querySelectorAll(".slot-row")]
    .map((row, index) => {
      const address = row.querySelector(".slot-input").value.trim();
      const selectedZone = row.querySelector(".slot-zone").value;
      const zone = selectedZone === "auto" ? inferDistrict(address) : selectedZone;
      return { index, address, zone, coords: coordsForStop(address, zone) };
    })
    .filter((stop) => stop.address);
}

function setStops(stops) {
  const rows = [...document.querySelectorAll(".slot-row")];
  rows.forEach((row, index) => {
    const stop = stops[index];
    row.querySelector(".slot-input").value = stop?.address || "";
    row.querySelector(".slot-zone").value = stop?.zone || "auto";
  });
  updateCounters();
}

function inferDistrict(address) {
  const text = address.toLowerCase();
  if (/\bnorth\b|york|markham|vaughan|richmond hill|yonge|steeles|dufferin/.test(text)) return "north";
  if (/\beast\b|scarborough|pickering|oshawa|eglinton east|borough/.test(text)) return "east";
  if (/\bsouth\b|lake|harbour|queens quay|waterfront|queensway/.test(text)) return "south";
  if (/\bwest\b|etobicoke|mississauga|oakville|dixon|mall/.test(text)) return "west";
  return "central";
}

function coordsForStop(address, zone) {
  let hash = 0;
  for (let i = 0; i < address.length; i += 1) {
    hash = (hash * 31 + address.charCodeAt(i)) % 9973;
  }
  const base = districtCoords[zone] || districtCoords.central;
  return {
    x: clamp(base.x + ((hash % 19) - 9), 8, 92),
    y: clamp(base.y + (((hash >> 3) % 19) - 9), 8, 92),
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function importBulkAddresses() {
  const lines = el.bulkAddresses.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_STOPS);

  if (!lines.length) {
    showToast("Paste at least one address first.");
    return;
  }

  const stops = lines.map((address) => ({ address, zone: "auto" }));
  setStops(stops);
  showToast(`${stops.length} stops imported into the 60-slot board.`);
  setAssistant("Bulk stops are loaded. Check the start address, days, and traffic mode before optimizing.");
}

function fillSample() {
  el.startAddress.value = "1 Dundas St W, Toronto";
  el.tripDays.value = "2";
  el.maxHours.value = "7.5";
  el.serviceMinutes.value = "8";
  setStops(sampleStops.map(([address, zone]) => ({ address, zone })));
  setAssistant("Sample delivery board loaded across central, north, west, east, and south districts.");
  optimizeRoutes();
}

function compactStops() {
  const stops = getStops().map(({ address, zone }) => ({ address, zone }));
  setStops(stops);
  showToast("Blank rows removed from the active stop sequence.");
}

function moveStop(index, delta) {
  const rows = [...document.querySelectorAll(".slot-row")];
  const target = index + delta;
  if (target < 0 || target >= rows.length) return;

  const currentInput = rows[index].querySelector(".slot-input");
  const currentZone = rows[index].querySelector(".slot-zone");
  const targetInput = rows[target].querySelector(".slot-input");
  const targetZone = rows[target].querySelector(".slot-zone");

  [currentInput.value, targetInput.value] = [targetInput.value, currentInput.value];
  [currentZone.value, targetZone.value] = [targetZone.value, currentZone.value];
  updateCounters();
}

function clearPlan() {
  el.startAddress.value = "";
  el.bulkAddresses.value = "";
  el.tripDays.value = "1";
  el.maxHours.value = "8";
  el.serviceMinutes.value = "6";
  el.returnToStart.checked = false;
  setStops([]);
  state.routes = [];
  state.selectedRouteId = null;
  renderEmptyRoutes();
  setAssistant("Plan cleared. Add a start point and up to 60 stops when you are ready.");
  localStorage.removeItem(STORAGE_KEY);
}

function optimizeRoutes() {
  const stops = getStops();
  const start = el.startAddress.value.trim();
  if (!start) {
    showToast("Add a start address before optimizing.");
    setAssistant("I need the driver's start address before ranking routes.");
    return;
  }

  if (!stops.length) {
    showToast("Add at least one delivery stop.");
    setAssistant("Add delivery stops in the board or paste a list, then I can rank options.");
    return;
  }

  const topCount = state.traffic === "busy" ? 2 : Math.min(3, stops.length >= 2 ? 3 : 2);
  const routes = [
    buildRoute("fastest", "Fastest sweep", orderByNearest(stops, start), "Shortest estimated drive time with closest-stop sequencing."),
    buildRoute("district", "District progressive", orderByDistrict(stops), "Groups nearby districts so multi-day trips move forward instead of bouncing across town."),
    buildRoute("balanced", "Balanced workload", orderBalanced(stops), "Spreads heavier districts and keeps day totals closer for longer routes."),
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, topCount);

  state.routes = routes;
  state.selectedRouteId = routes[0].id;
  renderRoutes();
  renderMap(routes[0]);
  updateCounters();
  setAssistant(`Best route is ${routes[0].name}: ${formatMinutes(routes[0].totalMinutes)} including stop time. You still choose the final route before opening Maps.`);
  renderGuidance(routes[0]);
}

function orderByNearest(stops) {
  const remaining = [...stops];
  const ordered = [];
  let current = { coords: { x: 50, y: 50 } };

  while (remaining.length) {
    remaining.sort((a, b) => distance(current, a) - distance(current, b));
    current = remaining.shift();
    ordered.push(current);
  }

  return ordered;
}

function orderByDistrict(stops) {
  return [...stops].sort((a, b) => {
    const districtDiff = districtOrder.indexOf(a.zone) - districtOrder.indexOf(b.zone);
    if (districtDiff !== 0) return districtDiff;
    return a.coords.y - b.coords.y || a.coords.x - b.coords.x;
  });
}

function orderBalanced(stops) {
  const grouped = districtOrder.map((zone) => stops.filter((stop) => stop.zone === zone));
  const ordered = [];
  let added = true;

  while (added) {
    added = false;
    grouped.forEach((group) => {
      if (group.length) {
        ordered.push(group.shift());
        added = true;
      }
    });
  }

  return ordered;
}

function distance(a, b) {
  const dx = a.coords.x - b.coords.x;
  const dy = a.coords.y - b.coords.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildRoute(id, name, orderedStops, description) {
  const trafficMultiplier = state.traffic === "busy" ? 1.32 : 1;
  const serviceMinutes = Number(el.serviceMinutes.value) || 6;
  const returnPenalty = el.returnToStart.checked ? 18 : 0;
  const legDistance = orderedStops.reduce((total, stop, index) => {
    const previous = index === 0 ? { coords: { x: 50, y: 50 } } : orderedStops[index - 1];
    return total + distance(previous, stop);
  }, 0);
  const driveMinutes = Math.round((legDistance * 2.05 + orderedStops.length * 7 + returnPenalty) * trafficMultiplier);
  const serviceTotal = orderedStops.length * serviceMinutes;
  const totalMinutes = driveMinutes + serviceTotal;
  const totalMiles = Math.max(1, Math.round(legDistance * 0.72));
  const days = splitIntoDays(orderedStops, totalMinutes);

  return {
    id,
    name,
    description,
    stops: orderedStops,
    driveMinutes,
    serviceTotal,
    totalMinutes,
    totalMiles,
    gasSavings: estimateSavings(id, totalMiles, orderedStops.length),
    score: totalMinutes + totalMiles * 1.8 + (id === "balanced" ? 18 : 0),
    days,
  };
}

function splitIntoDays(stops, totalMinutes) {
  const days = clamp(Number(el.tripDays.value) || 1, 1, 7);
  const maxDailyMinutes = (Number(el.maxHours.value) || 8) * 60;
  const chunks = Array.from({ length: days }, (_, index) => ({ day: index + 1, stops: [], minutes: 0 }));
  const perStop = Math.ceil(totalMinutes / Math.max(stops.length, 1));

  stops.forEach((stop, index) => {
    const progressiveIndex = Math.min(days - 1, Math.floor(index / Math.ceil(stops.length / days)));
    const chunk = chunks[progressiveIndex];
    chunk.stops.push(stop);
    chunk.minutes += perStop;
  });

  chunks.forEach((chunk) => {
    if (chunk.minutes > maxDailyMinutes) chunk.overLimit = true;
  });

  return chunks.filter((chunk) => chunk.stops.length);
}

function estimateSavings(id, miles, stopCount) {
  const base = Math.max(4, Math.round((stopCount * 1.6 + miles * 0.08)));
  if (id === "fastest") return `${base}-${base + 7} min`;
  if (id === "district") return `${Math.max(3, base - 2)}-${base + 4} min`;
  return `${Math.max(2, base - 5)}-${base + 2} min`;
}

function renderRoutes() {
  el.routeMode.textContent = state.traffic === "busy" ? "Busy: top 2 only" : "Normal: top 3";
  el.routeOptions.innerHTML = state.routes.map((route, index) => routeCard(route, index)).join("");
  el.routeOptions.querySelectorAll("[data-select-route]").forEach((button) => {
    button.addEventListener("click", () => selectRoute(button.dataset.selectRoute));
  });

  renderDayPlan(selectedRoute());
}

function routeCard(route, index) {
  const active = route.id === state.selectedRouteId ? " active" : "";
  return `
    <article class="route-card${active}">
      <div>
        <p class="kicker">Option ${index + 1}</p>
        <h3>${escapeHtml(route.name)}</h3>
      </div>
      <div class="route-metrics">
        <div class="metric"><span>Total</span><strong>${formatMinutes(route.totalMinutes)}</strong></div>
        <div class="metric"><span>Drive</span><strong>${formatMinutes(route.driveMinutes)}</strong></div>
        <div class="metric"><span>Stops</span><strong>${route.stops.length}</strong></div>
        <div class="metric"><span>Distance</span><strong>${route.totalMiles} mi</strong></div>
      </div>
      <p>${escapeHtml(route.description)} Estimated saving: ${route.gasSavings}.</p>
      <div class="route-actions">
        <a href="${googleRouteUrl(route.stops)}" target="_blank" rel="noreferrer">Google</a>
        <a href="${wazeRouteUrl(route.stops[0])}" target="_blank" rel="noreferrer">Waze first stop</a>
        <button type="button" data-select-route="${route.id}">Select</button>
      </div>
    </article>
  `;
}

function renderDayPlan(route) {
  if (!route) {
    el.dayPlan.innerHTML = "";
    return;
  }

  el.dayPlan.innerHTML = route.days.map((day) => {
    const names = day.stops.map((stop, index) => `<span>${index + 1}. ${escapeHtml(shortAddress(stop.address))}</span>`).join("");
    const status = day.overLimit ? "Over daily limit" : "On pace";
    return `
      <article class="day-card">
        <div>
          <p class="kicker">${status}</p>
          <h3>Day ${day.day} - ${formatMinutes(day.minutes)}</h3>
        </div>
        <div class="day-stop-list">${names}</div>
        <a href="${googleRouteUrl(day.stops)}" target="_blank" rel="noreferrer">Open day</a>
      </article>
    `;
  }).join("");
}

function selectRoute(routeId) {
  state.selectedRouteId = routeId;
  const route = selectedRoute();
  renderRoutes();
  renderMap(route);
  renderGuidance(route);
  setAssistant(`${route.name} selected. Review the day plan, then open Google Maps or Waze when the driver is ready.`);
}

function selectedRoute() {
  return state.routes.find((route) => route.id === state.selectedRouteId) || state.routes[0];
}

function renderEmptyRoutes() {
  el.routeMode.textContent = "Waiting for stops";
  el.routeOptions.innerHTML = '<div class="empty-state">Add a start address and at least one stop, then optimize to see the top route options.</div>';
  el.dayPlan.innerHTML = "";
  renderMap(null);
  updateCounters();
}

function renderMap(route) {
  el.mapPreview.querySelectorAll(".map-node, .map-line").forEach((node) => node.remove());

  if (!route) {
    el.mapStatus.textContent = "Ready";
    el.googlePreview.src = "https://www.google.com/maps?q=United%20States&output=embed";
    return;
  }

  const points = [{ address: "Start", coords: { x: 50, y: 50 }, start: true }, ...route.stops.slice(0, 18)];
  points.forEach((point, index) => {
    if (index > 0) drawLine(points[index - 1].coords, point.coords);
    const node = document.createElement("span");
    node.className = `map-node${point.start ? " start" : ""}`;
    node.textContent = point.start ? "S" : String(index);
    node.style.left = `${point.coords.x}%`;
    node.style.top = `${point.coords.y}%`;
    node.title = point.address;
    el.mapPreview.appendChild(node);
  });

  el.mapStatus.textContent = `${Math.min(route.stops.length, 18)} shown`;
  el.googlePreview.src = `https://www.google.com/maps?q=${encodeURIComponent(route.stops[0]?.address || el.startAddress.value)}&output=embed`;
}

function drawLine(from, to) {
  const rect = el.mapPreview.getBoundingClientRect();
  const x1 = (from.x / 100) * rect.width;
  const y1 = (from.y / 100) * rect.height;
  const x2 = (to.x / 100) * rect.width;
  const y2 = (to.y / 100) * rect.height;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const line = document.createElement("span");
  line.className = "map-line";
  line.style.width = `${length}px`;
  line.style.left = `${from.x}%`;
  line.style.top = `${from.y}%`;
  line.style.transform = `rotate(${angle}deg)`;
  el.mapPreview.appendChild(line);
}

function renderGuidance(route) {
  const first = route.stops[0];
  const midpoint = route.stops[Math.floor(route.stops.length / 2)];
  const last = route.stops[route.stops.length - 1];
  const firstBreak = route.driveMinutes > 180
    ? "Schedule gas or food after the first long cluster, before the midpoint."
    : "Keep the first fuel or food stop after the opening cluster unless the driver starts low.";

  el.assistantList.innerHTML = [
    `Start with ${shortAddress(first.address)}. Confirm live traffic in Google before departure.`,
    firstBreak,
    `Mid-route check near ${shortAddress(midpoint.address)}. If delayed, move low-priority stops to the next day.`,
    `Finish toward ${shortAddress(last.address)}${el.returnToStart.checked ? " and navigate back to start" : ""}.`,
  ].map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function googleRouteUrl(stops) {
  const start = el.startAddress.value.trim();
  const destination = stops[stops.length - 1]?.address || start;
  const waypoints = stops.slice(0, -1).map((stop) => stop.address).slice(0, 23);
  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    origin: start,
    destination,
  });
  if (waypoints.length) params.set("waypoints", waypoints.join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function wazeRouteUrl(stop) {
  const address = stop?.address || el.startAddress.value.trim();
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

function openSelectedGoogle() {
  const route = selectedRoute();
  if (!route) {
    showToast("Optimize a route first.");
    return;
  }
  window.open(googleRouteUrl(route.stops), "_blank", "noopener,noreferrer");
}

async function copySelectedManifest() {
  const route = selectedRoute();
  if (!route) {
    showToast("Optimize a route first.");
    return;
  }

  const manifest = [
    `RoutePilot manifest: ${route.name}`,
    `Total: ${formatMinutes(route.totalMinutes)} | Drive: ${formatMinutes(route.driveMinutes)} | Distance: ${route.totalMiles} mi`,
    `Start: ${el.startAddress.value.trim()}`,
    ...route.stops.map((stop, index) => `${index + 1}. ${stop.address} [${stop.zone}]`),
  ].join("\n");

  await navigator.clipboard.writeText(manifest);
  showToast("Selected route manifest copied.");
}

function exportCsv() {
  const stops = getStops();
  if (!stops.length) {
    showToast("No stops to export.");
    return;
  }

  const rows = [["slot", "address", "district"], ...stops.map((stop, index) => [index + 1, stop.address, stop.zone])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "routepilot-stops.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function savePlan() {
  const plan = {
    start: el.startAddress.value,
    days: el.tripDays.value,
    maxHours: el.maxHours.value,
    serviceMinutes: el.serviceMinutes.value,
    departTime: el.departTime.value,
    returnToStart: el.returnToStart.checked,
    traffic: state.traffic,
    stops: getStops().map(({ address, zone }) => ({ address, zone })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  showToast("Plan saved in this browser.");
}

function loadPlan() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const plan = JSON.parse(saved);
    el.startAddress.value = plan.start || "";
    el.tripDays.value = plan.days || "1";
    el.maxHours.value = plan.maxHours || "8";
    el.serviceMinutes.value = plan.serviceMinutes || "6";
    el.departTime.value = plan.departTime || "08:30";
    el.returnToStart.checked = Boolean(plan.returnToStart);
    setStops(plan.stops || []);
    if (plan.traffic) {
      state.traffic = plan.traffic;
      document.querySelectorAll(".segment").forEach((button) => {
        button.classList.toggle("active", button.dataset.traffic === state.traffic);
      });
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateCounters() {
  const stops = getStops();
  const days = clamp(Number(el.tripDays.value) || 1, 1, 7);
  el.stopCounter.textContent = `${stops.length} stop${stops.length === 1 ? "" : "s"}`;
  el.dayCounter.textContent = `${days} day${days === 1 ? "" : "s"}`;
  el.routeCounter.textContent = `${state.routes.length} route${state.routes.length === 1 ? "" : "s"}`;
}

function setAssistant(message) {
  el.assistantMessage.textContent = message;
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 2800);
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function shortAddress(address) {
  return address.length > 34 ? `${address.slice(0, 31)}...` : address;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
