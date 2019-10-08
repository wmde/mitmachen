SELECT
	cat_title
FROM
	category
WHERE
    cat_title LIKE %(first_letters)s
LIMIT 10;
