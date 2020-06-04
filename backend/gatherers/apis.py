from backend.gatherers.base import *
from backend.gatherers.conf import *
from models.neo import Paper, Field
from lib.log import get_logger
import requests
import traceback

DOI_SEARCH = re.compile(r'doi\.(?:\w+\.){,3}org[^/\\]*[/\\]+([^/]+/[^/]+)')
ACM_SEARCH = re.compile(r'/doi(?:\w+/){,2}([^/]+/[^/]+)')
PUBMED_SEARCH = re.compile(r'ncbi.nlm.nih.gov/pubmed/(\d+)')
logger = get_logger("aminer")


class AMiner(API):
    url = "https://apiv2.aminer.cn/n?a=SEARCH__searchapi.SearchPubsCommon___"
    params = PARAMS.aminer

    def _get_params(self, query, **kwargs):
        params = dict(self.params)
        params["parameters"]["query"] = query
        page = kwargs.get("page")
        if page and page >= 1:
            params["parameters"]["offset"] = page  # params["parameters"]["size"] * (page - 1)
        return [params]

    @staticmethod
    def _convert(item):
        result = dict()
        result["id"] = item.get("doi", "").strip('/ ')
        if not result["id"]:
            for url in item.get("urls", []):
                if "doi." in url and '.org' in url:
                    res = DOI_SEARCH.search(url)
                    if res:
                        result["id"] = "doi://" + res.group(1)
                        break
                else:
                    try:
                        # print(url)
                        with requests.get(url, headers={
                            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) "
                                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                                          "Chrome/81.0.4044.129 Mobile Safari/537.36"
                        }) as r:
                            url = r.url
                        # print(url)
                    except:
                        pass
                if "dl.acm.org" in url:
                    # print(url)
                    res = ACM_SEARCH.search(url)
                    if res:
                        # print(res.groupdict())
                        res = res.group(1)
                        try:
                            url = "https://www.doi.org/" + res
                            # print("acm", url)
                            with requests.head(url, allow_redirects=False) as r:
                                assert r.headers['location']
                            result["id"] = "doi://" + res
                            # print("acm", url)
                            break
                        except (AssertionError, KeyError):
                            traceback.print_exc()
                elif "ncbi.nlm.nih.gov/pubmed" in url:
                    # print(url)
                    res = PUBMED_SEARCH.search(url)
                    if res:
                        res = res.group(1)
                        result["id"] = "pubmed://{}".format(res)
        else:
            result["id"] = "doi://" + result["id"]
        if item.get("year"):
            result["y"] = item["year"]
        if item.get("sourcetype", "") == "publication":
            result["t"] = 1
        if item.get("num_citation"):
            result["c"] = item["num_citation"]
        keywords = item.get("keywords")
        if keywords and "null" in keywords:
            keywords.remove("null")
        if keywords:
            result["keywords"] = keywords
        return result

    @staticmethod
    def _add(item):
        keywords = item.pop("keywords", None)
        assert item["id"], item
        assert "t" in item, item
        node = Paper(**item)
        node.save()
        if keywords:
            for key in keywords:
                field = Field(id=key)
                field.save()
                node.contains(field, keyword=True)

    def _request(self, params):
        parameters = self._get_params(**params)
        with requests.post(self.url, json=parameters) as r:
            r.raise_for_status()
            result = r.json()
            try:
                data = result["data"]
                status = data[0]
                if status["succeed"] is False:
                    raise PageNotFound("Last page")
                for info in data:
                    for item in info["items"]:
                        yield item
            except KeyError:
                pass

    def run(self, query, page=1, delay=None):
        initial_query = query
        if isinstance(query, str):
            query = {"query": query}
        new_query = dict(query)
        while True:
            # print("Processing page", page, initial_query)
            new_query["page"] = page * 20
            try:
                for item in self._request(new_query):
                    try:
                        self._add(self._convert(item))
                    except AssertionError:
                        print(item)
                        if "urls" in item or item.get("doi"):
                            for x in item.get("urls", []):
                                for site in ["www.ijnc.org", "www.ncbi.nlm.nih.gov/pubmed",
                                             "ojhas.org", "isca-speech.org", "n2t.net",
                                             "ieeexplore.ieee.org"]:
                                    if site in x:
                                        break
                                else:
                                    continue
                                break
                            else:
                                logger.exception("{}".format(str(item)))
                                continue
                            # if "urls" in item:
                            #     print(item["urls"])
                    except Exception:
                        logger.exception("{}".format(str(item)))
            except PageNotFound:
                break
            page += 1
            time.sleep(delay if delay else random.random() * random.randint(1, 3))


if __name__ == '__main__':
    pass
