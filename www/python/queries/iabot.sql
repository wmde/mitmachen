SELECT DISTINCT
	page_title,
	'Ungeprüfter Link' AS tl_title
FROM
	page,
    (SELECT DISTINCT
		page_id
	FROM
		page,
    	categorylinks
	WHERE
     cl_to REGEXP %(categories)s COLLATE UTF8MB4_GENERAL_CI
        AND cl_type = 'page'
        AND cl_from = page_id
    LIMIT 10000) AS subpages,
    categorylinks
WHERE
	page.page_id = subpages.page_id
    AND cl_to IN %(iabot_categories)s
    AND cl_type = 'page'
    AND cl_from = page.page_id
LIMIT 100;
