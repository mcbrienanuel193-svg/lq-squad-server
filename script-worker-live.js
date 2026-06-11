const defaultContent = {
  site: {
    qq: "907522575",
    qqLink: "https://qm.qq.com/q/JWGSe4YnGm",
    serverName: "狼群服务器",
    voiceText: "kook.vip/azTBqj",
    voiceLink: "https://kook.vip/azTBqj",
    recruitStatus: "新人开放中",
  },
  match: {
    map: "同步中",
    mode: "同步中",
    factionA: "同步中",
    factionB: "同步中",
    players: "同步中",
    queue: "同步中",
    summary: "当前公开战局进行中，进服前请先确认服务器规则并遵守管理要求，保持公平对局和团队协作。",
    joinUrl: "./join.html",
    reserveUrl: "https://www.fyfaka.com/shop/langqunzsxd",
    cdkUrl: "https://sq.przsc.cn/cdk_activate.php",
    rulesUrl: "./rules.html",
    squadWikiUrl: "https://www.squad.wiki/#servers",
    squadWikiSessionId: "9c93a53f7ac94858a09dfa326cbd7bb2",
    squadWikiServerName: "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩",
    joinProxyUrl: "",
    statusProxyUrl: "https://lq-squad-status.mcbrienanuel193.workers.dev/",
    publicStatusUrl: "./public-status.json",
    publicListUrl: "",
    joinNote: "当前对局来自 BattleMetrics 精确服务器 ID 实时读取，进服仍跳转 Squad Wiki。",
  },
  rules: {
    intro: "进入狼群 L.Q 服务器前，请先确认并遵守以下规则。管理员会根据现场情况进行提醒、警告、踢出或封禁处理。",
    footerNote: "规则会根据服务器运营情况调整，最终解释以狼群 L.Q 管理组公告为准。",
    categories: [
      {
        title: "基础纪律",
        items: [
          "禁止辱骂、人身攻击、歧视、恶意挑衅、刷屏或发布无关广告。",
          "禁止使用外挂、脚本、漏洞、屏幕准星、透视等破坏公平的工具。",
          "进入服务器默认同意管理员依据规则进行管理。",
        ],
      },
      {
        title: "语音与沟通",
        items: [
          "保持语音频道清晰，战斗中优先传递关键情报。",
          "禁止长时间噪音、音乐外放、抢麦或故意干扰指挥。",
          "发生争议时先服从现场管理，赛后再提交截图或录像复核。",
        ],
      },
      {
        title: "小队与指挥",
        items: [
          "加入小队后请服从队长和管理员的岗位安排。",
          "禁止恶意锁队、占位、挂机、拒不配合团队目标或故意破坏战局。",
          "新人可以主动说明经验情况，队长应尽量安排可执行岗位。",
        ],
      },
      {
        title: "载具与资源",
        items: [
          "载具需按团队需求使用，禁止无故浪费、单人开走关键载具或恶意自毁。",
          "补给车、工事建设、火力支援和资源点应服从团队整体安排。",
          "因误操作造成损失时请及时说明并配合调整，不要隐瞒或争吵。",
        ],
      },
      {
        title: "处理与申诉",
        items: [
          "轻微违规会提醒或警告；重复违规、恶意行为或破坏战局将踢出或封禁。",
          "如对处理结果有异议，请保留截图或录像并联系管理组复核。",
        ],
      },
    ],
  },
  announcements: [
    {
      tag: "置顶",
      date: "2026-06-09",
      title: "狼群 L.Q 夏季公开战局预约开启",
      body: "开放新人体验位、预留位和后勤支援报名，参与前请确认服务器规则、当前地图安排与管理要求",
      pinned: true,
    },
    {
      tag: "OP 招募",
      date: "2026-06-08",
      title: "服务器 OP 管理招募开启",
      body: "招收能稳定在线、愿意维护秩序、协助审核申请和处理日常事务的管理成员",
      pinned: false,
    },
    {
      tag: "招募",
      date: "2026-06-06",
      title: "载具组与侦察组补位招募",
      body: "优先招收能稳定参加训练、愿意服从岗位安排的玩家，审核通过后进入试训",
      pinned: false,
    },
  ],
  sponsors: [
    {
      type: "战略赞助",
      name: "阿泽",
      note: "服务器续费支持",
    },
    {
      type: "活动赞助",
      name: "北巷七号",
      note: "活动奖品支持",
    },
    {
      type: "社区赞助",
      name: "三秋",
      note: "语音频道维护",
    },
  ],
};

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = [...document.querySelectorAll(".site-nav a, .mobile-menu a")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const applicationStorageKey = "lq-player-applications";

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function cleanText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeContent(content) {
  const fallback = cloneContent(defaultContent);
  const source = content && typeof content === "object" ? content : {};
  const site = source.site && typeof source.site === "object" ? source.site : {};
  const match = source.match && typeof source.match === "object" ? source.match : {};
  const rules = source.rules && typeof source.rules === "object" ? source.rules : {};
  const announcements = Array.isArray(source.announcements) ? source.announcements : fallback.announcements;
  const sponsors = Array.isArray(source.sponsors) ? source.sponsors : fallback.sponsors;
  const ruleCategories = Array.isArray(rules.categories) ? rules.categories : fallback.rules.categories;

  return {
    site: {
      qq: cleanText(site.qq, fallback.site.qq),
      qqLink: cleanText(site.qqLink, fallback.site.qqLink),
      serverName: cleanText(site.serverName, fallback.site.serverName),
      voiceText: cleanText(site.voiceText, fallback.site.voiceText),
      voiceLink: cleanText(site.voiceLink, fallback.site.voiceLink),
      recruitStatus: cleanText(site.recruitStatus, fallback.site.recruitStatus),
    },
    match: {
      map: cleanText(match.map, fallback.match.map),
      mode: cleanText(match.mode, fallback.match.mode),
      factionA: cleanText(match.factionA, fallback.match.factionA),
      factionB: cleanText(match.factionB, fallback.match.factionB),
      players: cleanText(match.players, fallback.match.players),
      queue: cleanText(match.queue, fallback.match.queue),
      summary: cleanText(match.summary, fallback.match.summary),
      joinUrl: cleanText(match.joinUrl, fallback.match.joinUrl),
      reserveUrl: cleanText(match.reserveUrl, fallback.match.reserveUrl),
      cdkUrl: cleanText(match.cdkUrl, fallback.match.cdkUrl),
      rulesUrl: cleanText(match.rulesUrl, fallback.match.rulesUrl),
      squadWikiUrl: cleanText(match.squadWikiUrl, fallback.match.squadWikiUrl),
      squadWikiSessionId: cleanText(match.squadWikiSessionId, fallback.match.squadWikiSessionId),
      squadWikiServerName: cleanText(match.squadWikiServerName, fallback.match.squadWikiServerName),
      joinProxyUrl: cleanText(match.joinProxyUrl, fallback.match.joinProxyUrl),
      statusProxyUrl: cleanText(match.statusProxyUrl, fallback.match.statusProxyUrl),
      publicStatusUrl: cleanText(match.publicStatusUrl, fallback.match.publicStatusUrl),
      publicListUrl: cleanText(match.publicListUrl, fallback.match.publicListUrl),
      joinNote: cleanText(match.joinNote, fallback.match.joinNote),
    },
    rules: {
      intro: cleanText(rules.intro, fallback.rules.intro),
      footerNote: cleanText(rules.footerNote, fallback.rules.footerNote),
      categories: ruleCategories
        .map((category) => ({
          title: cleanText(category?.title, "服务器规则"),
          items: Array.isArray(category?.items)
            ? category.items.map((item) => cleanText(item)).filter(Boolean)
            : [],
        }))
        .filter((category) => category.title && category.items.length),
    },
    announcements: announcements
      .map((item) => ({
        tag: cleanText(item?.tag, "公告"),
        date: cleanText(item?.date, "2026-06-09"),
        title: cleanText(item?.title, "公告标题"),
        body: cleanText(item?.body, "公告内容"),
        pinned: Boolean(item?.pinned),
      }))
      .filter((item) => item.title || item.body),
    sponsors: sponsors
      .map((item) => ({
        type: cleanText(item?.type, "赞助"),
        name: cleanText(item?.name, "未命名"),
        note: cleanText(item?.note, "感谢支持"),
      }))
      .filter((item) => item.name),
  };
}

function formatDate(date) {
  return cleanText(date).replaceAll("-", ".");
}

function secureExternalUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.protocol === "http:" && parsed.hostname.endsWith("fyfaka.com")) {
      parsed.protocol = "https:";
    }
    return parsed.href;
  } catch {
    return url;
  }
}

