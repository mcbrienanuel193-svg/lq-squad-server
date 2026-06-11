const SQUAD_WIKI_JOIN_URL = "https://www.squad.wiki/servers.php?action=join";
const SQUAD_WIKI_LIST_URL = "https://www.squad.wiki/servers.php?action=list";
const SQUADBROWSER_URL = "https://squadbrowser.app/";
const SQUADBROWSER_GET_SERVERS_ACTION = "404764fc6fe0bbc56e2d4039d07a94500291305ba6";
const BATTLEMETRICS_API_URL = "https://api.battlemetrics.com/servers";

const DEFAULT_SERVER_ID = "9c93a53f7ac94858a09dfa326cbd7bb2";
const DEFAULT_BATTLEMETRICS_SERVER_ID = "39205368";
const DEFAULT_SERVER_NAME =
  "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩";
const DEFAULT_NAME_HINTS = ["狼群", "【L.Q】", "L.Q", "LQ"];
const DEFAULT_SQUADBROWSER_SEARCH = "L.Q";

function corsHeaders(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? "*" : origin === allowedOrigin ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

async function readPayload(request) {
  if (request.method === "POST") {
    return request.json().catch(() => ({}));
  }
  return {};
}

function getServerConfig(env, payload = {}) {
  return {
    serverID: payload.serverID || env.SQUAD_WIKI_SESSION_ID || DEFAULT_SERVER_ID,
    battleMetricsServerID: payload.battleMetricsServerID || env.BATTLEMETRICS_SERVER_ID || DEFAULT_BATTLEMETRICS_SERVER_ID,
    serverName: payload.serverName || env.SQUAD_WIKI_SERVER_NAME || DEFAULT_SERVER_NAME,
    squadBrowserSearch: payload.search || env.SQUADBROWSER_SEARCH || DEFAULT_SQUADBROWSER_SEARCH,
  };
}

function getServerName(server) {
  return cleanText(server?.serverName || server?.name || server?.hostname);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getServerSearchHints(serverName) {
  const nameParts = cleanText(serverName)
    .split(/[\s=|｜#【】\[\]（）()]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !/^\d+$/.test(part));

  return unique([...DEFAULT_NAME_HINTS, ...nameParts]);
}

function serverMatchesName(server, serverName) {
  const name = getServerName(server);
  const configured = cleanText(serverName);

  if (!name) {
    return false;
  }

  if (configured && name === configured) {
    return true;
  }

  return getServerSearchHints(configured).some((hint) => name.includes(hint));
}

async function findCurrentWikiServer(serverID, serverName) {
  let fallback = null;
  let lastCache = null;

  for (let offset = 0; offset < 1200; offset += 200) {
    const upstream = await fetch(`${SQUAD_WIKI_LIST_URL}&offset=${offset}&limit=200`, {
      headers: { Accept: "application/json" },
    });
    const data = await upstream.json().catch(() => ({}));
    const servers = Array.isArray(data.servers) ? data.servers : [];
    lastCache = data.cache || lastCache;

    const byID = serverID ? servers.find((item) => item.sessionId === serverID) : null;
    if (byID) {
      return { server: byID, cache: data.cache || null };
    }

    if (!fallback) {
      fallback = servers.find((item) => serverMatchesName(item, serverName)) || null;
    }

    if (!data.hasMore) {
      break;
    }
  }

  return { server: fallback, cache: lastCache };
}

function parseSquadBrowserPayload(text) {
  const lines = String(text || "").split(/\r?\n/);

  for (const line of lines) {
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
      // Next.js action streams include several non-data records; ignore them.
    }
  }

  throw new Error("SquadBrowser action payload was not readable.");
}

async function fetchSquadBrowserPage(search, page) {
  const filters = {
    name: search,
    page,
    limit: 30,
    showFull: true,
    showEmpty: true,
    showPassworded: true,
  };

  const response = await fetch(SQUADBROWSER_URL, {
    method: "POST",
    headers: {
      Accept: "text/x-component",
      "Content-Type": "text/plain;charset=UTF-8",
      "Next-Action": SQUADBROWSER_GET_SERVERS_ACTION,
      Origin: SQUADBROWSER_URL,
      Referer: SQUADBROWSER_URL,
    },
    body: JSON.stringify([filters]),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`SquadBrowser request failed: ${response.status}`);
  }

  return parseSquadBrowserPayload(text);
}

function normalizeSquadBrowserServer(server) {
  return {
    serverName: getServerName(server),
    squadBrowserId: cleanText(server?.id),
    sessionId: cleanText(server?.session_id || server?.sessionId),
    address: cleanText(server?.address),
    map: cleanText(server?.current_map || server?.map),
    gameMode: cleanText(server?.game_mode || server?.gameMode),
    factionA: cleanText(server?.team_1 || server?.teamOne),
    factionB: cleanText(server?.team_2 || server?.teamTwo),
    playerCount: asNumber(server?.current_players ?? server?.currentPlayers ?? server?.playerCount),
    maxPlayers: asNumber(server?.max_players ?? server?.maxPlayers),
    queueCount: asNumber(server?.queue_players ?? server?.queueCount ?? server?.queue),
    source: "SquadBrowser",
  };
}

async function findCurrentSquadBrowserServer(serverName, search) {
  let fallback = null;
  let fallbackMeta = null;

  for (let page = 1; page <= 4; page += 1) {
    const payload = await fetchSquadBrowserPage(search, page);
    const servers = Array.isArray(payload.data) ? payload.data : [];
    const meta = payload.meta || null;

    const matched = servers.find((server) => serverMatchesName(server, serverName));
    if (matched) {
      return { server: normalizeSquadBrowserServer(matched), cache: { source: "SquadBrowser", page, meta } };
    }

    if (!fallback && servers.length) {
      fallback = servers[0];
      fallbackMeta = meta;
    }

    if (!meta?.hasMore) {
      break;
    }
  }

  return fallback
    ? { server: normalizeSquadBrowserServer(fallback), cache: { source: "SquadBrowser", page: 1, meta: fallbackMeta } }
    : { server: null, cache: null };
}

function normalizeBattleMetricsServer(data) {
  const attributes = data?.data?.attributes || data?.attributes || {};
  const details = attributes.details || {};
  const ip = cleanText(attributes.ip);
  const port = asNumber(attributes.port || attributes.portQuery);

  return {
    serverName: cleanText(attributes.name),
    battleMetricsId: cleanText(data?.data?.id || attributes.id),
    sessionId: DEFAULT_SERVER_ID,
    address: ip && port ? `${ip}:${port}` : "",
    map: cleanText(details.map),
    gameMode: cleanText(details.gameMode),
    factionA: cleanText(details.squad_teamOne),
    factionB: cleanText(details.squad_teamTwo),
    playerCount: asNumber(attributes.players),
    maxPlayers: asNumber(attributes.maxPlayers),
    queueCount: asNumber(details.squad_publicQueue ?? details.squad_reservedQueue),
    nextLayer: cleanText(details.squad_nextLayer),
    updatedAt: cleanText(attributes.updatedAt),
    status: cleanText(attributes.status),
    source: "BattleMetrics",
  };
}

async function findCurrentBattleMetricsServer(serverID) {
  const response = await fetch(`${BATTLEMETRICS_API_URL}/${encodeURIComponent(serverID)}`, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.data?.attributes) {
    throw new Error(data?.errors?.[0]?.detail || `BattleMetrics request failed: ${response.status}`);
  }

  const server = normalizeBattleMetricsServer(data);
  return {
    server,
    cache: {
      source: "BattleMetrics",
      battleMetricsId: serverID,
      updatedAt: server.updatedAt || null,
    },
  };
}

async function createJoinLink(request, env) {
  const payload = await readPayload(request);
  const server = getServerConfig(env, payload);
  const current = await findCurrentWikiServer(server.serverID, server.serverName);
  const target = current.server
    ? { serverID: current.server.sessionId, serverName: current.server.serverName || server.serverName }
    : { serverID: server.serverID, serverName: server.serverName };

  const upstream = await fetch(SQUAD_WIKI_JOIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  });
  const data = await upstream.json().catch(() => ({}));

  return jsonResponse(
    request,
    env,
    current.server ? { ...data, server: current.server, cache: current.cache || null } : data,
    upstream.ok ? 200 : upstream.status,
  );
}

async function findServer(request, env) {
  const url = new URL(request.url);
  const payload = request.method === "POST" ? await readPayload(request) : {};
  const server = getServerConfig(env, payload);
  const serverID = url.searchParams.get("serverID") || server.serverID;
  const battleMetricsServerID = url.searchParams.get("battleMetricsServerID") || server.battleMetricsServerID;
  const serverName = url.searchParams.get("serverName") || server.serverName;
  const search = url.searchParams.get("search") || server.squadBrowserSearch;
  let battleMetricsError = "";
  let squadBrowserError = "";

  try {
    const current = await findCurrentBattleMetricsServer(battleMetricsServerID);
    if (current.server) {
      return jsonResponse(request, env, {
        ok: true,
        source: "BattleMetrics Worker",
        generatedAt: new Date().toISOString(),
        server: current.server,
        cache: current.cache || null,
      });
    }
  } catch (error) {
    battleMetricsError = error instanceof Error ? error.message : String(error);
  }

  try {
    const current = await findCurrentSquadBrowserServer(serverName, search);
    if (current.server) {
      return jsonResponse(request, env, {
        ok: true,
        source: "SquadBrowser Worker",
        generatedAt: new Date().toISOString(),
        server: current.server,
        cache: current.cache || null,
        battleMetricsError,
      });
    }
  } catch (error) {
    squadBrowserError = error instanceof Error ? error.message : String(error);
  }

  const current = await findCurrentWikiServer(serverID, serverName);
  if (current.server) {
    return jsonResponse(request, env, {
      ok: true,
      source: "Squad Wiki fallback",
      generatedAt: new Date().toISOString(),
      server: current.server,
      cache: current.cache || null,
      battleMetricsError,
      squadBrowserError,
    });
  }

  return jsonResponse(
    request,
    env,
    {
      ok: false,
      source: "SquadBrowser Worker",
      error: "未找到狼群服务器",
      battleMetricsError,
      squadBrowserError,
      cache: current.cache || null,
    },
    404,
  );
}

export default {
  async fetch(request, env = {}) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    if (url.pathname.endsWith("/join") || (request.method === "POST" && !url.pathname.endsWith("/status"))) {
      return createJoinLink(request, env);
    }
    if (url.pathname.endsWith("/status") || request.method === "GET") {
      return findServer(request, env);
    }

    return jsonResponse(request, env, {
      ok: true,
      endpoints: {
        join: `${url.origin}/join`,
        status: `${url.origin}/status`,
      },
    });
  },
};
