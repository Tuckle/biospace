import os
import time
import neobolt.exceptions

from py2neo import Graph as NeoGraph, Node, Relationship
from config.neo import *

_url = os.environ.get('NEOGRAPHDB_URL')
_username = os.environ.get('NEO4J_USERNAME')
_password = os.environ.get('NEO4J_PASSWORD')
_host = os.environ.get('NEO4J_HOST')
assert _username and _password

graph = NeoGraph(host=_host, auth=(_username, _password))


class References(Relationship):
    pass


class BaseNode:
    _data = None
    _node = None
    _fields = []
    node_name = "base_node"

    def __init__(self, **kwargs):
        object.__setattr__(self, "_data", dict())

        for key, value in kwargs.items():
            if key not in self.__class__._fields:
                continue
            self._data[key] = value

    def __setattr__(self, key, value):
        if key in self.__class__._fields:
            self._data[key] = value
        else:
            object.__setattr__(self, key, value)

    def __getattr__(self, item):
        result = self._data.get(item)
        return result

    def __setitem__(self, key, value):
        self.__setattr__(key, value)

    def __getitem__(self, item):
        return self.__getattr__(item)

    def _filter_data(self):
        for key in list(self._data):
            if key not in self._fields or self._data[key] is None:
                del self._data[key]

    def save(self):
        assert self._data["id"]
        result = graph.run(format_(
            MERGE_NODE, self.node_name,
            {"id": self._data["id"]}, self._data
        )).data()[0]['n']
        self._node = result

    def node(self):
        return self._node

    @classmethod
    def get(cls, id_):
        try:
            result = graph.run(format_(
                MATCH_NODE, cls.node_name, {"id": id_})).data()[0]['n']
        except IndexError:
            return None
        node = cls()
        node._data = dict(result)
        node._node = result
        return node

    @classmethod
    def get_or_add(cls, id_, data=None):
        if data is None:
            data = dict()
            data["id"] = id_
        try:
            node = cls.get(id_)
        except:
            node = None
        if not node:
            node = cls(**data)
            node.save()
        elif data:
            for key in data:
                node[key] = data[key]
                node.save()
        return node

    @classmethod
    def delete(cls, id_):
        graph.run(format_(
            DELETE_NODE, cls.node_name, {"id": id_}))
        return True

    @classmethod
    def get_all(cls, fields="id"):
        if isinstance(fields, str):
            fields = fields.split(',')
        fields = list(set(fields).intersection(set(cls._fields)))
        if not fields:
            return
        query = GETALL.format(
            cls.node_name,
            ", ".join(list(map(lambda f: "f.{0} as {0}".format(f), fields)))
        )
        result = graph.run(query).data()
        return result

    @classmethod
    def connect(cls, node1, name, node2, **properties):
        assert name in ALL_RELATIONSHIPS, "invalid relationship"
        id1 = node1["id"]
        id2 = node2["id"]
        if properties:
            properties = ", ".join(["r.{} = {}".format(p, str(properties[p])) for p in properties])
        result = graph.run(format_(
            RELATIONSHIP if not properties else RELATIONSHIP_PROPERTIES, id1, id2, name, properties
        )).data()[0]['r']
        return result

    @classmethod
    def disconnect(cls, node1, name, node2):
        assert name in ALL_RELATIONSHIPS, "invalid relationship"
        id1 = node1["id"]
        id2 = node2["id"]
        result = graph.run(format_(
            DELETE_RELATIONSHIP, id1, id2, name
        )).data()
        return result

    def connect_to(self, node, name, **properties):
        return self.connect(self, name, node, **properties)

    def disconnect_from(self, node, name):
        return self.disconnect(self, name, node)

    def similar(self, node, **properties):
        return self.connect_to(node, RELATIONSHIPS.SIMILAR, **properties)


class Paper(BaseNode):
    # id, references, citations, year_of_publications, type_of_publication, ts, title
    _fields = ["id", "r", "c", "y", "t", "ts", "name"]
    node_name = "paper"

    @classmethod
    def get_or_add(cls, id_, data=None, keywords=None):
        node = super().get_or_add(id_, data=data)
        if keywords:
            for key in keywords:
                field = Field(id=key)
                field.save()
                node.contains(field, keyword=True)
        return node

    def references(self, node):
        return self.connect_to(node, RELATIONSHIPS.REFERENCES)

    def dereference(self, node):
        return self.disconnect_from(node, RELATIONSHIPS.REFERENCES)

    def contains(self, field, abstract=False, keyword=False, content=False):
        params = {}
        if abstract or keyword or content:
            params = {"a": abstract, "k": keyword, "c": content}
            params = {x: params[x] for x in params if params[x]}
        return self.connect_to(field, RELATIONSHIPS.CONTAINS, **params)


class Field(BaseNode):
    _fields = ["id"]
    node_name = "field"

    @staticmethod
    def convert(_id):
        result = " ".join(map(lambda x: x.strip().lower().capitalize(),
                              filter(lambda x: x, _id.strip().split(' ')))).replace("'", "\\'")
        return result

    def save(self):
        self._data["id"] = self.convert(self._data["id"])
        return super().save()

    @classmethod
    def get(cls, id_):
        id_ = cls.convert(id_)
        return super().get(id_)

    @classmethod
    def get_or_add(cls, id_, data=None):
        id_ = cls.convert(id_)
        return super().get_or_add(id_, data=data)


class Graph:
    @staticmethod
    def get_subgraph_from(keywords, retries=1, retry_delay=0.2, separator=" OR "):
        keywords = list(map(Field.convert, keywords))
        keywords = separator.join(list(map(lambda x: 'b.id = "{}"'.format(x), keywords)))
        keywords = KEYWORDS.format(keywords)
        for _retry in range(retries):
            try:
                result = graph.run(keywords).data()
                break
            except neobolt.exceptions.ServiceUnavailable:
                if _retry == retries - 1:
                    raise
                time.sleep(retry_delay)
        relationships_names = dict()
        relationships = dict()
        nodes = dict()
        for item in result:
            start_node = dict(item['r'].start_node)
            start_node["type"] = ",".join(list(item['r'].start_node.labels))
            end_node = dict(item['r'].end_node)
            end_node["type"] = ",".join(list(item['r'].end_node.labels))
            if start_node["id"] not in nodes:
                nodes[start_node["id"]] = start_node
            if end_node["id"] not in nodes:
                nodes[end_node["id"]] = end_node
            if end_node["id"] not in relationships:
                relationships[end_node["id"]] = dict()
            relationship_name = item['r'].__class__.__name__
            if relationship_name not in relationships_names:
                relationships_names[relationship_name] = len(relationships_names)

            relationships[end_node["id"]][start_node["id"]] = relationships_names[relationship_name]
        return {
            "nodes": nodes,
            "relationships": relationships,
            "relationships_names": relationships_names
        }

    @staticmethod
    def get_keywords():
        result = graph.run(GET_FIELDS).data()
        result = {r['id']: r['count'] for r in result}
        return result

    @staticmethod
    def custom_query(query):
        return graph.run(query).data()


if __name__ == '__main__':
    pass
