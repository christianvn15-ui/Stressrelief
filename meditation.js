/* ================= SAFE HELPER ================= */
function $(id) { return document.getElementById(id); }

/* ================= SESSION TRACKING ================= */
function logSession(type) {
  const key = `${type}-sessions`;
  const log = JSON.parse(localStorage.getItem(key) || "[]");
  log.push(new Date().toISOString());
  localStorage.setItem(key, JSON.stringify(log));
}

/* ================= AUDIO FADE ================= */
function fadeIn(audio, max = 0.5) {
  audio.volume = 0;
  audio.play();
  const i = setInterval(() => {
    audio.volume = Math.min(audio.volume + 0.02, max);
    if (audio.volume >= max) clearInterval(i);
  }, 50);
}

function fadeOut(audio) {
  const i = setInterval(() => {
    audio.volume = Math.max(audio.volume - 0.02, 0);
    if (audio.volume === 0) {
      audio.pause();
      clearInterval(i);
    }
  }, 50);
}

/* ================= MULTI-TIMER LOGIC ================= */
const timers = {};

function startSession(type) {
  logSession(type);
  recordUsage();

  const timeInput = $(type + "Time");
  const audio = $(type + "Audio");
  const display = $(type + "Timer");
  const text = $(type + "Text");
  if (!timeInput || !audio || !display) return;

  let sec = parseInt(timeInput.value || 5) * 60;
  fadeIn(audio);

  if (text) text.textContent =
    type === "sleep" ? "Let go and rest." :
    type === "focus" ? "Stay gently focused." :
    "Notice your breath.";

  if (timers[type]) clearInterval(timers[type]);
  timers[type] = setInterval(() => {
    sec--;
    display.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
    if (sec <= 0) stopSession(type);
  }, 1000);
}

function stopSession(type) {
  const audio = $(type + "Audio");
  audio && fadeOut(audio);
  if (timers[type]) clearInterval(timers[type]);
  const display = $(type + "Timer");
  const text = $(type + "Text");
  if (display) display.textContent = "Complete";
  if (text) text.textContent = "";
}

/* ================= BUTTON BINDINGS ================= */
window.startMeditation = () => startSession("meditation");
window.stopMeditation = () => stopSession("meditation");
window.startFocus = () => startSession("focus");
window.stopFocus = () => stopSession("focus");
window.startSleep = () => startSession("sleep");
window.stopSleep = () => stopSession("sleep");

/* ================= USAGE TRACK ================= */
function recordUsage() {
  const today = new Date().toDateString();
  let log = JSON.parse(localStorage.getItem("usage") || "[]");
  if (!log.includes(today)) log.push(today);
  localStorage.setItem("usage", JSON.stringify(log));
}