SELECT
	cat_title
FROM
	category
WHERE
    cat_title LIKE %(first_letters)s
    AND cat_pages > 20
LIMIT 100;

