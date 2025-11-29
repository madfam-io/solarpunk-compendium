# Codex Design System

A skeuomorphic design language for digital publications that bridges the tactile warmth of print with the possibilities of digital media.

> "The best interface is one that feels like it was always meant to exist."

## Philosophy

Codex reimagines digital reading by drawing from:
- **Almanacs & Field Guides** - Practical, well-worn, passed between hands
- **Letterpress & Risograph** - Imperfect, textured, human
- **Solarpunk Aesthetics** - Organic meets technological, hopeful futures
- **Slow Media** - Intentional consumption, bounded experiences

### Design Principles

1. **Tactile Presence** - Digital elements should feel like they have weight and texture
2. **Bounded Reading** - Editions have edges; not infinite scroll
3. **Seasonal Rhythm** - UI reflects the turning of seasons
4. **Accessible Craft** - Skeuomorphism enhances, never hinders
5. **Progressive Enhancement** - Works without JS, delights with it

---

## Visual Language

### Paper & Texture

```
┌─────────────────────────────────────────────────────────────┐
│  PAPER GRADES                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ░░░░░░░░░░   Newsprint      - Articles, body text          │
│  ▒▒▒▒▒▒▒▒▒▒   Laid Paper     - Feature articles, essays     │
│  ▓▓▓▓▓▓▓▓▓▓   Card Stock     - Covers, section dividers     │
│  ██████████   Kraft Paper    - Tools, practical guides      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**CSS Custom Properties:**
```css
:root {
  /* Base paper colors */
  --codex-paper-white: #faf8f5;
  --codex-paper-cream: #f5f0e6;
  --codex-paper-aged: #e8e0d0;
  --codex-paper-kraft: #c9b99a;

  /* Texture overlays (SVG noise) */
  --codex-texture-grain: url('/textures/grain.svg');
  --codex-texture-fiber: url('/textures/fiber.svg');
  --codex-texture-linen: url('/textures/linen.svg');

  /* Paper shadows */
  --codex-shadow-page: 0 1px 3px rgba(0,0,0,0.08),
                        0 4px 12px rgba(0,0,0,0.05);
  --codex-shadow-lifted: 0 8px 30px rgba(0,0,0,0.12),
                          0 2px 8px rgba(0,0,0,0.08);
}
```

### Ink & Typography

```
┌─────────────────────────────────────────────────────────────┐
│  INK COLORS                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ████  Carbon Black    #1a1a18   - Body text, headings      │
│  ████  Sepia Ink       #3d3225   - Captions, metadata       │
│  ████  Forest Green    #2d4a3e   - Links, accents           │
│  ████  Rust Orange     #b85c38   - Highlights, warnings     │
│  ████  Indigo Blue     #3d4f7c   - Info boxes, quotes       │
│                                                              │
│  Seasonal Accent Inks:                                       │
│  ████  Spring Sprout   #7cb342   - Vernal equinox          │
│  ████  Summer Gold     #f9a825   - Summer solstice         │
│  ████  Autumn Ember    #d84315   - Autumnal equinox        │
│  ████  Winter Frost    #4fc3f7   - Winter solstice         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Typography Scale:**
```css
:root {
  /* Serif for body (reading) */
  --codex-font-body: 'Literata', 'Georgia', serif;

  /* Sans for UI elements */
  --codex-font-ui: 'Inter', system-ui, sans-serif;

  /* Display for titles */
  --codex-font-display: 'Fraunces', 'Playfair Display', serif;

  /* Mono for tools/data */
  --codex-font-mono: 'JetBrains Mono', monospace;

  /* Type scale (1.25 ratio) */
  --codex-text-xs: 0.64rem;    /* 10px */
  --codex-text-sm: 0.8rem;     /* 13px */
  --codex-text-base: 1rem;     /* 16px */
  --codex-text-lg: 1.25rem;    /* 20px */
  --codex-text-xl: 1.563rem;   /* 25px */
  --codex-text-2xl: 1.953rem;  /* 31px */
  --codex-text-3xl: 2.441rem;  /* 39px */
  --codex-text-4xl: 3.052rem;  /* 49px */
}
```

