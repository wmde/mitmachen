import toolforge
import pymysql.cursors


class Mitmachen:

    MAX_DEPTH = 3  # maximum depth in category tree search
    TAGS = ["Überarbeiten", "Lückenhaft", "Veraltet", "Belege_fehlen", "Allgemeinverständlichkeit"]

    def __init__(self):
        self.autocomplete_query = self._load("autocomplete.sql")
        self.suggest_query = self._load("suggest.sql")
        self.subcategory_query = self._load("subcategories.sql")
        self.articles_query = self._load("articles.sql")

        self.tag_string = "','".join(self.TAGS)

        self.conn = toolforge.connect("dewiki_p", cursorclass=pymysql.cursors.DictCursor)

    def _load(self, fname):
        with open("queries/%s" % fname, "r") as queryfile:
            return queryfile.read()

    def matching_categories(self, first_letters):
        with self.conn.cursor() as cursor:
            cursor.execute(self.autocomplete_query, {"first_letters": first_letters.capitalize()})
            self.conn.commit()
            try:
                return [item["cat_title"].replace("_", " ") for item in cursor.fetchall()
                        if ":" not in item["cat_title"]]
            except Exception:
                return []

    def suggest_categories(self):
        with self.conn.cursor() as cursor:
            cursor.execute(self.suggest_query)
            self.conn.commit()
            try:
                return [item["cat_title"].replace("_", " ") for item in cursor.fetchall()
                        if ":" not in item["cat_title"]]
            except Exception:
                return ["China", "19. Jahrhundert", "Fußball"]

    def find_articles(self, category):
        tree = set(category.replace(" ", "_"))
        self._find_all_subcategories([category], tree, 0)
        return self._find_tagged_articles(list(tree))

    def _find_all_subcategories(self, categories, tree, depth):
        if depth == self.MAX_DEPTH:
            return

        categories = [cat for cat in categories if not ":" in cat]
        if not categories:
            return

        category_string = "','".join(categories)

        with self.conn.cursor() as cursor:
            cursor.execute(self.subcategory_query, {"categories": category_string})
            self.conn.commit()
            try:
                subcategories = [item["cat_title"] for item in cursor.fetchall()]
            except Exception:
                subcategories = []

        tree.update(subcategories)
        self._find_all_subcategories(subcategories, tree, depth + 1)

    def _find_tagged_articles(self, categories):

        category_string = "','".join(categories)

        with self.conn.cursor() as cursor:
            cursor.execute(self.articles_query, {"categories": category_string, "tags": self.tag_string})
            self.conn.commit()
            try:
                articles = [{"page": item["page_title"], "problems": [item["tl_title"]]} for item in cursor.fetchall()]
            except Exception:
                articles = []

        return articles
