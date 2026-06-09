(() => {
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
    cdkUrl: "https://sq.przsc.cn/cdk_activate.php",
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

const settingsKey = "lq-admin-repo-settings";
const tokenSessionKey = "lq-admin-token";
const applicationStorageKey = "lq-player-applications";
const contentPath = "content.json";
const statusNode = document.querySelector("#adminStatus");
const loginStatusNode = document.querySelector("#loginStatus");
const loginPanel = document.querySelector("#adminLogin");
const adminApp = document.querySelector("#adminApp");
const adminOverlay = document.querySelector("#adminOverlay");
const announcementList = document.querySelector("#announcementList");
const sponsorList = document.querySelector("#sponsorList");
const applicationList = document.querySelector("#applicationList");
let currentSha = "";
let currentRules = cloneContent(defaultContent.rules);

if (!loginPanel || !adminApp || !statusNode || !loginStatusNode) {
  return;
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function setStatus(message, state = "") {
  statusNode.textContent = message;
  statusNode.dataset.state = state;
}

function setLoginStatus(message, state = "") {
  loginStatusNode.textContent = message;
  loginStatusNode.dataset.state = state;
}

function openAdmin() {
  if (adminOverlay) {
    adminOverlay.classList.remove("hidden");
    adminOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-open");
  }
}

function closeAdmin() {
  if (adminOverlay) {
    adminOverlay.classList.add("hidden");
    adminOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("admin-open");
  }
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(settingsKey) || "{}");
  } catch {
    return {};
  }
}

function saveSettings() {
  const settings = {
    owner: cleanText(document.querySelector("#repoOwner").value),
    repo: cleanText(document.querySelector("#repoName").value),
    branch: cleanText(document.querySelector("#repoBranch").value),
  };
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  return settings;
}

function applySettings() {
  const settings = readSettings();
  if (settings.owner) document.querySelector("#repoOwner").value = settings.owner;
  if (settings.repo) document.querySelector("#repoName").value = settings.repo;
  if (settings.branch) document.querySelector("#repoBranch").value = settings.branch;
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
      qq: cleanText(site.qq) || fallback.site.qq,
      qqLink: cleanText(site.qqLink) || fallback.site.qqLink,
      serverName: cleanText(site.serverName) || fallback.site.serverName,
      voiceText: cleanText(site.voiceText) || fallback.site.voiceText,
      voiceLink: cleanText(site.voiceLink) || fallback.site.voiceLink,
      recruitStatus: cleanText(site.recruitStatus) || fallback.site.recruitStatus,
    },
    match: {
      map: cleanText(match.map) || fallback.match.map,
      mode: cleanText(match.mode) || fallback.match.mode,
      factionA: cleanText(match.factionA) || fallback.match.factionA,
      factionB: cleanText(match.factionB) || fallback.match.factionB,
      players: cleanText(match.players) || fallback.match.players,
      queue: cleanText(match.queue) || fallback.match.queue,
      summary: cleanText(match.summary) || fallback.match.summary,
      joinUrl: cleanText(match.joinUrl) || fallback.match.joinUrl,
      reserveUrl: cleanText(match.reserveUrl) || fallback.match.reserveUrl,
      cdkUrl: cleanText(match.cdkUrl) || fallback.match.cdkUrl,
      rulesUrl: cleanText(match.rulesUrl) || fallback.match.rulesUrl,
      squadWikiUrl: cleanText(match.squadWikiUrl) || fallback.match.squadWikiUrl,
      squadWikiSessionId: cleanText(match.squadWikiSessionId) || fallback.match.squadWikiSessionId,
      squadWikiServerName: cleanText(match.squadWikiServerName) || fallback.match.squadWikiServerName,
      joinProxyUrl: cleanText(match.joinProxyUrl) || fallback.match.joinProxyUrl,
      statusProxyUrl: cleanText(match.statusProxyUrl) || fallback.match.statusProxyUrl,
      publicStatusUrl: cleanText(match.publicStatusUrl) || fallback.match.publicStatusUrl,
      publicListUrl: cleanText(match.publicListUrl) || fallback.match.publicListUrl,
      joinNote: cleanText(match.joinNote) || fallback.match.joinNote,
    },
    rules: {
      intro: cleanText(rules.intro) || fallback.rules.intro,
      footerNote: cleanText(rules.footerNote) || fallback.rules.footerNote,
      categories: ruleCategories
        .map((category) => ({
          title: cleanText(category?.title) || "服务器规则",
          items: Array.isArray(category?.items) ? category.items.map((item) => cleanText(item)).filter(Boolean) : [],
        }))
        .filter((category) => category.title && category.items.length),
    },
    announcements: announcements.map((item) => ({
      tag: cleanText(item?.tag) || "公告",
      date: cleanText(item?.date) || "2026-06-09",
      title: cleanText(item?.title) || "公告标题",
      body: cleanText(item?.body) || "公告内容",
      pinned: Boolean(item?.pinned),
    })),
    sponsors: sponsors.map((item) => ({
      type: cleanText(item?.type) || "赞助",
      name: cleanText(item?.name) || "未命名",
      note: cleanText(item?.note) || "感谢支持",
    })),
  };
}

