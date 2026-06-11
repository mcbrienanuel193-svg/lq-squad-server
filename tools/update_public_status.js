const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "public-status.json");
const SQUADBROWSER_URL = "https://squadbrowser.app/";
const SQUADBROWSER_GET_SERVERS_ACTION = "404764fc6fe0bbc56e2d4039d07a94500291305ba6";
const BATTLEMETRICS_API_URL = "https://api.battlemetrics.com/servers";
const WIKI_LIST_URL = "https://www.squad.wiki/servers.php";
const TARGET_SESSION_ID = "9c93a53f7ac94858a09dfa326cbd7bb2";
const TARGET_BATTLEMETRICS_ID = "39205368";
const TARGET_SERVER_NAME =
  "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩";
const NAME_HINTS = ["狼群", "【L.Q】", "L.Q", "LQ"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getServerName(server) {
  return cleanText(server?.serverName || server?.name || server?.hostname);
}

function getServerSearchHints() {
  const nameParts = TARGET_SERVER_NAME.split(/[\s=|｜#【】\[\]（）()]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !/^\d+$/.test(part));

  return unique([...NAME_HINTS, ...nameParts]);
}

function serverMatchesName(server) {
  const serverName = getServerName(server);
  if (!serverName) {
    return false;
  }

  if (serverName === TARGET_SERVER_NAME) {
    return true;
  }

  return getServerSearchHints().some((hint) => serverName.includes(hint));
}

function parseSquadBrowserPayload(text) {
  for (const line of String(text || "").split(/\r?\n/)) {
    const matched = line.match(/^\d+:(.*)$/);
    if (!matched) {
      continue;
    }

    try {
      const payload = JSON.parse(matched[1]);
      if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
        return payload;
      }
    } catch {
      // Ignore non-data records in the React Server Component stream.
    }
  }

  throw new Error("SquadBrowser action payload was not readable.");
}

async function fetchSquadBrowserPage(page) {
  const response = await fetch(SQUADBROWSER_URL, {
    method: "POST",
    headers: {
      Accept: "text/x-component",
      "Content-Type": "text/plain;charset=UTF-8",
      "Next-Action": SQUADBROWSER_GET_SERVERS_ACTION,
      Origin: SQUADBROWSER_URL,
      Referer: SQUADBROWSER_URL,
    },
    body: JSON.stringify([
      {
        name: "L.Q",
        page,
        limit: 30,
        showFull: true,
        showEmpty: true,
        showPassworded: true,
      },
    ]),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`SquadBrowser request failed: ${response.status}`);
  }

  return parseSquadBrowserPayload(text);
}

async function findSquadBrowserServer() {
  let fallback = null;

  for (let page = 1; page <= 4; page += 1) {
    const payload = await fetchSquadBrowserPage(page);
    const servers = Array.isArray(payload.data) ? payload.data : [];
    const matched = servers.find(serverMatchesName);

    if (matched) {
      return { server: matched, cache: { source: "SquadBrowser", page, meta: payload.meta || null } };
    }

    if (!fallback && servers.length) {
      fallback = { server: servers[0], cache: { source: "SquadBrowser", page, meta: payload.meta || null } };
    }

    if (!payload.meta?.hasMore) {
      break;
    }
  }

  return fallback || { server: null, cache: null };
}

async function findBattleMetricsServer() {
  const response = await fetch(`${BATTLEMETRICS_API_URL}/${TARGET_BATTLEMETRICS_ID}`, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.data?.attributes) {
    throw new Error(data?.errors?.[0]?.detail || `BattleMetrics request failed: ${response.status}`);
  }

  return {
    server: data,
    cache: {
      source: "BattleMetrics",
      battleMetricsId: TARGET_BATTLEMETRICS_ID,
      updatedAt: data.data.attributes.updatedAt || null,
    },
  };
}

async function fetchWikiServerChunk(offset, limit) {
  const url = new URL(WIKI_LIST_URL);
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

async function findWikiServer() {
  let fallback = null;
  let fallbackCache = null;

  for (let offset = 0; offset < 1400; offset += 200) {
    const data = await fetchWikiServerChunk(offset, 200);
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

function normalizeServer(server, source) {
  if (!server) {
    return null;
  }

  if (source === "BattleMetrics") {
    const attributes = server?.data?.attributes || server?.attributes || {};
    const details = attributes.details || {};
    const ip = cleanText(attributes.ip);
    const port = asNumber(attributes.port || attributes.portQuery);

    return {
      serverName: cleanText(attributes.name),
      battleMetricsId: cleanText(server?.data?.id || attributes.id),
      sessionId: TARGET_SESSION_ID,
      address: ip && port ? `${ip}:${port}` : null,
      map: cleanText(details.map),
      gameMode: cleanText(details.gameMode),
      factionA: cleanText(details.squad_teamOne),
      factionB: cleanText(details.squad_teamTwo),
      playerCount: asNumber(attributes.players),
      maxPlayers: asNumber(attributes.maxPlayers),
      queueCount: asNumber(details.squad_publicQueue ?? details.squad_reservedQueue),
      nextLayer: cleanText(details.squad_nextLayer) || null,
      updatedAt: cleanText(attributes.updatedAt) || null,
      status: cleanText(attributes.status) || null,
      source: "BattleMetrics",
    };
  }

  if (source === "SquadBrowser") {
    return {
      serverName: getServerName(server),
      squadBrowserId: cleanText(server.id),
      sessionId: cleanText(server.session_id || server.sessionId),
      address: cleanText(server.address) || null,
      map: cleanText(server.current_map || server.map),
      gameMode: cleanText(server.game_mode || server.gameMode),
      factionA: cleanText(server.team_1 || server.teamOne),
      factionB: cleanText(server.team_2 || server.teamTwo),
      playerCount: asNumber(server.current_players ?? server.currentPlayers ?? server.playerCount),
      maxPlayers: asNumber(server.max_players ?? server.maxPlayers),
      queueCount: asNumber(server.queue_players ?? server.queueCount ?? server.queue),
      source: "SquadBrowser",
    };
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
    source: "Squad Wiki fallback",
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
  const statusSource = String(status?.server?.source || status?.source || "");
  const normalizedSource = statusSource.includes("BattleMetrics")
    ? "BattleMetrics"
    : statusSource.includes("SquadBrowser")
      ? "SquadBrowser"
      : "Squad Wiki";
  return JSON.stringify({
    ok: Boolean(status && status.ok),
    error: cleanText(status && status.error),
    server: status && status.server ? normalizeServer(status.server, normalizedSource) : null,
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
  const generatedAt = new Date().toISOString();
  let current = null;
  let source = "BattleMetrics";
  let battleMetricsError = "";
  let squadBrowserError = "";

  try {
    current = await findBattleMetricsServer();
  } catch (error) {
    battleMetricsError = error instanceof Error ? error.message : String(error);
  }

  if (!current?.server) {
    source = "SquadBrowser";
  }

  try {
    if (!current?.server) {
      current = await findSquadBrowserServer();
    }
  } catch (error) {
    squadBrowserError = error instanceof Error ? error.message : String(error);
  }

  if (!current?.server) {
    current = await findWikiServer();
    source = "Squad Wiki fallback";
  }

  if (!current.server) {
    writeStatus({
      ok: false,
      source,
      generatedAt,
      error: "未在公开服务器列表中找到狼群服务器",
      battleMetricsError,
      squadBrowserError,
      server: null,
      cache: current.cache || null,
    });
    console.log("LQ server was not found in the public server list.");
    return;
  }

  const server = normalizeServer(
    current.server,
    source === "BattleMetrics" ? "BattleMetrics" : source === "SquadBrowser" ? "SquadBrowser" : "Squad Wiki",
  );
  writeStatus({
    ok: true,
    source:
      source === "BattleMetrics"
        ? "BattleMetrics 公开 API"
        : source === "SquadBrowser"
          ? "SquadBrowser 公开列表"
          : "Squad Wiki fallback",
    generatedAt,
    server,
    cache: current.cache || null,
    battleMetricsError: battleMetricsError || undefined,
    squadBrowserError: squadBrowserError || undefined,
  });

  console.log(
    `Updated public status: ${server.map || "unknown map"}, ${server.playerCount ?? "?"} players, queue ${server.queueCount ?? "?"}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
