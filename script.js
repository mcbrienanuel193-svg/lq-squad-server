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
    map: "Gorodok Invasion v2",
    mode: "Invasion",
    factionA: "美国陆军",
    factionB: "俄罗斯陆军",
    players: "90 在线",
    queue: "0",
    summary: "当前公开战局进行中，进服前请先确认服务器规则并遵守管理要求，保持公平对局和团队协作。",
    joinUrl: "./join.html",
    reserveUrl: "https://www.fyfaka.com/shop/langqunzsxd",
    rulesUrl: "./rules.html",
    squadWikiUrl: "https://www.squad.wiki/#servers",
    squadWikiSessionId: "9c93a53f7ac94858a09dfa326cbd7bb2",
    squadWikiServerName: "【L.Q】狼群#1 =萌新通宵侵攻= 龟壳服务器-免费击杀提示 诚招OP 带队送积分 真实列表人数 kook:50717753 QQ群:907522575 欢迎游玩",
    joinProxyUrl: "",
    statusProxyUrl: "https://lq-squad-status.mcbrienanuel193.workers.dev/",
    publicStatusUrl: "./public-status.json",
    publicListUrl: "",
    joinNote: "当前对局来自 Cloudflare Worker 实时读取的 Squad Wiki 公开服务器列表。",
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
      body: "开放新人体验位、分队预留位和后勤支援报名，参与前请确认服务器规则、地图安排与语音频道",
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
  return cleanText(faction)
    .replace(/_/g, " ")
    .replace(/\bCombinedArms\b/i, "Combined Arms")
    .replace(/\bMotorized\b/i, "Motorized")
    .replace(/\bAirAssault\b/i, "Air Assault")
    .replace(/\s+/g, " ")
    .trim();
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
  const playerCount = toNumber(firstValue(source.playerCount, source.currentPlayers, source.numPlayers, source.playersOnline, playersText));
  const maxPlayers = toNumber(firstValue(source.maxPlayers, source.maxPlayerCount, source.slots, source.capacity));
  const queueCount = toNumber(firstValue(source.queueCount, source.queue, source.publicQueue, source.reserveQueue));

  return {
    serverName: cleanText(firstValue(source.serverName, source.name, source.hostname)),
    sessionId: cleanText(firstValue(source.sessionId, source.serverID, source.serverId, source.id)),
    map: cleanText(firstValue(source.map, source.currentMap, source.layer, source.layerName)),
    gameMode: cleanText(firstValue(source.gameMode, source.mode, source.gamemode)),
    factionA: cleanText(firstValue(source.factionA, source.teamOne, source.TeamOne_s)),
    factionB: cleanText(firstValue(source.factionB, source.teamTwo, source.TeamTwo_s)),
    playerCount: Number.isFinite(playerCount) ? playerCount : undefined,
    maxPlayers: Number.isFinite(maxPlayers) ? maxPlayers : undefined,
    queueCount: Number.isFinite(queueCount) ? queueCount : undefined,
    source: cleanText(firstValue(source.source, data?.source, "RCON")),
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
    source: cleanText(firstValue(data?.source, "Squad Wiki 公开列表")),
  });
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

function applyLiveMatchServer(server, cache) {
  if (!server || typeof server !== "object") {
    return;
  }

  const liveMatch = {
    map: formatSquadMap(server.map),
    mode: cleanText(server.gameMode),
    factionA: formatSquadFaction(server.factionA),
    factionB: formatSquadFaction(server.factionB),
    players: Number.isFinite(server.playerCount)
      ? server.maxPlayers
        ? `${server.playerCount} / ${server.maxPlayers}`
        : `${server.playerCount} 在线`
      : "",
    queue: Number.isFinite(server.queueCount) ? String(server.queueCount) : "",
  };

  Object.entries(liveMatch).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    document.querySelectorAll(`[data-match="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
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
    target.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 70, 210)}ms`);
  });

  function revealVisibleTargets() {
    const viewportBottom = window.innerHeight * 0.94;

    revealTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      target.classList.toggle("visible", rect.top < viewportBottom && rect.bottom > window.innerHeight * 0.06);
    });
  }

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("visible"));
    return;
  }

  document.documentElement.dataset.scrollDirection = "down";
  let lastScrollY = window.scrollY;
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
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { rootMargin: "-8% 0px -12% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
  updateRevealDirection();
  requestAnimationFrame(revealVisibleTargets);
  window.addEventListener(
    "scroll",
    () => {
      updateRevealDirection();
      revealVisibleTargets();
    },
    { passive: true }
  );
  window.addEventListener("resize", revealVisibleTargets);
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
          <p class="eyebrow">Reserve Slot</p>
          <h2 id="purchaseModalTitle">购买预留位</h2>
        </div>
        <button class="purchase-close" type="button" data-purchase-close aria-label="关闭购买窗口">×</button>
      </header>
      <div class="purchase-frame-wrap">
        <iframe data-purchase-frame title="预留位购买页面" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <footer class="purchase-footer">
        <a class="secondary-button" data-purchase-external href="#" target="_blank" rel="noopener">新窗口打开</a>
        <button class="secondary-button" type="button" data-purchase-close>关闭</button>
      </footer>
    </section>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll("[data-purchase-close]").forEach((control) => {
    control.addEventListener("click", closePurchaseModal);
  });

  return modal;
}

function openPurchaseModal(url) {
  const secureUrl = secureExternalUrl(url);
  const modal = ensurePurchaseModal();
  const frame = modal.querySelector("[data-purchase-frame]");
  const external = modal.querySelector("[data-purchase-external]");

  external.href = secureUrl;
  frame.src = secureUrl;
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
  const frame = modal.querySelector("[data-purchase-frame]");
  if (frame) {
    frame.src = "about:blank";
  }
}

function setupReservePurchase(content) {
  const match = normalizeContent(content).match;

  document.querySelectorAll("[data-match-reserve]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
        return;
      }

      event.preventDefault();
      openPurchaseModal(link.href || match.reserveUrl);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePurchaseModal();
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
}

boot();