function formatSquadMap(map) {
  return cleanText(map)
    .replaceAll("_", " ")
    .replace(/\bv(\d+)\b/i, "v$1");
}

function formatSquadFaction(faction) {
  const names = {
    ADF: "澳大利亚国防军",
    BAF: "英军",
    CAF: "加拿大军",
    IMF: "民兵",
    INS: "叛军",
    MEA: "中东联盟",
    MEI: "中东联盟",
    PLA: "中国人民解放军",
    PLANMC: "中国海军陆战队",
    RGF: "俄军",
    TLF: "土耳其陆军",
    USA: "美军",
    USMC: "美国海军陆战队",
    VDV: "俄空降军",
  };
  const roles = {
    AirAssault: "空中突击",
    Armored: "装甲",
    CombinedArms: "联合兵种",
    LightInfantry: "轻步兵",
    Mechanized: "机械化",
    Motorized: "摩托化",
    Support: "支援",
  };
  const text = cleanText(faction);
  const tokens = text.split("_").map((token) => token.trim()).filter(Boolean);
  const code = tokens[0]?.toUpperCase();
  const roleText = tokens
    .slice(1)
    .filter((token) => !["LD", "LO", "STD", "SUP"].includes(token.toUpperCase()))
    .map((token) => roles[token] || token.replace(/([a-z])([A-Z])/g, "$1 $2"))
    .join(" / ");

  if (names[code]) {
    return roleText ? `${names[code]} / ${roleText}` : names[code];
  }

  const normalized = text
    .replace(/_/g, " ")
    .replace(/\bCombinedArms\b/i, "Combined Arms")
    .replace(/\bMechanized\b/i, "Mechanized")
    .replace(/\bMotorized\b/i, "Motorized")
    .replace(/\bAirAssault\b/i, "Air Assault")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

function formatLiveTime(date = new Date()) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const matched = value.replaceAll(",", "").match(/\d+/);
    return matched ? Number(matched[0]) : NaN;
  }

  return NaN;
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeLiveServerPayload(data) {
  const source = data?.server || data?.status || data?.data || data;
  if (!source || typeof source !== "object") {
    return null;
  }

  const playersText = firstValue(source.players, source.playerText);
  const playerCount = toNumber(
    firstValue(
      source.playerCount,
      source.currentPlayers,
      source.current_players,
      source.numPlayers,
      source.playersOnline,
      playersText,
    ),
  );
  const maxPlayers = toNumber(firstValue(source.maxPlayers, source.max_players, source.maxPlayerCount, source.slots, source.capacity));
  const queueCount = toNumber(firstValue(source.queueCount, source.queue_players, source.queue, source.publicQueue, source.reserveQueue));

  return {
    serverName: cleanText(firstValue(source.serverName, source.name, source.hostname)),
    sessionId: cleanText(firstValue(source.sessionId, source.session_id, source.serverID, source.serverId, source.squadWikiSessionId)),
    map: cleanText(firstValue(source.map, source.currentMap, source.current_map, source.layer, source.layerName)),
    gameMode: cleanText(firstValue(source.gameMode, source.game_mode, source.mode, source.gamemode)),
    factionA: cleanText(firstValue(source.factionA, source.teamOne, source.team_1, source.TeamOne_s)),
    factionB: cleanText(firstValue(source.factionB, source.teamTwo, source.team_2, source.TeamTwo_s)),
    playerCount: Number.isFinite(playerCount) ? playerCount : undefined,
    maxPlayers: Number.isFinite(maxPlayers) ? maxPlayers : undefined,
    queueCount: Number.isFinite(queueCount) ? queueCount : undefined,
    source: cleanText(firstValue(source.source, data?.source, "SquadBrowser")),
  };
}

