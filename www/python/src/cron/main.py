import urllib.request, json
import toolforge

conn = toolforge.toolsdb(dbname="s53772__mitracking_p")

# having issue with kunst and kultur category, can't get result with space and underscore in between
all_links = {
	"Geographie": "https://petscan.wmflabs.org/?psid=11458260&format=json",
	"Geschichte": "https://petscan.wmflabs.org/?psid=11458273&format=json",
	"Gesellschaft": "https://petscan.wmflabs.org/?psid=11458287&format=json",
	"Religion": "https://petscan.wmflabs.org/?psid=11458319&format=json",
	"Sport": "https://petscan.wmflabs.org/?psid=11458327&format=json",
	"Technik": "https://petscan.wmflabs.org/?psid=11458343&format=json",
	"Wissen": "https://petscan.wmflabs.org/?psid=11458358&format=json",
	"Kunst_und_Kultur": "https://petscan.wmflabs.org/?psid=11458424&format=json"
}

for item in list(all_links.keys()):
	with urllib.request.urlopen(all_links[item]) as url:
		data = json.loads(url.read().decode())
		all_values = []

		for elem in data['*'][0]['a']['*']:
			all_values.append((item.lower(), elem['title'], elem['id']))

		query = "INSERT INTO crondata (categ, subcateg, page_id) VALUES (%s, %s, %s)"
		# print (all_values)
		# print (data['*'][0]['a']['*'])
		# query = "INSERT INTO crondata (categ, subcateg, page_id) VALUES " + ",".join("(%s, %s, %s)" for _ in len(data['*'][0]['a']['*']))
		# print (query)
		# val_insert = [(item, elem['title'].lower(), elem['id']) for elem in data['*']['a']['*']]
		# flatten_values = [pp for sublist in val_insert for pp in sublist]

		try:
			with conn.cursor() as cursor:
				cursor.executemany(query, all_values)

				conn.commit()
		except Exception as e:
			print ('Error with insert query: ', e)
		finally:
			# conn.close()
			print ('Done with: ', item)
