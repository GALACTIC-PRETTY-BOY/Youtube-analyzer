let counts = { good: 0, bad: 0, neutral: 0 };
let chartLine, chartPie;
let cats = [], catsEnabled = true;

const commentsBox = document.getElementById("comments");
const summaryBox = document.getElementById("summary");

function extractVideoId(url) {
  const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return m ? m[1] : null;
}

async function start() {
  commentsBox.innerHTML = "";
  summaryBox.innerText = "";
  counts = { good: 0, bad: 0, neutral: 0 };

  const url = document.getElementById("url").value;
  const videoId = extractVideoId(url);
  if (!videoId) return alert("Invalid URL");

  const res = await fetch("/live-fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId })
  });

  const data = await res.json();

  data.new_comments.forEach(c => {
    const p = document.createElement("p");
    p.className = c.sentiment;
    p.innerText = c.text;
    commentsBox.prepend(p);
  });

  counts = data.counts;
  updateSummary();
  updateCharts();
}

function stop() {
  fetch("/stop", { method: "POST" });
}

function updateSummary() {
  summaryBox.innerText =
    counts.good > counts.bad
      ? "Viewers are mostly positive and enjoying the content."
      : "Audience reactions are mixed or critical.";
}

function updateCharts() {
  const d = [counts.good, counts.bad, counts.neutral];

  if (!chartLine) {
    chartLine = new Chart(lineChart, {
      type: "line",
      data: { labels: ["Good","Bad","Neutral"], datasets: [{ data: d }] }
    });
    chartPie = new Chart(pieChart, {
      type: "pie",
      data: { labels: ["Good","Bad","Neutral"], datasets: [{ data: d }] }
    });
  } else {
    chartLine.data.datasets[0].data = d;
    chartPie.data.datasets[0].data = d;
    chartLine.update(); chartPie.update();
  }
}

/* 🐱 CATS */
function createCat() {
  const c = document.createElement("div");
  c.className = "cat";
  c.style.setProperty("--size", Math.random()*60+60+"px");
  c.style.setProperty("--speed", Math.random()*20+15+"s");
  c.style.setProperty("--delay", Math.random()*10+"s");
  c.style.bottom = Math.random()*70+"px";
  document.body.appendChild(c);
  cats.push(c);
}

for (let i=0;i<6;i++) createCat();

function toggleCats() {
  catsEnabled = !catsEnabled;
  cats.forEach(c => c.style.display = catsEnabled ? "block" : "none");
}