function buildSquadWikiServerUrl(match) {
  try {
    const url = new URL(match.squadWikiUrl || "https://www.squad.wiki/#servers", window.location.href);
    if (match.squadWikiSessionId) {
      url.searchParams.set("serverID", match.squadWikiSessionId);
    }
    if (match.squadWikiServerName) {
      url.searchParams.set("serverName", match.squadWikiServerName);
    }
    if (!url.hash) {
      url.hash = "servers";
    }
    return url.href;
  } catch {
    return match.squadWikiUrl || "https://www.squad.wiki/#servers";
  }
}

function deriveStatusProxyUrl(match) {
  if (match.statusProxyUrl) {
    return match.statusProxyUrl;
  }

  if (!match.joinProxyUrl) {
    return "";
  }

  try {
    const parsed = new URL(match.joinProxyUrl, window.location.href);
    parsed.pathname = parsed.pathname.replace(/\/join\/?$/, "/status");
    if (!parsed.pathname.endsWith("/status")) {
      parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/status`;
    }
    return parsed.href;
  } catch {
    return "";
  }
}

function hasLiveStatusSource(match) {
  return Boolean(deriveStatusProxyUrl(match) || match.publicStatusUrl || match.publicListUrl);
}

function getPublicStatusUrls(match) {
  return [match.publicStatusUrl, match.publicListUrl].map((url) => cleanText(url)).filter(Boolean);
}

function getServerSearchHints(match) {
  const configured = cleanText(match.squadWikiServerName);
  const hints = ["狼群", "L.Q", "LQ"];

  configured
    .split(/[\s=|｜#【】\[\]（）()]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !/^\d+$/.test(part))
    .forEach((part) => hints.push(part));

  return [...new Set(hints)];
}

function publicServerMatches(server, match) {
  if (!server || typeof server !== "object") {
    return false;
  }

  const sessionId = cleanText(firstValue(server.sessionId, server.serverID, server.serverId, server.id));
  if (match.squadWikiSessionId && sessionId === match.squadWikiSessionId) {
    return true;
  }

  const serverName = cleanText(firstValue(server.serverName, server.name, server.hostname));
  if (!serverName) {
    return false;
  }

  if (match.squadWikiServerName && serverName === match.squadWikiServerName) {
    return true;
  }

  return getServerSearchHints(match).some((hint) => serverName.includes(hint));
}

function getPublicServers(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return firstValue(data?.servers, data?.data?.servers, data?.data, data?.results, []);
}

function normalizePublicStatusPayload(data, match) {
  const direct = normalizeLiveServerPayload(data);
  if (direct && (direct.map || direct.gameMode || Number.isFinite(direct.playerCount))) {
    direct.source = direct.source === "RCON" ? "公开服务器列表" : direct.source;
    return direct;
  }

  const servers = getPublicServers(data);
  if (!Array.isArray(servers)) {
    return null;
  }

  const found = servers.find((server) => publicServerMatches(server, match));
  if (!found) {
    return null;
  }

  return normalizeLiveServerPayload({
    server: found,
    source: cleanText(firstValue(data?.source, "SquadBrowser 公开列表")),
  });
}

function isOutdatedStatusWorker(data, server) {
  const sourceText = `${cleanText(data?.source)} ${cleanText(server?.source)}`;
  if (/Squad Wiki Worker/i.test(sourceText)) {
    return true;
  }
  return /SquadBrowser Worker/i.test(sourceText) && !data?.battleMetricsError;
}

function addMatchQueryParams(url, match) {
  if (match.squadWikiSessionId && !url.searchParams.has("serverID")) {
    url.searchParams.set("serverID", match.squadWikiSessionId);
  }
  if (match.squadWikiServerName && !url.searchParams.has("serverName")) {
    url.searchParams.set("serverName", match.squadWikiServerName);
  }
}

function setLiveMatchStatus(message, state = "info") {
  document.querySelectorAll("[data-live-match-status]").forEach((node) => {
    node.textContent = message;
    node.dataset.state = state;
  });
}

function setMatchFieldValue(key, value) {
  document.querySelectorAll(`[data-match="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function setMatchLoadingState() {
  const statusNode = document.querySelector("[data-live-match-status]");
  if (statusNode?.dataset.state === "ready") {
    return;
  }

  Object.entries({
    map: "同步中",
    mode: "同步中",
    factionA: "同步中",
    factionB: "同步中",
    players: "同步中",
    queue: "同步中",
  }).forEach(([key, value]) => {
    setMatchFieldValue(key, value);
  });
}

function applyLiveMatchServer(server, cache) {
  if (!server || typeof server !== "object") {
    return;
  }

  const liveMatch = {
    map: formatSquadMap(server.map) || "同步中",
    mode: cleanText(server.gameMode) || "同步中",
    factionA: formatSquadFaction(server.factionA) || "公开列表未提供",
    factionB: formatSquadFaction(server.factionB) || "公开列表未提供",
    players: Number.isFinite(server.playerCount)
      ? server.maxPlayers
        ? `${server.playerCount} / ${server.maxPlayers}`
        : `${server.playerCount} 在线`
      : "同步中",
    queue: Number.isFinite(server.queueCount) ? String(server.queueCount) : "同步中",
  };

  Object.entries(liveMatch).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    setMatchFieldValue(key, value);
  });

  if (server.serverName) {
    document.querySelectorAll("[data-join-server-name]").forEach((node) => {
      node.textContent = server.serverName;
    });
  }

  if (server.sessionId) {
    document.querySelectorAll("[data-join-session-id]").forEach((node) => {
      node.textContent = server.sessionId;
    });
  }

  const cacheAge = cache && Number.isFinite(cache.ageSeconds) ? `，缓存 ${cache.ageSeconds}s` : "";
  setLiveMatchStatus(`实时同步：${server.source || "RCON"} ${formatLiveTime()}${cacheAge}`, "ready");
}

async function refreshLiveMatchStatus(match) {
  if (!hasLiveStatusSource(match)) {
    setLiveMatchStatus("当前显示最近一次记录；配置公开状态源后会自动同步。", "warn");
    return false;
  }

  const sources = [
    { url: deriveStatusProxyUrl(match), type: "status" },
    ...getPublicStatusUrls(match).map((url) => ({ url, type: "public" })),
  ].filter((source) => source.url);

  setMatchLoadingState();
  setLiveMatchStatus("正在同步 BattleMetrics 实时对局...", "busy");

  for (const source of sources) {
    try {
      const url = new URL(source.url, window.location.href);
      if (source.type === "status") {
        addMatchQueryParams(url, match);
      }

      const response = await fetch(url.href, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "实时状态读取失败");
      }

      const server =
        source.type === "status" ? normalizeLiveServerPayload(data) : normalizePublicStatusPayload(data, match);
      if (!server) {
        throw new Error("实时状态格式不正确");
      }
      if (source.type === "status" && isOutdatedStatusWorker(data, server)) {
        throw new Error("旧版 Worker 数据源已跳过");
      }

      applyLiveMatchServer(server, data.cache || null);
      return true;
    } catch {
      continue;
    }
  }

  setLiveMatchStatus("公开服务器列表暂时不可用，当前显示最近一次记录。", "error");
  return false;
}

