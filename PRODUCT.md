# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the current product and its household setup: people sharing a home, including adults coordinating children, who need to see plans and responsibilities together.

## Product Purpose

Inferred: reduce the work of remembering and repeating household plans by keeping today's events, chores, meals, lists, and messages in one shared board.

## Positioning

Inferred: a passphrase-protected household board hosted on a home computer and shared across browsers on the same local network; household changes persist in SQLite and sync to connected devices.

## Operating Context

- The host computer must remain available while household members use the board.
- Members open the board from a browser and sign in with the household passphrase.
- The main home view should make today's plans and next household actions easy to scan.

## Capabilities and Constraints

- Existing workflows: family calendar, chores and coin rewards, shopping and custom lists, meal planning, household messages, shared goals, and member management.
- The project is a Python standard-library HTTP server with SQLite persistence and a plain HTML/CSS/JavaScript client.
- It is intended for a trusted home network. HTTP is not encrypted; it is not a public-hosting configuration.
- Meal ingredient suggestions are illustrative. Calendar entries are household-managed; Google, Outlook, and iCloud are not connected.
- Preserve existing household data and the SQLite database location during this rebrand.

## Brand Commitments

- Confirmed product name: `familyboard`.
- The user approved a playful, illustration-led dashboard based on supplied family-planning and education-app references, including animated SVG artwork and logo.
- The violet frame, teal and coral activity illustrations, and rounded typography are deliberate reference-led choices. Audience details beyond household coordination remain inferred.

## Evidence on Hand

- Working local-network application in this project, including its server, UI, and regression tests.
- The public FridgeBoard feature description informed the original workflow set; no authenticated access to its dashboard was available.
- No verified customer claims, integrations, or live weather data. Do not present sample data as live.

## Product Principles

- Put today's household information before secondary settings and history.
- Keep shared actions legible to both adults and children.
- Persist household changes and make sync state visible.
- Be explicit about local-network limits and sample data.