import os
from flask import Flask

app = Flask(__name__)

@app.route("/")  # This is the homepage route
def home():
    return "Backend is alive"

# Optional test route
@app.route("/test")
def test():
    return "Test route works!"

if __name__ == "__main__":
    # Render provides the port in environment variable
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
