/* ================= SAFE HELPER ================= */
function $(id) { return document.getElementById(id); }

/* ================= AUDIO FADE ================= */
function fadeIn(audio, max = 0.5) {
  if (!audio) return;
  audio.volume = 0;
  audio.play();
  const i = setInterval(() => {
    audio.volume = Math.min(audio.volume + 0.02, max);
    if (audio.volume >= max) clearInterval(i);
  }, 50);
}

function fadeOut(audio) {
  if (!audio) return;
  const i = setInterval(() => {
    audio.volume = Math.max(audio.volume - 0.02, 0);
    if (audio.volume === 0) {
      audio.pause();
      clearInterval(i);
    }
  }, 50);
}

/* ================= SESSION TRACKER ================= */
function logSession(key) {
  const today = new Date().toDateString();
  let sessions = JSON.parse(localStorage.getItem(key) || "[]");
  sessions.push({ date: today });
  localStorage.setItem(key, JSON.stringify(sessions));
}

/* ================= MEDITATION / FOCUS / SLEEP ================= */
const sessionTimers = {}; // store timers per type

function startSession(type) {
  logSession(`${type}-sessions`);

  const timeInput = $(`${type}Time`);
  const audio = $(`${type}Audio`);
  const display = $(`${type}Timer`);
  const text = $(`${type}Text`);

  if (!timeInput || !audio || !display) return;

  let sec = parseInt(timeInput.value || 5) * 60;

  fadeIn(audio); // start audio fade in

  if (text) text.textContent =
    type === "sleep" ? "Let go and rest." :
    type === "focus" ? "Stay gently focused." :
    "Notice your breath.";

  // Clear any existing timer
  if (sessionTimers[type]) clearInterval(sessionTimers[type]);

  display.textContent = `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;

  sessionTimers[type] = setInterval(() => {
    sec--;
    display.textContent = `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;
    if (sec <= 0) stopSession(type);
  }, 1000);
}

function stopSession(type) {
  const audio = $(`${type}Audio`);
  const display = $(`${type}Timer`);
  const text = $(`${type}Text`);

  if (sessionTimers[type]) clearInterval(sessionTimers[type]);

  fadeOut(audio); // fade out audio

  if (display) display.textContent = "Complete";
  if (text) text.textContent = "";
}

/* ================= BIND BUTTONS ================= */
window.startMeditation = () => startSession("meditation");
window.stopMeditation = () => stopSession("meditation");

window.startFocus = () => startSession("focus");
window.stopFocus = () => stopSession("focus");

window.startSleep = () => startSession("sleep");
window.stopSleep = () => stopSession("sleep");