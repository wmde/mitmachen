SELECT
	page_title,
    tl_title
FROM
	page,
    (SELECT DISTINCT
		page_id
	FROM
		page,
    	categorylinks
	WHERE
        cl_to IN %(categories)s
        AND cl_type = 'page'
        AND cl_from = page_id
    LIMIT 10000) AS subpages,
    templatelinks
WHERE
	page.page_id = subpages.page_id
	AND tl_from = subpages.page_id
    AND tl_title IN %(tags)s
ORDER BY RAND()
LIMIT 30;
