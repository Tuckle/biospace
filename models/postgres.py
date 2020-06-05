import hashids
import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return '<User {}>'.format(self.id)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password": self.password
        }


class Spaces(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    keys = db.Column(db.String(1000), index=True)
    name = db.Column(db.String(200))
    description = db.Column(db.String(400))
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    accessed = db.Column(db.DateTime, default=datetime.datetime.utcnow, index=True)
    popularity = db.Column(db.Integer, default=1, index=True)

    def __repr__(self):
        return '<Space {}>'.format(self.id)

    def access(self):
        self.popularity = self.popularity + 1
        self.accessed = datetime.datetime.utcnow()
        db.session.commit()

    @classmethod
    def convert_id(cls, input_id):
        hash_id = hashids.Hashids(salt=cls.__name__)
        if isinstance(input_id, int):
            return hash_id.encode(input_id)
        return hash_id.decode(input_id)[0]

    @classmethod
    def get(cls, id=None, keys=None, raw=False):
        if id:
            space = cls.query.filter(cls.id == id).first()
            if not space:
                return
            return space.serialize() if not raw else space
        if keys:
            if isinstance(keys, str):
                keys = list(filter(lambda x: x, map(lambda x: x.strip().lower(), keys.split(','))))
            keys = ",".join(sorted(keys))
            space = cls.query.filter(cls.keys == keys).first()
            if not space:
                space = cls(keys=keys)
                db.session.add(space)
                db.session.commit()
            space = cls.query.filter(cls.keys == keys).first()
            return space.serialize() if not raw else space

    @classmethod
    def get_spaces(cls, top=10, asc=False, by=None):
        if by is None:
            by = cls.popularity
        by = by.asc() if asc else by.desc()
        query = list(map(lambda x: x.serialize(), cls.query.order_by(by).limit(top)))
        return query

    def serialize(self):
        return {
            "id": self.convert_id(self.id),
            "keys": self.keys,
            "name": self.name,
            "description": self.description,
            "created": str(self.created),
            "accessed": str(self.accessed),
            "popularity": self.popularity
        }


if __name__ == '__main__':
    db.create_all()
