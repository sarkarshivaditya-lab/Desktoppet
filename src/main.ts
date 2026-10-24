import "./style.css";
import { availableMonitors, getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { PhysicalPosition } from "@tauri-apps/api/dpi";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root");

const phrases = [
  "Ready when you are.",
  "Good work. Take a breath.",
  "I'm keeping you company.",
  "Want to stretch your legs?",
  "Woof. Back to it."
];
let phraseIndex = 0;

app.innerHTML = `
  <main class="pet-shell" aria-label="Desktop German Shepherd companion">
    <div class="pet-toolbar">
      <span class="status"><span class="status-dot"></span> HERE WITH YOU</span>
      <button class="icon-button" id="hide" title="Hide pet" aria-label="Hide pet">−</button>
    </div>
    <button class="dog-button" id="dog" aria-label="Pet your German Shepherd">
      <svg class="dog-art" viewBox="0 0 280 270" role="img" aria-label="Original illustration of a German Shepherd dog">
        <defs>
          <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#d7a15c"/><stop offset=".55" stop-color="#a96b36"/><stop offset="1" stop-color="#704323"/>
          </linearGradient>
          <linearGradient id="darkCoat" x1="0" y1="0" x2=".8" y2="1">
            <stop offset="0" stop-color="#37302b"/><stop offset="1" stop-color="#171717"/>
          </linearGradient>
          <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f2d4a4"/><stop offset="1" stop-color="#cda274"/>
          </linearGradient>
        </defs>
        <ellipse cx="140" cy="239" rx="81" ry="13" fill="#111" opacity=".14"/>
        <g class="tail-group"><path class="tail" d="M77 173 C47 156 35 130 39 104 C42 88 55 79 68 88 C78 96 78 113 71 127 C66 141 79 153 97 155Z" fill="url(#darkCoat)"/></g>
        <path class="leg leg-back-left" d="M83 154 C76 178 74 200 75 224 Q75 235 86 235 H110 Q119 233 117 223 L110 167Z" fill="url(#coat)"/>
        <path class="leg leg-back-right" d="M151 165 C153 184 161 207 160 225 Q160 235 171 235 H192 Q202 233 199 224 L192 167Z" fill="url(#darkCoat)"/>
        <path d="M105 151 C91 159 86 185 93 210 L102 231 Q105 237 113 233 L125 229 Q132 226 128 216 L127 179 L157 178 L165 220 Q166 232 177 233 L189 231 Q196 229 194 218 L185 169 C177 149 150 143 105 151Z" fill="url(#coat)"/>
        <path d="M100 166 C115 183 151 187 176 168 L189 197 C177 212 154 217 130 210 C109 204 99 187 100 166Z" fill="url(#darkCoat)"/>
        <path d="M95 100 C90 74 93 47 110 17 Q116 8 122 21 L144 66 L163 21 Q169 10 176 20 C191 46 190 76 181 101 L171 128 L105 128Z" fill="url(#darkCoat)"/>
        <path d="M112 23 L135 69 L119 79 L103 55Z" fill="#34261c"/><path d="M170 24 L154 69 L170 79 L183 53Z" fill="#34261c"/>
        <path d="M104 72 C115 57 132 54 141 58 C151 54 169 59 179 73 L188 105 C190 130 173 151 145 153 C116 153 97 133 96 108Z" fill="url(#coat)"/>
        <path d="M105 72 C117 61 132 60 141 66 C152 60 165 63 178 73 L168 101 L147 115 L124 101Z" fill="url(#darkCoat)"/>
        <path d="M110 91 C117 82 128 82 137 91 L137 113 C133 127 125 133 116 127 C109 120 106 102 110 91Z" fill="#342b25"/>
        <path d="M151 91 C160 82 171 84 176 93 C179 105 176 121 168 127 C159 133 151 126 150 113Z" fill="#342b25"/>
        <path d="M117 121 C130 112 158 112 170 121 C166 140 155 149 143 149 C130 149 120 139 117 121Z" fill="url(#cream)"/>
        <g class="eye eye-left"><ellipse cx="125" cy="101" rx="7" ry="8" fill="#111"/><circle cx="127" cy="98" r="2" fill="#fff"/></g>
        <g class="eye eye-right"><ellipse cx="161" cy="101" rx="7" ry="8" fill="#111"/><circle cx="163" cy="98" r="2" fill="#fff"/></g>
        <path d="M132 122 Q143 115 154 122 Q151 132 143 132 Q135 131 132 122Z" fill="#191715"/>
        <path d="M143 131 L143 139 Q140 142 137 139" fill="none" stroke="#704b38" stroke-width="2" stroke-linecap="round"/>
        <path d="M99 97 C88 94 83 104 91 111 C95 115 101 114 105 108Z" fill="url(#cream)"/><path d="M181 98 C192 94 198 104 190 112 C186 116 180 114 176 108Z" fill="url(#cream)"/>
        <path d="M112 142 C125 159 159 159 174 142 L183 158 C167 178 122 181 101 158Z" fill="#bd8952"/>
        <path d="M104 152 C117 166 166 169 180 151 L188 168 C172 190 111 187 96 165Z" fill="url(#darkCoat)"/>
        <path class="leg leg-front-left" d="M92 209 L94 226 Q95 234 105 233 L116 231 Q124 229 120 220 L115 207Z" fill="#2c2119"/>
        <path class="leg leg-front-right" d="M160 212 L161 226 Q162 235 173 233 L187 232 Q196 230 191 220 L184 207Z" fill="#171615"/>
        <path d="M101 231 Q111 235 120 229 M169 232 Q180 236 191 228" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="tap-hint">TAP TO PET</span>
    </button>
    <div class="speech" aria-live="polite"><span class="speech-mark">“</span><p id="phrase">Ready when you are.</p></div>
    <div class="pet-actions">
      <button class="action-button" id="hello"><span aria-hidden="true">♡</span> Say hello</button>
      <button class="action-button" id="nap"><span aria-hidden="true">☾</span> Take a nap</button>
    </div>
    <p class="footnote">GERMAN SHEPHERD · DESKTOP COMPANION</p>
  </main>
`;

const phraseElement = document.querySelector<HTMLParagraphElement>("#phrase");
const dogElement = document.querySelector<HTMLButtonElement>("#dog");
const shellElement = document.querySelector<HTMLElement>(".pet-shell");
const artElement = document.querySelector<SVGSVGElement>(".dog-art");
if (!phraseElement || !dogElement || !shellElement || !artElement) {
  throw new Error("Pet UI failed to initialize");
}
// Keep non-null DOM references outside closures for strict TypeScript checks.
const phrase: HTMLParagraphElement = phraseElement;
const dog: HTMLButtonElement = dogElement;
const shell: HTMLElement = shellElement;
const art: SVGSVGElement = artElement;
const eyes = Array.from(document.querySelectorAll<SVGGElement>(".eye"));
let lastUserInteraction = Date.now();
let lastTypingReaction = 0;
let roamTimer: number | undefined;
let idleWagTimer: number | undefined;
shell.classList.add("idle");

function speak(text: string) {
  phrase.textContent = text;
  shell.classList.remove("is-napping");
  shell.classList.add("is-awake");
}

function wagTail() {
  shell.classList.remove("idle");
  if (idleWagTimer !== undefined) window.clearTimeout(idleWagTimer);
  dog.classList.remove("wag");
  void dog.offsetWidth;
  dog.classList.add("wag");
  window.setTimeout(() => {
    dog.classList.remove("wag");
    if (!shell.classList.contains("is-napping") && !shell.classList.contains("walking")) shell.classList.add("idle");
  }, 1200);
}

function blink() {
  if (shell.classList.contains("is-napping")) return;
  art.classList.remove("blink");
  void art.getBoundingClientRect();
  art.classList.add("blink");
  window.setTimeout(() => art.classList.remove("blink"), 180);
}

function reactToTyping() {
  const now = Date.now();
  if (now - lastTypingReaction < 1800 || shell.classList.contains("is-napping")) return;
  lastTypingReaction = now;
  shell.classList.remove("idle");
  shell.classList.remove("typing-reaction");
  void shell.offsetWidth;
  shell.classList.add("typing-reaction");
  window.setTimeout(() => {
    shell.classList.remove("typing-reaction");
    if (!shell.classList.contains("is-napping") && !shell.classList.contains("walking")) shell.classList.add("idle");
  }, 850);
}

// Let the user reposition the pet by click-dragging directly on the dog.
// Starting the native drag on pointer-down keeps movement smooth and avoids
// implementing window movement in the webview. A normal click still pets him.
if ("__TAURI_INTERNALS__" in window) {
  dog.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    lastUserInteraction = Date.now();
    void getCurrentWindow().startDragging().catch((error) => {
      console.warn("Could not start manual pet drag.", error);
    });
  });
}

