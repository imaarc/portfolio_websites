# Codex Handoff Summary - EIPI Belettering Redesign

## Goal

Continue and implement the EIPI Belettering landing-page UI/UX redesign that began in the referenced ChatGPT planning conversation "React Landing Page UI Plan".

The redesign is a trial improvement of the live site at https://www.eipibelettering.nl/. The user does not have original project files, so the project started from public website content, a referenced ChatGPT planning history, and an uploaded original EIPI logo image.

## Repository / Workspace Context

Original working folder:

`C:\Users\Lenovo\Documents\Codex\2026-09-02\referenced-chatgpt-conversation-this-is-an`

React app created in:

`C:\Users\Lenovo\Documents\Codex\2026-09-02\referenced-chatgpt-conversation-this-is-an\eipi-redesign`

Transferred portfolio destination:

`C:\Users\Lenovo\OneDrive\Documents\portfolio\_websites\eipibelettering`

The destination contains the editable project source and docs. Generated folders were intentionally not transferred: `node_modules`, `.next`, `.vinext`, `.wrangler`, `dist`, and `.git`.

## Tech Stack

- React 19
- Vinext / Sites scaffold
- Tailwind CSS / shadcn foundation
- GSAP + ScrollTrigger
- Lenis
- SplitType
- Motion installed for later micro-interactions
- Three.js not installed; WebGL remains conditional

## Established Decisions

- Preserve the recognizable EIPI identity for the trial redesign.
- Use the uploaded original EIPI logo initially.
- Consider a simplified compact web variant later, but do not perform a full rebrand yet.
- Visual identity: near-black/charcoal base, off-white typography, gray secondary text, EIPI red accent.
- Real EIPI project photography should drive the final design.
- Because public WordPress asset extraction hit HTTP 429, temporary signage-inspired CSS surfaces are currently used where project photos should eventually go.
- Use GSAP + ScrollTrigger for major scroll choreography.
- Use Lenis for smooth scrolling unless reduced motion is requested.
- Use SplitType for hero text reveal.
- Use Motion only where helpful.
- Use Three.js/WebGL only if a specific image/signage effect justifies it.
- Motion should alternate between high-impact and quiet sections.
- Mobile needs purpose-built fallbacks.
- Maintain detailed documentation throughout the project.

## Implemented So Far

The new React app has a first-pass full homepage skeleton:

1. Fixed navigation with EIPI logo
2. Hero: "SHOW WHO YOU ARE."
3. Selected Work opening section
4. What We Do service list
5. Impact section featuring 160,000+ monthly contact moments
6. Why Eipi manifesto section
7. Recent Projects experimental layout
8. Custom-design brand statement
9. Three advantages: Consistency, Materials, Transparency
10. Testimonial
11. Start a Project contact section
12. Footer

Main files:

- `app/page.tsx`
- `app/sections/eipi-landing.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `public/eipi-logo-original.png`
- `docs/DEVELOPMENT_LOG.md`
- `docs/UI_UX_DECISIONS.md`
- `docs/DEBUGGING_LOG.md`
- `docs/PERFORMANCE.md`
- `docs/ASSET_MANIFEST.md`

## Validation

- Production build passed.
- Local preview route returned HTTP 200.
- Local preview was started at `http://localhost:3000/`.
- A private Sites project was created and version 1 was saved.
- Private Sites deployment started but remained in `publishing` without returning a production URL or failure message.

## Known Issues

- Public asset extraction from the current WordPress site is incomplete due HTTP 429 rate limiting.
- Temporary visual surfaces must be replaced with real EIPI project photography.
- Sites production deployment did not complete during the session.
- Scaffold install reported dependency audit warnings. Do not run forced fixes casually; schedule a dependency/security pass.
- Contact form is presentational only at this stage.
- Selected Work is not yet a pinned scroll-controlled project sequence.

## Next Steps

1. Install dependencies in the portfolio destination with npm.
2. Run the local preview from the destination folder.
3. Replace temporary project surfaces with real EIPI assets once safely acquired.
4. Implement pinned Selected Work with GSAP ScrollTrigger.
5. Add desktop service-hover image previews and mobile tap/scroll fallbacks.
6. Add stronger contact form behavior, validation, and success state.
7. Add Open Graph/social preview.
8. Run responsive and reduced-motion QA.
9. Recheck Sites deployment status or redeploy after the next build.
10. Keep updating all docs after every meaningful change.
