# run_v4.py (or your entry file)

from app import create_app
from flask import render_template, redirect, url_for

app = create_app()  # DO NOT overwrite this

# Plain HTML pages (data comes from your existing API)
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

# Optional: /place with no id -> send user home (or pick a first place)
@app.route("/place")
def default_place():
    return redirect(url_for("index"))

@app.route("/place/<string:id>")
def place_details(id):
    return render_template("place.html", place_id=id)

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
