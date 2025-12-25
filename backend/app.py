import os
from flask import Flask, request, jsonify, render_template
from googleapiclient.discovery import build
from textblob import TextBlob

app = Flask(__name__, template_folder="../templates", static_folder="../static")

API_KEY = os.environ.get("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=API_KEY)

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

@app.route("/analyze", methods=["POST"])
def analyze():
    video_id = request.json.get("video_id")

    comments = []
    counts = {"good": 0, "bad": 0, "neutral": 0}

    req = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100,   # ONE HEAVY FETCH
        textFormat="plainText"
    )

    res = req.execute()

    for item in res.get("items", []):
        text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        sentiment = classify(text)

        comments.append({
            "text": text,
            "sentiment": sentiment
        })
        counts[sentiment] += 1

    return jsonify({
        "comments": comments,
        "counts": counts
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
