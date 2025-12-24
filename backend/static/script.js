let lineChart, pieChart;

function getVideoId(input) {
    const m = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : input;
}

async function start() {
    await fetch("/reset", { method: "POST" });

    document.getElementById("comments").innerHTML = "";
    document.getElementById("graphs").style.display = "none";

    const videoId = getVideoId(document.getElementById("videoId").value);
    fetchOnce(videoId);
}

function stop() {
    document.getElementById("graphs").style.display = "block";
}

function fetchOnce(videoId) {
    fetch("/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        document.getElementById("summary").innerText = data.summary;

        data.comments.forEach(c => {
            const p = document.createElement("p");
            p.className = c.sentiment;
            p.innerText = c.text;
            document.getElementById("comments").appendChild(p);
        });

        drawCharts(data.counts);
    });
}

function drawCharts(c) {
    const ctx1 = document.getElementById("lineChart");
    const ctx2 = document.getElementById("pieChart");

    lineChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels: ["Good", "Neutral", "Bad"],
            datasets: [{
                data: [c.good, c.neutral, c.bad],
                borderColor: "#aaa"
            }]
        }
    });

    pieChart = new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Good", "Neutral", "Bad"],
            datasets: [{
                data: [c.good, c.neutral, c.bad],
                backgroundColor: ["#7CFFB2", "#ffd966", "#ff7c7c"]
            }]
        }
    });
}
