SELECT
	subcateg
FROM
	crondata
WHERE 
	categ IN %(categories)s;