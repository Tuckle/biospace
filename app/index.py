from flask import Flask, Blueprint, request, render_template

from .exceptions import ExceptionHandler
from app.errors import blueprint


def create_app(config_object=None):
    """ Factory function to start application  """
    app = Flask(__name__.split('.')[0], static_folder='../client/build/static', template_folder="../client/build")

    app.url_map.strict_slashes = False
    app.config.from_object(config_object)
    register_blueprints(app)
    register_error_handler(app)

    return app


def register_blueprints(app):
    app.register_blueprint(blueprint)


def register_error_handler(app):
    """ Register function for handling errors  """

    def errorhandler(error):
        response = error.to_json()
        response.status_code = error.status_code
        print(response.status_code)
        return response

    app.errorhandler(ExceptionHandler)(errorhandler)