### Page Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─ Fore-edge (right side, slight shadow) ─────────────────┐ │
│ │                                                          │ │
│ │  ┌─ Running Header ───────────────────────────────────┐ │ │
│ │  │  Edition Title              Section    Page Number │ │ │
│ │  └────────────────────────────────────────────────────┘ │ │
│ │                                                          │ │
│ │  ┌─ Content Area ─────────────────────────────────────┐ │ │
│ │  │                                                     │ │ │
│ │  │   Article Title                                    │ │ │
│ │  │   ═══════════════                                  │ │ │
│ │  │                                                     │ │ │
│ │  │   Body text with proper measure (65-75 chars)      │ │ │
│ │  │   for comfortable reading. Generous line height    │ │ │
│ │  │   (1.6-1.8) for the texture to breathe.           │ │ │
│ │  │                                                     │ │ │
│ │  │   ┌─ Pull Quote ─────────────────────────────┐     │ │ │
│ │  │   │ "Meaningful callout with decorative      │     │ │ │
│ │  │   │  borders inspired by woodcut prints"     │     │ │ │
│ │  │   └──────────────────────────────────────────┘     │ │ │
│ │  │                                                     │ │ │
│ │  │   ┌─ Margin Note ──┐                               │ │ │
│ │  │   │ Contextual     │  More body text continues     │ │ │
│ │  │   │ annotation     │  alongside margin notes for   │ │ │
│ │  │   │ in smaller     │  supplementary information.   │ │ │
│ │  │   │ type           │                               │ │ │
│ │  │   └────────────────┘                               │ │ │
│ │  │                                                     │ │ │
│ │  └─────────────────────────────────────────────────────┘ │ │
│ │                                                          │ │
│ │  ┌─ Folio ────────────────────────────────────────────┐ │ │
│ │  │           ◆  12  ◆           [Bookmark] [Share]   │ │ │
│ │  └────────────────────────────────────────────────────┘ │ │
│ │                                                          │ │
│ └─ Gutter (left side, deeper shadow into spine) ──────────┘ │
│                                                              │
│  ▓▓▓ Page edges visible (stacked pages effect) ▓▓▓         │
└─────────────────────────────────────────────────────────────┘
```

---

## Reading Modes

### Mode 1: Flow (Default)

Modern vertical scroll with skeuomorphic touches:
- Paper texture background
- Soft page shadows
- Section dividers with decorative rules
- Progress indicator as page numbers

```
┌─────────────────┐
│  ┌───────────┐  │
│  │  Article  │  │  ← Current viewport
│  │  Content  │  │
│  │           │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │  Next     │  │  ← Below fold
│  │  Section  │  │
│  └───────────┘  │
│        ↓        │
└─────────────────┘
    Scroll indicator
```

### Mode 2: Codex (Page-flip)

Magazine-style spreads with page turn animations:
- Two-page spreads on desktop
- Single page on mobile
- Swipe or click to turn
- Page curl on hover (corner)

```
┌─────────────────────────────────────────┐
│  ┌─────────────┐ │ ┌─────────────┐      │
│  │             │ │ │             │      │
│  │   Page 2    │ │ │   Page 3    │   ┐  │
│  │   (verso)   │ │ │   (recto)   │   │  │
│  │             │ │ │             │   │  │ ← Page curl hint
│  │             │ │ │             │ ──┘  │
│  └─────────────┘ │ └─────────────┘      │
│                  │                       │
│        Spine     │     Click to turn →  │
└─────────────────────────────────────────┘
```

### Mode 3: Focus (Distraction-free)

Minimal chrome, maximum immersion:
- Centered column
- No navigation visible
- Keyboard/gesture only
- Optional ambient soundscape

```
┌─────────────────────────────────────────┐
│                                          │
│                                          │
│         Just the words.                  │
│                                          │
│         Nothing else.                    │
│                                          │
│         Breathe.                         │
│                                          │
│                                          │
└─────────────────────────────────────────┘
```

---

## Interactive Elements

### Bookmarks & Dog-ears

```svelte
<Bookmark
  style="ribbon"      <!-- ribbon | dog-ear | tab -->
  color="seasonal"    <!-- Uses current season accent -->
  position="top-right"
