/* ================= SAFE HELPERS ================= */
function $(id) { return document.getElementById(id); }

/* ================= PROFILE & AVATAR ================= */
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = $("loginSection");
  const profileSection = $("profileSection");
  const avatarDisplay = $("avatarDisplay");
  const avatarInput = $("avatarInput");
  const saveBtn = $("saveProfileBtn");
  const logoutBtn = $("logoutBtn");

  let avatarData = "";

  avatarInput?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => avatarData = reader.result;
    reader.readAsDataURL(file);
  });

  function loadProfile() {
    const profile = JSON.parse(localStorage.getItem("profile") || "null");
    if (!profile || !profile.name) {
      loginSection?.classList.remove("hidden");
      profileSection?.classList.add("hidden");
      return;
    }

    loginSection?.classList.add("hidden");
    profileSection?.classList.remove("hidden");

    $("welcomeText") && ($("welcomeText").textContent = `Welcome, ${profile.name}`);
    $("profileInfo") && ($("profileInfo").textContent =
      `${profile.email || ""} • Born ${profile.dob || ""}`);

    if (avatarDisplay && profile.avatar) {
      avatarDisplay.src = profile.avatar;
      avatarDisplay.classList.remove("hidden");
    }

    const log = JSON.parse(localStorage.getItem("usage") || "[]");
    $("streakInfo") && ($("streakInfo").textContent = `Days practiced: ${log.length}`);
  }

  saveBtn?.addEventListener("click", () => {
    const profile = {
      email: $("email")?.value.trim(),
      name: $("name")?.value.trim(),
      dob: $("dob")?.value,
      avatar: avatarData
    };
    localStorage.setItem("profile", JSON.stringify(profile));
    loadProfile();
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  loadProfile();
});

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light");
}
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

/* ================= USAGE TRACK ================= */
function recordUsage() {
  const today = new Date().toDateString();
  let log = JSON.parse(localStorage.getItem("usage") || "[]");
  if (!log.includes(today)) log.push(today);
  localStorage.setItem("usage", JSON.stringify(log));
}

/* ================= BREATHING ================= */
let breathingInterval, breathingTimeout;
let breathingPhase = 0;
let breathingRunning = false;

const phases = ["Inhale", "Hold", "Exhale", "Hold"];
const ring = document.querySelector(".breath-ring");
const breathText = $("breathText");
const toggleBtn = $("breathToggleBtn");

let breathDuration = 4000;

$("preset")?.addEventListener("change", e => {
  breathDuration = parseInt(e.target.value) * 1000;
});

toggleBtn?.addEventListener("click", () => {
  breathingRunning ? stopBreathing() : startBreathing();
});

function startBreathing() {
  logSession("breathing-sessions");
  recordUsage();
  breathingRunning = true;
  breathingPhase = 0;
  toggleBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
  breathingInterval = setInterval(runBreathPhase, breathDuration);
  breathingTimeout = setTimeout(stopBreathing, 2 * 60000);
  runBreathPhase();
}

function runBreathPhase() {
  if (!breathText) return;
  breathText.textContent = phases[breathingPhase];
  ring && (ring.style.strokeDashoffset = breathingPhase % 2 === 0 ? 0 : 565);
  breathingPhase = (breathingPhase + 1) % phases.length;
}

function stopBreathing() {
  clearInterval(breathingInterval);
  clearTimeout(breathingTimeout);
  breathingRunning = false;
  toggleBtn && (toggleBtn.innerHTML = `<i class="fa-solid fa-play"></i>`);
  breathText && (breathText.textContent = "Complete");
  ring && (ring.style.strokeDashoffset = 565);
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

/* ================= SESSION LOGGING ================= */
function logSession(key) {
  const today = new Date().toDateString();
  let sessions = JSON.parse(localStorage.getItem(key) || "[]");
  sessions.push({ date: today });
  localStorage.setItem(key, JSON.stringify(sessions));
}

/* ================= JOURNAL ================= */
const journalText = $("journalText");
const journalStatus = $("journalStatus");
journalText && (journalText.value = localStorage.getItem("journal") || "");
window.saveJournal = function() {
  localStorage.setItem("journal", journalText.value);
  journalStatus.textContent = "Saved ✓";
};

/* ================= MOOD ================= */
window.setMood = function(value) {
  const today = new Date().toDateString();
  let moods = JSON.parse(localStorage.getItem("moods") || "{}");
  moods[today] = value;
  localStorage.setItem("moods", JSON.stringify(moods));
  drawMoodGraph();
};

function drawMoodGraph() {
  const svg = $("moodGraph");
  if (!svg) return;

  const moods = Object.values(JSON.parse(localStorage.getItem("moods") || "{}"));
  if (!moods.length) return;

  const points = moods.map((v,i) =>
    `${i*(300/Math.max(moods.length-1,1))},${150 - v*25}`
  ).join(" ");

  svg.innerHTML = `<polyline points="${points}" />`;
}
drawMoodGraph();

/* ================= BACKUP ================= */
window.exportData = function() {
  const blob = new Blob([JSON.stringify(localStorage)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "calmspace-backup.json";
  a.click();
};

/* ================= PWA INSTALL ================= */
let deferredPrompt;
const installBtn = $("installBtn");
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn?.classList.remove("hidden");
});

installBtn?.addEventListener("click", async () => {
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.classList.add("hidden");
  deferredPrompt = null;
});