dog.addEventListener("click", () => {
  const text = phrases[phraseIndex % phrases.length];
  phraseIndex += 1;
  speak(text);
  lastUserInteraction = Date.now();
  wagTail();
});

document.querySelector<HTMLButtonElement>("#hello")?.addEventListener("click", () => {
  speak("Hello, friend. You’re doing fine.");
  lastUserInteraction = Date.now();
  wagTail();
});

document.querySelector<HTMLButtonElement>("#nap")?.addEventListener("click", () => {
  const napping = shell.classList.toggle("is-napping");
  if (napping) shell.classList.remove("idle");
  else shell.classList.add("idle");
  phrase.textContent = napping ? "I’ll rest my paws for a bit." : "Back on duty.";
  lastUserInteraction = Date.now();
});

document.querySelector<HTMLButtonElement>("#hide")?.addEventListener("click", async () => {
  if ("__TAURI_INTERNALS__" in window) {
    await getCurrentWindow().hide();
    return;
  }
  shell.classList.toggle("is-hidden");
});

if ("__TAURI_INTERNALS__" in window) {
  document.querySelector(".pet-toolbar")?.setAttribute("data-tauri-drag-region", "");
  document.querySelector(".footnote")?.setAttribute("data-tauri-drag-region", "");
}

// Manual pointer interaction should postpone autonomous roaming.
document.addEventListener("pointerdown", () => {
  lastUserInteraction = Date.now();
});

