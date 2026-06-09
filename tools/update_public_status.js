const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "public-status.json");
const LIST_URL = "https://www.squad.wiki/servers.php";
const TARGET_SESSION_ID = "9c93a53f7ac94858a09dfa326cbd7bb2";
const TARGET_SERVER_NAME =
  "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩";
const NAME_HINTS = ["狼群", "【L.Q】", "L.Q", "LQ"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getServerSearchHints() {
  const nameParts = TARGET_SERVER_NAME.split(/[\s=|｜#【】\[\]（）()]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !/^\d+$/.test(part));

  return unique([...NAME_HINTS, ...nameParts]);
}

function serverMatchesName(server) {
  const serverName = cleanText(server && server.serverName);
  if (!serverName) {
    return false;
  }

  if (serverName === TARGET_SERVER_NAME) {
    return true;
  }

  return getServerSearchHints().some((hint) => serverName.includes(hint));
}

async function fetchServerChunk(offset, limit) {
  const url = new URL(LIST_URL);
  url.searchParams.set("action", "list");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.href, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false || !Array.isArray(data.servers)) {
    throw new Error(data.error || `Squad Wiki list request failed: ${response.status}`);
  }

  return data;
}

async function findCurrentServer() {
  let fallback = null;
  let fallbackCache = null;

  for (let offset = 0; offset < 1400; offset += 200) {
    const data = await fetchServerChunk(offset, 200);
    const servers = data.servers || [];
    fallbackCache = data.cache || fallbackCache;

    const byId = servers.find((server) => server.sessionId === TARGET_SESSION_ID);
    if (byId) {
      return { server: byId, cache: data.cache || fallbackCache };
    }

    if (!fallback) {
      fallback = servers.find(serverMatchesName) || null;
    }

    if (!data.hasMore) {
      break;
    }
  }

  return { server: fallback, cache: fallbackCache };
}

function normalizeServer(server) {
  if (!server) {
    return null;
  }

  return {
    sessionId: cleanText(server.sessionId),
    serverName: cleanText(server.serverName),
    map: cleanText(server.map),
    gameMode: cleanText(server.gameMode),
    playerCount: Number.isFinite(server.playerCount) ? server.playerCount : null,
    maxPlayers: Number.isFinite(server.maxPlayers) ? server.maxPlayers : null,
    queueCount: Number.isFinite(server.queueCount) ? server.queueCount : null,
    isLicensed: Boolean(server.isLicensed),
    isCoop: Boolean(server.isCoop),
    region: cleanText(server.region) || null,
  };
}

function readExistingStatus() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
  } catch {
    return null;
  }
}

function comparableStatus(status) {
  return JSON.stringify({
    ok: Boolean(status && status.ok),
    error: cleanText(status && status.error),
    server: status && status.server ? normalizeServer(status.server) : null,
  });
}

function writeStatus(nextStatus) {
  const existing = readExistingStatus();

  if (existing && comparableStatus(existing) === comparableStatus(nextStatus)) {
    nextStatus.generatedAt = existing.generatedAt || nextStatus.generatedAt;
    nextStatus.cache = existing.cache || nextStatus.cache;
  }

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(nextStatus, null, 2)}\n`, "utf8");
}

async function main() {
  const current = await findCurrentServer();
  const generatedAt = new Date().toISOString();

  if (!current.server) {
    writeStatus({
      ok: false,
      source: "Squad Wiki 公开列表",
      generatedAt,
      error: "未在公开服务器列表中找到狼群服务器",
      server: null,
      cache: current.cache || null,
    });
    console.log("LQ server was not found in the public server list.");
    return;
  }

  writeStatus({
    ok: true,
    source: "Squad Wiki 公开列表",
    generatedAt,
    server: normalizeServer(current.server),
    cache: current.cache || null,
  });

  console.log(
    `Updated public status: ${current.server.map || "unknown map"}, ${current.server.playerCount ?? "?"} players, queue ${current.server.queueCount ?? "?"}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
