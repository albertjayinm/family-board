---
name: familyboard
description: A shared household board for today's plans and everyday tasks.
colors:
  primary: "#245c46"
  leaf: "#5f8c56"
  leaf-light: "#a9c97e"
  fruit: "#c65a49"
  harvest: "#a47716"
  sky: "#376d83"
  paper: "#f1f5ef"
  surface: "#ffffff"
  ink: "#1c2a23"
  muted: "#52665a"
  line: "#dce6dc"
  green-ink: "#315d4a"
  blue-ink: "#315d72"
  coral-ink: "#8f382d"
  harvest-ink: "#61490d"
  harvest-light: "#f0d47a"
  member-maya: "#c65a49"
  member-leo: "#397658"
  member-june: "#376d83"
  member-oscar: "#947015"
typography:
  display:
    fontFamily: "DM Sans, Trebuchet MS, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "DM Sans, Trebuchet MS, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, Trebuchet MS, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "7px"
  panel: "8px"
  compact: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "40px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px"
  nav-active:
    backgroundColor: "#e3f0e5"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
---

# Design System: familyboard

## Overview

**Creative North Star: "A household folio that grows with shared effort"**

The interface combines a familiar household workspace with a botanical folio used only where it carries meaning: the shared goal grows from the real coin balance. Standard navigation and form controls remain recognizable and direct.

The botanical direction was assigned during this rebrand from the product's shared-goal workflow. The audience and warm-but-dependable personality are inferred from the current product, not confirmed brand preferences. Keep content factual: weather and external calendar services are not live integrations.

**Key Characteristics:**
- Product name and household scope are visible in the shell.
- Leaf, fruit, harvest, and sky colors distinguish purpose and people.
- One data-linked garden illustrates the shared goal; its exact ratio remains text.
- Cards use flat surfaces and a quiet border, with no resting shadow.

## Colors

The palette pairs a deep garden green with leaf, fruit, harvest, and sky accents on a pale green paper ground.

### Primary
- **Garden Green** (#245c46): Primary actions and selected navigation.
- **Leaf Green** (#5f8c56): Shared-goal progress and growth visualization.

### Secondary
- **Fruit Red** (#bb4f3d): Attention and urgent states.
- **Harvest Gold** (#a47716): Reward balances.
- **Clear Sky** (#376d83): Calendar/person distinction.
- **Household Member Hues** (#c65a49, #397658, #376d83, #947015): Stable person identity marks; their pale avatar backgrounds use the matching soft family color.

### Neutral
- **Paper** (#f1f5ef): App ground.
- **White Surface** (#ffffff): Panels, forms, and dialogs.
- **House Ink** (#1c2a23): Primary text.
- **Garden Muted** (#52665a): Secondary text; retain readable contrast.
- **Green Ink** (#315d4a), **Blue Ink** (#315d72), **Fruit Ink** (#8f382d), and **Harvest Ink** (#61490d): Readable foreground pairs for selected states and member avatars.
- **Pollen Highlight** (#f0d47a): Small highlight on the botanical folio.
- **Stem Line** (#dce6dc): Quiet panel and row separation.

**The Garden-State Rule.** Color distinguishes action, status, people, and shared progress; do not color every control or turn the navigation into a rainbow.

## Typography

**Display Font:** DM Sans (Trebuchet MS, sans-serif), used in the familyboard wordmark.
**Body Font:** DM Sans (Trebuchet MS, sans-serif), for all working UI.

**Character:** Friendly, sturdy, and readable. The custom house icon gives the wordmark its distinct shape while the same loaded sans keeps the product shell consistent.

### Hierarchy
- **Title** (700, 24px, 1.2): Current screen name.
- **Section** (700, 16px): Panel titles.
- **Body** (400–600, 13–14px, 1.45–1.5): Household data, navigation, and form copy.
- **Meta** (400–600, 12px): Dates, secondary labels, and status text.
- **Figures** (600, tabular): Coin balances, percentages, dates, and counts.

## Layout

Desktop uses a labeled 244px sidebar and an equal-margin content area. The home view pairs tasks with dinner, calendar with shopping, and the shared goal with member balances. At 820px the sidebar yields to a bottom navigation; at 620px content becomes one column with 14–20px page margins. The single shared goal panel keeps its value and progress label beside the illustration.

## Elevation & Depth

At-rest panels are flat, separated by a one-step border. The existing soft shadow is reserved for floating menus and dialogs, never routine data panels.

### Shadow Vocabulary
- **Floating menu** (`0 12px 32px rgba(37, 51, 42, .07)`): Mobile navigation overflow menu only.
- **Dialog** (`0 24px 80px rgba(20, 42, 33, .24)`): Modal form over a scrim.

## Shapes

Panels use an 8px radius; controls use 6–7px; the original familyboard icon is a compact house silhouette with four differently colored windows. Inputs stay visibly bordered and focusable.

## Components

### Buttons
- **Primary:** Garden Green fill with white text, 40px minimum height, 7px radius.
- **Secondary:** White fill with a Stem Line border.
- **Focus:** 3px Garden Fruit outline with 2px offset; never remove keyboard focus.

### Cards / Containers
- **Panel:** White, 1px Stem Line border, 8px radius, no shadow at rest.
- **Home layout:** Paired two-column rows on wide screens; one column on phones.

### Inputs / Fields
- **Style:** White fill, visible border, 6px radius, 42px minimum height for form fields.
- **Focus:** Contrasting outline; preserve native labels and keyboard operation.

### Navigation
- **Desktop:** Labeled household sidebar with a pale leaf active state.
- **Phone:** Five labeled destinations along the bottom; remaining areas in the More menu.
- **Icons:** One outline SVG family with accessible text labels on navigation controls.

### Shared Goal Garden
- **Data:** Leaf count derives from `goal.current / goal.target`; the percentage and coin ratio stay visible in text.
- **Rendering:** Three.js, one renderer reused across home updates; an authored SVG remains visible if WebGL or the CDN is unavailable.
- **Motion:** GSAP animates leaf growth only after a chore changes the goal. Respect reduced motion.

## Do's and Don'ts

### Do:
- **Do** lead with today's plans and unfinished chores.
- **Do** keep amounts, progress, and member balances tied to stored household state.
- **Do** retain the SVG logo, garden fallback, and readable ratio when external modules fail.
- **Do** preserve the existing SQLite file and legacy session compatibility.

### Don't:
- **Don't** claim weather or Google, Outlook, or iCloud integration; they are not connected.
- **Don't** present the 3D plant as an independent score; it only visualizes the shared goal.
- **Don't** apply botanical styling to standard navigation, forms, or task controls.