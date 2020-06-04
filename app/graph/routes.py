from flask import Blueprint, request
from flask import jsonify
from models.neo import Graph
from models.postgres import Spaces, db

blueprint = Blueprint("graph", __name__)


@blueprint.route('/graph/sub', methods=("GET",))
def subgraph():
    args = request.args.to_dict(flat=False)
    keys = args.get("key", args.get("keys", None))
    keys = ",".join(keys).split(',')

    if not keys:
        return jsonify({"error": "no keys given"})
    return jsonify({"info": Graph.get_subgraph_from(keys)})


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
        space = Spaces.get(id=Spaces.convert_id(input_id))
    if keys and not space:
        if isinstance(keys, str):
            keys = list(filter(lambda x: x, map(lambda x: x.strip().lower(), keys.split(','))))
        keys = sorted(keys)
        space = Spaces.get(keys=keys)

    if not space:
        return {
            "error": "Failed to retrieve space"
        }
    return space
