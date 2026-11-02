import copy
import http.client
import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

import server


class HouseholdApiTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_database = server.DATABASE
        server.DATABASE = Path(self.temporary_directory.name) / "test.sqlite3"
        server.initialize_database()
        self.http_server = ThreadingHTTPServer(("127.0.0.1", 0), server.BoardHandler)
        self.http_server.daemon_threads = True
        self.thread = threading.Thread(target=self.http_server.serve_forever, daemon=True)
        self.thread.start()
        self.host, self.port = self.http_server.server_address
        self.origin = "http://%s:%s" % (self.host, self.port)

    def tearDown(self):
        self.http_server.shutdown()
        self.http_server.server_close()
        self.thread.join(timeout=2)
        server.DATABASE = self.original_database
        self.temporary_directory.cleanup()

    def request(self, method, path, body=None, cookie=None):
        connection = http.client.HTTPConnection(self.host, self.port, timeout=5)
        headers = {}
        encoded_body = None
        if body is not None:
            encoded_body = json.dumps(body)
            headers["Content-Type"] = "application/json"
        if method in ("POST", "PUT"):
            headers["Origin"] = self.origin
        if cookie:
            headers["Cookie"] = cookie
        connection.request(method, path, body=encoded_body, headers=headers)
        response = connection.getresponse()
        payload = response.read()
        result = json.loads(payload) if response.getheader("Content-Type", "").startswith("application/json") else payload
        response_headers = dict(response.getheaders())
        status = response.status
        connection.close()
        return status, result, response_headers

    def test_household_auth_sync_conflict_and_static_file_boundary(self):
        status, result, _ = self.request("GET", "/api/status")
        self.assertEqual(status, 200)
        self.assertFalse(result["configured"])

        status, _, headers = self.request(
            "POST",
            "/api/setup",
            {
                "household_name": "Test Home",
                "passphrase": "a sufficiently long test phrase",
                "members": ["Morgan", "Sam"],
            },
        )
        self.assertEqual(status, 201)
        cookie = headers["Set-Cookie"].split(";", 1)[0]

        status, result, _ = self.request("GET", "/api/status", cookie=cookie)
        self.assertTrue(result["authenticated"])
        status, _, headers = self.request(
            "POST", "/api/login", {"passphrase": "a sufficiently long test phrase"}
        )
        self.assertEqual(status, 200)
        login_cookie = headers["Set-Cookie"].split(";", 1)[0]

        status, result, _ = self.request("GET", "/api/state")
        self.assertEqual(status, 401)
        status, result, _ = self.request("GET", "/api/state", cookie=login_cookie)
        self.assertEqual(status, 200)
        self.assertEqual([person["name"] for person in result["state"]["members"]], ["Morgan", "Sam"])

        stale_state = copy.deepcopy(result["state"])
        updated_state = copy.deepcopy(result["state"])
        updated_state["lists"][0]["items"].append(
            {"id": "shared-item", "name": "Apples", "quantity": "", "done": False}
        )
        status, result, _ = self.request(
            "PUT", "/api/state", {"state": updated_state, "revision": 1}, login_cookie
        )
        self.assertEqual(status, 200)
        self.assertEqual(result["revision"], 2)

        status, result, _ = self.request(
            "PUT", "/api/state", {"state": stale_state, "revision": 1}, login_cookie
        )
        self.assertEqual(status, 409)
        self.assertEqual(result["revision"], 2)
        self.assertEqual(result["state"]["lists"][0]["items"][0]["name"], "Apples")

        status, _, _ = self.request("GET", "/server.py")
        self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()