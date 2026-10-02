use tauri::Manager;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
#[cfg(target_os = "windows")]
use window_vibrancy::{apply_acrylic, apply_blur, apply_mica};

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None)
                    .expect("vibrancy solo soportado en macOS 10.14+");
            }

            #[cfg(target_os = "windows")]
            {
                if apply_mica(&window, None).is_err() {
                    let _ = apply_acrylic(&window, Some((18, 18, 18, 125)))
                        .or_else(|_| apply_blur(&window, Some((18, 18, 18, 125))));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar la app de Tauri");
}
