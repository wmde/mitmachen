SELECT 
	cat.cat_title, COUNT(catlink.cl_timestamp) as count
FROM 
	category as cat 
INNER JOIN 
	categorylinks as catlink 
ON 
	cat.cat_title = catlink.cl_to 
WHERE 
	cat.cat_pages > 50 
GROUP BY cat.cat_title
ORDER BY RAND() 
LIMIT 10;