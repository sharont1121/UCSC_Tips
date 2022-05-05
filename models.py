"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *
from .random_data import int_to_color

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
db.define_table(
    'user',
    Field('user_email', default=get_user_email),
    Field('first_name', requires=IS_NOT_EMPTY()),
    Field('last_name', 'float', default=0.),
)

db.define_table(
    'tags',
    Field('tag_name'),
    Field('color'),
    Field('uses', 'integer', default=0),
)

def add_random_color(tag, id):
    db(db.tags.id == id and db.tags.color == None).update(color=int_to_color(id))

db.tags._after_insert.append(add_random_color)


db.define_table(
    'posts',
    Field('title', default=IS_NOT_EMPTY()),
    Field('body', 'text', requires=IS_NOT_EMPTY()),
    Field('created_by', 'reference user'),
    Field('created_on', 'datetime'),
    # Figure out what to store for images later, for now string
    Field('image_url'),
    Field('rating', 'integer', default=0),
    Field('tag1', 'reference tags'),
    Field('tag2', 'reference tags'),
    Field('tag3', 'reference tags'),
    Field('lat_coord'),
    Field('lon_coord'),
)

def update_tag_usages(post, i):
    db(
        db.tags.id == post.tag1 or 
        db.tags.id == post.tag2 or 
        db.tags.id == post.tag3
    ).update(uses=db.tags.uses + 1)

db.posts._after_insert.append(update_tag_usages)


db.commit()
