import os
from flask import Flask
from models.postgres import db
from flask_jwt_extended import JWTManager


def create_app(config_object=None, funcs=None):
    """ Factory function to start application  """
    app = Flask(__name__.split('.')[0], static_folder='../client/build/static', template_folder="../client/build")

    app.url_map.strict_slashes = False
    app.config.from_object(config_object)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        "SQLALCHEMY_DATABASE_URI")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    jwt = JWTManager(app)

    db.init_app(app)
    db.app = app
    # db.create_all()

    for func in funcs:
        func(app)

    return app
