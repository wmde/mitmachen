SELECT
    DISTINCT cl_to
FROM
    page,
    (SELECT DISTINCT
        page_id, cl_to
    FROM
        page,
        categorylinks
    WHERE
        cl_to IN %(subcateg)s
        AND cl_type = 'page'
        AND cl_from = page_id
    LIMIT 10000) AS subpages,
    templatelinks
WHERE
    page.page_id = subpages.page_id
    AND tl_from = subpages.page_id
    AND tl_title IN %(tags)s
ORDER BY RAND()
LIMIT 100;