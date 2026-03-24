# Design System Specification: High-End Medical Editorial

## 1. Overview & Creative North Star: "The Clinical Sanctuary"
This design system moves beyond the generic "SaaS dashboard" to create a space that feels like a high-end, private medical suite. Our Creative North Star is **The Clinical Sanctuary**: an environment that balances the rigorous precision of medical science with the calming, breathable atmosphere of luxury wellness.

To achieve this, we reject the "boxed-in" layout of traditional apps. We utilize **Intentional Asymmetry** and **Negative Space as a Component**. By breaking the rigid 12-column grid with overlapping elements and varied typographic scales, we signal to the user—and investors—that this is a bespoke, premium experience designed for clarity and calm, not just data density.

---

## 2. Color Strategy & The "No-Line" Philosophy
Our palette is rooted in trust, using a spectrum of blues and clinical whites to establish authority.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** To define boundaries, designers must use background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background). This creates a sophisticated, "Apple-esque" seamlessness that feels integrated rather than partitioned.

### Surface Hierarchy & Layering
Treat the UI as a series of physical layers—stacked sheets of frosted glass.
- **Base Layer:** `surface` (#f9f9fe)
- **Content Zones:** `surface-container-low` (#f3f3f8) for secondary information.
- **Active Cards:** `surface-container-lowest` (#ffffff) to provide the highest contrast against the off-white base.
- **Nesting:** Never place two surfaces of the same token next to each other. Always create a "step" in value (e.g., a `surface-container-high` header inside a `surface-container` body).

### Glass & Gradients
For floating elements (Modals, Navigation Bars), use **Glassmorphism**. Apply `surface` at 80% opacity with a `20px` backdrop blur. 
- **Signature Texture:** Primary CTAs should not be flat. Use a subtle linear gradient from `primary` (#0058bc) to `primary-container` (#0070eb) at a 135° angle. This adds "soul" and a tactile, pressable quality.

---

## 3. Typography: Editorial Authority
We use a dual-font system to balance human approachability with clinical data.

| Level | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | High-impact hero stats/marketing headers. |
| **Headline** | `headline-md` | Manrope | 1.75rem | Primary section titles. Bold and authoritative. |
| **Title** | `title-lg` | Inter | 1.375rem | Card headers and modal titles. |
| **Body** | `body-lg` | Inter | 1.0rem | Primary reading experience; optimized for older adults. |
| **Label** | `label-md` | Inter | 0.75rem | Micro-copy and metadata. |

**Editorial Note:** Use `manrope` for numbers. Its geometric nature provides a "medical-grade" precision to health metrics, while `inter` handles the heavy lifting of legibility for body copy.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to create **presence**.

- **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f3f8) background. The 2% shift in brightness is enough to signify elevation without visual clutter.
- **Ambient Shadows:** For floating elements, use a "Cloud Shadow": `Y: 20px, Blur: 40px, Color: rgba(26, 28, 31, 0.04)`. It must feel like a soft glow of light, not a dark drop shadow.
- **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., high-sunlight environments), use `outline-variant` (#c1c6d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Primitive Styles

### Buttons: Accessible Authority
- **Primary:** 135° Gradient (`primary` to `primary-container`), `radius-md` (1.5rem). Minimum height: `4rem` (5.5rem for core actions) to ensure accessibility for older adults.
- **Secondary:** `surface-container-high` background with `on-surface` text. No border.

### Cards & Lists: The "No-Divider" Rule
**Divider lines (HR tags) are forbidden.** 
- To separate list items, use `spacing-4` (1.4rem) of vertical white space. 
- In complex lists, use alternating background tints: `surface` vs `surface-container-low`.
- **Corner Radius:** All cards must use `lg` (2rem) for external containers and `md` (1.5rem) for nested internal elements.

### Progress & Health Indicators
- **Positive:** `tertiary` (#006b27) for success and health-up trends.
- **Alert:** `error` (#ba1a1a) for critical medical alerts. Use a soft `error_container` (#ffdad6) background to prevent "visual panic."

### Input Fields
- **State:** On focus, the background shifts from `surface-container` to `surface-container-lowest` with a `primary` 2px "Ghost Border" (20% opacity). This creates a "lighting up" effect.

---

## 6. Do’s and Don’ts

### Do
- **DO** use the `spacing-12` and `spacing-16` tokens generously. Luxury is defined by the amount of "wasted" space.
- **DO** overlap images or charts over card boundaries slightly (Asymmetry) to create a high-end editorial feel.
- **DO** use "True Blue" (#007AFF) only for actionable items or primary status; use neutrals for everything else.

### Don't
- **DON'T** use pure black (#000000) for text. Use `on-surface` (#1a1c1f) to maintain a soft, premium medical tone.
- **DON'T** use a shadow and a border at the same time. Choose one method of containment and commit to it.
- **DON'T** use sharp corners. A minimum of `sm` (0.5rem) radius is required for even the smallest elements like checkboxes.

---

## 7. Signature Elements
- **The Health Horizon:** Use a very subtle mesh gradient in the background of the `surface` layer, using `primary_fixed` (#d8e2ff) and `surface_bright`. It should be almost imperceptible, giving the app a "living" atmosphere rather than a static white screen.
- **Oversized Stats:** When displaying vital signs (Heart Rate, Sleep), use `display-lg` typography with a `primary` color. This ensures immediate cognitive processing for users with visual impairments.