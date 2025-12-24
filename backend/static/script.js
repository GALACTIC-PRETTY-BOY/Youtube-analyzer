let intervalId;
let chart;

// Extract YouTube video ID from URL or ID
function getVideoId(input) {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    const match = input.match(regex);
    return match ? match[1] : input;
}

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
        animation: { duration: 300 },
        scales: { y: { beginAtZero: true } }
    }
});

function start() {
    let videoIdInput = document.getElementById("videoId").value;
    const videoId = getVideoId(videoIdInput);
    if (!videoId) { alert("Enter a valid YouTube video ID or URL!"); return; }
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => fetchLive(videoId), 5000);
}

function stop() {
    clearInterval(intervalId);
    fetch("/stop", { method: "POST" });
}

function fetchLive(videoId) {
    fetch("/live-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            stop();
            return;
        }

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
    })
    .catch(err => {
        console.error("Fetch error:", err);
        stop();
        alert("Failed to fetch comments. Check video ID or API limits.");
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
