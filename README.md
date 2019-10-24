# Mitmachen

[*Mitmachen*](https://tools.wmflabs.org/mitmachen/)
is a small web-interface which helps Wikipedia editors
find articles which are known to need improvement.
It is aimed at new editors who are looking for ways to make their
first meaningful edits and do not know where to start.

*Mitmachen* currently works for the German-language Wikipedia only,
where it will be used as part of an onboarding campaign run by
[Wikimedia Deutschland](https://www.wikimedia.de) planned to launch
in August 2018.

## Setup and Deployment

*Mitmachen* is written to run on the 
[Toolforge](https://tools.wmflabs.org) Cloud-as-a-Service platform
maintained by the [Wikimedia Foundation](https://www.wikimedia.org).
It requires direct access to some of the MediaWiki database tables
of the German Wikipedia and will therefore not run on a server
which does not provide such access.

To deploy *Mitmachen*, simply clone the Git repository to a Toolforge
tool account and set up the webservice as described
[here](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Web#Using_virtualenv_with_webservice_shell).

### Here are the steps to deploy the project on wikimedia server :-

***Anywhere it says user please replace with user from step 3***

- Create a tool on wikimedia 
- ssh into it
- from replica.my.cnf file, get your `user`
- Clone the code and checkout the branch you want 
- Update in the following files the DB name:-
- In api.py line number - 69, change to `user`_mitracking_p
- Second change the same in cron/main.py on line 4
- Then start running the following commands
- `webservice --backend=kubernetes python3.5 shell`
- `python3 -m venv $HOME/www/python/venv`
- `source $HOME/www/python/venv/bin/activate`
- `pip install --upgrade pip`
- `pip install -r requirements.txt`
- `python3 www/python/src/cron/main.py`
- `exit`
- `webservice --backend=kubernetes python3.5 start`

#### Side note (Important)
There is a need to create the DB on wikimedia server too.
Run this command
` mysql --defaults-file=replica.my.cnf -h tools.db.svc.eqiad.wmflabs`

Then run the following commands:-
`use 'user'_mitracking_p`

then we need to create tables, so run the following commands
- `CREATE TABLE tracking (
id INT NOT NULL AUTO_INCREMENT,
type VARCHAR(255),
title VARCHAR(255),
weblink TEXT,
count INT,
PRIMARY KEY (id)
);`

- `CREATE TABLE crondata(
id INT NOT NULL AUTO_INCREMENT,
categ TEXT,
subcateg TEXT,
page_id INT NOT NULL,
PRIMARY KEY (id)
);`

After everything is done, we need to do something about **cron**
*Setting cron on wikimedia server*
Run
`crontab -e`
then in INSERT mode, type the following
`0 5 * * 0 /usr/bin/python3 /data/project/mmt/www/python/src/cron/main.py`
Save and close


## Contributing

If you found a bug, would like to contribute ideas or code, or are
interested in bringing *Mitmachen* to another Wikipedia please head
over to the
[Mitmachen project on Wikimedia Phabricator](https://phabricator.wikimedia.org/tag/mitmachen/)
(or simply leave a pull request).

However, please note that there are no plans to expand *Mitmachen* beyond
a simple web interface for a handful of database queries.
For more experienced Wikipedia editors,
[PetScan](https://tools.wmflabs.org/petscan) already provides a
fine-grained search functionality for articles with issues and there
is a plethora of tools and bot-curated lists to find articles in need
of attention.

## License

*Mitmachen* is licensed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
