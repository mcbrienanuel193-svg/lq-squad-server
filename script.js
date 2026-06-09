const config = {
  qq: "907522575",
  qqLink: "https://qm.qq.com/q/JWGSe4YnGm",
  serverIp: "狼群服务器",
};

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = [...document.querySelectorAll(".site-nav a, .mobile-menu a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll('[data-config="qq"]').forEach((node) => {
  node.textContent = config.qq;
});

document.querySelectorAll('[data-config="server-ip"]').forEach((node) => {
  node.textContent = config.serverIp;
});

document.querySelectorAll("[data-qq-link]").forEach((node) => {
  node.href = config.qqLink;
});

function setHeaderState() {
  header.dataset.elevated = window.scrollY > 12 ? "true" : "false";
}

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

const revealTargets = [
  ".ops-strip",
  ".section-head",
  ".feature-grid article",
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
} else {
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

document.querySelector(".join-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const status = form.querySelector(".form-status");
  const nickname = String(data.get("nickname") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const role = String(data.get("role") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!nickname || !contact) {
    status.textContent = "请至少填写游戏昵称和联系方式";
    return;
  }

  const summary = `申请信息：${nickname} / ${contact} / ${role}${message ? ` / ${message}` : ""}`;
  status.textContent = "已生成申请信息，可复制后发送给管理员";

  if (navigator.clipboard) {
    navigator.clipboard.writeText(summary).catch(() => undefined);
  }
});
