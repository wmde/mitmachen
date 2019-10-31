#    Copyright 2018 Kilian Kluge <kilian.kluge@wikipedia.de>
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
import json
import flask
from api import Mitmachen
import requests

with open("text.js", "rt") as f:
    text = json.load(f)

api = Mitmachen()
app = flask.Flask(__name__)

image_prob = {
    "Belege fehlen": {
        "image": "new/img/review-media1.png",
        "text":"In diesem Artikel fehlen Belege. Schau in diesem Baustein nach welche. Recherchiere fehlende Quellen und füge sie ein."},
    "Veraltet": {
        "image": "new/img/review-media1.png",
        "text": "Dieser Artikel ist nicht mehr aktuell. Recherchiere fehlende Informationen und füge sie ein."},
    "Lückenhaft": {
        "image": "new/img/review-media2.png",
        "text": "In diesem Artikel fehlen wichtige Informationen. Schau in diesem Baustein nach welche. Recherchiere die Informationen und ergänze den Artikel."},
    "Ungeprüfter Link": {"image": "new/img/review-media1.png", "text": "In diesem Artikel wurde ein Link automatisch aktualisiert. Scrolle nach unten zu den Einzelnachweisen, finde den mit einem (i) markierten Link und prüfe ob der Link noch stimmt."},
    "Überarbeiten": {"image": "new/img/review-media1.png", "text": "In diesem Artikel muss grundlegend etwas verändert werden. Schau in diesem Baustein nach, was fehlt und überarbeite den Artikel."}
}


@app.route("/", methods=["GET"])
def index():
    query = flask.request.args.get("q", default="")
    # return flask.render_template("index.html", text=text, query=query)
    return flask.render_template("index3.html", text=text, query=query)

@app.route("/articles", methods=["GET"])
def second():
    query = flask.request.args.get("q", default="")
    return flask.render_template("index2.html", text=text, query=query)

@app.route("/autocomplete", methods=["GET"])
def autocomplete():
    first_letters = flask.request.args.get("q", default="Aaa")
    return flask.jsonify({"categories": api.autocomplete(first_letters)})


@app.route("/suggest")
def suggest():
    return flask.jsonify({"categories": api.suggest_categories()})


@app.route("/find", methods=["GET"])
def find():
    category = flask.request.args.get("q", default="")
    articles, more, total = api.find_articles(category)
    return flask.jsonify({"articles": articles, "more": more, "total": total})

@app.route("/tracking", methods=["POST"])
def tracking():
    data = flask.request.get_json()
    result = api.save_tracking_info(data)
    return flask.jsonify({"status": 1, "message": "Saved tracking"})

@app.route("/getsubcateg", methods=["POST"])
def getsubcateg():
    data = flask.request.get_json()
    subcategories = api.getsubcategories(data)
    return flask.jsonify({"status": 1, "message": "All subcategories", "data": subcategories})

@app.route('/subcategarticles', methods=["GET"])
def getarticlesforsubcategory():
    name = flask.request.args.get("q", default="")
    articles = api.getarticlesforsubcategory(name)
    return flask.jsonify({"status": 1, "message": "All articles with the subcategory", "data": articles})

@app.route('/preview', methods=['GET'])
def previewarticle():
    query = flask.request.args.get("q", default="")
    problems = flask.request.args.getlist("problems")
    problems = problems[0].split(',') if len(problems) > 0 else problems

    return flask.render_template("preview.html", text=text, query=query, problems=problems, image_prob=image_prob)
