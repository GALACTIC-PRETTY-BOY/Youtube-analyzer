let intervalId;
let chart;

// Initialize Chart.js
const ctx = document.getElementById("chart").getContext("2d");
chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Good", "Neutral", "Bad"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ["#7CFFB2", "#ffd966", "#ff7c7c"]
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration: 300
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Start live-fetching
function start() {
  const videoId = document.getElementById("videoId").value;
  if (!videoId) {
    alert("Enter a YouTube video ID first!");
    return;
  }
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => fetchLive(videoId), 5000);
}

// Stop live-fetching
function stop() {
  clearInterval(intervalId);
  fetch("/stop", { method: "POST" });
}

// Fetch comments and classify
function fetchLive(videoId) {
  fetch("/live-fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId })
  })
    .then(res => res.json())
    .then(data => {
      data.new_comments.forEach(c => {
        const p = document.createElement("p");
        p.className = c.sentiment;
        p.innerText = c.text;
        document.getElementById("comments").prepend(p);
      });

      chart.data.datasets[0].data = [
        data.counts.good,
        data.counts.neutral,
        data.counts.bad
      ];
      chart.update();
    });
}

// Get summary
function getSummary(mode) {
  fetch("/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("summary").innerText = data.summary;
    });
}
