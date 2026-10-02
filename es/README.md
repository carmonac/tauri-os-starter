# Tauri OS-Native CSS Starter

Punto de partida para una app Tauri (vanilla JS) cuya UI imita el lenguaje visual de macOS, Windows y Linux (GNOME/Adwaita), detectando el SO en runtime y aplicando un set de tokens distinto por plataforma.

## Estructura

```
tauri-os-starter/
├── index.html                       Demo con titlebar, botones, switch, sidebar, menú
├── src/
│   ├── styles/
│   │   ├── tokens.css                Variables por SO + tema (data-os, data-theme)
│   │   ├── base.css                  Reset y layout raíz de la ventana
│   │   └── components.css            Titlebar, controles de ventana, botones, switch...
│   └── main.js                       Detección de SO/tema en runtime
└── src-tauri-snippets/
    ├── window_vibrancy_setup.rs      Código Rust para activar blur/mica/vibrancy
    └── tauri.conf.snippet.json       Config de ventana transparente + macOSPrivateApi
```

Esto es solo el front del proyecto. Para correrlo dentro de Tauri:

1. Crea el proyecto Tauri normalmente (`npm create tauri-app@latest`, eligiendo "Vanilla").
2. Reemplaza la carpeta del frontend generada por el contenido de `index.html` y `src/` de este starter.
3. Copia el contenido de `src-tauri-snippets/tauri.conf.snippet.json` dentro de tu `tauri.conf.json` real (son fragmentos a fusionar, no un archivo completo — fíjate que `macOSPrivateApi` va en la **raíz** del JSON, no dentro de `"app"`).
4. Añade el plugin de detección de SO:
   ```bash
   npm install @tauri-apps/plugin-os
   cargo add tauri-plugin-os
   ```
   Y regístralo en `lib.rs`:
   ```rust
   tauri::Builder::default()
       .plugin(tauri_plugin_os::init())
       // ...
   ```
   No olvides el permiso en tu capability file (`src-tauri/capabilities/default.json`):
   ```json
   { "permissions": ["os:default"] }
   ```
5. Para el efecto de cristal nativo:
   ```bash
   cargo add window-vibrancy
   ```
   y pega el contenido de `window_vibrancy_setup.rs` en tu `setup()`.

## Cómo funciona la parte CSS

- `main.js` detecta el SO (vía `plugin-os` dentro de Tauri, o por `navigator.userAgent` si lo abres en un navegador normal para iterar el diseño sin levantar Tauri) y setea `<html data-os="macos|windows|linux">`.
- También detecta `prefers-color-scheme` y setea `data-theme="light|dark"`, reaccionando en vivo si el usuario cambia el tema del sistema.
- `tokens.css` define **todas** las variables de diseño (tipografía, radios, alturas, colores) por combinación de `[data-os][data-theme]`.
- `components.css` consume esas variables y añade ajustes estructurales específicos por SO donde el layout realmente cambia (p. ej. semáforo a la izquierda en macOS vs. caption buttons a la derecha en Windows vs. headerbar alta de GNOME en Linux).

Si más adelante quieres distinguir entornos Linux (GNOME vs. KDE), el patrón se extiende igual añadiendo un atributo `data-de="gnome|kde"` y un bloque de tokens adicional — no hace falta tocar la arquitectura.

## Limitaciones a tener en cuenta

- **Vibrancy/blur real en Linux no existe** vía `window-vibrancy`: depende del compositor del usuario (KWin, Mutter, etc.), fuera de tu control. El starter usa un `--titlebar-bg` semi-opaco como fallback razonable en vez de prometer un blur que no se puede garantizar.
- **Blur en Windows 11 build 22621+** puede tener mal rendimiento al redimensionar/arrastrar la ventana (limitación conocida del crate).
- Esto **no es un clon pixel-perfect** de cada SO — es un set de tokens y componentes que capturan lo esencial de cada plataforma (tipografía del sistema, radios, jerarquía de controles de ventana). Perseguir el 100% exacto es un objetivo móvil porque Apple/Microsoft/GNOME cambian su lenguaje visual con cada major release.
- `-webkit-app-region: drag` funciona en las tres plataformas porque las tres webviews de Tauri son WebKit-based (WKWebView, WebView2/Chromium, WebKitGTK), pero verifica el comportamiento real en cada SO al integrar.

## Próximos pasos sugeridos

- Añadir más componentes (inputs, dropdowns, tooltips, diálogos modales) siguiendo el mismo patrón `[data-os="..."] .componente`.
- Leer el color de acento real del sistema en Windows/macOS en vez de hardcodearlo, si quieres ese nivel de fidelidad.
- Si usas un framework (React/Vue/Svelte) más adelante, los tokens CSS se reutilizan tal cual; solo cambia cómo generas el HTML de los componentes.