/>
```

Visual states:
```
   Ribbon          Dog-ear         Tab
   ┌────┐         ┌──────┐       ┌──────┐
   │████│         │    ◢│       │▓▓▓▓▓▓│
   │████│         │     │       └┬─────┘
   │████│         │     │        │
   │ ▼  │         │     │        │
   └────┘         │     │        │
                  │     │        ▼
```

### Page Turn Animation

```
Frame 1        Frame 2        Frame 3        Frame 4
┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
│      │      │    ╱ │      │  ╱   │      │      │
│  A   │  →   │  A╱  │  →   │ ╱ B  │  →   │  B   │
│      │      │  ╱   │      │╱     │      │      │
└──────┘      └──────┘      └──────┘      └──────┘

- 300ms ease-out timing
- Subtle shadow follows curl
- Paper texture visible on back
- Optional page flip sound
```

### Progress & Navigation

```
Edition Progress (Top)
━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━
                   │
            You are here (pg 23 of 48)

Section Navigator (Thumb index)
┌───────────────────────────────────────────┐
│  ▸ Introduction                           │
│  ▸ The Return of the Light                │
│  ▾ Passive Solar Design  ←── Current     │
│      └─ Principles                        │
│      └─ Case Studies                      │
│      └─ DIY Guide                         │
│  ▸ Community Mapping                      │
│  ▸ Seasonal Wellness                      │
└───────────────────────────────────────────┘
```

---

## Seasonal Theming

The UI subtly shifts with each edition's season:

### Winter Solstice (Dec 21)
```css
.season-winter {
  --codex-accent: var(--winter-frost);
  --codex-paper: #f8fafc;           /* Cooler white */
  --codex-texture: var(--frost-grain);
  --codex-ornament: url('/ornaments/snowflake.svg');
}
```
- Cooler paper tones
- Frost-like textures
- Candlelight warm accents
- Bare branch ornaments

### Spring Equinox (Mar 20)
```css
.season-spring {
  --codex-accent: var(--spring-sprout);
  --codex-paper: #fafdf7;           /* Slight green tint */
  --codex-texture: var(--seed-grain);
  --codex-ornament: url('/ornaments/seedling.svg');
}
```
- Fresh, bright paper
- Seed/sprout motifs
- Morning dew textures
- Budding ornaments

### Summer Solstice (Jun 21)
```css
.season-summer {
  --codex-accent: var(--summer-gold);
  --codex-paper: #fffdf5;           /* Warm, sun-bleached */
  --codex-texture: var(--sun-grain);
  --codex-ornament: url('/ornaments/sunburst.svg');
}
```
- Sun-warmed paper
- Golden hour tones
- Linen textures
- Radiating ornaments

### Autumn Equinox (Sep 22)
```css
.season-autumn {
  --codex-accent: var(--autumn-ember);
  --codex-paper: #fdf8f3;           /* Aged, warm */
  --codex-texture: var(--leaf-grain);
  --codex-ornament: url('/ornaments/oak-leaf.svg');
}
```
- Aged paper warmth
- Harvest colors
- Pressed leaf textures
- Falling leaf ornaments

---

## Sound Design (Optional)

Ambient soundscapes enhance immersion when enabled:

| Sound | Trigger | Description |
|-------|---------|-------------|
| `page-turn.mp3` | Page flip | Soft paper rustle |
| `bookmark.mp3` | Add bookmark | Ribbon placement |
| `ambient-fire.mp3` | Winter reading | Crackling hearth |
| `ambient-rain.mp3` | Reading mode | Gentle rainfall |
| `ambient-birds.mp3` | Spring/Summer | Garden soundscape |

```svelte
<CodexAudio
  ambience="seasonal"    <!-- off | seasonal | custom -->
  interactions={true}    <!-- Page turns, bookmarks -->
  volume={0.3}
