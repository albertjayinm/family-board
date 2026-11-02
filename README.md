# familyboard

A shared household board that runs on one computer and syncs browsers on the same home network.

## Run it

Requires Python 3.9 or newer. No packages to install. The animated goal illustration uses Three.js and GSAP from pinned CDNs; the SVG mark and progress bar remain available offline.

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

## Tests

Run the backend tests with:

```sh
python3 -m unittest discover -s tests
```