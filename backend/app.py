import os
import time
from flask import Flask, request, jsonify
from googleapiclient.discovery import build
from textblob import TextBlob

app = Flask(__name__)

# YouTube API
API_KEY = os.environ.get("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=API_KEY)

# -------- STATE --------
state = {
    "comments": [],
    "sentiments": [],
    "counts": {"good": 0, "bad": 0, "neutral": 0},
    "last_summary_index": 0,
    "next_page_token": None
}

# -------- SENTIMENT --------
def classify(text):
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.1:
        return "good"
    elif polarity < -0.1:
        return "bad"
    return "neutral"

# -------- ROUTES --------
@app.route("/")
def home():
    return "Backend is alive"

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

        state["comments"].append(text)
        state["sentiments"].append(sentiment)
        state["counts"][sentiment] += 1

        new_comments.append({
            "text": text,
            "sentiment": sentiment
        })

    return jsonify({
        "new_comments": new_comments,
        "counts": state["counts"]
    })

@app.route("/summary", methods=["POST"])
def summary():
    mode = request.json["mode"]  # "start" or "last"

    if mode == "last":
        sentiments = state["sentiments"][state["last_summary_index"]:]
        state["last_summary_index"] = len(state["sentiments"])
    else:
        sentiments = state["sentiments"]

    good = sentiments.count("good")
    bad = sentiments.count("bad")
    neutral = sentiments.count("neutral")

    if good > bad:
        text = "Overall sentiment is positive."
    elif bad > good:
        text = "Overall sentiment is negative."
    else:
        text = "Overall sentiment is mixed."

    return jsonify({
        "summary": text,
        "stats": {"good": good, "bad": bad, "neutral": neutral}
    })

@app.route("/stop", methods=["POST"])
def stop():
    state["next_page_token"] = None
    return jsonify({"status": "stopped"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

@app.route("/test")
def test():
    if API_KEY:
        return "API key loaded ✅"
    else:
        return "API key NOT found ❌"
