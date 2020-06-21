import re
import time
import crossref_commons.retrieval
from models.neo import Graph, Paper


def get_crossref_info(doi):
    try:
        return crossref_commons.retrieval.get_publication_as_json(doi)
    except ValueError as ver:
        raise ValueError("Invalid doi: " + str(ver))


def get_info(doi):
    assert not doi.startswith('pubmed://'), "pubmed id"
    raw_doi = doi.replace('doi://', '')
    if raw_doi.startswith('https'):
        raw_doi = re.sub("https:.*?doi.org/", "", raw_doi)
    result = get_crossref_info(raw_doi)
    assert result, "no crossref info"
    doi_type = result["type"]
    timestamp = result["created"]["timestamp"]
    references = list(map(lambda x: x["DOI"], filter(lambda x: "DOI" in x, result.get("reference", []))))
    title = result["title"]
    return {
        "type": doi_type,
        "ts": timestamp,
        "references": references,
        "name": title
    }


def update_doi(doi, info, references=None):
    info = {x: info[x] for x in info if info[x]}
    if not info:
        return
    node = Paper.get_or_add(doi)
    for key in info:
        node[key] = info[key]
    try:
        node.save()
    except:
        pass
    if references:
        for ref in references:
            try:
                ref_doi = "doi://" + ref
                ref_node = Paper.get_or_add(ref_doi)
                node.references(ref_node)
            except:
                pass


def update_missing_dois(loop=False):
    while True:
        try:
            dois = list(map(lambda x: x["id"], Graph.get_missing_dois()))
            for _doi in dois:
                raw_doi = _doi.replace('doi://', '')
                try:
                    doi_info = get_info(raw_doi)
                    update_info = {
                        "ts": doi_info["ts"],
                        "t": doi_info["type"],
                        "r": len(doi_info["references"]),
                        "name": doi_info["name"][0] if len(doi_info["name"]) else None
                    }
                    update_doi(_doi, update_info)
                except:
                    pass
        except:
            pass
        finally:
            if not loop:
                break
        time.sleep(60 * 60 * 24)
