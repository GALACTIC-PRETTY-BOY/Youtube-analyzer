let intervalId = null;
let videoId = null;
let chartLine = null;
let chartPie = null;

let counts = { good: 0, bad: 0, neutral: 0 };
let commentsBox = document.getElementById("comments");
let summaryBox = document.getElementById("summary");

/* =========================
   HELPERS
========================= */

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

function sentimentColor(type) {
  if (type === "good") return "good";
  if (type === "bad") return "bad";
  return "neutral";
}

/* =========================
   FETCH COMMENTS
========================= */

async function fetchOnce() {
  try {
    const res = await fetch("/live-fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id: videoId })
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    renderComments(data.new_comments);
    updateCounts(data.counts);
    updateCharts();
    updateSummary();
  } catch (e) {
    summaryBox.innerText = "⚠️ Unable to fetch. Check API quota or video URL.";
    stop();
  }
}

/* =========================
   START / STOP
========================= */

function start() {
  commentsBox.innerHTML = "";
  summaryBox.innerText = "";
  counts = { good: 0, bad: 0, neutral: 0 };

  const url = document.getElementById("url").value;
  videoId = extractVideoId(url);

  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }

  fetchOnce(); // static fetch once

  // if user wants live later → can enable polling
  // intervalId = setInterval(fetchOnce, 5000);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  fetch("/stop", { method: "POST" });
}

/* =========================
   RENDER COMMENTS
========================= */

function renderComments(list) {
  list.forEach(c => {
    const p = document.createElement("p");
    p.className = sentimentColor(c.sentiment);
    p.innerText = c.text;
    commentsBox.prepend(p);
  });
}

/* =========================
   SUMMARY
========================= */

function updateSummary() {
  let text = "";

  if (counts.good > counts.bad && counts.good > counts.neutral) {
    text = "Most viewers are enjoying the content and reacting positively.";
  } else if (counts.bad > counts.good) {
    text = "Viewers seem dissatisfied or critical in many comments.";
  } else {
    text = "Reactions are mixed, with balanced opinions.";
  }

  summaryBox.innerText = text;
}

/* =========================
   CHARTS
========================= */

function updateCounts(newCounts) {
  counts = newCounts;
}

function updateCharts() {
  const data = [counts.good, counts.bad, counts.neutral];

  if (!chartLine) {
    chartLine = new Chart(document.getElementById("lineChart"), {
      type: "line",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{
          data,
          borderWidth: 2
        }]
      }
    });
  } else {
    chartLine.data.datasets[0].data = data;
    chartLine.update();
  }

  if (!chartPie) {
    chartPie = new Chart(document.getElementById("pieChart"), {
      type: "pie",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{
          data
        }]
      }
    });
  } else {
    chartPie.data.datasets[0].data = data;
    chartPie.update();
  }
}

/* =========================
   🐱 ANIME CATS SYSTEM
========================= */

let catsEnabled = true;
let cats = [];

function createCat() {
  const cat = document.createElement("div");
  cat.className = "cat";

  const size = Math.random() * 70 + 60 + "px";
  const speed = Math.random() * 20 + 15 + "s";
  const delay = Math.random() * 10 + "s";
  const bottom = Math.random() * 70 + "px";

  cat.style.setProperty("--size", size);
  cat.style.setProperty("--speed", speed);
  cat.style.setProperty("--delay", delay);
  cat.style.bottom = bottom;

  document.getElementById("cat-field").appendChild(cat);
  cats.push(cat);
}

function spawnCats(count = 6) {
  for (let i = 0; i < count; i++) {
    createCat();
  }
}

function toggleCats() {
  catsEnabled = !catsEnabled;
  cats.forEach(cat => {
    cat.style.display = catsEnabled ? "block" : "none";
  });
}

/* SPAWN CATS ON LOAD */
spawnCats(7);
