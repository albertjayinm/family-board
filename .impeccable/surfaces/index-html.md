---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Familyboard home

## Scope

Operate: responsive household board on desktop, tablet, and phone.

## Audience and job

Inferred from current capabilities: household members use one shared board to coordinate today's events, chores, meals, shopping, and rewards. The primary job is to see the next household action without having to ask another person.

## Constraints

Preserve the current SQLite-backed household data, passphrase sign-in, local-network hosting, standard web controls, and every existing workflow. Keep Familyboard's new identity separate from the household's own name. Do not imply cloud sync or live third-party integrations.

## Direction contract

THESIS: Familyboard makes shared household work feel approachable through original, animated scenes while keeping plans and unfinished chores actionable.

OWN-WORLD: User-approved illustrated family workspace: violet outer frame, white working surfaces, teal laundry and coral cooking scenes, a plum shared-goal illustration, Nunito Sans headings, and DM Sans controls. Rounded illustrated tiles are deliberate reference-led exceptions to the default restrained app treatment. Original SVG characters are not copied from the supplied references.

STORY: On arrival, a household member sees the selected day's plans, today's unfinished chores, tonight's meal, and the shared goal. Completing a chore persists real coins and goal progress. Original scenes loop smoothly in place, never delaying content or implying a separate score.

FIRST VIEWPORT: Keep the labeled sidebar, household scope, member switcher, and animated SVG house mark. Lead with Today, together., a week strip, a next-plan summary, and two illustrated activity buttons. Show unfinished chores under them with Everyone, My chores, and Completed filters. Use a right column for exact shared-goal progress, plans, and the shopping link. Retain existing forms and all eight views; fold navigation on tablets and phones.

FORM: Illustrated family dashboard, explicitly approved from the user's supplied references on 2026-11-02; supersedes the earlier botanical-folio exploration. Loop motion uses GSAP with pause/replay, reduced motion, visibility gating, and per-view cleanup. Static local SVG assets are the fallback.

FINISH: Verify persisted household workflows, SVG validity, continuous loop endpoints, responsive views, pause persistence, reduced motion, and animation cleanup on an isolated database. Do not modify real household data during testing.
