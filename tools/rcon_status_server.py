import json
import os
import socket
import struct
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse


RCON_HOST = os.environ.get("RCON_HOST", "202.189.10.12")
RCON_PORT = int(os.environ.get("RCON_PORT", "42008"))
RCON_PASSWORD = os.environ.get("RCON_PASSWORD", "")
HTTP_HOST = os.environ.get("STATUS_HTTP_HOST", "127.0.0.1")
HTTP_PORT = int(os.environ.get("STATUS_HTTP_PORT", "8787"))


def make_packet(packet_id, packet_type, body):
    payload = body.encode("utf-8")
    size = 4 + 4 + len(payload) + 2
    return struct.pack("<iii", size, packet_id, packet_type) + payload + b"\x00\x00"


def read_packet(sock):
    size_data = sock.recv(4)
    if len(size_data) < 4:
        raise ConnectionError("RCON connection closed")

    size = struct.unpack("<i", size_data)[0]
    data = b""
    while len(data) < size:
        chunk = sock.recv(size - len(data))
        if not chunk:
            raise ConnectionError("RCON response ended early")
        data += chunk

    packet_id, packet_type = struct.unpack("<ii", data[:8])
    body = data[8:-2].decode("utf-8", errors="replace")
    return packet_id, packet_type, body


def read_matching(sock, expected_id, timeout=8):
    deadline = time.time() + timeout
    bodies = []

    while time.time() < deadline:
        try:
            packet_id, _, body = read_packet(sock)
        except socket.timeout:
            break

        if packet_id == -1:
            raise PermissionError("RCON authentication failed")

        if packet_id == expected_id and body:
            bodies.append(body)
            return "\n".join(bodies)

    return "\n".join(bodies)


def send_command(command):
    if not RCON_PASSWORD:
        raise RuntimeError("RCON_PASSWORD is not configured")

    with socket.create_connection((RCON_HOST, RCON_PORT), timeout=8) as sock:
        sock.settimeout(2)
        sock.sendall(make_packet(1, 3, RCON_PASSWORD))
        time.sleep(0.4)
        sock.sendall(make_packet(2, 2, command))
        body = read_matching(sock, 2, timeout=8)
        if not body:
            raise TimeoutError("RCON command returned no data")
        return body


def send_command_with_retry(command, attempts=5):
    last_error = None
    for attempt in range(attempts):
        try:
            return send_command(command)
        except Exception as exc:
            last_error = exc
            if attempt < attempts - 1:
                time.sleep(1)
    raise last_error


def parse_server_info(raw):
    try:
        info = json.loads(raw)
    except json.JSONDecodeError:
        info = {}

    player_count = int(info.get("PlayerCount_I") or 0)
    max_players = int(info.get("MaxPlayers") or 0)
    public_queue = int(info.get("PublicQueue_I") or 0)
    reserved_queue = int(info.get("ReservedQueue_I") or 0)

    return {
        "ok": True,
        "source": "RCON",
        "server": {
            "serverName": info.get("ServerName_s", ""),
            "map": info.get("MapName_s", ""),
            "gameMode": info.get("GameMode_s", ""),
            "factionA": info.get("TeamOne_s", ""),
            "factionB": info.get("TeamTwo_s", ""),
            "playerCount": player_count,
            "maxPlayers": max_players,
            "queueCount": public_queue + reserved_queue,
            "publicQueue": public_queue,
            "reservedQueue": reserved_queue,
            "nextLayer": info.get("NextLayer_s", ""),
            "playTimeSeconds": int(info.get("PLAYTIME_I") or 0),
            "source": "RCON",
        },
    }


class StatusHandler(BaseHTTPRequestHandler):
    def write_json(self, body, status=200):
        encoded = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_OPTIONS(self):
        self.write_json({"ok": True})

    def do_GET(self):
        path = urlparse(self.path).path
        if path not in ("/", "/status"):
            self.write_json({"ok": False, "error": "not found"}, 404)
            return

        try:
            raw = send_command_with_retry("ShowServerInfo")
            self.write_json(parse_server_info(raw))
        except Exception as exc:
            self.write_json({"ok": False, "error": str(exc), "source": "RCON"}, 502)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HTTP_HOST, HTTP_PORT), StatusHandler)
    print(f"RCON status server listening on http://{HTTP_HOST}:{HTTP_PORT}/status")
    server.serve_forever()
