const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");

function loadConfig() {
  const configPath = path.join(__dirname, "rcon_status_config.json");
  let fileConfig = {};

  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  return {
    rconHost: process.env.RCON_HOST || fileConfig.rconHost || "202.189.10.12",
    rconPort: Number(process.env.RCON_PORT || fileConfig.rconPort || 42008),
    rconPassword: process.env.RCON_PASSWORD || fileConfig.rconPassword || "",
    httpHost: process.env.STATUS_HTTP_HOST || fileConfig.httpHost || "127.0.0.1",
    httpPort: Number(process.env.STATUS_HTTP_PORT || fileConfig.httpPort || 8787),
  };
}

const config = loadConfig();

function makePacket(id, type, body) {
  const bodyBuffer = Buffer.from(body, "utf8");
  const packet = Buffer.alloc(4 + 4 + 4 + bodyBuffer.length + 2);

  packet.writeInt32LE(4 + 4 + bodyBuffer.length + 2, 0);
  packet.writeInt32LE(id, 4);
  packet.writeInt32LE(type, 8);
  bodyBuffer.copy(packet, 12);
  packet.writeInt16LE(0, 12 + bodyBuffer.length);

  return packet;
}

function readPacket(socket) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("end", onEnd);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onEnd = () => {
      cleanup();
      reject(new Error("RCON connection closed"));
    };

    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length < 4) {
        return;
      }

      const size = buffer.readInt32LE(0);
      if (buffer.length < size + 4) {
        return;
      }

      cleanup();
      const packet = buffer.subarray(4, size + 4);
      const id = packet.readInt32LE(0);
      const body = packet.subarray(8, packet.length - 2).toString("utf8");
      resolve({ id, body });
    };

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("end", onEnd);
  });
}

function connectRcon() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(
      { host: config.rconHost, port: config.rconPort, timeout: 8000 },
      () => resolve(socket)
    );

    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("RCON connection timed out"));
    });
    socket.once("error", reject);
  });
}

async function sendCommand(command) {
  if (!config.rconPassword) {
    throw new Error("RCON password is not configured");
  }

  const socket = await connectRcon();

  try {
    socket.write(makePacket(1, 3, config.rconPassword));
    await new Promise((resolve) => setTimeout(resolve, 400));
    socket.write(makePacket(2, 2, command));

    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const packet = await readPacket(socket);
      if (packet.id === -1) {
        throw new Error("RCON authentication failed");
      }
      if (packet.id === 2 && packet.body) {
        return packet.body;
      }
    }

    throw new Error("RCON command returned no data");
  } finally {
    socket.destroy();
  }
}

async function sendCommandWithRetry(command, attempts = 5) {
  let lastError;

  for (let index = 0; index < attempts; index += 1) {
    try {
      return await sendCommand(command);
    } catch (error) {
      lastError = error;
      if (index < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}

function toInt(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function parseServerInfo(raw) {
  const info = JSON.parse(raw);
  const publicQueue = toInt(info.PublicQueue_I);
  const reservedQueue = toInt(info.ReservedQueue_I);

  return {
    ok: true,
    source: "RCON",
    server: {
      serverName: info.ServerName_s || "",
      map: info.MapName_s || "",
      gameMode: info.GameMode_s || "",
      factionA: info.TeamOne_s || "",
      factionB: info.TeamTwo_s || "",
      playerCount: toInt(info.PlayerCount_I),
      maxPlayers: toInt(info.MaxPlayers),
      queueCount: publicQueue + reservedQueue,
      publicQueue,
      reservedQueue,
      nextLayer: info.NextLayer_s || "",
      playTimeSeconds: toInt(info.PLAYTIME_I),
      source: "RCON",
    },
  };
}

function writeJson(response, status, body) {
  const payload = JSON.stringify(body);

  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    writeJson(response, 200, { ok: true });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method !== "GET" || !["/", "/status"].includes(url.pathname)) {
    writeJson(response, 404, { ok: false, error: "not found" });
    return;
  }

  try {
    const raw = await sendCommandWithRetry("ShowServerInfo");
    writeJson(response, 200, parseServerInfo(raw));
  } catch (error) {
    writeJson(response, 502, {
      ok: false,
      source: "RCON",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(config.httpPort, config.httpHost, () => {
  console.log(`RCON status server listening on http://${config.httpHost}:${config.httpPort}/status`);
});
