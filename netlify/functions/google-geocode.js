const { json, mapsKey, parseBody, preflight } = require("./_shared");

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
  const addresses = Array.isArray(body?.addresses)
    ? body.addresses.map((address) => String(address || "").trim()).filter(Boolean).slice(0, 61)
    : [];

  if (!addresses.length) return json(400, { configured: true, error: "No addresses supplied." });

  const results = [];
  for (const query of addresses) {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", query);
    url.searchParams.set("key", key);

    const response = await fetch(url);
    const data = await response.json();
    const first = data.results?.[0];

    results.push({
      query,
      status: data.status,
      formatted: first?.formatted_address || "",
      lat: first?.geometry?.location?.lat || null,
      lng: first?.geometry?.location?.lng || null,
      placeId: first?.place_id || "",
      locationType: first?.geometry?.location_type || "",
    });

    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  return json(200, { configured: true, results });
};
