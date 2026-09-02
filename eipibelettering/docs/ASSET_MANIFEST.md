# EIPI Belettering Redesign - Asset Manifest

## Brand Assets

| Asset                        | Source                                                                                | Local Path                                                          | Status           | Notes                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Original EIPI logo reference | Uploaded in referenced ChatGPT conversation                                           | `work/assets/brand/eipi-logo-original.png`                          | Archived locally | Large serif EIPI mark, red gradient block, gray outline/text, long red underline.                     |
| App logo copy                | Local project copy of uploaded reference                                              | `eipi-redesign/public/eipi-logo-original.png`                       | In use           | Used in fixed navigation for first visual slice.                                                      |
| Current logo reference       | User-provided PNG from Downloads                                                      | `C:\Users\Lenovo\Downloads\Eipi_belettering-en-gevelreclame-bv.png` | Source reference | Used as the visual reference for the modernized SVG lockup.                                           |
| Modern web logo              | Deterministic SVG derived from the current logo cues                                  | `public/eipi-logo-modern.svg`                                       | In use           | Transparent horizontal lockup for the website header; keeps EIPI, descriptor text, and red underline. |
| Compact modern mark          | Deterministic SVG derived from the modern logo                                        | `public/eipi-logo-mark.svg`                                         | Available        | Compact EIPI mark for favicon/social/avatar-style use if needed later.                                |
| Social preview card          | Generated with built-in image generation from the established EIPI redesign direction | `public/og.png`                                                     | In use           | Landscape Open Graph preview with exact text "SHOW WHO YOU ARE." and "EIPI Belettering".              |

## Website Assets

Status: Real Selected Work images added; broader site asset discovery remains partial.

| Asset                          | Source                                   | Local Path                                  | Status | Notes                                                                                                          |
| ------------------------------ | ---------------------------------------- | ------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| Truck lettering image          | User-provided project asset              | `public/truck_lettering.png`                | In use | Used in Selected Work card 01.                                                                                 |
| Vehicle lettering image        | User-provided project asset              | `public/vehicle_lettering.png`              | In use | Used in Selected Work card 02 and What We Do service preview.                                                  |
| Banner flags image             | User-provided project asset              | `public/banner_flags.png`                   | In use | Used in Selected Work card 03 and What We Do service preview.                                                  |
| Facade signage image           | User-provided project asset              | `public/facade_signage.jpg`                 | In use | Used in What We Do service preview.                                                                            |
| Interior signing image         | User-provided project asset              | `public/interior.jpg`                       | In use | Used in What We Do service preview.                                                                            |
| Wayfinding image               | User-provided project asset              | `public/wayfinding.jpg`                     | In use | Used in What We Do service preview.                                                                            |
| Banner image                   | User-provided project asset              | `public/banner.webp`                        | In use | Used in What We Do service preview.                                                                            |
| Decorative window film         | User-provided project asset              | `public/decorative_window_film.jpg`         | In use | Used in Recent Projects.                                                                                       |
| Mercedes car wrap              | User-provided project asset              | `public/mercedes_car_wrap.jpg`              | In use | Used in Recent Projects.                                                                                       |
| Bouwmeesters image             | User-provided project asset              | `public/boumeesters.jpg`                    | In use | Used in Recent Projects.                                                                                       |
| Hoogland image                 | User-provided project asset              | `public/hoogland.jpg`                       | In use | Used in Recent Projects.                                                                                       |
| Advantage consistency image    | Generated with built-in image generation | `public/advantage_consistency.png`          | In use | Generated 4:3 signage-system visual for the Consistency card.                                                  |
| Advantage materials image      | Generated with built-in image generation | `public/advantage_materials.png`            | In use | Generated 4:3 vinyl/acrylic/metal material visual for the Materials card.                                      |
| Advantage transparency image   | Generated with built-in image generation | `public/advantage_transparency.png`         | In use | Generated 4:3 quote/planning desk visual for the Transparency card.                                            |
| Hero vehicle/facade background | Generated with built-in image generation | `public/hero_vehicle_facade_background.png` | In use | Generated wide hero background showing vehicle lettering and facade signage with dark center-safe composition. |
| Spare Rib Express truck        | User-provided project asset              | `public/Spare-Rib-Expres-scaled.jpg`        | In use | Used in the brand story/contact-moments split section.                                                         |

Known issue:

- Previous public asset extraction from `https://www.eipibelettering.nl/` hit HTTP 429 rate limiting.

Next steps:

- Rebuild a careful source URL list before downloading.
- Record source URL, original filename, dimensions, usage, and optimization status for every local asset.
- Use temporary project-specific placeholders only where real assets are not yet available.
