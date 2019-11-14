SELECT DISTINCT
    page_title,
	'Ungeprüfter Link' AS tl_title
FROM
    page,
    categorylinks
WHERE
    cl_from = page_id
    AND cl_type = 'subcat'
    AND cl_to IN %(categories)s;
