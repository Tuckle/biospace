class PARAMS:
    aminer = {
        "action": "searchapi.SearchPubsCommon",
        "parameters": {
            "offset": 0, "size": 20, "searchType": "all",
            "aggregation": ["year", "author_year"],
            "query": "biomedical", "year_interval": 1
        },
        "schema": {
            "publication": ["id", "year", "title", "title_zh", "abstract", "abstract_zh", "authors",
                            "authors._id", "authors.name", "keywords", "authors.name_zh", "num_citation",
                            "num_viewed", "num_starred", "num_upvoted", "is_starring", "is_upvoted",
                            "is_downvoted", "venue.info.name", "venue.volume", "venue.info.name_zh",
                            "venue.info.publisher", "venue.issue", "pages.start", "pages.end", "lang",
                            "pdf", "ppt", "doi", "urls", "flags", "resources"]
        }
    }
