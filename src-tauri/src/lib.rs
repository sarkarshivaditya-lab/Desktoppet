use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

static LAST_TYPING_ACTIVITY_MS: AtomicU64 = AtomicU64::new(0);

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn record_typing_activity() {
    LAST_TYPING_ACTIVITY_MS.store(now_ms(), Ordering::Relaxed);
}

#[tauri::command]
fn typing_activity_recent() -> bool {
    let last = LAST_TYPING_ACTIVITY_MS.load(Ordering::Relaxed);
    let now = now_ms();
    last != 0 && now.saturating_sub(last) <= 900
}

#[cfg(target_os = "macos")]
mod global_typing_macos {
    use super::record_typing_activity;
    use std::ffi::c_void;
    use std::ptr;
    use std::sync::atomic::{AtomicPtr, Ordering};
    use std::thread;

    static EVENT_TAP: AtomicPtr<c_void> = AtomicPtr::new(ptr::null_mut());

    type CGEventRef = *mut c_void;
    type CGEventTapProxy = *mut c_void;
    type CGEventTapCallBack = Option<
        unsafe extern "C" fn(
            proxy: CGEventTapProxy,
            event_type: u32,
            event: CGEventRef,
            user_info: *mut c_void,
        ) -> CGEventRef,
    >;
    type CFRunLoopRef = *mut c_void;
    type CFRunLoopSourceRef = *mut c_void;
    type CFMachPortRef = *mut c_void;

    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn CGEventTapCreate(
            tap: u32,
            place: u32,
            options: u32,
            events_of_interest: u64,
            callback: CGEventTapCallBack,
            user_info: *mut c_void,
        ) -> CFMachPortRef;
        fn CGEventTapEnable(tap: CFMachPortRef, enable: bool);
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    extern "C" {
        fn CFMachPortCreateRunLoopSource(
            allocator: *const c_void,
            port: CFMachPortRef,
            order: isize,
        ) -> CFRunLoopSourceRef;
        fn CFRunLoopGetCurrent() -> CFRunLoopRef;
        fn CFRunLoopAddSource(
            run_loop: CFRunLoopRef,
            source: CFRunLoopSourceRef,
            mode: *const c_void,
        );
        fn CFRunLoopRun();
        static kCFRunLoopDefaultMode: *const c_void;
    }

    const K_CG_SESSION_EVENT_TAP: u32 = 1;
    const K_CG_HEAD_INSERT_EVENT_TAP: u32 = 0;
    const K_CG_EVENT_TAP_LISTEN_ONLY: u32 = 1;
    const K_CG_EVENT_KEY_DOWN: u32 = 10;
    const K_CG_EVENT_TAP_DISABLED_BY_TIMEOUT: u32 = 0xFFFFFFFE;
    const K_CG_EVENT_TAP_DISABLED_BY_USER_INPUT: u32 = 0xFFFFFFFF;

    unsafe extern "C" fn event_callback(
        _proxy: CGEventTapProxy,
        event_type: u32,
        _event: CGEventRef,
        _user_info: *mut c_void,
    ) -> CGEventRef {
        if event_type == K_CG_EVENT_KEY_DOWN {
            // Deliberately do not inspect the event or read its key code/string.
            record_typing_activity();
        } else if event_type == K_CG_EVENT_TAP_DISABLED_BY_TIMEOUT
            || event_type == K_CG_EVENT_TAP_DISABLED_BY_USER_INPUT
        {
            let tap = EVENT_TAP.load(Ordering::Relaxed);
            if !tap.is_null() {
                CGEventTapEnable(tap, true);
            }
        }
        _event
    }

    pub(super) fn start() {
        thread::spawn(|| unsafe {
            let mask = 1u64 << K_CG_EVENT_KEY_DOWN;
            let tap = CGEventTapCreate(
                K_CG_SESSION_EVENT_TAP,
                K_CG_HEAD_INSERT_EVENT_TAP,
                K_CG_EVENT_TAP_LISTEN_ONLY,
                mask,
                Some(event_callback),
                ptr::null_mut(),
            );
            if tap.is_null() {
                eprintln!(
                    "DesktopPet: global typing monitor unavailable. On macOS, allow Input Monitoring for the app in System Settings > Privacy & Security."
                );
                return;
            }

            EVENT_TAP.store(tap, Ordering::Relaxed);
            let source = CFMachPortCreateRunLoopSource(ptr::null(), tap, 0);
            if source.is_null() {
                eprintln!("DesktopPet: could not create the global typing monitor run-loop source.");
                return;
            }

            let run_loop = CFRunLoopGetCurrent();
            CFRunLoopAddSource(run_loop, source, kCFRunLoopDefaultMode);
            CGEventTapEnable(tap, true);
            CFRunLoopRun();
        });
    }
}

#[cfg(target_os = "windows")]
mod global_typing_windows {
    use super::record_typing_activity;
    use std::ptr;
    use std::thread;
    use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, DispatchMessageW, GetMessageW, SetWindowsHookExW, TranslateMessage,
        UnhookWindowsHookEx, HHOOK, MSG, WH_KEYBOARD_LL, WM_KEYDOWN,
        WM_SYSKEYDOWN,
    };

    unsafe extern "system" fn keyboard_callback(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code >= 0 && (wparam as u32 == WM_KEYDOWN || wparam as u32 == WM_SYSKEYDOWN) {
            // Only the event type is checked. KBDLLHOOKSTRUCT and key identity are never read.
            record_typing_activity();
        }
        CallNextHookEx(ptr::null_mut(), code, wparam, lparam)
    }

    pub(super) fn start() {
        thread::spawn(|| unsafe {
            let module = GetModuleHandleW(ptr::null());
            let hook: HHOOK = SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(keyboard_callback),
                module,
                0,
            );
            if hook.is_null() {
                eprintln!("DesktopPet: could not install the global keyboard activity hook.");
                return;
            }

            let mut message: MSG = std::mem::zeroed();
            while GetMessageW(&mut message, ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&message);
                DispatchMessageW(&message);
            }
            UnhookWindowsHookEx(hook);
        });
    }
}

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(target_os = "macos")]
            global_typing_macos::start();
            #[cfg(target_os = "windows")]
            global_typing_windows::start();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![cursor_position, typing_activity_recent])
        .run(tauri::generate_context!())
        .expect("error while running DesktopPet");
}
