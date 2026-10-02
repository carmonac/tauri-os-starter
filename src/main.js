async function detectOS() {
  if (window.__TAURI__) {
    try {
      const { platform } = await import("@tauri-apps/plugin-os");
      const p = await platform();
      if (p === "macos" || p === "windows" || p === "linux") return p;
    } catch (e) {
      console.warn("plugin-os no disponible, usando fallback de navegador", e);
    }
  }

  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return "macos";
  if (/Win/i.test(ua)) return "windows";
  return "linux";
}

function applyTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

async function init() {
  const os = await detectOS();
  document.documentElement.dataset.os = os;
  applyTheme();

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", applyTheme);

  if (os === "macos" || os === "windows") {
    document.querySelector(".app-window")?.classList.add("vibrancy-active");
  }
}

init();

document.addEventListener("click", (e) => {
  const sw = e.target.closest(".switch");
  if (sw) {
    const checked = sw.getAttribute("aria-checked") === "true";
    sw.setAttribute("aria-checked", String(!checked));
  }

  const item = e.target.closest(".sidebar-item");
  if (item) {
    item.parentElement
      .querySelectorAll(".sidebar-item")
      .forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  }
});
