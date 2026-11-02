---
name: familyboard
description: A shared household board for today's plans and everyday tasks.
colors:
  primary: "#6244bd"
  teal: "#0b8d7b"
  plum: "#392146"
  coral: "#ffad93"
  pollen: "#f6d46e"
  sky: "#526bc1"
  paper: "#8c78dd"
  surface: "#ffffff"
  ink: "#30213f"
  muted: "#675b71"
  line: "#eee9f2"
  primary-soft: "#eee8fb"
  teal-soft: "#d6eee4"
  blue-soft: "#e2e8ff"
  coral-soft: "#ffe0d2"
  harvest-ink: "#70510a"
  member-maya: "#c65a49"
  member-leo: "#397658"
  member-june: "#376d83"
  member-oscar: "#947015"
typography:
  display:
    fontFamily: "Nunito Sans, DM Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 900
    lineHeight: 1.1
  title:
    fontFamily: "Nunito Sans, DM Sans, sans-serif"
    fontSize: "30px"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, Trebuchet MS, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "8px"
  panel: "12px"
  illustration: "16px"
  shell: "24px"
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
    height: "44px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px"
  nav-active:
    backgroundColor: "#eee8fb"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
---

# Design System: familyboard

## Overview

**Creative North Star: "Shared work, illustrated together"**

The user approved a playful, illustration-led direction from supplied education and family-planning references. Violet framing, teal and coral activity scenes, rounded headings, and original SVG characters replace the botanical exploration. The mode remains Operate: readable dates, responsibilities, and real actions take priority over illustration.

## Color and Type

- Violet (#6244bd) identifies primary actions; its pale tint (#eee8fb) marks selection.
- Teal (#0b8d7b) and coral (#ffad93) distinguish laundry and cooking artwork.
- Plum (#392146) frames the shared goal; pollen (#f6d46e) carries progress and coin highlights.
- White surfaces, ink (#30213f), muted text (#675b71), and quiet lines (#eee9f2) keep working data readable.
- Nunito Sans supplies rounded headings and the wordmark. DM Sans supplies data, controls, and forms. Local sans-serif fallbacks remain usable if Google Fonts is blocked.
- Screen titles are 26-30px, section headings 17-24px, working text 13-14px, and secondary labels 11-12px. Updating figures use tabular numbers.

The reference-led violet frame and illustrated tile colors are deliberate exceptions to the default restrained app palette. Do not extend full-color treatment to every data row.

## Layout and Controls

- A 196px labeled sidebar sits beside the desktop workspace; it narrows to 176px before folding at 1050px.
- Home has a main column and a 300px goal/agenda column. A selected-date week strip and next-plan summary precede illustrated chore and meal buttons.
- Chores due today default to unfinished work. Everyone, My chores, and Completed filters show at most four rows, with access to the full Chores view.
- The right column contains exact shared-goal progress, selected-day plans, and the actual shopping count.
- Tablet navigation uses the bottom bar. At 640px, Home becomes one column with 20px margins and supporting sections below chores.
- Standard form fields and primary controls have a 44px minimum height. Inputs retain labels, native keyboard behavior, and visible focus.
- Illustrated tiles use 12-16px radii, normal panels 12px, controls 8px, and the desktop shell 24px. Resting sections do not float on shadows. Menus and dialogs may cast shadows.

## SVG Artwork and Motion

All shipped illustrations are original code-authored SVGs based on household activities, not copies of reference characters. The assets are the house mark, laundry scene, cooking scene, and family picnic. Named `data-part` groups make arms, heads, fabric, vegetables, steam, leaves, roof, windows, and door independently editable.

Local static SVG images render first. `artwork.js` fetches and mounts trusted local assets inline, then GSAP 3.13.0 supplies the motion layer. Three.js is not loaded by this flat illustrated design.

- Laundry loops over 4.8 seconds, cooking over 5.6 seconds, picnic over 7.2 seconds, and the logo over 6.4 seconds.
- Sine easing and matching endpoint transforms avoid a visible restart. Steam has two phase-offset 2.8-second cycles.
- Hover and keyboard focus smoothly change loop speed rather than abruptly restarting poses.
- Chore completion persists the normal coin and goal changes, then briefly accelerates visible goal/logo motion and animates a coin toward the goal.
- Header controls pause/resume or replay visible artwork. Pause is retained for the browser session.
- Offscreen assets, background tabs, and open dialogs pause loops. Reduced-motion mode reverts animation contexts to static artwork.
- Disconnected view assets revert their GSAP contexts; repeated navigation must not accumulate animations.

The illustration is expressive, not a second score. Goal amounts, percentages, shopping counts, chore ownership, and calendar plans come from persisted household state.

## Constraints

Preserve the SQLite database location, legacy cookie/storage compatibility, shared-passphrase authentication, and all eight application views. Never insert sample household data into the real database during UI testing. External calendars and live weather are not connected. Meal ingredient suggestions remain illustrative.