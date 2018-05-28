from .api import Mitmachen


m = Mitmachen()

print(m.autocomplete_query)
print(m.suggest_query)
print(m.subcategory_query)
print(m.articles_query)

print(m.tag_string)

for _ in range(5):
    print(m.suggest_categories())

print(m.matching_categories("Phy"))
print(m.matching_categories("phy"))
print(m.matching_categories("Ion"))

print(m.find_articles("Physik"))
print(m.find_articles("Soziologe (20. Jahrhundert)"))





