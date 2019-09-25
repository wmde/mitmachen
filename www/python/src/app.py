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
# import request

with open("text.js", "rt") as f:
    text = json.load(f)

api = Mitmachen()
app = flask.Flask(__name__)


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
    articles, more = api.find_articles(category)
    return flask.jsonify({"articles": articles, "more": more})

@app.route("/tracking", methods=["POST"])
def tracking():
    data = flask.request.get_json()
    result = api.save_tracking_info(data)
    return flask.jsonify({"status": 1, "message": "Saved tracking"})

if __name__ == '__main__':
    app.debug = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host = '0.0.0.0', port = 5000)