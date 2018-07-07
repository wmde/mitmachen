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
import flask
from api import Mitmachen

api = Mitmachen()
app = flask.Flask(__name__)


@app.route("/")
def index():
    return flask.render_template("index.html")


@app.route("/autocomplete", methods=["GET"])
def autocomplete():
    first_letters = flask.request.args.get("q")
    return flask.jsonify({"categories": api.matching_categories(first_letters)})


@app.route("/suggest")
def suggest():
    return flask.jsonify({"categories": api.suggest_categories()})


@app.route("/find", methods=["GET"])
def find():
    category = flask.request.args.get("q")
    articles, more = api.find_articles(category)
    return flask.jsonify({"articles": articles, "more": more})