/>
```

---

## Component Architecture

```
codex/
├── styles/
│   ├── tokens.css           # Design tokens (CSS custom properties)
│   ├── typography.css       # Type system
│   ├── paper.css            # Texture & shadow utilities
│   └── seasons/
│       ├── winter.css
│       ├── spring.css
│       ├── summer.css
│       └── autumn.css
│
├── components/
│   ├── CodexProvider.svelte # Context provider, mode switching
│   ├── Page.svelte          # Single page container
│   ├── Spread.svelte        # Two-page spread (desktop)
│   ├── PageTurn.svelte      # Page flip animation
│   ├── Bookmark.svelte      # Bookmark/dog-ear
│   ├── ProgressBar.svelte   # Reading progress
│   ├── TableOfContents.svelte
│   ├── MarginNote.svelte    # Sidenotes/annotations
│   ├── PullQuote.svelte     # Decorative quotes
│   ├── SectionDivider.svelte
│   └── CodexAudio.svelte    # Sound controller
│
├── textures/
│   ├── grain.svg
│   ├── fiber.svg
│   ├── linen.svg
│   └── frost.svg
│
├── ornaments/
│   ├── fleuron.svg          # Classic printer's ornament
│   ├── seedling.svg
│   ├── sunburst.svg
│   ├── oak-leaf.svg
│   └── snowflake.svg
│
└── sounds/
    ├── page-turn.mp3
    ├── bookmark.mp3
    └── ambience/
        ├── fire.mp3
        ├── rain.mp3
        └── garden.mp3
```

---

## Usage Example

```svelte
<script>
  import { CodexProvider, Page, Bookmark } from '@solarpunk/codex';
</script>

<CodexProvider
  mode="codex"           <!-- flow | codex | focus -->
  season="winter"        <!-- auto | winter | spring | summer | autumn -->
  sounds={true}
>
  <Page number={1}>
    <h1>The Return of the Light</h1>
    <p>As the wheel turns toward the longest night...</p>

    <Bookmark saved={true} />
  </Page>

  <Page number={2}>
    <MarginNote>
      The winter solstice has been celebrated for millennia.
    </MarginNote>
    <p>Content continues with margin annotations...</p>
  </Page>
</CodexProvider>
```

---

## Accessibility

Skeuomorphism must enhance, never exclude:

1. **All textures are decorative** - Content readable without them
2. **Page flip has keyboard equivalent** - Arrow keys, Tab navigation
3. **Sounds are optional** - Respect `prefers-reduced-motion`
4. **High contrast mode** - Disable textures, maximize contrast
5. **Screen reader support** - Semantic HTML, ARIA landmarks
6. **Focus indicators** - Visible, styled to match aesthetic

```css
@media (prefers-reduced-motion: reduce) {
  .page-turn { animation: none; }
  .codex-audio { display: none; }
}

@media (prefers-contrast: high) {
  :root {
    --codex-paper: white;
    --codex-ink: black;
    --codex-texture: none;
  }
}
```

---

## Future: AR/VR Extensions

### AR Reading (Phone/Tablet)
- Point device at physical space
- Edition appears as floating book
- Turn pages with hand gestures
- Articles can "grow" with 3D plant models

### VR Reading Room
- Cozy cabin environment
- Edition on reading desk
- Ambient fire, window weather
- Other readers visible (social presence)

```
WebXR Component (Future)
┌─────────────────────────────────────────┐
│                                          │
│     ╭──────────╮    🔥                  │
│     │ ALMANAC  │                         │
│     │ ════════ │    ═══════             │
│     │          │    Reading              │
│     │  [open]  │    Desk                 │
│     ╰──────────╯                         │
│                                          │
│  🪑 Your seat         🌧️ Window         │
│                                          │
└─────────────────────────────────────────┘
```

---

## Package Distribution

Eventually extractable as:

```bash
npm install @solarpunk/codex
```

Framework support:
- Svelte (primary)
- React (wrapper)
- Vue (wrapper)
- Web Components (universal)

---

*"A book is a garden you can carry in your pocket."*
— Chinese Proverb