function makeInput(label, value, field, type = "text") {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const input = document.createElement(type === "textarea" ? "textarea" : "input");

  if (type === "textarea") {
    input.rows = 3;
  } else {
    input.type = type;
  }

  input.dataset.field = field;
  input.value = value;
  wrapper.appendChild(input);
  return wrapper;
}

function renderAnnouncements(items) {
  announcementList.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "admin-item";
    card.dataset.index = String(index);

    const top = document.createElement("div");
    top.className = "admin-item-top";
    const title = document.createElement("strong");
    title.textContent = `公告 ${index + 1}`;
    const remove = document.createElement("button");
    remove.className = "secondary-button compact-button";
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => card.remove());
    top.append(title, remove);

    const fields = document.createElement("div");
    fields.className = "admin-grid";
    fields.append(
      makeInput("标签", item.tag, "tag"),
      makeInput("日期", item.date, "date", "date"),
      makeInput("标题", item.title, "title"),
      makeInput("正文", item.body, "body", "textarea")
    );

    const pinned = document.createElement("label");
    pinned.className = "admin-check";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.field = "pinned";
    checkbox.checked = item.pinned;
    pinned.append(checkbox, document.createTextNode("置顶公告"));

    card.append(top, fields, pinned);
    announcementList.appendChild(card);
  });
}

function renderSponsors(items) {
  sponsorList.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "admin-item";
    card.dataset.index = String(index);

    const top = document.createElement("div");
    top.className = "admin-item-top";
    const title = document.createElement("strong");
    title.textContent = `赞助 ${index + 1}`;
    const remove = document.createElement("button");
    remove.className = "secondary-button compact-button";
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => card.remove());
    top.append(title, remove);

    const fields = document.createElement("div");
    fields.className = "admin-grid";
    fields.append(
      makeInput("类型", item.type, "type"),
      makeInput("网名", item.name, "name"),
      makeInput("备注", item.note, "note")
    );

    card.append(top, fields);
    sponsorList.appendChild(card);
  });
}

function renderForm(content) {
  const normalized = normalizeContent(content);
  document.querySelectorAll("[data-site-field]").forEach((input) => {
    input.value = normalized.site[input.dataset.siteField] || "";
  });
  document.querySelectorAll("[data-match-field]").forEach((input) => {
    input.value = normalized.match[input.dataset.matchField] || "";
  });
  currentRules = cloneContent(normalized.rules);
  renderAnnouncements(normalized.announcements);
  renderSponsors(normalized.sponsors);
}

