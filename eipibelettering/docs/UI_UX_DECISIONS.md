# EIPI Belettering Redesign - UI/UX Decisions

## Decision #001 - Preserve Recognizable EIPI Identity

Status: Accepted  
Source phase: #003 Brand Direction

Use the existing EIPI logo as the starting point for the visual identity. The mark is somewhat dated, but it is recognizable and carries the company's existing brand equity. A trial redesign should modernize presentation before replacing identity.

Implications:

- Keep the EIPI name prominent.
- Use the red underline as a recurring motif.
- Use charcoal, off-white, gray, and EIPI red as the core palette.
- Explore a simplified web/nav variant only after the main direction is stable.

## Decision #002 - Photography Drives the Design

Status: Accepted  
Source phase: #003 Brand Direction

The redesigned page should use real EIPI project photography as its primary visual material.

Implications:

- Prefer large image crops over generic cards.
- Selected Work and Recent Projects should feel immersive.
- Temporary placeholders may be used only until local assets are acquired.
- Asset provenance must be recorded in the asset manifest.

## Decision #003 - Motion Has Rhythm

Status: Accepted  
Source phase: #004 Homepage Experience Map

The site should not animate everything. High-impact scroll choreography should alternate with quieter sections.

Implications:

- Hero and Selected Work can be intense.
- Services should be interactive but calmer.
- Why Eipi and Advantages should slow the experience down.
- Respect `prefers-reduced-motion`.
- Mobile should use purpose-built fallbacks instead of forcing desktop choreography onto small screens.

## Decision #004 - WebGL Is Conditional

Status: Accepted  
Source phase: #003/#004

Three.js/WebGL should only be used if a specific visual effect meaningfully improves the experience.

Initial implication:

- Start with GSAP, ScrollTrigger, CSS, and native image presentation.
- Revisit WebGL only for project-image transitions or signage-light effects if standard techniques feel insufficient.

## Decision #005 - #005 Visual Design Direction

Status: Started

Visual design should feel industrial, premium, bold, and practical. The page should demonstrate visibility: large type, sharp contrast, physical signage imagery, and a confident red line system.

Initial tokens:

- Base: near-black / charcoal
- Text: off-white
- Secondary text: cool gray
- Accent: EIPI red
- Corners: restrained, 8px or less for cards/items
- Layout: full-width bands, large typography, minimal nested panels

## Decision #006 - Temporary Visual Surfaces Before Final Photography

Status: Accepted as interim

Because public WordPress asset extraction remains incomplete due HTTP 429 rate limiting, the first #005 implementation uses the uploaded logo plus signage-inspired temporary surfaces. These are not final replacements for real EIPI project photography.

Implications:

- The visual system can be evaluated immediately.
- All temporary project imagery must be replaced with sourced EIPI photography once assets are safely archived.
- The asset manifest must distinguish between source assets and interim design surfaces.

## Decision #007 - First Slice Scope

Status: Accepted

The first implementation slice covers the navigation, hero, selected-work opening, service list, impact claim, and contact band. This makes the visual direction recognizable without pretending the full homepage is complete.

## Decision #008 - Full Architecture Before Final Imagery

Status: Accepted

After the first preview slice, the page was expanded to include every planned homepage section as a coherent skeleton before final EIPI photography was available.

Rationale:

- This lets the full pacing and alternation of loud/quiet sections be evaluated early.
- It prevents the design from becoming a polished hero with no downstream UX.
- It keeps asset replacement as a clear follow-up rather than a blocker for structure.

## Decision #009 - Selected Work Carousel

Status: Accepted

The Selected Work section briefly used pinned horizontal movement, then a direct grid. After UI review, the grid was replaced with a focused carousel that gives one project visual priority at a time.

Rationale:

- The prototype needs reliable, easy scanning more than a cinematic scroll effect.
- The pinned sequence made the page feel stretched and less predictable.
- The carousel keeps the section more premium and controlled, with arrow controls, thumbnail selection, and click-to-view image enlargement.
- Project images use contained fitting so trucks, vans, and flags stay fully visible without awkward cropping.

## Decision #010 - Presentational Contact State First

Status: Accepted as interim

The contact form now validates required fields and shows a success state, but it does not send data yet.

Rationale:

- This lets the conversion interaction be evaluated in the prototype.
- Final submission behavior should be wired only after the preferred destination is known.

## Decision #011 - Calmer Editorial Scale

Status: Accepted

The first full skeleton pushed headings too large for practical browsing. The current type system keeps the EIPI boldness but reduces the hero, section, impact, brand, testimonial, and mobile heading clamps.

Rationale:

- EIPI should still feel confident and visible.
- The page should be easy to read and move through on normal laptop and mobile viewports.
- Oversized typography should be reserved for specific moments, not every section.

## Decision #012 - Modernized Logo Without Rebrand

Status: Accepted

The current logo was modernized as a transparent SVG lockup for web use rather than regenerated as a raster image.

Rationale:

- Logo text must stay exact and crisp at every size.
- The new mark keeps recognizable EIPI cues: red block, bold wordmark, descriptor, and red underline.
- The dated outlined serif treatment was replaced with a cleaner, heavier sans-serif system that matches the website's dark, direct visual language.

## Decision #013 - Reviews Use Infinite Carousel, Not Scrollbar

Status: Accepted

Client reviews should feel like a polished moving brand strip rather than a raw horizontal overflow area.

Rationale:

- Native visible scrollbars looked unfinished for this section.
- Embla Carousel provides looped swipe/drag behavior with React cleanup, and the official Auto Scroll plugin provides smooth continuous movement.
- The review rail should show five desktop positions with permanent left/right gradient fades so edge cards soften in and out.
- The page itself must never gain horizontal overflow from the carousel track.
