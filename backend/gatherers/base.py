import os
import requests


class API:
    url = None

    def _get_params(self, query, **kwargs):
        pass

    def _request(self, params):
        pass


class PageNotFound(ValueError):
    pass