function appendText(parent, tagName, text) {
  const node = document.createElement(tagName);
  node.textContent = text;
  parent.appendChild(node);
  return node;
}

function renderAnnouncements(items) {
  const list = document.querySelector(".event-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = item.pinned ? "event-card pinned" : "event-card";

    const meta = document.createElement("div");
    appendText(meta, "span", item.tag);
    const time = appendText(meta, "time", formatDate(item.date));
    time.dateTime = item.date;

    appendText(card, "h3", item.title);
    appendText(card, "p", item.body);
    card.prepend(meta);
    list.appendChild(card);
  });
}

function renderSponsors(items) {
  const wall = document.querySelector(".sponsor-wall");
  if (!wall) {
    return;
  }

  wall.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    appendText(card, "span", item.type);
    appendText(card, "strong", item.name);
    appendText(card, "small", item.note);
    wall.appendChild(card);
  });
}

function renderRules(rules) {
  const list = document.querySelector(".rules-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  rules.categories.forEach((category, index) => {
    const details = document.createElement("details");
    details.className = "rule-category";
    details.open = index === 0;

    appendText(details, "summary", category.title);
    const items = document.createElement("ul");
    category.items.forEach((item) => {
      appendText(items, "li", item);
    });

    details.appendChild(items);
    list.appendChild(details);
  });
}

