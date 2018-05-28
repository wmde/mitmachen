SELECT
	cat_title
FROM
	category
WHERE
    cat_pages > 50
ORDER BY RAND()
LIMIT 10;