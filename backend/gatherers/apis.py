from .base import *
from .config import PARAMS


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

    def _request(self, params):
        parameters = self._get_params(**params)
        with requests.post(self.url, json=parameters) as r:
            r.raise_for_status()
            result = r.json()
            try:
                data = result["data"]
                print(data)
                status = data[0]
                if status["succeed"] is False:
                    raise PageNotFound("Last page")
            except KeyError:
                pass


if __name__ == '__main__':
    a = AMiner()
    a._request({"query": "biomedical", "page": 9980})