function applySiteContent(content) {
  const normalized = normalizeContent(content);

  document.querySelectorAll('[data-config="qq"]').forEach((node) => {
    node.textContent = normalized.site.qq;
  });

  document.querySelectorAll('[data-config="server-ip"]').forEach((node) => {
    node.textContent = normalized.site.serverName;
  });

  document.querySelectorAll('[data-config="voice"]').forEach((node) => {
    node.textContent = normalized.site.voiceText;
  });

  document.querySelectorAll(".green").forEach((node) => {
    node.textContent = normalized.site.recruitStatus;
  });

  document.querySelectorAll("[data-qq-link]").forEach((node) => {
    node.href = normalized.site.qqLink;
  });

  document.querySelectorAll("[data-voice-link]").forEach((node) => {
    node.href = normalized.site.voiceLink;
  });

  document.querySelectorAll("[data-match]").forEach((node) => {
    const key = node.dataset.match;
    if (key && Object.hasOwn(normalized.match, key)) {
      node.textContent = normalized.match[key];
    }
  });

  const squadWikiServerUrl = buildSquadWikiServerUrl(normalized.match);

  document.querySelectorAll("[data-match-join]").forEach((node) => {
    node.href = squadWikiServerUrl;
    node.target = "_blank";
    node.rel = "noopener";
  });

  document.querySelectorAll("[data-match-reserve]").forEach((node) => {
    node.href = secureExternalUrl(normalized.match.reserveUrl);
  });

  document.querySelectorAll("[data-match-cdk]").forEach((node) => {
    node.href = secureExternalUrl(normalized.match.cdkUrl);
  });

  document.querySelectorAll("[data-match-rules]").forEach((node) => {
    node.href = normalized.match.rulesUrl;
  });

  document.querySelectorAll("[data-squad-wiki-link]").forEach((node) => {
    node.href = squadWikiServerUrl;
  });

  document.querySelectorAll("[data-join-server-name]").forEach((node) => {
    node.textContent = normalized.match.squadWikiServerName;
  });

  document.querySelectorAll("[data-join-session-id]").forEach((node) => {
    node.textContent = normalized.match.squadWikiSessionId;
  });

  document.querySelectorAll("[data-rules-intro]").forEach((node) => {
    node.textContent = normalized.rules.intro;
  });

  document.querySelectorAll("[data-rules-footer]").forEach((node) => {
    node.textContent = normalized.rules.footerNote;
  });

  renderAnnouncements(normalized.announcements);
  renderSponsors(normalized.sponsors);
  renderRules(normalized.rules);
}