function collectContent() {
  const site = {};
  document.querySelectorAll("[data-site-field]").forEach((input) => {
    site[input.dataset.siteField] = cleanText(input.value);
  });

  const match = {};
  document.querySelectorAll("[data-match-field]").forEach((input) => {
    match[input.dataset.matchField] = cleanText(input.value);
  });

  const announcements = [...announcementList.querySelectorAll(".admin-item")].map((card) => ({
    tag: cleanText(card.querySelector('[data-field="tag"]').value),
    date: cleanText(card.querySelector('[data-field="date"]').value),
    title: cleanText(card.querySelector('[data-field="title"]').value),
    body: cleanText(card.querySelector('[data-field="body"]').value),
    pinned: card.querySelector('[data-field="pinned"]').checked,
  }));

  const sponsors = [...sponsorList.querySelectorAll(".admin-item")].map((card) => ({
    type: cleanText(card.querySelector('[data-field="type"]').value),
    name: cleanText(card.querySelector('[data-field="name"]').value),
    note: cleanText(card.querySelector('[data-field="note"]').value),
  }));

  return normalizeContent({ site, match, rules: currentRules, announcements, sponsors });
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function githubHeaders() {
  const token = cleanText(document.querySelector("#githubToken").value);
  if (!token) {
    throw new Error("请先输入 GitHub Token");
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function unlockAdmin(token) {
  document.querySelector("#githubToken").value = token;
  sessionStorage.setItem(tokenSessionKey, token);
  loginPanel.classList.add("hidden");
  adminApp.classList.remove("hidden");
  setStatus("已登录", "ok");
  renderApplications();
}

async function loginAdmin() {
  const token = cleanText(document.querySelector("#githubToken").value);
  if (!token) {
    setLoginStatus("请先输入 GitHub Token", "error");
    return;
  }

  try {
    setLoginStatus("正在验证", "busy");
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`登录失败 ${response.status}`);
    }

    unlockAdmin(token);
  } catch (error) {
    setLoginStatus(error.message || "登录失败", "error");
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(tokenSessionKey);
  document.querySelector("#githubToken").value = "";
  adminApp.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  setLoginStatus("已退出", "");
}

function setupAdminTabs() {
  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.adminTab;
      document.querySelectorAll("[data-admin-tab]").forEach((node) => {
        node.classList.toggle("active", node === button);
      });
      document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.adminPanel !== tab);
      });

      if (tab === "applications") {
        renderApplications();
      }
    });
  });
}

function readApplications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(applicationStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderApplications() {
  if (!applicationList) {
    return;
  }

  const applications = readApplications();
  applicationList.innerHTML = "";

  if (!applications.length) {
    const empty = document.createElement("article");
    empty.className = "application-card";
    empty.innerHTML = "<h3>暂无申请记录</h3><p>玩家在当前浏览器提交申请后，这里会显示记录 纯 GitHub Pages 无法自动收集所有玩家跨设备提交的信息</p>";
    applicationList.appendChild(empty);
    return;
  }

  applications.forEach((item) => {
    const card = document.createElement("article");
    card.className = "application-card";

    const title = document.createElement("h3");
    title.textContent = item.nickname || "未填写昵称";

    const meta = document.createElement("div");
    meta.className = "application-meta";
    [item.role || "未选方向", item.status || "待处理", item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "未知时间"].forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.appendChild(span);
    });

    const contact = document.createElement("p");
    contact.textContent = `联系方式：${item.contact || "未填写"}`;

    const message = document.createElement("p");
    message.textContent = `说明：${item.message || "无"}`;

    card.append(title, meta, contact, message);
    applicationList.appendChild(card);
  });
}

