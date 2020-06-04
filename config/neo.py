def format_(query, *params):
    params = list(params)
    for i in range(len(params)):
        if isinstance(params[i], dict):
            params[i] = "{} {} {}".format(
                "{", ", ".join(["{}: '{}'".format(k, params[i][k]) for k in params[i]]), "}"
            )
    return query.format(*params)


MERGE_NODE = """
MERGE (n:{} {})
SET n = {}
RETURN n
"""

MATCH_NODE = """
MATCH (n:{} {})
RETURN n
"""

RELATIONSHIP = """
MATCH (a),(b)
WHERE a.id = '{}' AND b.id = '{}'
MERGE (a)-[r:{}]->(b)
RETURN r
"""

RELATIONSHIP_PROPERTIES = """
MATCH (a),(b)
WHERE a.id = '{}' AND b.id = '{}'
MERGE (a)-[r:{}]->(b)
ON MATCH SET {}
RETURN r
"""

DELETE_RELATIONSHIP = """
MATCH (a {{id: '{}'}})-[r:{}]->(b {{id: '{}'}}) 
DELETE r
"""


KEYWORDS = """
MATCH (b)-[r]-(a)
WHERE ({})
RETURN b, r, a
"""

GET_FIELDS = """
MATCH (b)<-[r]-(a)
RETURN b.id as id, count(r) as count
ORDER BY count(r) DESC
"""


GETALL = """
MATCH (f:{})
RETURN {}
"""


class RELATIONSHIPS:
    REFERENCES = "REFERENCES"
    SIMILAR = "SIMILAR"
    CONTAINS = "CONTAINS"


ALL_RELATIONSHIPS = set(filter(lambda _x: _x.upper() == _x, RELATIONSHIPS.__dict__))