function updateEyeGaze(clientX: number, clientY: number) {
  const rect = art.getBoundingClientRect();
  const x = Math.max(-5, Math.min(5, ((clientX - rect.left) / rect.width - 0.5) * 10));
  const y = Math.max(-4, Math.min(4, ((clientY - rect.top) / rect.height - 0.37) * 8));
  eyes.forEach((eye) => {
    eye.style.transform = `translate(${x}px, ${y}px)`;
  });
}

document.addEventListener("pointermove", (event) => {
  updateEyeGaze(event.clientX, event.clientY);
});

// Browser pointer events stop at the webview boundary. On macOS, sample the
// native screen cursor so the dog's gaze continues to follow while another
// app is focused. Only the pointer coordinates are read; no keyboard input.
if ("__TAURI_INTERNALS__" in window && navigator.userAgent.includes("Mac")) {
  const petWindow = getCurrentWindow();
  const trackScreenCursor = async () => {
    try {
      const point = await invoke<[number, number] | null>("cursor_position");
      if (!point) return;
      const position = await petWindow.outerPosition();
      const scale = await petWindow.scaleFactor();
      updateEyeGaze(point[0] - position.x / scale, point[1] - position.y / scale);
    } catch (error) {
      console.warn("Global cursor tracking unavailable.", error);
    }
  };
  const cursorTimer = window.setInterval(() => { void trackScreenCursor(); }, 70);
  window.addEventListener("beforeunload", () => window.clearInterval(cursorTimer));
}

