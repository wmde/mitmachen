import flask
from .api import Mitmachen

api = Mitmachen()
app = flask.Flask(__name__)


@app.route("/")
def index():
    return flask.render_template("index.html")


@app.route("/autocomplete", methods=["GET"])
def autocomplete():
    first_letters = flask.request.args.get("q")
    return flask.jsonify({"categories" : api.matching_categories(first_letters)})


@app.route("/suggest")
def suggest():
    return flask.jsonify({"categories" : api.suggest_categories()})


@app.route("/find", methods=["GET"])
def find():
    category = flask.request.args.get("q")
    return flask.jsonify({"articles": api.find_articles(category)})
