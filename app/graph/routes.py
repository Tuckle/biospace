from flask import Blueprint, request
from flask import jsonify
from models.neo import Graph
from models.postgres import Spaces, db
from lib.utils import add_dois

blueprint = Blueprint("graph", __name__)


@blueprint.route('/graph/sub', methods=("GET",))
def subgraph():
    args = request.args.to_dict(flat=False)
    keys = args.get("key", args.get("keys", None))
    keys = ",".join(keys).split(',')

    if not keys:
        return jsonify({"error": "no keys given"})
    return jsonify({"info": Graph.get_subgraph_from(keys, retries=5, retry_delay=0.3)})


@blueprint.route('/graph/keywords', methods=("GET",))
def keywords():
    return jsonify({"info": Graph.get_keywords()})


@blueprint.route('/space', methods=("POST", "GET"))
def get_space_id():
    data = request.get_json()
    keys = data.get('keys', [])
    input_id = data.get('id', None)
    space = None
    if input_id:
        space = Spaces.get(id=Spaces.convert_id(input_id), raw=True)
    if keys and not space:
        if isinstance(keys, str):
            keys = list(filter(lambda x: x, map(lambda x: x.strip().lower(), keys.split(','))))
        keys = sorted(keys)
        space = Spaces.get(keys=keys, raw=True)

    if not space:
        return {
            "error": "Failed to retrieve space"
        }
    try:
        space.access()
    except:
        pass
    return space.serialize()


@blueprint.route('/view_space', methods=("POST", "GET"))
def access_space():
    data = request.get_json()
    keys = data.get('keys', [])
    input_id = data.get('id', None)
    space = None
    if input_id:
        space = Spaces.get(id=Spaces.convert_id(input_id), raw=True)
    if keys and not space:
        if isinstance(keys, str):
            keys = list(filter(lambda x: x, map(lambda x: x.strip().lower(), keys.split(','))))
        keys = sorted(keys)
        space = Spaces.get(keys=keys, raw=True)
    space.access()

    if not space:
        return {
            "error": "Failed to retrieve space"
        }
    return space.serialize()


@blueprint.route('/get_spaces', methods=("POST", "GET"))
def get_spaces_top():
    data = request.get_json()
    top = data.get("top", 10)
    asc = data.get("asc", False)
    key = data.get("by", "popularity")
    if key == "popularity":
        result = Spaces.get_spaces(top=top, asc=asc, by=Spaces.popularity)
        result = {
            x["id"]: x for x in result
        }
        return result
    elif key == "accessed":
        result = Spaces.get_spaces(top=top, asc=asc, by=Spaces.accessed)
        result = {
            x["id"]: x for x in result
        }
        return result
    return []


@blueprint.route('/add_dois', methods=("POST", "GET"))
def add_doi():
    data = request.get_json()
    dois = data.get("doi", [])
    space = data.get("space")
    keys = data.get("keys", [])
    if keys and isinstance(keys, str):
        keys = keys.split(',')
    if space:
        space = Spaces.get(id=Spaces.convert_id(space), raw=True).serialize()
        keys.extend(space.get("keys", "").split(","))
    if keys:
        keys = list(set(keys))
    if not isinstance(dois, list):
        dois = [dois]
    result = add_dois(dois, keywords=keys)
    return jsonify({"info": result})


@blueprint.route('/add_project', methods=("POST", "GET"))
def add_project():
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    keys = data.get("keys", [])
    if keys and isinstance(keys, str):
        keys = keys.split(',')
    if keys:
        keys = list(set(keys))
    return jsonify({"info": "success"})


@blueprint.route('/add_space', methods=("POST", "GET"))
def add_space():
    data = request.get_json()
    name = data.get("name")
    keys = data.get("keys", [])
    if keys and isinstance(keys, str):
        keys = keys.split(',')
    if keys:
        keys = list(set(keys))
    return jsonify({"info": "success"})
