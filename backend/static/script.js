          let counts = { good: 0, bad: 0, neutral: 0 };
let chartLine = null;
let chartPie = null;

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
  document.getElementById("graphs").style.display = "none";

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id: videoId })
    });

    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    counts = data.counts;
    renderComments(data.comments);
    renderSummary();
    renderCharts();

  } catch {
    document.getElementById("summary").innerText =
      "⚠️ Unable to fetch comments. Check API quota or URL.";
  }
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
  let text = "Overall reactions are mixed.";

  if (counts.good > counts.bad && counts.good > counts.neutral) {
    text = "Most viewers are enjoying the video and responding positively.";
  } else if (counts.bad > counts.good) {
    text = "Many viewers are critical or dissatisfied with the content.";
  }

  document.getElementById("summary").innerText = text;
}

function renderCharts() {
  document.getElementById("graphs").style.display = "block";

  const data = [counts.good, counts.bad, counts.neutral];

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  const pieCtx = document.getElementById("pieChart").getContext("2d");

  if (chartLine) {
    chartLine.data.datasets[0].data = data;
    chartLine.update();
  } else {
    chartLine = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{ data, borderWidth: 2 }]
      }
    });
  }

  if (chartPie) {
    chartPie.data.datasets[0].data = data;
    chartPie.update();
  } else {
    chartPie = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Good", "Bad", "Neutral"],
        datasets: [{ data }]
      }
    });
  }
}
