import os
from flask import Flask, request, jsonify, render_template
from googleapiclient.discovery import build
from textblob import TextBlob

app = Flask(__name__)

API_KEY = os.environ.get("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=API_KEY)

state = {
    "counts": {"good": 0, "bad": 0, "neutral": 0},
    "next_page_token": None
}

def classify(text):
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.1:
        return "good"
    elif polarity < -0.1:
        return "bad"
    return "neutral"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/live-fetch", methods=["POST"])
def live_fetch():
    video_id = request.json["video_id"]

    req = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=20,
        pageToken=state["next_page_token"],
        textFormat="plainText"
    )

    res = req.execute()
    state["next_page_token"] = res.get("nextPageToken")

    new_comments = []

    for item in res.get("items", []):
        text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        sentiment = classify(text)
        state["counts"][sentiment] += 1

        new_comments.append({
            "text": text,
            "sentiment": sentiment
        })

    return jsonify({
        "new_comments": new_comments,
        "counts": state["counts"]
    })

@app.route("/stop", methods=["POST"])
def stop():
    state["next_page_token"] = None
    state["counts"] = {"good": 0, "bad": 0, "neutral": 0}
    return jsonify({"status": "stopped"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
