#!/usr/bin/env python3
"""Local-network household board server."""

import argparse
import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import sqlite3
import time
import uuid
from datetime import date, timedelta
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
DATABASE = Path(os.environ.get("FAMILYBOARD_DB", os.environ.get("GATHERDAY_DB", ROOT / "data" / "gatherday.sqlite3")))
SESSION_SECONDS = 30 * 24 * 60 * 60
MAX_BODY_BYTES = 1_500_000
PALETTE = ["maya", "leo", "june", "oscar", "coral", "blue", "green", "yellow"]
STATIC_SUFFIXES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"}
LOGIN_FAILURES = {}


def connect_db():
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with connect_db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS household (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                name TEXT NOT NULL,
                passphrase_salt BLOB NOT NULL,
                passphrase_hash BLOB NOT NULL,
                state_json TEXT NOT NULL,
                revision INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                expires_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
            """
        )


def derive_passphrase(passphrase, salt):
    return hashlib.pbkdf2_hmac("sha256", passphrase.encode("utf-8"), salt, 600_000, dklen=32)


def default_state(member_names):
    members = []
    seen = set()
    for index, name in enumerate(member_names):
        normalized = name.strip()[:32]
        key = normalized.casefold()
        if normalized and key not in seen:
            seen.add(key)
            members.append(
                {
                    "id": uuid.uuid4().hex,
                    "name": normalized,
                    "initials": "".join(part[0] for part in normalized.split()[:2]).upper(),
                    "tone": PALETTE[index % len(PALETTE)],
                    "coins": 0,
                }
            )
    if not members:
        members.append(
            {"id": uuid.uuid4().hex, "name": "You", "initials": "Y", "tone": "maya", "coins": 0}
        )
    return {
        "members": members,
        "tasks": [],
        "events": [],
        "lists": [
            {"id": "shopping", "name": "Shopping", "items": []},
            {"id": "use-soon", "name": "Use soon", "items": []},
        ],
        "meals": [],
        "messages": [],
        "rewards": [
            {"id": uuid.uuid4().hex, "name": "Choose a family movie", "cost": 15, "symbol": "▶"},
            {"id": uuid.uuid4().hex, "name": "Pick Saturday dessert", "cost": 20, "symbol": "✳"},
            {"id": uuid.uuid4().hex, "name": "Stay up 20 minutes later", "cost": 30, "symbol": "☾"},
        ],
        "goal": {"name": "Saturday adventure fund", "current": 0, "target": 120},
    }


def validate_state(state):
    if not isinstance(state, dict):
        raise ValueError("Board data must be an object.")
    for key in ("members", "tasks", "events", "lists", "meals", "messages", "rewards"):
        if not isinstance(state.get(key), list):
            raise ValueError("Board data is missing a valid " + key + " list.")
        if len(state[key]) > 2000:
            raise ValueError("This board has too many " + key + ".")
    if not state["members"] or len(state["members"]) > 50:
        raise ValueError("A household needs between 1 and 50 people.")
    if not isinstance(state.get("goal"), dict):
        raise ValueError("Board data is missing its shared goal.")


def create_session(connection):
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("ascii")).hexdigest()
    now = int(time.time())
    connection.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
    connection.execute(
        "INSERT INTO sessions(token_hash, expires_at) VALUES (?, ?)",
        (token_hash, now + SESSION_SECONDS),
    )
    return token


def household_row(connection):
    return connection.execute("SELECT * FROM household WHERE id = 1").fetchone()


class BoardHandler(BaseHTTPRequestHandler):
    server_version = "familyboard/1.0"

    def log_message(self, format_string, *args):
        print("[%s] %s" % (self.log_date_time_string(), format_string % args))

    def send_json(self, status, value, cookie=None, clear_cookie=False):
        payload = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if cookie:
            self.send_header(
                "Set-Cookie",
                "gatherday_session=%s; HttpOnly; SameSite=Strict; Path=/; Max-Age=%d"
                % (cookie, SESSION_SECONDS),
            )
        elif clear_cookie:
            self.send_header(
                "Set-Cookie", "gatherday_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
            )
        self.end_headers()
        self.wfile.write(payload)

    def read_json(self):
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Invalid request size.")
        if size < 0 or size > MAX_BODY_BYTES:
            raise ValueError("Request is too large.")
        try:
            value = json.loads(self.rfile.read(size).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("Request must contain valid JSON.")
        if not isinstance(value, dict):
            raise ValueError("Request must contain a JSON object.")
        return value

    def check_origin(self):
        origin = self.headers.get("Origin")
        if not origin:
            return self.client_address[0] in ("127.0.0.1", "::1")
        return urlsplit(origin).netloc.lower() == self.headers.get("Host", "").lower()

    def current_session(self, connection):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
            token = cookie["gatherday_session"].value
        except (KeyError, AttributeError):
            return None
        token_hash = hashlib.sha256(token.encode("ascii", errors="ignore")).hexdigest()
        now = int(time.time())
        return connection.execute(
            "SELECT token_hash FROM sessions WHERE token_hash = ? AND expires_at > ?",
            (token_hash, now),
        ).fetchone()

    def require_session(self, connection):
        if self.current_session(connection):
            return True
        self.send_json(401, {"error": "Sign in to this household first."})
        return False

    def do_GET(self):
        path = urlsplit(self.path).path
        if path.startswith("/api/"):
            self.handle_api_get(path)
            return
        self.serve_static(path)

    def handle_api_get(self, path):
        with connect_db() as connection:
            if path == "/api/status":
                household = household_row(connection)
                self.send_json(
                    200,
                    {
                        "configured": bool(household),
                        "authenticated": bool(self.current_session(connection)),
                        "household_name": household["name"] if household else "",
                    },
                )
                return
            if path == "/api/state":
                if not self.require_session(connection):
                    return
                household = household_row(connection)
                self.send_json(
                    200,
                    {
                        "household_name": household["name"],
                        "state": json.loads(household["state_json"]),
                        "revision": household["revision"],
                    },
                )
                return
        self.send_json(404, {"error": "API route not found."})

    def do_POST(self):
        path = urlsplit(self.path).path
        if not self.check_origin():
            self.send_json(403, {"error": "Request origin was rejected."})
            return
        if path not in ("/api/setup", "/api/login", "/api/logout"):
            self.send_json(404, {"error": "API route not found."})
            return
        try:
            body = self.read_json()
            if path == "/api/setup":
                self.handle_setup(body)
            elif path == "/api/login":
                self.handle_login(body)
            else:
                self.handle_logout()
        except ValueError as error:
            self.send_json(400, {"error": str(error)})

    def handle_setup(self, body):
        name = str(body.get("household_name", "")).strip()[:60]
        passphrase = str(body.get("passphrase", ""))
        names = body.get("members", [])
        if len(name) < 2:
            raise ValueError("Give your household a name (at least 2 characters).")
        if len(passphrase) < 12:
            raise ValueError("Choose a household passphrase with at least 12 characters.")
        if len(passphrase) > 256:
            raise ValueError("The passphrase is too long.")
        if not isinstance(names, list) or len(names) > 50 or any(not isinstance(item, str) for item in names):
            raise ValueError("Enter up to 50 household member names.")
        salt = secrets.token_bytes(16)
        passphrase_hash = derive_passphrase(passphrase, salt)
        state = default_state(names)
        with connect_db() as connection:
            if household_row(connection):
                self.send_json(409, {"error": "This server already has a household. Sign in instead."})
                return
            connection.execute(
                "INSERT INTO household(id, name, passphrase_salt, passphrase_hash, state_json, revision, created_at) "
                "VALUES (1, ?, ?, ?, ?, 1, ?)",
                (name, salt, passphrase_hash, json.dumps(state, ensure_ascii=False), int(time.time())),
            )
            token = create_session(connection)
        self.send_json(201, {"ok": True}, cookie=token)

    def handle_login(self, body):
        address = self.client_address[0]
        failures, blocked_until = LOGIN_FAILURES.get(address, (0, 0))
        now = time.time()
        if blocked_until > now:
            self.send_json(429, {"error": "Too many attempts. Try again in a minute."})
            return
        passphrase = str(body.get("passphrase", ""))
        with connect_db() as connection:
            household = household_row(connection)
            if not household:
                self.send_json(404, {"error": "Set up a household on this server first."})
                return
            candidate = derive_passphrase(passphrase, household["passphrase_salt"])
            if not hmac.compare_digest(candidate, household["passphrase_hash"]):
                failures += 1
                LOGIN_FAILURES[address] = (failures, now + 60 if failures >= 5 else 0)
                self.send_json(401, {"error": "That passphrase didn’t match. Try again."})
                return
            LOGIN_FAILURES.pop(address, None)
            token = create_session(connection)
        self.send_json(200, {"ok": True}, cookie=token)

    def handle_logout(self):
        with connect_db() as connection:
            session = self.current_session(connection)
            if session:
                connection.execute("DELETE FROM sessions WHERE token_hash = ?", (session["token_hash"],))
        self.send_json(200, {"ok": True}, clear_cookie=True)

    def do_PUT(self):
        if urlsplit(self.path).path != "/api/state":
            self.send_json(404, {"error": "API route not found."})
            return
        if not self.check_origin():
            self.send_json(403, {"error": "Request origin was rejected."})
            return
        try:
            body = self.read_json()
            state = body.get("state")
            validate_state(state)
            state_json = json.dumps(state, ensure_ascii=False, separators=(",", ":"))
            if len(state_json.encode("utf-8")) > MAX_BODY_BYTES:
                raise ValueError("Board data is too large.")
            revision = int(body.get("revision", -1))
        except (ValueError, TypeError) as error:
            self.send_json(400, {"error": str(error)})
            return
        with connect_db() as connection:
            if not self.require_session(connection):
                return
            household = household_row(connection)
            if revision != household["revision"]:
                self.send_json(
                    409,
                    {
                        "error": "This board changed on another device. The latest version has been loaded.",
                        "household_name": household["name"],
                        "state": json.loads(household["state_json"]),
                        "revision": household["revision"],
                    },
                )
                return
            next_revision = revision + 1
            connection.execute(
                "UPDATE household SET state_json = ?, revision = ? WHERE id = 1 AND revision = ?",
                (state_json, next_revision, revision),
            )
            if connection.total_changes == 0:
                self.send_json(409, {"error": "Board changed. Refresh and try again."})
                return
        self.send_json(200, {"revision": next_revision})

    def serve_static(self, request_path):
        decoded = unquote(request_path)
        if decoded == "/":
            decoded = "/index.html"
        candidate = (ROOT / decoded.lstrip("/")).resolve()
        try:
            candidate.relative_to(ROOT)
        except ValueError:
            self.send_error(404)
            return
        if not candidate.is_file() or candidate.name.startswith(".") or candidate.suffix.lower() not in STATIC_SUFFIXES:
            self.send_error(404)
            return
        content = candidate.read_bytes()
        content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(content)


def main():
    parser = argparse.ArgumentParser(description="Run familyboard on this computer or home network.")
    parser.add_argument("--host", default="0.0.0.0", help="Interface to listen on (default: all network interfaces).")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000).")
    args = parser.parse_args()
    initialize_database()
    server = ThreadingHTTPServer((args.host, args.port), BoardHandler)
    server.daemon_threads = True
    print("familyboard is ready at http://localhost:%d" % args.port)
    print("On your home network, other devices can use this computer's LAN IP and port %d." % args.port)
    print("Press Ctrl+C to stop the server. Household data is stored in %s" % DATABASE)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping familyboard.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()