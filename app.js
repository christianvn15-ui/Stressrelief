/* ================= PROFILE & AVATAR ================= */
document.addEventListener("DOMContentLoaded", () => {

  const loginSection = document.getElementById("loginSection");
  const profileSection = document.getElementById("profileSection");
  const avatarDisplay = document.getElementById("avatarDisplay");
  const avatarInput = document.getElementById("avatarInput");
  const saveBtn = document.getElementById("saveProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let avatarData = "";

  avatarInput?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => avatarData = reader.result;
    reader.readAsDataURL(file);
  });

  function loadProfile() {
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (!profile) {
      // No profile yet, show login section
      loginSection?.classList.remove("hidden");
      profileSection?.classList.add("hidden");
      return;
    }

    loginSection?.classList.add("hidden");
    profileSection?.classList.remove("hidden");

    const welcomeText = document.getElementById("welcomeText");
    const profileInfo = document.getElementById("profileInfo");
    const streakInfo = document.getElementById("streakInfo");

    if (welcomeText) welcomeText.textContent = "Welcome, " + (profile.name || "");
    if (profileInfo) profileInfo.textContent = `${profile.email || ""} • Born ${profile.dob || ""}`;
    if (avatarDisplay && profile.avatar) {
      avatarDisplay.src = profile.avatar;
      avatarDisplay.classList.remove("hidden");
    }

    if (streakInfo) {
      const log = JSON.parse(localStorage.getItem("usage") || "[]");
      streakInfo.textContent = "Days practiced: " + log.length;
    }
  }

  saveBtn?.addEventListener("click", () => {
    const profile = {
      email: document.getElementById("email")?.value || "",
      name: document.getElementById("name")?.value || "",
      dob: document.getElementById("dob")?.value || "",
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

/* ================= DARK MODE ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

/* ================= BACKUP & RESTORE ================= */
function exportData() {
  const data = JSON.stringify(localStorage);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "calmspace-backup.json";
  a.click();
}

function importData(e) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
    location.reload();
  };
  reader.readAsText(e.target.files[0]);
}

/* ================= BREATHING ================= */
let breathingInterval, breathingTimeout;
let breathingPhase = 0;
let breathingRunning = false;
const phases = ["Inhale", "Hold", "Exhale", "Hold"];
const ring = document.querySelector(".breath-ring");
const text = document.getElementById("breathText");
const toggleBtn = document.getElementById("breathToggleBtn");

let breathDuration = 4000;
document.getElementById("preset")?.addEventListener("change", e => {
  breathDuration = parseInt(e.target.value) * 1000;
});

toggleBtn?.addEventListener("click", () => {
  breathingRunning ? stopBreathing() : startBreathing();
});

function startBreathing() {
  recordUsage();
  breathingRunning = true;
  breathingPhase = 0;
  if (toggleBtn) toggleBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Stop`;
  const minutes = 2;
  breathingInterval = setInterval(runBreathPhase, breathDuration);
  breathingTimeout = setTimeout(stopBreathing, minutes * 60000);
  runBreathPhase();
}

function runBreathPhase() {
  if (!text) return;
  text.textContent = phases[breathingPhase];
  if (document.getElementById("hapticsToggle")?.checked) {
    navigator.vibrate && navigator.vibrate(breathingPhase % 2 === 0 ? 400 : 200);
  }
  if (ring) ring.style.strokeDashoffset = breathingPhase % 2 === 0 ? 0 : 565;
  breathingPhase = (breathingPhase + 1) % phases.length;
}

function stopBreathing() {
  clearInterval(breathingInterval);
  clearTimeout(breathingTimeout);
  breathingRunning = false;
  if (toggleBtn) toggleBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
  if (text) text.textContent = "Complete";
  if (ring) ring.style.strokeDashoffset = 565;
}

/* ================= MEDITATION ================= */
let meditationTimer;
let fadeInterval;

function guidedMessage() {
  const moods = JSON.parse(localStorage.getItem("moods") || "{}");
  const last = Object.values(moods).pop() || 3;
  return last <= 2 ? "Slow down. You are safe." :
         last === 3 ? "Notice your breath." :
         "Carry this calm forward.";
}

function startMeditation() {
  recordUsage();

  const meditationTimeInput = document.getElementById("meditationTime");
  const guidedText = document.getElementById("guidedText");
  const timerDisplay = document.getElementById("timerDisplay");
  const zenAudio = document.getElementById("zenAudio");
  if (!meditationTimeInput || !guidedText || !timerDisplay || !zenAudio) return;

  let sec = parseInt(meditationTimeInput.value || "5") * 60;

  // Start zen audio with fade in
  zenAudio.currentTime = 0;
  zenAudio.volume = 0;
  zenAudio.play();
  if(fadeInterval) clearInterval(fadeInterval);
  fadeInterval = setInterval(() => {
    if(zenAudio.volume < 0.5) zenAudio.volume = Math.min(zenAudio.volume + 0.01, 0.5);
    else clearInterval(fadeInterval);
  }, 50);

  guidedText.textContent = guidedMessage();

  // Timer countdown
  meditationTimer = setInterval(() => {
    sec--;
    if (timerDisplay) timerDisplay.textContent = Math.floor(sec/60) + ":" + String(sec%60).padStart(2,"0");
    if (sec <= 0) stopMeditation();
  }, 1000);
}

function stopMeditation() {
  clearInterval(meditationTimer);

  const zenAudio = document.getElementById("zenAudio");
  if (zenAudio) {
    // Fade out before stopping
    if(fadeInterval) clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      if(zenAudio.volume > 0) zenAudio.volume = Math.max(zenAudio.volume - 0.02, 0);
      else {
        zenAudio.pause();
        clearInterval(fadeInterval);
      }
    }, 50);
  }
}

/* ================= JOURNAL ================= */
const journalText = document.getElementById("journalText");
const journalStatus = document.getElementById("journalStatus");
if (journalText) journalText.value = localStorage.getItem("journal") || "";

function saveJournal() {
  if (!journalText || !journalStatus) return;
  localStorage.setItem("journal", journalText.value);
  journalStatus.textContent = "Saved";
}

/* ================= PROGRESS ================= */
function recordUsage() {
  const today = new Date().toDateString();
  let log = JSON.parse(localStorage.getItem("usage") || "[]");
  if (!log.includes(today)) log.push(today);
  localStorage.setItem("usage", JSON.stringify(log));
}

/* ================= MOOD TRACKING ================= */
const moodStatus = document.getElementById("moodStatus");
function setMood(value) {
  const today = new Date().toDateString();
  let moods = JSON.parse(localStorage.getItem("moods") || "{}");
  moods[today] = value;
  localStorage.setItem("moods", JSON.stringify(moods));
  if (moodStatus) moodStatus.textContent = "Mood saved";
  drawMoodGraph();
}

function drawMoodGraph() {
  const svg = document.getElementById("moodGraph");
  if (!svg) return;
  const moods = JSON.parse(localStorage.getItem("moods") || "{}");
  const values = Object.values(moods);
  if (values.length === 0) return;
  const points = values.map((v,i) => `${i*(300/(values.length-1||1))},${150 - v*25}`).join(" ");
  svg.innerHTML = `<polyline points="${points}" />`;
}
drawMoodGraph();

/* ================= PDF EXPORT ================= */
function exportPDF() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const moods = JSON.parse(localStorage.getItem("moods") || "{}");
  const usage = JSON.parse(localStorage.getItem("usage") || "[]");
  const win = window.open("", "", "width=600,height=800");
  if (!win) return;
  win.document.write(`
    <h1>CalmSpace Progress</h1>
    <p>Name: ${profile?.name || ""}</p>
    <p>Sessions: ${usage.length}</p>
    <p>Mood entries: ${Object.keys(moods).length}</p>
    <p>Generated: ${new Date().toDateString()}</p>
  `);
  win.print();
}