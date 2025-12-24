let intervalId;
let chart;

const ctx = document.getElementById("chart").getContext("2d");
chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Good", "Neutral", "Bad"],
    datasets: [{
      data: [0, 0, 0]
    }]
  }
});

function start() {
  intervalId = setInterval(fetchLive, 5000);
}

function stop() {
  clearInterval(intervalId);
  fetch("/stop", { method: "POST" });
}

function fetchLive() {
  const videoId = document.getElementById("videoId").value;

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
