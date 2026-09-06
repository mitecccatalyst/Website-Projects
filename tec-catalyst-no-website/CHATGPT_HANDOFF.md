# ChatGPT → Claude Code Handoff

## Project
TEC CATALYST — No-Website Lead Engine → Daily Website Production

## Current operating objective
TEC CATALYST wants to identify Canadian local businesses with active Google Business Profiles but no verified standalone website, qualify them, then build prospect-specific website demos as a foot-in-the-door asset.

The business owner's existing Google reputation is treated as proof of demand. The website demo is positioned as the missing conversion layer between discovery and revenue — not as an insult that the business “needs a website.”

## Daily production target
**10 new review-ready prospect-demo websites every day.**

Every site is for TEC CATALYST internal review first. The user will inspect the initial product and provide edits. Do not publish or contact the prospect.

## Current division of labor
### ChatGPT
- lead discovery / research
- no-website verification
- qualification / prioritization
- daily queue creation
- QA / red-team review of Claude output
- outreach strategy after user approval

### Claude Code
- high-end frontend execution
- cinematic motion implementation
- advanced UI/UX
- responsive build
- interaction polish
- code cleanup
- local QA before commit

### User
- final creative approval
- requested edits
- outreach / closing decisions

## Commercial design principle
One primary commercial leak → one primary demo → one dominant CTA.

Do not pitch the entire TEC CATALYST service stack inside each site.

Typical objective for no-website businesses:
`Google/Maps discovery → stronger trust/service clarity → request service/book/call`

## UX expectations
The user specifically wants:
- premium, modern, high-end UI/UX
- cinematic moving hero backgrounds catered to the business's service
- cohesive brand/service imagery and motion
- multiple CTA opportunities throughout the page
- strong mobile presentation
- high perceived build quality

Repeated CTA does not mean random buttons. The repeated action should serve the same conversion objective.

## Motion philosophy
Choose the visual metaphor from the industry/service.

Examples:
- automotive: controlled speed trails, metallic light, diagnostic/HUD motifs, mechanical motion
- barbers: editorial spotlight, reflective surfaces, subtle neon, precise sweep motion
- home service: blueprint geometry, airflow, energy paths, system flow

Keep motion performant and subordinate to text/CTA readability.

## Accuracy firewall
Do not fabricate:
- owners
- emails
- hours
- prices
- testimonials
- certifications
- awards
- guarantees
- years operating
- service claims not supported by evidence

Use `UNKNOWN` or omit unsupported details.

## Prior work
Five early concept demos existed for:
- Grip and Go Tire + Auto Services
- VM Auto Care Inc.
- Mechanical Edge Automotive
- Silver Mile Service Centre
- Clipz N Cutz Barber Shop

They were useful as design experiments but are **not** the quality ceiling. Claude is expected to improve substantially on frontend quality, motion, polish, composition, and responsiveness.

## Lead verification lesson
A prior false positive was discovered: APA Automotive had an actual standalone website (`apaauto.ca`) even though the directory source suggested no website. Therefore every queued business must be rechecked before build.

## Output standard
For each business commit a self-contained reviewable build under:

`tec-catalyst-no-website/builds/YYYY-MM-DD/<business-slug>/`

Include a README explaining:
- verified business facts used
- primary CTA
- design concept
- cinematic background concept
- implementation choices
- UNKNOWN fields
- QA result

Create the daily review summary under:
`tec-catalyst-no-website/reviews/YYYY-MM-DD.md`

## Workflow
1. Read `CLAUDE.md`.
2. Read today's queue in `queues/`.
3. Reverify every selected prospect has no standalone site.
4. Replace false positives from the replacement queue.
5. Build 10 websites.
6. Test 1440 / 768 / 390 widths.
7. Commit all builds and the daily review report.
8. Stop for TEC CATALYST review.

## Review loop
After Claude commits the work, ChatGPT will inspect the repository, review the builds, identify defects/conversion issues, and return a revision list. The user will also provide subjective design edits. Claude should implement approved changes in the repo and keep the review trail clear.
