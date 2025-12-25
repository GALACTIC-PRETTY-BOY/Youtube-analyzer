let counts = { good: 0, bad: 0, neutral: 0 };
let chartPie = null;
let chartLine = null;

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

async function analyze() {
  const url = document.getElementById("url").value;
  const videoId = extractVideoId(url);

  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }

  document.getElementById("comments").innerHTML = "";
  document.getElementById("summary").innerText = "Analyzing comments…";

  const res = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId })
  });

  const data = await res.json();

  counts = data.counts;
  renderComments(data.comments);
  renderSummary();
  renderCharts();
}

function renderComments(comments) {
  const box = document.getElementById("comments");
  comments.forEach(c => {
    const p = document.createElement("p");
    p.className = c.sentiment;
    p.innerText = c.text;
    box.appendChild(p);
  });
}

function renderSummary() {
  let text = "The discussion feels mixed.";

  if (counts.good > counts.bad && counts.good > counts.neutral)
    text = "Most viewers are enjoying the video and reacting positively.";
  else if (counts.bad > counts.good)
    text = "Many viewers are critical or dissatisfied.";

  document.getElementById("summary").innerText = text;
}

function renderCharts() {
  document.getElementById("graphs").style.display = "block";

  const data = [counts.good, counts.bad, counts.neutral];

  if (!chartLine) {
    chartLine = new Chart(lineChart, {
      type: "line",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{ data, borderWidth: 2 }]
      }
    });
  }

  if (!chartPie) {
    chartPie = new Chart(pieChart, {
      type: "pie",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{ data }]
      }
    });
  }
}
