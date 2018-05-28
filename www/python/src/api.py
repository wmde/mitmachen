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
import toolforge
import pymysql.cursors
import os

__dir__ = os.path.abspath("..")
print(__dir__)
print(os.listdir(__dir__))

class Mitmachen:

    MAX_DEPTH = 3  # maximum depth in category tree search
    TAGS = ["Überarbeiten", "Lückenhaft", "Veraltet", "Belege_fehlen", "Allgemeinverständlichkeit"]

    def __init__(self):
        self.autocomplete_query = self._load("autocomplete.sql")
        self.suggest_query = self._load("suggest.sql")
        self.subcategory_query = self._load("subcategories.sql")
        self.articles_query = self._load("articles.sql")

        self.conn = toolforge.connect("dewiki_p", cursorclass=pymysql.cursors.DictCursor)

    def _load(self, fname):
        with open(os.path.abspath(os.path.join(__dir__, "queries/%s" % fname)), "r") as queryfile:
            return queryfile.read()

    def matching_categories(self, first_letters):
        with self.conn.cursor() as cursor:
            cursor.execute(self.autocomplete_query, {"first_letters": "%s%%" % first_letters.capitalize()})
            
            self.conn.commit()
            try:
                return [item["cat_title"].decode("utf-8").replace("_", " ") for item in cursor.fetchall()
                        if ":" not in item["cat_title"].decode("utf-8")]
            except Exception as e:
                return []

    def suggest_categories(self):
        with self.conn.cursor() as cursor:
            cursor.execute(self.suggest_query)
            self.conn.commit()
            try:
                return [item["cat_title"].decode("utf-8").replace("_", " ") for item in cursor.fetchall()
                        if ":" not in item["cat_title"].decode("utf-8")]
            except Exception as e:
                print(e)
                return ["China", "19. Jahrhundert", "Fußball"]

    def find_articles(self, category):
        tree = set([category.replace(" ", "_")])
        self._find_all_subcategories([category], tree, 0)
        print(tree)
        return self._find_tagged_articles(list(tree))

    def _find_all_subcategories(self, categories, tree, depth):
        if depth >= self.MAX_DEPTH:
            return

        categories = [cat for cat in categories if not ":" in cat]
        if not categories:
            return
        
        with self.conn.cursor() as cursor:
            cursor.execute(self.subcategory_query, {"categories": categories})
            self.conn.commit()
            try:
                subcategories = [item["page_title"].decode("utf-8") for item in cursor.fetchall()]
            except Exception as e:
                print(e)
                subcategories = []

        tree.update(subcategories)
        self._find_all_subcategories(subcategories, tree, depth + 1)

    def _find_tagged_articles(self, categories):
        with self.conn.cursor() as cursor:
            cursor.execute(self.articles_query, {"categories": categories, "tags": self.TAGS})
            self.conn.commit()
            try:
                articles = [{"page": item["page_title"].decode("utf-8"),
                             "problems": [item["tl_title"].decode("utf-8").replace("_", " ")]} for item in cursor.fetchall()]
            except Exception:
                articles = []

        return articles
