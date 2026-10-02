# Tauri OS-Native CSS Starter

A starting point for a Tauri app (vanilla JS) whose UI mimics the visual language of macOS, Windows, and Linux (GNOME/Adwaita), detecting the OS at runtime and applying a different token set per platform.

## Structure

```
tauri-os-starter/
├── index.html                       Demo with titlebar, buttons, switch, sidebar, menu
├── src/
│   ├── styles/
│   │   ├── tokens.css                Variables by OS + theme (data-os, data-theme)
│   │   ├── base.css                  Reset and root window layout
│   │   └── components.css            Titlebar, window controls, buttons, switch...
│   └── main.js                       OS/theme detection at runtime
└── src-tauri-snippets/
    ├── window_vibrancy_setup.rs      Rust code to enable blur/mica/vibrancy
    └── tauri.conf.snippet.json       Transparent window config + macOSPrivateApi
```

This is only the frontend of the project. To run it inside Tauri:

1. Create the Tauri project normally (`npm create tauri-app@latest`, selecting "Vanilla").
2. Replace the generated frontend folder with the contents of `index.html` and `src/` from this starter.
3. Copy the contents of `src-tauri-snippets/tauri.conf.snippet.json` into your real `tauri.conf.json` (these are fragments to merge, not a complete file — note that `macOSPrivateApi` goes at the root of the JSON, not inside `"app"`).
4. Add the OS detection plugin:
   ```bash
   npm install @tauri-apps/plugin-os
   cargo add tauri-plugin-os
   ```
   And register it in `lib.rs`:
   ```rust
tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    // ...
   ```
   Also add the required permission in your capability file (`src-tauri/capabilities/default.json`):
   ```json
   { "permissions": ["os:default"] }
   ```
5. For the native glass effect:
   ```bash
   cargo add window-vibrancy
   ```
   and paste the contents of `window_vibrancy_setup.rs` into your `setup()`.

## How the CSS part works

- `main.js` detects the OS (via `plugin-os` inside Tauri, or via `navigator.userAgent` if you open it in a normal browser for quick iteration) and sets `<html data-os="macos|windows|linux">`.
- It also detects `prefers-color-scheme` and sets `data-theme="light|dark"`, reacting live when the user changes the system theme.
- `tokens.css` defines all design variables (typography, radii, heights, colors) by `[data-os][data-theme]` combination.
- `components.css` consumes those variables and adds OS-specific structural adjustments where the layout truly changes (for example, the semaphore on the left in macOS vs. caption buttons on the right in Windows vs. the taller GNOME headerbar in Linux).

If you later want to distinguish Linux environments (GNOME vs. KDE), you can extend the same pattern by adding a `data-de="gnome|kde"` attribute and an additional tokens block — no architecture change is required.

## Limitations to keep in mind

- **Real vibrancy/blur on Linux does not exist** through `window-vibrancy`: it depends on the user's compositor (KWin, Mutter, etc.), which is outside your control. The starter uses a semi-opaque `--titlebar-bg` as a reasonable fallback instead of promising a blur that cannot be guaranteed.
- **Blur on Windows 11 build 22621+** can perform poorly when resizing or dragging the window (a known limitation of the crate).
- This is **not a pixel-perfect clone** of each OS — it is a set of tokens and components that capture the essential platform language (system typography, radii, control hierarchy). Reaching 100% fidelity is a moving target because Apple, Microsoft, and GNOME change their visual language with each major release.
- `-webkit-app-region: drag` works across all three platforms because all Tauri webviews are WebKit-based (WKWebView, WebView2/Chromium, WebKitGTK), but verify the actual behavior on each OS when integrating.

## Suggested next steps

- Add more components (inputs, dropdowns, tooltips, modal dialogs) following the same pattern `[data-os="..."] .component`.
- Read the real system accent color on Windows/macOS instead of hardcoding it, if you want a higher level of fidelity.
- If you use a framework (React/Vue/Svelte) later, the CSS tokens can be reused exactly as-is; only the HTML generation for the components changes.
