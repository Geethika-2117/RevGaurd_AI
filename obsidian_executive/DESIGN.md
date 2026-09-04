---
name: Obsidian Executive
colors:
  surface: '#16181D'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1F1F23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#303034'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#68dba9'
  on-secondary: '#003825'
  secondary-container: '#25a475'
  on-secondary-container: '#00311f'
  tertiary: '#bfcdff'
  on-tertiary: '#082b72'
  tertiary-container: '#97b0ff'
  on-tertiary-container: '#254188'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#27438a'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
  text-pearl: '#EAECEF'
  muted-slate: '#6B7280'
  border-low: '#2D3748'
  error-red: '#EF4444'
typography:
  display:
    fontFamily: Syne
    fontSize: 80px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.15em
  metric:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.02em
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the elite financial tier, evoking an atmosphere of high-stakes authority and impenetrable security. It rejects the soft, approachable tropes of consumer SaaS in favor of a "FinTech Gothic" aesthetic—a look that is precise, expensive, and technically superior. The brand personality is one of "Hard-Edged Precision," where visual choices prioritize structural rigidity over decorative softness.

The visual style is characterized as **Brutalism with a Luxury Overlay**. It utilizes a dark, obsidian-based color palette to convey depth and permanence, accented by metallic gold to signify value and executive success. By combining the expressive weight of avant-garde display type with the cold efficiency of technical monospaced fonts, the system bridges the gap between high-level executive decision-making and rigorous, machine-level auditability.

## Colors

The color palette is anchored in **Deep Obsidian** (`#0A0B0E`) to establish a sense of architectural depth. 

- **Primary (Brushed Gold):** Reserved exclusively for brand signatures, primary calls to action, and indicators of financial recovery. It is a functional color that signals value.
- **Secondary (Emerald Success):** Strictly utilized for positive deltas, "Verified" statuses, and system-healthy indicators.
- **Surface Hierarchy:** Surfaces utilize a slightly lighter charcoal (`#16181D`) to create a subtle layered hierarchy.
- **Typography Colors:** High-contrast Pearl (`#EAECEF`) is used for primary readability, while Muted Slate is reserved for secondary metadata and timestamps to ensure the visual hierarchy is led by the gold and emerald signals.

## Typography

This system employs a high-contrast typographic pairing that reflects its technical yet authoritative nature.

**Syne** is used for headlines to provide a bold, avant-garde character. Its wider proportions and aggressive weights command attention and signify modern executive power.

**JetBrains Mono** serves as the functional backbone for all body text, data, and labels. It brings a "terminal" aesthetic to the financial ledger, emphasizing the precision of the underlying technology. All data-heavy layouts and metric cards must use this face to ensure perfect vertical alignment. 

**Formatting Rules:**
- Navigation and primary labels always use `label-caps` (uppercase with aggressive 0.15em tracking).
- Financial totals and cryptographic hashes must remain monospaced to ensure character alignment.

## Layout & Spacing

The layout philosophy is built on a rigid, 12-column grid that emphasizes structure and architectural alignment. 

- **Grid Model:** A fixed grid for desktop content (max width 1440px), centered within the viewport. Tablet and mobile layouts transition to a fluid grid with reduced margins.
- **Rhythm:** An 8px base unit governs all padding and margins. 
- **Command Center Pattern:** Dashboards utilize a fixed-height header (120px) and modular metric cards that snap to grid intersections. 
- **Reflow:** On mobile, complex ledger tables reflow into simplified list stacks, maintaining the 1px structural borders and high-contrast color signals. Large gaps (120px+) are used between major sections on desktop to maintain an "executive" sense of whitespace.

## Elevation & Depth

This design system rejects traditional shadows. Depth is communicated through **structural layering** and **tonal contrast** rather than physical metaphors of light.

- **Flat Layering:** Z-axis depth is achieved by nesting darker surfaces (`#0A0B0E`) within lighter containers (`#16181D`), or vice versa.
- **Hard Outlines:** 1px solid borders in `border-low` define the boundaries of all containers.
- **Technical Glow:** To highlight critical gold elements, a subtle radial background glow (15% opacity primary gold) can be used to simulate "screen glare" or digital luminescence.
- **Interactive Lift:** On hover, interactive elements do not use shadows. They utilize a -4px Y-axis translation and a 1px border shift to the primary gold color.

## Shapes

The shape language is strictly **architectural and sharp**. Every UI element—including buttons, cards, input fields, and modals—uses a 0px border radius. 

This rejection of roundedness reinforces the "Bank-Grade" authority of the product, creating a look that is precise, immutable, and rigid. All dividers and structural lines must be exactly 1px thick, reinforcing the grid-based construction of the interface. Corner accents (2x2px solid gold blocks) may be used on the corners of featured containers to simulate a "targeting" or "technical scan" UI.

## Components

### Buttons
- **Primary:** Solid 1px gold border, 0px radius, uppercase `label-caps` text. On hover, the button fills with gold and the text shifts to obsidian.
- **Ghost:** Transparent background, 1px slate border. On hover, the border transitions to gold.

### Cards & Metrics
- **Metric Cards:** Charcoal background, 1px slate border. Featured metrics receive a 2px top border in gold.
- **Data Cards:** 1px slate border with zero padding on the container; content is inset via internal 24px padding.

### Inputs & Form Fields
- **Text Inputs:** Sharp 0px corners, obsidian background, 1px slate border. On focus, the border flashes gold.
- **Labels:** Positioned strictly above the input field using `label-caps`.

### Indicators & Status
- **Success Badges:** Emerald text with a 1px emerald border; no background fill.
- **Status Ledger:** Uses horizontal 1px slate dividers to separate audit trails. Each entry includes a monospaced timestamp.

### Progress & Loading
- **Executive Line:** A 1px gold horizontal line that expands from the center.
- **Nodes:** Strategic list items may pulse from charcoal to gold to indicate background cryptographic processing.