from flask import Blueprint, request
from flask import jsonify

from flask_jwt_extended import (create_access_token, create_refresh_token, jwt_required, jwt_refresh_token_required,
                                get_jwt_identity, get_raw_jwt)
from werkzeug.security import generate_password_hash, check_password_hash
from models.postgres import Users, db

blueprint = Blueprint("user", __name__)


@blueprint.route('/users/register', methods=("POST",))
def register():
    data = request.get_json()
    if Users.query.filter(Users.email == data['email']).first():
        return jsonify({"error": "User already exists"})

    u = Users(email=data['email'], password=generate_password_hash(data['password']), name=data['name'])
    db.session.add(u)
    db.session.commit()

    access_token = create_access_token(identity=data['email'])
    refresh_token = create_refresh_token(identity=data['email'])
    return jsonify({
        'email': data['email'],
        'name': data['name'],
        'access_token': access_token,
        'refresh_token': refresh_token
    })


@blueprint.route('/users/login', methods=("POST",))
def login():
    try:
        data = request.get_json()
        current_user = Users.query.filter(Users.email == data['email']).first()

        if not current_user:
            return {"error": "User not in DB. Register as a new user"}

        if check_password_hash(current_user.password, data['password']):
            access_token = create_access_token(identity=data['email'])
            refresh_token = create_refresh_token(identity=data['email'])
            return jsonify({
                'email': current_user.email,
                'name': current_user.name,
                'access_token': access_token,
                'refresh_token': refresh_token
            })
        else:
            return jsonify({'error': 'Wrong credentials'})
    except:
        raise Exception("Cannot login user")
