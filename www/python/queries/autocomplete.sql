SELECT
	cat_title
FROM
	category
WHERE
    cat_title LIKE %(first_letters)s;
