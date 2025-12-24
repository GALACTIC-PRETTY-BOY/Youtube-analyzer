import os
from flask import Flask, request, jsonify, render_template
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from textblob import TextBlob

app = Flask(__name__)

API_KEY = os.environ.get("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=API_KEY)

state = {}

def reset_state():
    state.update({
        "comments": [],
        "sentiments": [],
        "counts": {"good": 0, "bad": 0, "neutral": 0},
        "next_page_token": None
    })

reset_state()

def classify(text):
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.15:
        return "good"
    elif polarity < -0.15:
        return "bad"
    return "neutral"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/reset", methods=["POST"])
def reset():
    reset_state()
    return jsonify({"status": "reset"})

@app.route("/fetch", methods=["POST"])
def fetch():
    video_id = request.json["video_id"]

    try:
        req = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=50,
            pageToken=state["next_page_token"],
            textFormat="plainText"
        )
        res = req.execute()
    except HttpError as e:
        return jsonify({"error": "YouTube API error or quota exceeded"}), 400

    state["next_page_token"] = res.get("nextPageToken")
    new = []

    for item in res.get("items", []):
        text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        sentiment = classify(text)

        state["comments"].append(text)
        state["sentiments"].append(sentiment)
        state["counts"][sentiment] += 1

        new.append({"text": text, "sentiment": sentiment})

    return jsonify({
        "comments": new,
        "counts": state["counts"],
        "summary": generate_summary()
    })

def generate_summary():
    total = len(state["sentiments"])
    if total == 0:
        return "No comments yet."

    g = state["counts"]["good"]
    b = state["counts"]["bad"]
    n = state["counts"]["neutral"]

    if g > b:
        return "Viewers are mostly enjoying the content, expressing appreciation, excitement, and positive reactions."
    elif b > g:
        return "Many viewers are unhappy or critical, pointing out issues, frustration, or disagreement."
    else:
        return "The audience appears divided, with a mix of opinions and neutral observations."

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
