from api import Mitmachen
import string
import itertools
import json

m = Mitmachen()

lowercase = string.ascii_lowercase + "äöüß"
uppercase = string.ascii_uppercase + "ÄÖÜ"

all_categories = {}

i = 0

for combination in itertools.product(uppercase, lowercase, lowercase):
    triple = "".join(combination)
    categories = m.matching_categories(triple)
    if categories:
        all_categories[triple] = categories
        i += 1

        if not i % 100:
            print("Saving at", combination)
            with open("autocomplete.json", "wt") as f:
                json.dump(all_categories, f)

print("Final save...")
with open("autocomplete.json", "wt") as f:
    json.dump(all_categories, f)