function exportApplications() {
  const content = JSON.stringify(readApplications(), null, 2);
  const blob = new Blob([`${content}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "applications.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function clearApplications() {
  localStorage.removeItem(applicationStorageKey);
  renderApplications();
  setStatus("已清空本机申请记录", "ok");
}

function repoUrl() {
  const settings = saveSettings();
  if (!settings.owner || !settings.repo || !settings.branch) {
    throw new Error("请补全仓库所有者、仓库名称和分支");
  }

  return {
    ...settings,
    api: `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${contentPath}`,
  };
}

async function readRemoteContent() {
  const repo = repoUrl();
  const response = await fetch(`${repo.api}?ref=${encodeURIComponent(repo.branch)}`, {
    headers: githubHeaders(),
  });

  if (response.status === 404) {
    currentSha = "";
    return cloneContent(defaultContent);
  }

  if (!response.ok) {
    throw new Error(`读取失败 ${response.status}`);
  }

  const payload = await response.json();
  currentSha = payload.sha || "";
  return normalizeContent(JSON.parse(fromBase64(payload.content || "")));
}

async function publishRemoteContent() {
  const repo = repoUrl();
  let sha = currentSha;

  if (!sha) {
    try {
      await readRemoteContent();
      sha = currentSha;
    } catch (error) {
      if (!String(error.message).includes("404")) {
        throw error;
      }
    }
  }

  const content = JSON.stringify(collectContent(), null, 2);
  const body = {
    message: "更新官网后台内容",
    content: toBase64(`${content}\n`),
    branch: repo.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(repo.api, {
    method: "PUT",
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`发布失败 ${response.status}`);
  }

  const payload = await response.json();
  currentSha = payload.content?.sha || "";
}

async function loadLocalContent() {
  try {
    const response = await fetch(`./${contentPath}?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("local content unavailable");
    }
    renderForm(await response.json());
  } catch {
    renderForm(defaultContent);
  }
}

function downloadContent() {
  const content = JSON.stringify(collectContent(), null, 2);
  const blob = new Blob([`${content}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

document.querySelector("#loadRemote")?.addEventListener("click", async () => {
  try {
    setStatus("正在读取", "busy");
    renderForm(await readRemoteContent());
    setStatus("已读取线上内容", "ok");
  } catch (error) {
    setStatus(error.message || "读取失败", "error");
  }
});

document.querySelector("#publishRemote")?.addEventListener("click", async () => {
  try {
    setStatus("正在发布", "busy");
    await publishRemoteContent();
    setStatus("已发布，等待页面刷新", "ok");
  } catch (error) {
    setStatus(error.message || "发布失败", "error");
  }
});

document.querySelector("#downloadJson")?.addEventListener("click", downloadContent);

document.querySelector("#addAnnouncement")?.addEventListener("click", () => {
  const content = collectContent();
  content.announcements.unshift({
    tag: "公告",
    date: new Date().toISOString().slice(0, 10),
    title: "新的公告",
    body: "填写公告内容",
    pinned: false,
  });
  renderAnnouncements(content.announcements);
});

document.querySelector("#addSponsor")?.addEventListener("click", () => {
  const content = collectContent();
  content.sponsors.push({
    type: "活动赞助",
    name: "新的网名",
    note: "赞助备注",
  });
  renderSponsors(content.sponsors);
});

applySettings();
loadLocalContent();
setupAdminTabs();
document.querySelector("#loginAdmin")?.addEventListener("click", loginAdmin);
document.querySelector("#logoutAdmin")?.addEventListener("click", logoutAdmin);
document.querySelector("#exportApplications")?.addEventListener("click", exportApplications);
document.querySelector("#clearApplications")?.addEventListener("click", clearApplications);
document.querySelectorAll("[data-admin-open]").forEach((button) => {
  button.addEventListener("click", () => {
    openAdmin();
    document.querySelector(".mobile-menu")?.classList.remove("open");
    document.querySelector(".menu-button")?.setAttribute("aria-expanded", "false");
  });
});
document.querySelectorAll("[data-admin-close]").forEach((button) => {
  button.addEventListener("click", closeAdmin);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !adminOverlay?.classList.contains("hidden")) {
    closeAdmin();
  }
});

const savedToken = sessionStorage.getItem(tokenSessionKey);
if (savedToken) {
  unlockAdmin(savedToken);
}
})();
