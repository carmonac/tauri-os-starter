// main.js
// Detecta SO + tema y los expone como data-os / data-theme en <html>.
// Funciona dentro de Tauri (usa @tauri-apps/plugin-os) y también
// en un navegador normal durante desarrollo (fallback heurístico),
// para que puedas iterar el CSS con `npm run dev` sin levantar Tauri.

async function detectOS() {
  // Dentro de Tauri: fuente de verdad real, no heurística de UA.
  if (window.__TAURI__) {
    try {
      const { platform } = await import("@tauri-apps/plugin-os");
      const p = await platform(); // 'macos' | 'windows' | 'linux' | ...
      if (p === "macos" || p === "windows" || p === "linux") return p;
    } catch (e) {
      console.warn("plugin-os no disponible, usando fallback de navegador", e);
    }
  }

  // Fallback de navegador (solo para desarrollo fuera de Tauri)
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

  // Reacciona a cambios de tema en vivo (el usuario cambia de claro a oscuro
  // sin cerrar la app)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", applyTheme);

  // Si estás dentro de Tauri y aplicaste window-vibrancy con éxito desde
  // Rust, marca la ventana para que el CSS use fondo semitransparente
  // en vez de sólido (ver .vibrancy-active en base.css). En Linux no hay
  // vibrancy real (depende del compositor), así que se queda sin activar.
  if (os === "macos" || os === "windows") {
    document.querySelector(".app-window")?.classList.add("vibrancy-active");
  }
}

init();

// --- Demo: wiring mínimo de los componentes de ejemplo del index.html ---
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
