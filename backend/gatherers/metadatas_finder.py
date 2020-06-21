import os
import re
import sys
import json
import crossref_commons.retrieval

from lib.utils import add_dois
from models.neo import Paper, Field

polite_headers = {
    "User-Agent": "BioSpace/1.0 (https://bio-space.herokuapp.com/; mailto:adi.piriu@gmail.com)",
    "Mailto": "adi.piriu@gmail.com"
}
crapi_path = os.path.join(os.path.dirname(__file__), ".crapi_key")
if not os.path.isfile(crapi_path):
    with open(crapi_path, "w") as o:
        json.dump(polite_headers, o)


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


def process_ids(dump):
    with open(dump) as f:
        dois = f.read().strip().split('\n')
        dois = list(filter(lambda x: x.startswith('doi://'), map(lambda x: x.strip(), dois)))
        print("Processing", len(dois), "dois")
        with open(dump + ".crossref.done", "w") as done:
            with open(dump + ".crossref.failed", "w") as failed:
                for _id in dois:
                    try:
                        info = get_info(_id)
                        assert info, "got no info"
                        done.write("{} {}\n".format(
                            _id, json.dumps(info)
                        ))
                        done.flush()
                    except Exception as ex:
                        failed.write("{},{}\n".format(_id, str(ex)))
                        failed.flush()
                        print(_id, str(ex))


def remove_dois(failed_path):
    failed = list()
    with open(failed_path) as f:
        dois = list(filter(lambda x: x, map(lambda x: x.split(',', 1)[0].strip(), f.read().strip().split('\n'))))
    if not dois:
        return
    for doi in dois:
        try:
            Paper.delete(doi)
        except:
            failed.append(doi)
    print("failed")
    print("\n".join(failed))


def get_id_mapping(dump, folder, force=False):
    to_path = dump + ".mapping"
    if not force and os.path.isfile(to_path):
        with open(to_path) as f:
            return json.load(f)
    dois = dict()
    to_replace = "http://doi.org/"
    with open(dump) as f:
        for doi, _id in map(
                lambda x: [x[0].replace(to_replace, '').strip('/ '),
                           x[1][:-4]],
                map(
                    lambda x: x.split('|||'),
                    filter(
                        lambda x: x,
                        map(lambda x: x.strip(), f.read().strip().split('\n'))
                    )
                )
        ):
            dois[_id] = doi
    for fo in filter(lambda x: x.name.endswith('.id'), os.scandir(folder)):
        id = fo.name[:-7]
        with open(fo.path) as f:
            doi = f.read().strip().replace(to_replace, '').strip('/ ')
        dois[id] = doi
    with open(to_path, "w") as o:
        json.dump(dois, o)
    return dois


def add_doi_keys(doi, keywords):
    if not doi.startswith("doi:"):
        doi = "doi://" + doi
    node = Paper.get_or_add(doi)
    if not node:
        return
    for key in keywords:
        field = Field.get_or_add(key)
        node.contains(field, content=True)


def update_dois(done_path, skip=0):
    count = 0
    with open(done_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            count += 1
            if skip is not None and skip > 0:
                skip -= 1
                if skip <= 0:
                    print("Continuing from", count)
                continue
            if count % 100 == 0:
                print("Done", count)

            index = line.index('{"')
            doi = line[:index].strip()
            info = json.loads(line[index:].strip())
            update_info = {"ts": info["ts"], "t": info["type"],
                           "r": len(info["references"]), "name": info["name"][0] if len(info["name"]) else None}
            update_info = {x: update_info[x] for x in update_info if update_info[x]}
            node = Paper.get_or_add(doi)
            if update_info:
                for key in update_info:
                    node[key] = update_info[key]
                try:
                    node.save()
                except Exception as ex:
                    print("Failed to update", doi)
                    print(str(ex))
            if info["references"]:
                for reference in info["references"]:
                    try:
                        ref_doi = "doi://" + reference
                        ref_node = Paper.get_or_add(ref_doi)
                        node.references(ref_node)
                    except:
                        pass


if __name__ == '__main__':
    # process_ids(sys.argv[1])
    dois_path = sys.argv[1]
    found = dois_path + ".crossref.done"
    failed = dois_path + ".crossref.failed"
    # remove_dois(failed)
    update_dois(found, skip=3800)
