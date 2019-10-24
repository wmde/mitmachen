import os
import unittest

from app import app

class BasicTests(unittest.TestCase):

	# executed prior to each test
	def setUp(self):
		self.app = app.test_client()

	# executed after each test
	def tearDown(self):
		pass

	def test_autocomplete_response(self):
		response = self.app.get('/autocomplete?q=hel')
		self.assertEqual(response.status_code, 200)

	def test_suggest(self):
		response = self.app.get('/suggest')
		self.assertEqual(response.status_code, 200)
		self.assertIn('categories', response.data)

	def test_find(self):
		response = self.app.get('/find')
		self.assertEqual(response.status_code, 200)
		response.assertIn('articles', response.data)

	def test_subcategarticles(self):
		response = self.app.get('/subcategarticles?q=Liste_(Geographie)')
		self.assertEqual(response.status_code, 200)
		self.assertIn('data', response.data)

	def test_tracking(self):
		response = self.app.post('/tracking', data=dict(title="Liste_(Geographie)", type="subcategoryarticle", weblink=""))
		self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
	unittest.main()