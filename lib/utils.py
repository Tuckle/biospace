import re
import crossref_commons.retrieval
from models.neo import Paper, Field


def get_crossref_info(doi):
    try:
        return crossref_commons.retrieval.get_publication_as_json(doi)
    except ValueError as ver:
        raise ValueError("Invalid doi: " + str(ver))


def get_info(doi):
    raw_doi = doi.replace('doi://', '').strip('/\\')
    if raw_doi.startswith('https'):
        raw_doi = re.sub("https:.*?doi.org/", "", raw_doi)
    raw_doi = raw_doi.strip('/\\ ')
    result = get_crossref_info(raw_doi)
    if not result:
        raise ValueError("no crossref info")
    doi_type = result["type"]
    timestamp = result["created"]["timestamp"]
    references = list(map(lambda x: x["DOI"], filter(lambda x: "DOI" in x, result.get("reference", []))))
    references_count = result.get("references-count", len(references))
    title = result["title"]
    if isinstance(title, list):
        title = title[0]
    return {
        "doi": doi,
        "raw_doi": raw_doi,
        "info": {
            "type": doi_type,
            "ts": timestamp,
            "references_count": references_count,
            "name": title
        },
        "references": references,
        "keywords": result.get("subject", [])
    }


def add_dois(doi_list, keywords=None):
    doi_list = {x: False for x in doi_list}
    for doi in doi_list:
        try:
            result = get_info(doi)
            db_doi = "doi://" + result["raw_doi"]
            info = result["info"]
            update_info = {"ts": info["ts"], "t": info["type"],
                           "r": info["references_count"], "name": info["name"]}
            update_info = {x: update_info[x] for x in update_info if update_info[x]}
            doi_node = Paper.get(db_doi)
            for key in update_info:
                doi_node[key] = update_info[key]
            doi_node.save()

            for reference in result["references"]:
                try:
                    ref_doi = "doi://" + reference
                    ref_node = Paper.get_or_add(ref_doi)
                    doi_node.references(ref_node)
                except:
                    pass
            for keyword in result["keywords"]:
                try:
                    key_node = Field.get_or_add(keyword)
                    doi_node.contains(key_node, keyword=True)
                except:
                    pass
            if keywords:
                for keyword in keywords:
                    try:
                        key_node = Field.get_or_add(keyword)
                        doi_node.contains(key_node)
                    except:
                        pass
            doi_list[doi] = True
        except ValueError:
            pass
        except:
            pass
    return doi_list


if __name__ == '__main__':
    pass