// Safe fallback: react only to keyboard activity delivered to the pet window.
// Capture at the document level so bubbled key events are handled even when a
// child element is the focused target. This does not enable global monitoring.
document.addEventListener("keydown", (event) => {
  if (event.isComposing || event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
  reactToTyping();
}, true);

function scheduleBlink() {
  window.setTimeout(() => {
    blink();
    scheduleBlink();
  }, 2400 + Math.random() * 3200);
}
scheduleBlink();

if ("__TAURI_INTERNALS__" in window) {
  const petWindow = getCurrentWindow();
  let roamInProgress = false;
  let roamCancelled = false;
  let roamGeneration = 0;

  const scheduleNextRoam = () => {
    if (roamTimer !== undefined) window.clearTimeout(roamTimer);
    roamTimer = window.setTimeout(() => { void roam(); }, 22000 + Math.random() * 18000);
  };

  const roam = async () => {
    if (roamInProgress) return;
    roamInProgress = true;
    const thisGeneration = ++roamGeneration;
    roamCancelled = false;
    try {
      if (Date.now() - lastUserInteraction <= 12000 || shell.classList.contains("is-napping")) return;
      const monitors = await availableMonitors();
      const position = await petWindow.outerPosition();
      const size = await petWindow.outerSize();
      if (thisGeneration !== roamGeneration || Date.now() - lastUserInteraction <= 12000 || shell.classList.contains("is-napping")) return;

      const monitor = monitors.find((item) =>
        position.x >= item.position.x &&
        position.y >= item.position.y &&
        position.x < item.position.x + item.size.width &&
        position.y < item.position.y + item.size.height
      );
      if (!monitor) {
        console.debug("Desktop roaming skipped: pet window is not inside a detected monitor.");
        return;
      }

      const padding = 18;
      const minX = monitor.position.x + padding;
      const minY = monitor.position.y + padding;
      const maxX = monitor.position.x + monitor.size.width - size.width - padding;
      const maxY = monitor.position.y + monitor.size.height - size.height - padding;
      if (maxX < minX || maxY < minY) {
        console.debug("Desktop roaming skipped: monitor is smaller than the pet window bounds.");
        return;
      }

      const startX = position.x;
      const startY = position.y;
      const targetX = Math.round(minX + Math.random() * (maxX - minX));
      const targetY = Math.round(minY + Math.random() * (maxY - minY));
      const distance = Math.hypot(targetX - startX, targetY - startY);
      // Keep each roam short enough to feel intentional, not like a screen-wide teleport.
      const scale = distance > 260 ? 260 / distance : 1;
      const endX = Math.round(startX + (targetX - startX) * scale);
      const endY = Math.round(startY + (targetY - startY) * scale);
      const duration = 1400;
      shell.classList.remove("idle");
      shell.classList.add("walking");

      await new Promise<void>((resolve) => {
        const started = performance.now();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          resolve();
        };
        const step = async (now: number) => {
          if (finished) return;
          if (thisGeneration !== roamGeneration || roamCancelled || Date.now() - lastUserInteraction <= 12000 || shell.classList.contains("is-napping")) {
            finish();
            return;
          }
          const raw = Math.min(1, (now - started) / duration);
          const eased = raw * raw * (3 - 2 * raw);
          try {
            await petWindow.setPosition(new PhysicalPosition(
              Math.round(startX + (endX - startX) * eased),
              Math.round(startY + (endY - startY) * eased)
            ));
          } catch (error) {
            console.warn("Could not animate pet window position; the next roam will be retried.", error);
            finish();
            return;
          }
          if (raw < 1) {
            window.requestAnimationFrame((next) => { void step(next); });
          } else {
            finish();
          }
        };
        window.requestAnimationFrame((now) => { void step(now); });
      });
    } catch (error) {
      console.warn("Desktop roaming failed; preserving the current window position and retrying later.", error);
    } finally {
      shell.classList.remove("walking");
      if (!shell.classList.contains("is-napping") && !shell.classList.contains("typing-reaction")) shell.classList.add("idle");
      roamInProgress = false;
      scheduleNextRoam();
    }
  };

  // Any manual pointer interaction should invalidate stale animation frames so
  // an in-progress roam cannot continue moving the window after user input.
  document.addEventListener("pointerdown", () => {
    roamCancelled = true;
    roamGeneration += 1;
  });

  roamTimer = window.setTimeout(() => { void roam(); }, 18000);
  window.addEventListener("beforeunload", () => {
    if (roamTimer !== undefined) window.clearTimeout(roamTimer);
    roamCancelled = true;
    roamGeneration += 1;
  });
}
