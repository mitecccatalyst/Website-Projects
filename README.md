# RoutePilot

![RoutePilot cover](./assets/routepilot-cover.png)

**RoutePilot helps delivery drivers turn messy stop lists into smarter route plans that can save time, gas, and daily stress.** Paste addresses, compare the fastest route options, split longer delivery runs across multiple days, and open the route in Google Maps or Waze when it is time to drive.

This is a lightweight web app that can run as a static planner, plus an optional secure Netlify backend for Google exact pins and live traffic times.

## Why It Matters

Every unnecessary backtrack costs fuel, time, and money. RoutePilot is built for delivery workers, couriers, mobile service pros, small businesses, and anyone who needs to hit many addresses without wasting the day zig-zagging across town.

Use it to:

- Plan up to **60 delivery stops**.
- Compare the **top 2 or 3 efficient route options**.
- Switch to **Busy traffic mode** when the day is crowded and you only want the strongest choices.
- Split long trips across **multiple days** so the route stays progressive.
- Save a plan locally in the browser.
- Import addresses from **CSV**.
- Export your stop list as CSV.
- Open selected routes in **Google Maps**.
- Split large 25+ stop plans into **Google Maps segments** so the full 60-stop route stays usable.
- Open the first stop in **Waze** for quick navigation.
- Install RoutePilot on a phone or laptop with **PWA support**.
- Verify **exact Google pins** through a secure backend proxy.
- Refresh routes with **live Google traffic times** when the backend is configured.
- Use the built-in **Road Assistant** for pacing tips, gas/food/coffee searches, and route reminders.

## Community Pitch

RoutePilot is for people who make money by moving. If your day depends on deliveries, appointments, mobile service calls, or customer stops, this repo gives you a fast way to organize the route before the engine starts. It is simple enough to run from a phone, useful enough for daily laptop planning, and open enough for the community to improve.

The goal is practical: fewer wasted miles, fewer confusing route decisions, and more time back in the day.

## Suggested GitHub Description

> A local-first delivery route optimizer that helps drivers save time and gas with 60-stop planning, top route choices, multi-day routing, Google Maps handoff, Waze links, and a Road Assistant.

## Features

| Feature | What it does |
| --- | --- |
| 60 stop slots | Add delivery addresses one by one. |
| Bulk paste | Paste a full address list, one stop per line. |
| CSV import | Import a spreadsheet export with addresses. |
| Route ranking | Compare fastest, district-progressive, and balanced route styles. |
| Busy mode | Shows only the top 2 route options when traffic is heavy. |
| Multi-day planning | Splits stops into day-by-day delivery plans. |
| Map handoff | Opens selected routes in Google Maps and Waze. |
| Google segments | Breaks large routes into Google-friendly segments. |
| Local save | Stores the plan in the browser with `localStorage`. |
| CSV export | Downloads the stop list for records or sharing. |
| PWA install | Lets users add RoutePilot to a phone or laptop home screen. |
| Exact pin mode | Optional secure backend verifies real Google pins without exposing the Google key in the browser. |
| Live traffic times | Optional secure backend calls Google Routes API for current drive duration and distance. |
| Mobile-friendly UI | Works on phones, tablets, and laptops. |
| Privacy notice | Explains that saved plans stay in the browser. |

## Run Locally

### Option 1: Open Directly

Open `index.html` in your browser.

That is enough for the main app because RoutePilot is plain HTML, CSS, and JavaScript.

### Option 2: Run A Local Server

From this folder:

```bash
python -m http.server 4177
```

Then open:

```text
http://127.0.0.1:4177
```

## Run Tests

Install test tools:

```bash
npm install
```

Run the smoke tests:

```bash
npm test
```

The tests check that the app loads, starts with 60 slots, shows 10 slots first, creates route options, switches busy mode to 2 options, and creates Google segments for 60-stop plans.

## Secure Google Backend

RoutePilot includes Netlify Functions for production Google Maps access:

```text
netlify/functions/google-geocode.js
netlify/functions/google-route.js
```

Set this environment variable on Netlify:

```text
GOOGLE_MAPS_API_KEY=your_server_side_google_key
```

Enable these Google APIs for that key:

- Geocoding API
- Routes API

Do not put the Google key in `index.html`, `route-optimizer.js`, GitHub, or browser local storage. The frontend calls the backend functions, and the backend calls Google.

## Use On A Phone

The easiest phone-friendly setup is GitHub Pages:

1. Upload this folder to GitHub.
2. Make sure `index.html`, `route-optimizer.css`, and `route-optimizer.js` are in the published folder.
3. Turn on GitHub Pages in the repo settings.
4. Open the GitHub Pages link from your phone.

You can also run a local server from your laptop and open it on your phone using your laptop's local network IP address.

Example:

```text
http://YOUR-LAPTOP-IP:4177
```

Your phone and laptop must be on the same Wi-Fi network.

## How To Use

1. Add the driver's start address.
2. Paste or type delivery stops.
3. Choose trip days, max hours per day, stop time, and traffic mode.
4. Click **Optimize routes**.
5. Review the ranked route options.
6. Choose the route you want.
7. Open the selected route in Google Maps or Waze.

## Current Map Behavior

RoutePilot works without paid APIs by using local preview pins and local route estimates. When the secure backend is deployed with `GOOGLE_MAPS_API_KEY`, the app can verify exact Google pins and refresh route cards with live Google Routes API traffic duration and distance.

Google Maps and Waze are still used as handoff tools for turn-by-turn navigation.

For very large stop lists, Google Maps may limit how many waypoints it opens in a single link. RoutePilot still keeps the full 60-stop plan locally, and the selected route now shows Google Maps segment links so drivers can open the whole route in practical chunks.

## Project Files

```text
index.html
route-optimizer.css
route-optimizer.js
package.json
netlify.toml
manifest.webmanifest
sw.js
netlify/
  functions/
    google-geocode.js
    google-route.js
playwright.config.js
tests/
  routepilot.spec.js
assets/
  routepilot-cover.png
```

## Roadmap

- Add a public Netlify production deployment with `GOOGLE_MAPS_API_KEY`.
- Add smarter waypoint chunking for 25+ Google Maps stops.
- Add saved route profiles for repeat drivers.
- Improve CSV column detection for more spreadsheet formats.

## Privacy

RoutePilot is local-first by default. Address lists are stored in your browser when you click save. If the secure backend is enabled, addresses are sent to the backend only when you verify exact pins or refresh live traffic times.

When you open Google Maps or Waze links, those services handle the navigation data according to their own terms and privacy policies.

## License

RoutePilot is released under the MIT License. See [LICENSE](./LICENSE).
