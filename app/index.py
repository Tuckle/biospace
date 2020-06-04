from .exceptions import ExceptionHandler
from app.errors import blueprint
from app import graph, users
from lib import cache


def register_blueprints(app):
    app.register_blueprint(blueprint)
    app.register_blueprint(graph.routes.blueprint)
    app.register_blueprint(users.routes.blueprint)


def register_error_handler(app):
    """ Register function for handling errors  """

    def errorhandler(error):
        response = error.to_json()
        response.status_code = error.status_code
        print(response.status_code)
        return response

    app.errorhandler(ExceptionHandler)(errorhandler)


funcs = [cache.init_app, register_blueprints, register_error_handler]
