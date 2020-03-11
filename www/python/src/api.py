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
import logging
import os
import random
import ast
import pymysql.cursors
import toolforge
from datetime import datetime

__dir__ = os.path.abspath("../queries")


def generate_iabot_cats():
    archive = ["Wikipedia:Defekte_Weblinks/Ungeprüfte_Archivlinks_201%d-%02d" % (y, m)
               for m in range(4, 13) for y in (8, 9)]
    dead = ["Wikipedia:Defekte_Weblinks/Ungeprüfte_Botmarkierungen_201%d-%02d" % (y, m)
            for m in range(4, 13) for y in (8, 9)]
    return archive + dead


class Mitmachen:
    MAX_DEPTH = 3  # maximum depth in category tree search
    TAGS = ["Nur_Liste", "Lückenhaft", "Veraltet",
            "Belege_fehlen", "Ungeprüfter_Link"]
    NUM = 10  # number of articles to return (goal)
    IABOT_CATS = generate_iabot_cats()

    def __init__(self):
        self.logger = logging.getLogger("mitmachen")

        self.autocomplete_query = self._load("autocomplete.sql")
        self.suggest_query = self._load("suggest.sql")
        self.subcategory_query = self._load("subcategories.sql")
        self.articles_query = self._load("articles.sql")
        self.iabot_query = self._load("iabot.sql")
        self.tracking_query = self._load("tracking.sql")
        self.tracking_insert_query = self._load("trackinginsert.sql")
        self.getsubs_query = self._load("getsubs.sql")
        self.subcateg_articles = self._load("getcategarticles.sql")
        self.subcateg_iabotarticles = self._load('iabot_getcategarticles.sql')
        self.subfilter_query = self._load("subcategfilter.sql")
        self.getstats_query = self._load('trackingget.sql')


        self.blacklist = self._readfile("blacklist.txt")
        self.configdb = self._readconfig("db_config.txt")

        autocomplete_result = os.path.join(__dir__, "autocomplete.json")
        if os.path.exists(autocomplete_result):
            with open(autocomplete_result, "rt") as f:
                self.all_categories = json.load(f)
        else:
            self.all_categories = {}

    def _get_connection(self):
        return toolforge.connect("dewiki_p",
                                 cursorclass=pymysql.cursors.DictCursor)

    def _tracking_connection(self):
        return toolforge.toolsdb(dbname=self.configdb)

    def _load(self, fname):
        self.logger.info("Load query from '%s'.", fname)
        with open(os.path.join(__dir__, fname), "r") as queryfile:
            return queryfile.read()

    def _readfile(self, pp):
        self.logger.info("Reading file: {}".format(pp))
        with open(os.path.join('./', pp), "r") as bb:
            full_list = ast.literal_eval(bb.read())
            full_list = [item.lower().replace(' ', '_') for item in full_list]
            full_list = list(set(full_list))
            return full_list

    # to read db config file
    def _readconfig(self, fname):
        self.logger.info("Reading file: {}".format(fname))
        with open(os.path.join('./', fname), "r") as ff:
            ftxt = ff.read()
            return ftxt

    # save tracking data into other DB
    def save_tracking_info(self, data):
        conn = self._tracking_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.tracking_query, {"type": data['type'], "title": data['title'], "webdate": datetime.today().strftime('%d-%m-%Y')})
                # tracking_insert_query
                
                try:
                    rowsaffected = cursor.rowcount

                    if rowsaffected >= 1:
                        conn.commit()
                        return []
                    else:
                        cursor.execute(self.tracking_insert_query, {"type": data['type'], "title": data['title'], "weblink": data['weblink'], "webdate": datetime.today().strftime('%d-%m-%Y')})
                        conn.commit()
                        return []
                except Exception as e:
                    self.logger.log('Failed to update, update error: %s', e)
                    return []

        finally:
            conn.close()

    # get subcategories list for all categories
    def getsubcategories(self, data):
        categories = data
        # categories = ast.literal_eval(data['categories'])
        conn = self._tracking_connection()
        conn_orig = self._get_connection()

        categories = [item.replace(' ', '_') for item in categories]

        subcategories = []
        distinct_categories = []

        try:
            with conn.cursor() as cursor:
                cursor.execute(self.getsubs_query, {"categories": categories})
                conn.commit()

                subcategories = [item for item in cursor.fetchall()]
                subcategories = list(set(subcategories))
            
            with conn_orig.cursor() as cursor:
                cursor.execute(self.subfilter_query, {"subcateg": subcategories, "tags": self.TAGS})
                conn_orig.commit()

                distinct_categories = [item['cl_to'].decode("utf-8") for item in cursor.fetchall()]
                # distinct_categories = list(set(distinct_categories))
            
            return distinct_categories

        finally:
            conn.close()

    # get articles for passed subcategory
    def getarticlesforsubcategory(self, data):
        subcateg = data

        conn = self._get_connection()
        articles = {}
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.subcateg_articles,
                               {"subcateg": [subcateg], "tags": self.TAGS})
                conn.commit()
                articles = self._extract_problems(cursor.fetchall(),
                                                  articles)

            with conn.cursor() as cursor:
                cursor.execute(self.subcateg_iabotarticles, {"subcateg": [subcateg], "iabot_categories": self.IABOT_CATS})

                conn.commit()
                articles = self._extract_problems(cursor.fetchall(), articles)

            articles = articles.items()
            
            more = len(articles) > self.NUM
            if more:
                articles = random.sample(articles, self.NUM)

            return [{"page": page, "problems": list(set(problems))}
                    for page, problems in articles], more
        finally:
            conn.close()


    def matching_categories(self, first_letters):
        """Return a list of categories starting with *first_letters*."""
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
                    self.logger.log(
                        "Failed to return list of matching categories: %s", e)
                    return []
        finally:
            conn.close()

    def autocomplete(self, first_letters):
        """Return a list of autocomplete suggestions."""
        if self.all_categories:
            key = first_letters[:3].capitalize()
            return [cat for cat in self.all_categories.get(key, [])
                    if cat.lower().startswith(first_letters.lower())]
        else:
            return self.matching_categories(first_letters)

    def suggest_categories(self):
        """Return a list of random category names."""
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
                    self.logger.log(
                        "Failed to return list of random categories: %s", e)
                    return ["China", "19. Jahrhundert", "Fußball"]
                else:
                    return sugg

        finally:
            conn.close()

    def find_articles(self, category):
        """Return a list of articles in *category* in need of attention.

        All articles which are in *category* or below in the category tree
        are examined. See :meth:`._find_all_subcategories` and
        :meth:`._find_tagged_articles` for details.
        """
        tree = set([category.replace(" ", "_")])
        self._find_all_subcategories([category], tree, 0)
        return self._find_tagged_articles(list(tree))

    def _find_all_subcategories(self, categories, tree, depth):
        """Return a list of all categories below *categories*."""
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
                    self.logger.error(
                        "Failed to create a list of subcategories: %s", e)
                    subcategories = []
        finally:
            conn.close()

        tree.update(subcategories)
        self._find_all_subcategories(subcategories, tree, depth + 1)

    def _find_tagged_articles(self, categories):
        """Return a list of articles with associated problems."""
        conn = self._get_connection()
        articles = {}
        
        # categories is list and remove items from it that are in blacklist
        categories = [item for item in categories if item not in self.blacklist]
        categories = [item.title() for item in categories]
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.articles_query,
                               {"categories": categories,
                                "tags": self.TAGS})
                conn.commit()
                articles = self._extract_problems(cursor.fetchall(),
                                                  articles)

            with conn.cursor() as cursor:
                cursor.execute(self.iabot_query,
                               {"categories": categories,
                                "iabot_categories": self.IABOT_CATS})
                conn.commit()
                articles = self._extract_problems(cursor.fetchall(),
                                                  articles)

            articles = articles.items()
            
            more = len(articles) > self.NUM
            total = len(articles)
            if more:
                articles = random.sample(articles, self.NUM)

            return [{"page": page, "problems": list(set(problems))}
                    for page, problems in articles], more, total
        finally:
            conn.close()

    def _extract_problems(self, result, articles):
        """Add articles with their associated results to the articles dict."""
        for item in result:
            try:
                page = item["page_title"].decode("utf-8")
                try:
                    problem = item["tl_title"].decode("utf-8").replace("_", " ")
                except AttributeError:
                    problem = item["tl_title"]
            except Exception as e:
                self.logger.error(
                    "Failed to extract problem from query result: %s", e)
                continue
            try:
                articles[page].append(problem)
            except KeyError:
                articles[page] = [problem]
        return articles

    def getstats(self):
        conn = self._tracking_connection()
        stats = {}
        try:
            with conn.cursor() as cursor:
                cursor.execute(self.getstats_query)

                conn.commit()
                stats = cursor.fetchall()

                # stats = stats.items()

                return stats
        finally:
            conn.close()