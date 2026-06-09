const SQUAD_WIKI_JOIN_URL = "https://www.squad.wiki/servers.php?action=join";
const SQUAD_WIKI_LIST_URL = "https://www.squad.wiki/servers.php?action=list";

const DEFAULT_SERVER_ID = "9c93a53f7ac94858a09dfa326cbd7bb2";
const DEFAULT_SERVER_NAME =
  "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩";
const DEFAULT_NAME_HINTS = ["狼群", "【L.Q】", "L.Q"];

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

async function readPayload(request) {
  if (request.method === "POST") {
    return request.json().catch(() => ({}));
  }
  return {};
}

function getServerConfig(env, payload = {}) {
  return {
    serverID: payload.serverID || env.SQUAD_WIKI_SESSION_ID || DEFAULT_SERVER_ID,
    serverName: payload.serverName || env.SQUAD_WIKI_SERVER_NAME || DEFAULT_SERVER_NAME,
  };
}

function serverMatchesName(server, serverName) {
  const name = String(server && server.serverName ? server.serverName : "");
  const configured = String(serverName || "");
  const hints = [
    ...DEFAULT_NAME_HINTS,
    ...configured
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 2 && !/^[=#-]+$/.test(part)),
  ];

  return hints.some((hint) => name.includes(hint));
}

async function findCurrentServer(serverID, serverName) {
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

async function createJoinLink(request, env) {
  const payload = await readPayload(request);
  const server = getServerConfig(env, payload);
  const current = await findCurrentServer(server.serverID, server.serverName);
  const target = current.server
    ? { serverID: current.server.sessionId, serverName: current.server.serverName || server.serverName }
    : server;

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
  const serverID = url.searchParams.get("serverID") || env.SQUAD_WIKI_SESSION_ID || DEFAULT_SERVER_ID;
  const serverName = url.searchParams.get("serverName") || env.SQUAD_WIKI_SERVER_NAME || DEFAULT_SERVER_NAME;
  const current = await findCurrentServer(serverID, serverName);

  if (current.server) {
    return jsonResponse(request, env, { ok: true, server: current.server, cache: current.cache || null });
  }

  return jsonResponse(request, env, { ok: false, error: "未找到服务器", cache: current.cache || null }, 404);
}

export default {
  async fetch(request, env = {}) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    if (url.pathname.endsWith("/status")) {
      return findServer(request, env);
    }
    if (url.pathname.endsWith("/join") || request.method === "POST") {
      return createJoinLink(request, env);
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
