use tauri::Emitter;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn CGEventCreate(source: *const std::ffi::c_void) -> *mut std::ffi::c_void;
    fn CGEventGetLocation(event: *mut std::ffi::c_void) -> CGPoint;
}

#[cfg(target_os = "macos")]
#[link(name = "CoreFoundation", kind = "framework")]
unsafe extern "C" {
    fn CFRelease(value: *const std::ffi::c_void);
}

#[cfg(target_os = "macos")]
#[repr(C)]
struct CGPoint {
    x: f64,
    y: f64,
}

#[tauri::command]
fn cursor_position() -> Option<(f64, f64)> {
    #[cfg(target_os = "macos")]
    unsafe {
        let event = CGEventCreate(std::ptr::null());
        if event.is_null() {
            return None;
        }
        let point = CGEventGetLocation(event);
        CFRelease(event);
        return Some((point.x, point.y));
    }
    #[cfg(not(target_os = "macos"))]
    {
        None
    }
}

// Emit only a generic activity signal. Key identity is discarded immediately;
// no key values or typed text are sent to the frontend, logged, or persisted.
#[tauri::command]
fn start_typing_monitor(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        let result = rdev::listen(move |event| {
            if matches!(event.event_type, rdev::EventType::KeyPress(_)) {
                static LAST_SIGNAL_MS: AtomicU64 = AtomicU64::new(0);
                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64;
                let previous = LAST_SIGNAL_MS.load(Ordering::Relaxed);
                if now.saturating_sub(previous) >= 250
                    && LAST_SIGNAL_MS
                        .compare_exchange(previous, now, Ordering::Relaxed, Ordering::Relaxed)
                        .is_ok()
                {
                    let _ = app.emit("typing-activity", ());
                }
            }
        });
        if let Err(error) = result {
            eprintln!("Global typing-activity monitor stopped: {error:?}");
        }
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cursor_position, start_typing_monitor])
        .run(tauri::generate_context!())
        .expect("error while running DesktopPet");
}