async function loadContent() {
  try {
    const response = await fetch(`./content.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("content unavailable");
    }

    return normalizeContent(await response.json());
  } catch {
    return cloneContent(defaultContent);
  }
}

function setHeaderState() {
  if (!header) {
    return;
  }

  header.dataset.elevated = window.scrollY > 12 ? "true" : "false";
}

function setupNavigation() {
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  menuButton?.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });
}

function setupRipple() {
  document.querySelectorAll("button, .icon-button, .primary-button, .secondary-button, .join-links a").forEach((control) => {
    control.addEventListener("click", (event) => {
      if (reduceMotion.matches) {
        return;
      }

      const rect = control.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${event.clientX - rect.left - 22}px`;
      ripple.style.top = `${event.clientY - rect.top - 22}px`;
      control.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
}

function setupReveal() {
  const revealTargets = [
    ".ops-strip",
    ".section-head",
    ".match-panel",
    ".match-board article",
    ".match-stat",
    ".join-server-button",
    ".reserve-slot-button",
    ".cdk-button",
    ".student-benefit-button",
    ".rules-button",
    ".rule-category",
    ".feature-grid article",
    ".about-grid article",
    ".server-console",
    ".section-copy",
    ".event-card",
    ".squad-grid article",
    ".sponsor-wall article",
    ".join-copy",
    ".join-form",
  ]
    .flatMap((selector) => [...document.querySelectorAll(selector)])
    .filter((target) => !target.closest(".join-launch-actions"));

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.dataset.revealDirection = "up";
    target.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 52, 156)}ms`);
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("visible"));
    return;
  }

  document.documentElement.dataset.scrollDirection = "down";
  let lastScrollY = window.scrollY;
  let ticking = false;
  function updateRevealDirection() {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) > 1) {
      document.documentElement.dataset.scrollDirection = currentScrollY > lastScrollY ? "down" : "up";
    }
    lastScrollY = currentScrollY;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const direction = entry.boundingClientRect.top < 0 ? "down" : "up";
        entry.target.dataset.revealDirection = direction;
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { rootMargin: "-6% 0px -10% 0px", threshold: [0, 0.16, 0.32] }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
  updateRevealDirection();
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(() => {
        updateRevealDirection();
        ticking = false;
      });
    },
    { passive: true }
  );
}

function setupSectionObserver() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sections = navLinks
    .map((link) => link.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"))
    .map((href) => document.querySelector(href))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      document.querySelectorAll(".site-nav a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.35, 0.7] }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupAmbientMotion() {
  if (reduceMotion.matches) {
    return;
  }

  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function setScrollProgress() {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  }

  function moveHero(event) {
    if (!hero || !heroArt) {
      return;
    }

    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return;
    }

    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 28;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
  }

  function animateHero() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    if (heroArt) {
      heroArt.style.setProperty("--hero-x", `${currentX.toFixed(2)}px`);
      heroArt.style.setProperty("--hero-y", `${currentY.toFixed(2)}px`);
    }

    requestAnimationFrame(animateHero);
  }

  setScrollProgress();
  window.addEventListener("scroll", setScrollProgress, { passive: true });
  window.addEventListener("resize", setScrollProgress);
  window.addEventListener("pointermove", moveHero, { passive: true });
  requestAnimationFrame(animateHero);
}

function readLocalApplications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(applicationStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalApplication(application) {
  const applications = readLocalApplications();
  applications.unshift(application);
  localStorage.setItem(applicationStorageKey, JSON.stringify(applications.slice(0, 80)));
}

function setupJoinForm() {
  document.querySelector(".join-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const status = form.querySelector(".form-status");
    const nickname = cleanText(data.get("nickname"));
    const contact = cleanText(data.get("contact"));
    const role = cleanText(data.get("role"));
    const message = cleanText(data.get("message"));

    if (!nickname || !contact) {
      status.textContent = "请至少填写游戏昵称和联系方式";
      return;
    }

    const summary = `申请信息：${nickname} / ${contact} / ${role}${message ? ` / ${message}` : ""}`;
    saveLocalApplication({
      id: `APP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      nickname,
      contact,
      role,
      message,
      status: "待处理",
    });

    status.textContent = "申请信息已保存到本机后台，并已复制 可再发送到QQ群或KOOK给管理员";
    form.reset();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => undefined);
    }
  });
}

function setJoinLaunchState(message, state = "info") {
  document.querySelectorAll("[data-join-launch-status]").forEach((node) => {
    node.textContent = message;
    node.dataset.state = state;
  });
}

function setupLiveMatchStatus(content) {
  const match = normalizeContent(content).match;
  refreshLiveMatchStatus(match);

  if (hasLiveStatusSource(match)) {
    window.setInterval(() => {
      refreshLiveMatchStatus(match);
    }, 60 * 1000);
  }
}

function setupSquadWikiJoin(content) {
  const match = normalizeContent(content).match;
  const buttons = document.querySelectorAll("[data-dynamic-join]");
  const squadWikiServerUrl = buildSquadWikiServerUrl(match);

  if (!buttons.length) {
    return;
  }

  setJoinLaunchState("点击后会跳转到 Squad Wiki 对应服务器页面，在页面内使用一键加入。", "ready");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setJoinLaunchState("正在打开 Squad Wiki 服务器页面...", "busy");
      window.open(squadWikiServerUrl, "_blank", "noopener");
      setJoinLaunchState("已打开 Squad Wiki；如浏览器拦截新窗口，请点击旁边的打开 Squad Wiki。", "ready");
    });
  });
}

const purchaseCatalog = [
  {
    label: "预留位",
    desc: "VIP 专属席位",
    badge: "VIP",
    plans: [
      { label: "月", price: "30", suffix: "元/月" },
      { label: "季", price: "75", suffix: "元/季" },
      { label: "永久", price: "388", suffix: "元/永久" },
    ],
  },
  {
    label: "跳边权限",
    desc: "可任意加入任一阵营",
    badge: "SWAP",
    plans: [
      { label: "月", price: "15", suffix: "元/月" },
      { label: "季", price: "35", suffix: "元/季" },
      { label: "永久", price: "188", suffix: "元/永久" },
    ],
  },
  {
    label: "防踢权限",
    desc: "安心作战，专注团队配合",
    badge: "SAFE",
    plans: [
      { label: "月", price: "20", suffix: "元/月" },
      { label: "季", price: "50", suffix: "元/季" },
      { label: "永久", price: "288", suffix: "元/永久" },
    ],
  },
  {
    label: "入服黄字定制",
    desc: "专属战术标识",
    badge: "TAG",
    plans: [
      { label: "月", price: "10", suffix: "元/月" },
      { label: "季", price: "25", suffix: "元/季" },
      { label: "永久", price: "188", suffix: "元/永久" },
    ],
  },
];

