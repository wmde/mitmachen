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

The [initial version of *Mitmachen*](https://github.com/ionicsolutions/mitmachen) was licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

The version developed in this repository is licenced under [GNU GPL 2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).
