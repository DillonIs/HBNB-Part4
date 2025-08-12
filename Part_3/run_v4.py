# run_v4.py
from app import create_app
from flask import render_template, redirect, url_for

app = create_app()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/place")
def default_place():
    return redirect(url_for("index"))

@app.route("/place/<string:id>")
def place_details(id):
    return render_template("place.html", place_id=id)

if __name__ == "__main__":
    print("Registered routes:")
    for r in app.url_map.iter_rules():
        print(f"  {r} -> {r.endpoint}")
    app.run(host="localhost", port=5000, debug=False, use_reloader=False)
