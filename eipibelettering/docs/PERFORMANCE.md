# EIPI Belettering Redesign - Performance Notes

## Performance Principles

- Use real imagery, but optimize and size assets deliberately.
- Keep GSAP ScrollTrigger use focused on high-impact sections.
- Avoid WebGL unless it materially improves a specific visual effect.
- Provide reduced-motion fallbacks.
- Use lighter mobile choreography.
- Avoid layout shifts by defining stable dimensions for fixed-format UI elements.

## Open Performance Work

- Choose final image formats and responsive sizes after assets are acquired.
- Validate page build output.
- Validate mobile layout and reduced-motion behavior.
- Audit animation cost after GSAP sequences are implemented.

## Current Performance Choices

- Three.js/WebGL has not been installed or used.
- Lenis is disabled for users with reduced-motion preference.
- GSAP animations are focused on the hero, the Selected Work reveal, and quiet section reveals.
- Native browser scrolling is used instead of Lenis to keep anchors and touch scrolling predictable.
- Temporary visual surfaces are CSS-based, keeping the first slice light until real images are available.

## Build Checks

- Production build passed after initial visual slice.
- Production build passed after full architecture skeleton.
- Local preview root returned HTTP 200.
- Production build passed after the portfolio destination continuation pass.
- Production build passed after removing pinned scrolling and reducing the typography scale.

## Future Optimization Tasks

- Replace CSS temporary project surfaces with optimized real images.
- Size hero and project images with responsive sources.
- Audit bundle impact after final GSAP choreography is implemented.
- Decide whether Motion remains useful; remove it if not used by the final pass.
