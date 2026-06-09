const defaultContent = {
  site: {
    qq: "907522575",
    qqLink: "https://qm.qq.com/q/JWGSe4YnGm",
    serverName: "狼群服务器",
    voiceText: "kook.vip/azTBqj",
    voiceLink: "https://kook.vip/azTBqj",
    recruitStatus: "新人开放中",
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
  const announcements = Array.isArray(source.announcements) ? source.announcements : fallback.announcements;
  const sponsors = Array.isArray(source.sponsors) ? source.sponsors : fallback.sponsors;

  return {
    site: {
      qq: cleanText(site.qq, fallback.site.qq),
      qqLink: cleanText(site.qqLink, fallback.site.qqLink),
      serverName: cleanText(site.serverName, fallback.site.serverName),
      voiceText: cleanText(site.voiceText, fallback.site.voiceText),
      voiceLink: cleanText(site.voiceLink, fallback.site.voiceLink),
      recruitStatus: cleanText(site.recruitStatus, fallback.site.recruitStatus),
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

  renderAnnouncements(normalized.announcements);
  renderSponsors(normalized.sponsors);
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
    ".feature-grid article",
    ".about-grid article",
    ".server-console",
    ".section-copy",
    ".event-card",
    ".squad-grid article",
    ".sponsor-wall article",
    ".join-copy",
    ".join-form",
  ].flatMap((selector) => [...document.querySelectorAll(selector)]);

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 70, 210)}ms`);
  });

  function revealVisibleTargets() {
    const viewportBottom = window.innerHeight * 0.94;

    revealTargets.forEach((target) => {
      if (target.classList.contains("visible")) {
        return;
      }

      const rect = target.getBoundingClientRect();
      if (rect.top < viewportBottom && rect.bottom > 0) {
        target.classList.add("visible");
      }
    });
  }

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
  requestAnimationFrame(revealVisibleTargets);
  window.addEventListener("scroll", revealVisibleTargets, { passive: true });
  window.addEventListener("resize", revealVisibleTargets);
}

function setupSectionObserver() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
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

async function boot() {
  applySiteContent(await loadContent());
  setupNavigation();
  setupRipple();
  setupReveal();
  setupSectionObserver();
  setupAmbientMotion();
  setupJoinForm();
}

boot();
