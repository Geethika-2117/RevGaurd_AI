---
name: Obsidian Executive
colors:
  surface: '#16181D'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
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
  text-primary: '#EAECEF'
  text-muted: '#6B7280'
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
    fontSize: 36px
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
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is engineered for the elite financial tier, evoking an atmosphere of high-stakes authority and impenetrable security. It rejects the soft, approachable tropes of consumer SaaS in favor of a "Bank-Grade" brutalist aesthetic. The personality is precise, expensive, and technically superior.

By combining the expressive weight of avant-garde display type with the cold efficiency of developer-centric monospaced fonts, the system bridges the gap between executive-level decision-making and rigorous auditability. The visual style is defined by heavy contrast, architectural rigidity, and a singular focus on value, where gold is used as a technical indicator of recovery and profit.

## Colors

The palette is anchored in "Deep Obsidian" to establish a sense of depth and permanence. Gold is the primary functional color, reserved exclusively for brand signatures, primary calls to action, and indicators of financial success.

- **Primary (Brushed Gold):** Used for highlighting value, active states, and critical metric connections.
- **Secondary (Emerald Success):** Strictly reserved for positive deltas, recovery indicators, and "system healthy" states.
- **Background & Surface:** The base is a near-black obsidian, while surfaces utilize a slightly lighter charcoal to create a subtle layered hierarchy without relying on traditional elevation.
- **Text:** High-contrast pearl for readability, with slate gray used for secondary metadata to ensure the visual hierarchy is led by the gold and emerald signals.

## Typography

This design system employs a high-contrast typographic pairing that reflects its technical yet authoritative nature.

**Syne** is used for headlines to provide a bold, avant-garde character. Its wider proportions and aggressive weights command attention and signify a modern, experimental approach to executive power.

**JetBrains Mono** serves as the functional backbone for all body text, data, and labels. It brings a "terminal" aesthetic to the financial ledger, emphasizing the precision of the underlying technology. All data-heavy layouts and metric cards must use this monospaced face to ensure perfect vertical alignment and a technical, "un-designed" look.

## Layout & Spacing

The layout philosophy is built on a rigid, 12-column grid that emphasizes structure and architectural alignment. 

- **Grid:** A fixed grid for desktop content with a max width of 1440px, transitioning to a fluid layout for tablet and mobile devices. 
- **Rhythm:** An 8px base unit governs all padding and margins. Vertical rhythm is expansive, using large gaps (120px+) between major sections to allow the high-contrast elements to breathe.
- **Dashboards:** Use a "Command Center" pattern with a fixed-height executive header (120px) and modular metric cards that snap to grid intersections.
- **Reflow:** On mobile, complex ledger tables should transition to simplified list views, maintaining the strict sharp-edged borders and high-contrast color signals.

## Elevation & Depth

This design system rejects traditional shadows. Depth is communicated through **structural layering** and **tonal contrast** rather than physical metaphors.

- **Flat Depth:** Layers are distinguished by switching between the Deep Obsidian background and the Charcoal surface color.
- **Hard Outlines:** 1px solid borders in low-contrast slate define the boundaries of containers. 
- **Technical Glows:** For primary gold elements, a subtle radial background glow (15% opacity primary color) may be used to simulate a technical luminescence or "screen glare," but it should never appear as a soft drop shadow.
- **Active State Lift:** Interactive elements do not use shadows on hover; instead, they utilize a -4px Y-axis translation combined with a color shift to primary gold.

## Shapes

The shape language is strictly **architectural and sharp**. Every UI element—including buttons, cards, input fields, and modals—uses a 0px border radius. 

This rejection of rounded corners reinforces the "Bank-Grade" authority of the product, moving away from consumer-friendly aesthetics toward a look that is precise, technical, and rigid. Dividers and structural lines must be exactly 1px thick, reinforcing the grid-based construction of the interface.

## Components

### Buttons
- **Primary:** Solid gold border, 0px radius, uppercase JetBrains Mono text. On hover, fills with gold and changes text to obsidian.
- **Ghost:** Transparent background, slate border. On hover, the border changes to gold.

### Cards & Containers
- **Metric Cards:** Charcoal background, 1px slate border. Top border becomes 2px gold for "active" or "highlighted" metrics.
- **Content Cards:** No padding on the outer container; content is inset via the 8px grid.

### Inputs & Form Fields
- **Text Inputs:** Sharp 0px corners, obsidian background, 1px slate border. The border flashes gold when focused.
- **Labels:** Always use the `label-caps` typography style, positioned strictly above the input.

### Indicators & Badges
- **Success Indicators:** Emerald text with a 1px emerald border. No background fill.
- **Error Indicators:** Red text with a 1px red border.
- **Status Ledger:** Uses horizontal dividers (1px solid slate) to separate audit trails. Each entry is timestamped in the monospaced body font.

### Progress & Loading
- **Linear:** A single 1px gold line that expands from the center of its container.
- **Pulse:** Strategic nodes in a graph or list pulse from charcoal to gold to indicate background processing.