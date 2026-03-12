# Neurax Figma Blueprint

## Constraint
- This workspace does not currently expose a Figma MCP server.
- `c:\Users\justi\.gemini\antigravity\mcp_config.json` only includes `cloudrun`, `gmp-code-assist`, and `genkit-mcp-server`.
- Use this file as the frame/component handoff until a Figma MCP server is added.

## Visual Direction
- Style: glassmorphism mixed with claymorphism
- Tone: premium clinical, tactile, calm, high-contrast
- Primary accent: theme-driven accent color from `--neon`
- Surfaces:
  - Frosted shells for panels, headers, and large cards
  - Soft raised clay cards for metrics, action chips, and compact widgets
  - Rounded radii: `24px`, `28px`, `40px`

## Home Page Frames
- `Desktop / Home / 1440`
  - Sticky glass header
  - Split hero:
    - Left: headline, subcopy, large clinical query input
    - Right: live metrics stack
  - Capability grid: 3 cards
  - Workflow row: 3 sequential cards
  - Testimonial section
  - CTA band
- `Mobile / Home / 390`
  - Stack hero panels vertically
  - Keep metric cards in 2-column grid
  - Quick prompts wrap below search

## Dashboard Frames
- `Desktop / Dashboard / 1440`
  - Left sidebar:
    - Brand card
    - Navigation stack
    - Catalog mini-metrics
    - Local runtime panel
  - Top bar:
    - Workspace title
    - Search surface
    - Theme toggle
    - Notification glass popover
    - User capsule
  - Main shell:
    - Large frosted workspace canvas
    - Existing diagnosis widgets remain inside
- `Tablet / Dashboard / 1024`
  - Sidebar collapses to icon-first mode
  - Top bar search stays visible
- `Mobile / Dashboard / 390`
  - Sidebar becomes a compact rail
  - Top bar trims to title, theme, notifications, avatar

## Component Inventory
- `Glass Header`
- `Clay Metric Card`
- `Raised Prompt Chip`
- `Clinical Search Surface`
- `Sidebar Nav Tile`
- `Notification Popover`
- `Workspace Shell`
- `Top-3 Accuracy Stat`

## Typography
- Display: heavy condensed industrial sans
- Body: clean variable UI sans
- Hierarchy:
  - Hero H1: `64/68`, black
  - Section H2: `36/40`, black
  - Card title: `24/28`, black
  - Meta labels: `10/12`, uppercase, high tracking

## Motion
- Hover raise: `translateY(-2px to -4px)`
- Soft panel fade and slide on load
- Glass popovers use blur and opacity transitions, not bouncy spring motion

## Product Messaging
- Do not claim `>90%` single-label accuracy.
- Preferred metric headline:
  - `Top-3 Differential Accuracy`
- Secondary metric:
  - `Weighted F1`

## Figma Handoff Notes
- Build color styles from CSS variables rather than fixed hexes where possible.
- Preserve theme variants:
  - `Clinical Light`
  - `Midnight`
  - `Emerald`
- Use Auto Layout for every card, rail item, and header cluster.
