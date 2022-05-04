"""
This file defines the database models
"""

from random import choice, randint, random
import datetime
from .common import db, Field, auth
from pydal.validators import *


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

def generate_garbage_word(num_chars: int):
    LETTERS = [ a for a in "abcdefghijklmnopqrstuvwxyz"]
    res= ""
    for _ in range(num_chars):
        res += choice(LETTERS)
    return res
def generate_garbage_text(num_words: int, max_chars = None):
    WORD_LEN_FREQ = [1,2,3,3,4,4,4,5,5,5,5,6,6,7,7,8,9]
    res = ""
    for _ in range(num_words):
        res += generate_garbage_word(choice(WORD_LEN_FREQ)) 
        res += " "
    if max_chars and len(res) > max_chars:
        return res[0:max_chars]
    return res


def add_fake_data(db, num:int):

    tag_ids = [ x['id'] for x in db().select(db.tags.id).as_list()]
    post_tags = [None, None, None]

    ntags = 0
    while ntags < len(post_tags):
        post_tags[ntags] = choice(tag_ids)
        ntags += 1
        if random() > 0.5:
            break

    max_id = db().select(db.posts.id, orderby=~db.posts.id).first()
    if not max_id:
        max_id = 0

    for i in range(max_id+1, num+max_id+1):
        db.posts.insert(
            title= f"fake title {i}",
            body= generate_garbage_text(randint(0, 100)),
            tag1= post_tags[0],
            tag2= post_tags[1],
            tag3= post_tags[2],
            rating= randint(1,1000),
        )

db.commit()
