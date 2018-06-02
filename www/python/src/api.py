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

__dir__ = os.path.abspath("../queries")
print(__dir__)
print(os.listdir(__dir__))


class Mitmachen:
    MAX_DEPTH = 3  # maximum depth in category tree search
    TAGS = ["Überarbeiten", "Lückenhaft", "Veraltet",
            "Belege_fehlen", "Allgemeinverständlichkeit"]
    NUM = 20  # number of articles to return (goal)

    def __init__(self):
        self.autocomplete_query = self._load("autocomplete.sql")
        self.suggest_query = self._load("suggest.sql")
        self.subcategory_query = self._load("subcategories.sql")
        self.articles_query = self._load("articles.sql")

    def _get_connection(self):
        return toolforge.connect("dewiki_p",
                                 cursorclass=pymysql.cursors.DictCursor)

    def _load(self, fname):
        with open(os.path.join(__dir__, fname), "r") as queryfile:
            return queryfile.read()

    def matching_categories(self, first_letters):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.autocomplete_query,
                               {"first_letters": "%s%%"
                                                 % first_letters.capitalize()})
                conn.commit()
                try:
                    return [item["cat_title"].decode("utf-8").replace("_", " ")
                            for item in cursor.fetchall()
                            if ":" not in item["cat_title"].decode("utf-8")]
                except Exception as e:
                    return []
        finally:
            conn.close()

    def suggest_categories(self):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.suggest_query)
                conn.commit()
                try:
                    sugg = [item["cat_title"].decode("utf-8").replace("_", " ")
                            for item in cursor.fetchall()
                            if ":" not in item["cat_title"].decode("utf-8")]
                except Exception as e:
                    return ["China", "19. Jahrhundert", "Fußball"]
                else:
                    # Sort long category names to the center
                    # of the list for improved UI layout
                    ordered = sorted(sugg, key=len)
                    point = int(len(ordered)/2)
                    categories = ordered[:point]
                    categories.extend(reversed(ordered[point:]))
                    return categories

        finally:
            conn.close()

    def find_articles(self, category):
        tree = set([category.replace(" ", "_")])
        self._find_all_subcategories([category], tree, 0)
        return self._find_tagged_articles(list(tree))

    def _find_all_subcategories(self, categories, tree, depth):
        if depth >= self.MAX_DEPTH:
            return

        categories = [cat for cat in categories if ":" not in cat]
        if not categories:
            return

        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.subcategory_query,
                               {"categories": categories})
                conn.commit()
                try:
                    subcategories = [item["page_title"].decode("utf-8")
                                     for item in cursor.fetchall()]
                except Exception as e:
                    subcategories = []
        finally:
            conn.close()

        tree.update(subcategories)
        self._find_all_subcategories(subcategories, tree, depth + 1)

    def _find_tagged_articles(self, categories):
        conn = self._get_connection()
        articles = {}
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.articles_query,
                               {"categories": categories,
                                "tags": self.TAGS,
                                "num": self.NUM})
                conn.commit()
                articles = self._extract_problems(cursor.fetchall(),
                                                  articles)

            if articles:
                with conn.cursor() as cursor:
                    cursor.execute(self.iabot_query,
                                   {"pages": list(articles.keys())})
                    conn.commit()
                    articles = self._extract_problems(cursor.fetchall(),
                                                      articles)

            if len(articles) < self.NUM:  # throw in pages with link issues
                with conn.cursor() as cursor:
                    cursor.execute(self.weblink_query,
                                   {"categories": categories,
                                    "num": self.NUM - len(articles)})
                    conn.commit()
                    articles = self._extract_problems(cursor.fetchall(),
                                                      articles)

            return [{"page": page, "problems": list(set(problems))}
                    for page, problems in articles.items()]
        finally:
            conn.close()

    def _extract_problems(self, result, articles):
        for item in result:
            try:
                page = item["page_title"].decode("utf-8")
                problem = item["tl_title"].decode("utf-8").replace("_", " ")
            except Exception:
                continue
            try:
                articles[page].append(problem)
            except KeyError:
                articles[page] = [problem]
        return articles
    