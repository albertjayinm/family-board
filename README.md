# familyboard

A shared household board that runs on one computer and syncs browsers on the same home network.

## Run it

Requires Python 3.9 or newer. No packages to install. SVG artwork is served locally; GSAP 3.13.0 loads from a pinned CDN for animation. If that CDN is unavailable, the artwork and all household workflows remain usable without animation. Google Fonts supplies Nunito Sans and DM Sans, with local sans-serif fallbacks.

```sh
cd Projects/familyboard
python3 server.py
```

Open [http://localhost:8000](http://localhost:8000). On first run, create the household, add member names, and choose a passphrase of at least 12 characters. Household members open the same address from their own devices and enter that passphrase.

The server listens on all network interfaces by default. To use it from another device on the same Wi-Fi, open `http://<this-computer's-LAN-IP>:8000`. Your operating-system firewall may ask whether to allow Python to accept local network connections. Keep the computer awake while the household board is in use.

## Data and security

The board is stored in `data/gatherday.sqlite3` and survives browser restarts and server restarts. The legacy filename is retained so existing household data is not moved or lost. Back it up by stopping the server and copying that database file. Set `FAMILYBOARD_DB` to choose another path; the previous `GATHERDAY_DB` override remains supported. Browser sessions use an HttpOnly cookie; household passphrases are stored as salted PBKDF2-HMAC-SHA256 hashes.

This is intended for a trusted home network. Traffic uses plain HTTP, and all household members share the passphrase. Do not port-forward it or expose it directly to the public internet. Public hosting requires HTTPS, stronger individual accounts, and deployment hardening.

Calendar entries, chores, lists, meals, messages, and rewards sync between connected browsers. Sync checks for remote changes every few seconds and rejects stale writes rather than silently replacing newer data. Meal ingredient suggestions are illustrative; Google, Outlook, and iCloud calendars are not connected.

## Artwork and motion

The illustrated home uses original SVG assets: `familyboard-icon.svg`, `artwork-chores.svg`, `artwork-dinner.svg`, and `artwork-picnic.svg`. Their `data-part` groups are mounted inline by `artwork.js` for animation; the same files render as static images while loading or if inline mounting fails. The supplied visual references informed the style, not the artwork itself.

GSAP runs seamless, sine-eased loops for the logo, laundry, cooking, steam, and picnic scenes. Hover and keyboard focus gently change playback speed. Replay and pause controls live in the header; the pause preference is retained for the browser session. Motion pauses offscreen, in hidden tabs, and while a dialog is open, and becomes static for `prefers-reduced-motion`. View changes dispose disconnected animation contexts. The previous Three.js garden is no longer loaded.

Home shows stored plans for the selected date, unfinished chores due today, the actual dinner plan, shopping count, and shared-goal ratio. Its My chores filter uses the current household member. No demonstration household data is inserted into the real database.

## Tests

Run the backend tests with:

```sh
python3 -m unittest discover -s tests
```