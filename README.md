# RoutePilot

![RoutePilot cover](./assets/routepilot-cover.png)

**RoutePilot helps delivery drivers turn messy stop lists into smarter route plans that can save time, gas, and daily stress.** Paste addresses, compare the fastest route options, split longer delivery runs across multiple days, and open the route in Google Maps or Waze when it is time to drive.

This is a lightweight static web app. No install, no account, no backend, and no database required.

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
- Verify **exact Google pins** when a Maps key is saved locally on the device.
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
| Exact pin mode | Optional Google geocoding support verifies real map pins when a Maps key is saved locally. |
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

RoutePilot currently uses a local planning engine for route ranking and organization. It does not call a paid routing API yet. Google Maps and Waze are used as handoff tools for real navigation and live traffic confirmation.

The app includes optional exact pin verification with Google Maps. The Maps key is saved only in that browser with `localStorage`; do not commit API keys to the repository. For a larger public launch, move geocoding behind a backend proxy or serverless function so the key is not exposed in browser code.

For very large stop lists, Google Maps may limit how many waypoints it opens in a single link. RoutePilot still keeps the full 60-stop plan locally, and the selected route now shows Google Maps segment links so drivers can open the whole route in practical chunks.

## Project Files

```text
index.html
route-optimizer.css
route-optimizer.js
package.json
playwright.config.js
tests/
  routepilot.spec.js
assets/
  routepilot-cover.png
```

## Roadmap

- Move Google geocoding behind a backend proxy for safer public production use.
- Add optional Google Maps API integration for live duration estimates.
- Add smarter waypoint chunking for 25+ Google Maps stops.
- Add saved route profiles for repeat drivers.
- Improve CSV column detection for more spreadsheet formats.

## Privacy

RoutePilot is local-first. Address lists are stored in your browser when you click save. There is no backend server in this version.

When you open Google Maps or Waze links, those services handle the navigation data according to their own terms and privacy policies.

## License

RoutePilot is released under the MIT License. See [LICENSE](./LICENSE).