function renderPurchaseRows() {
  return purchaseCatalog
    .map(
      (item) => `
        <article class="purchase-row">
          <div class="purchase-product">
            <span>${item.badge}</span>
            <div>
              <strong>${item.label}</strong>
              <small>${item.desc}</small>
            </div>
          </div>
          <div class="purchase-options">
            ${item.plans
              .map(
                (plan) => `
                  <a class="purchase-option is-disabled" aria-disabled="true" data-purchase-option="${item.label} ${plan.label} ${plan.price}${plan.suffix}" href="#" target="_blank" rel="noopener">
                    <strong>${plan.price}</strong>
                    <span>${plan.suffix}</span>
                  </a>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function hasPurchaseConsent(modal) {
  return Boolean(modal.querySelector("[data-purchase-consent]")?.checked);
}

function setPurchaseStatus(modal, message) {
  const status = modal.querySelector("[data-purchase-status]");
  if (status) {
    status.textContent = message;
  }
}

function updatePurchaseConsentState(modal) {
  const confirmed = hasPurchaseConsent(modal);

  modal.querySelectorAll("[data-purchase-option], [data-purchase-external]").forEach((control) => {
    control.classList.toggle("is-disabled", !confirmed);
    control.setAttribute("aria-disabled", confirmed ? "false" : "true");
  });

  setPurchaseStatus(
    modal,
    confirmed
      ? "已确认购买须知，现在可以点击价格或打开完整店铺。购买完成后请使用 CDK 兑换入口激活。"
      : "请先勾选并确认购买须知，确认后才能点击价格或打开完整店铺。"
  );
}

function guardPurchaseNavigation(event, modal) {
  if (hasPurchaseConsent(modal)) {
    return true;
  }

  event.preventDefault();
  setPurchaseStatus(modal, "请先确认：虚拟权益和 CDK 商品购买后不支持退款，确认后才能继续购买。");
  modal.querySelector("[data-purchase-consent]")?.focus();
  return false;
}

function ensurePurchaseModal() {
  let modal = document.querySelector("[data-purchase-modal]");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");
  modal.className = "purchase-modal hidden";
  modal.dataset.purchaseModal = "";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "purchaseModalTitle");
  modal.innerHTML = `
    <div class="purchase-backdrop" data-purchase-close></div>
    <section class="purchase-dialog">
      <header class="purchase-header">
        <div>
          <p class="eyebrow">SERVER SHOP</p>
          <h2 id="purchaseModalTitle">权限与预留价目表</h2>
        </div>
        <button class="purchase-close" type="button" data-purchase-close aria-label="关闭购买窗口">x</button>
      </header>
      <div class="purchase-body">
        <div class="purchase-intro">
          <strong>选择项目后跳转飞鱼发卡付款</strong>
          <span>付款和 CDK 自动发放仍由飞鱼发卡处理，购买完成后可使用本站提供的 CDK 兑换入口激活。</span>
        </div>
        <div class="purchase-consent">
          <strong>购买须知</strong>
          <ul>
            <li>虚拟权益、预留位和 CDK 商品付款后不支持无理由退款。</li>
            <li>请确认购买项目、期限、游戏信息和联系方式填写正确，信息错误可能影响发放或激活。</li>
            <li>CDK 购买完成后请前往兑换入口激活，遇到问题请联系管理处理。</li>
          </ul>
          <label class="purchase-confirm">
            <input type="checkbox" data-purchase-consent />
            <span>我已阅读并同意以上购买须知，确认后继续购买。</span>
          </label>
        </div>
        <div class="purchase-table">
          ${renderPurchaseRows()}
        </div>
        <p class="purchase-note" data-purchase-status>请先勾选并确认购买须知，确认后才能点击价格或打开完整店铺。</p>
      </div>
      <footer class="purchase-footer">
        <a class="secondary-button" data-purchase-cdk href="https://sq.przsc.cn/cdk_activate.php" target="_blank" rel="noopener">兑换 CDK</a>
        <a class="secondary-button is-disabled" aria-disabled="true" data-purchase-external href="#" target="_blank" rel="noopener">打开完整店铺</a>
        <button class="secondary-button" type="button" data-purchase-close>关闭</button>
      </footer>
    </section>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll("[data-purchase-close]").forEach((control) => {
    control.addEventListener("click", closePurchaseModal);
  });

  modal.querySelector("[data-purchase-consent]")?.addEventListener("change", () => {
    updatePurchaseConsentState(modal);
  });

  modal.querySelectorAll("[data-purchase-option]").forEach((control) => {
    control.addEventListener("click", (event) => {
      if (!guardPurchaseNavigation(event, modal)) {
        return;
      }

      const option = control.dataset.purchaseOption || "所选商品";
      setPurchaseStatus(modal, `已打开飞鱼发卡：${option}。如果没有自动定位，请在发卡页面选择同名商品。`);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`我要购买：${option}`).catch(() => undefined);
      }
    });
  });

  modal.querySelector("[data-purchase-external]")?.addEventListener("click", (event) => {
    guardPurchaseNavigation(event, modal);
  });

  return modal;
}

function openPurchaseModal(url, cdkUrl = defaultContent.match.cdkUrl) {
  const secureUrl = secureExternalUrl(url);
  const modal = ensurePurchaseModal();
  const external = modal.querySelector("[data-purchase-external]");
  const cdk = modal.querySelector("[data-purchase-cdk]");
  const consent = modal.querySelector("[data-purchase-consent]");

  external.href = secureUrl;
  cdk.href = secureExternalUrl(cdkUrl);
  if (consent) {
    consent.checked = false;
  }
  modal.querySelectorAll("[data-purchase-option]").forEach((link) => {
    link.href = secureUrl;
  });
  updatePurchaseConsentState(modal);
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  modal.querySelector(".purchase-close")?.focus();
}

function closePurchaseModal() {
  const modal = document.querySelector("[data-purchase-modal]");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function setupReservePurchase(content) {
  const match = normalizeContent(content).match;

  document.querySelectorAll("[data-match-reserve]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPurchaseModal(link.href || match.reserveUrl, match.cdkUrl);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePurchaseModal();
    }
  });
}

function updateStudentFileStatus(modal) {
  const status = modal.querySelector("[data-student-file-status]");
  if (!status) {
    return;
  }

  const selected = [...modal.querySelectorAll("[data-student-file]")]
    .map((input) => {
      const files = [...(input.files || [])].map((file) => file.name).filter(Boolean);
      return files.length ? `${input.dataset.studentFile}：${files.join("、")}` : "";
    })
    .filter(Boolean);

  status.textContent = selected.length
    ? `已在本机选择：${selected.join("；")}。请进 QQ 群联系管理提交审核。`
    : "尚未选择材料；准备好后请进 QQ 群联系管理提交审核。";
}

function ensureStudentBenefitModal() {
  let modal = document.querySelector("[data-student-modal]");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");
  modal.className = "student-modal hidden";
  modal.dataset.studentModal = "";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "studentBenefitTitle");
  modal.innerHTML = `
    <div class="student-backdrop" data-student-close></div>
    <section class="student-dialog">
      <header class="student-header">
        <div>
          <p class="eyebrow">STUDENT BENEFIT</p>
          <h2 id="studentBenefitTitle">高考生预留位福利</h2>
        </div>
        <button class="student-close" type="button" data-student-close aria-label="关闭高考生福利窗口">x</button>
      </header>
      <div class="student-body">
        <div class="student-benefit-steps">
          <article>
            <span>01 准考证审核</span>
            <strong>领取 15 天预留位</strong>
            <p>高考生凭本人准考证，经管理审核后可领取 15 天预留位。</p>
          </article>
          <article>
            <span>02 录取通知书审核</span>
            <strong>可再领 15 天</strong>
            <p>收到大学录取通知书后，凭通知书联系管理，可再领取 15 天预留位。</p>
          </article>
        </div>
        <div class="student-upload-panel">
          <p>本页面只用于本地选择材料，不会上传或保存文件。请加入 QQ 群后联系管理，提交准考证或录取通知书审核领取。</p>
          <div class="student-file-grid">
            <label class="student-file-field">
              <span>准考证图片/文件</span>
              <input type="file" data-student-file="准考证" accept="image/*,.pdf" />
            </label>
            <label class="student-file-field">
              <span>大学录取通知书图片/文件</span>
              <input type="file" data-student-file="录取通知书" accept="image/*,.pdf" />
            </label>
          </div>
          <p class="student-file-status" data-student-file-status>尚未选择材料；准备好后请进 QQ 群联系管理提交审核。</p>
        </div>
      </div>
      <footer class="student-footer">
        <a class="primary-button" data-student-qq data-qq-link href="https://qm.qq.com/q/JWGSe4YnGm" target="_blank" rel="noopener">进入 QQ 群联系管理</a>
        <button class="secondary-button" type="button" data-student-close>关闭</button>
      </footer>
    </section>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll("[data-student-close]").forEach((control) => {
    control.addEventListener("click", closeStudentBenefitModal);
  });

  modal.querySelectorAll("[data-student-file]").forEach((input) => {
    input.addEventListener("change", () => updateStudentFileStatus(modal));
  });

  return modal;
}

function openStudentBenefitModal(qqLink = defaultContent.site.qqLink) {
  const modal = ensureStudentBenefitModal();

  modal.querySelectorAll("[data-qq-link]").forEach((node) => {
    node.href = secureExternalUrl(qqLink);
  });
  updateStudentFileStatus(modal);
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  modal.querySelector(".student-close")?.focus();
}

function closeStudentBenefitModal() {
  const modal = document.querySelector("[data-student-modal]");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function setupStudentBenefit(content) {
  const site = normalizeContent(content).site;

  document.querySelectorAll("[data-student-benefit-open]").forEach((control) => {
    control.addEventListener("click", () => {
      openStudentBenefitModal(site.qqLink);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeStudentBenefitModal();
    }
  });
}

async function boot() {
  const content = await loadContent();
  applySiteContent(content);
  setupNavigation();
  setupRipple();
  setupReveal();
  setupSectionObserver();
  setupAmbientMotion();
  setupJoinForm();
  setupLiveMatchStatus(content);
  setupSquadWikiJoin(content);
  setupReservePurchase(content);
  setupStudentBenefit(content);
}

boot();
