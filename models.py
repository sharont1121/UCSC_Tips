"""
This file defines the database models
"""

import datetime
import re
from collections import Counter

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
    Field('created_by', 'reference auth_user', notnull=True),
    Field('created_on', 'datetime', default=get_time),
    # Figure out what to store for images later, for now string
    Field('image_url'),
    Field('rating', 'integer', default=0),
    Field('tag1', 'reference tags'),
    Field('tag2', 'reference tags'),
    Field('tag3', 'reference tags'),
    Field('lat_coord'),
    Field('lon_coord'),
    Field('tag1_str'), #tags when creating posts use these string fields for now
    Field('tag2_str'),
    Field('tag3_str'),
    Field('inverse_max_freq','double', default=1.0)
)

def get_terms_from_str(body:str):
    seps = re.sub(r'[^\w\s]'," ", body).split() #replace non-letters with spaces
    words = [w[:MAX_TERM_LEN].lower() for w in seps] #lowercase and max 12 letters
    return Counter(words)

MAX_TERM_LEN = 12
def after_post_insert(post, i):
    #update tag usages stats
    db(
        db.tags.id == post.tag1 or 
        db.tags.id == post.tag2 or 
        db.tags.id == post.tag3
    ).update(uses=db.tags.uses + 1)

    #update terms and term freq
    freq = get_terms_from_str(post.body)
    if not freq:
        return
    db(db.posts.id == i).update(inverse_max_freq= (1.0/(freq.most_common(1)[0][1])) )
    for term, count in freq.items():
        t = db(db.terms.term == term).select(db.terms.id).first()
        id = None
        if not t:
            id = db.terms.insert(term=term, doc_freq=1)
        else:
            id = t.id
            db(db.terms.id == id).update(doc_freq=db.terms.doc_freq + 1)
        db.term_freq.insert(term=id, post=i, post_freq=count)
db.posts._after_insert.append(after_post_insert)

def after_post_delete(post):
    terms = [k for k in get_terms_from_str(post.body).keys()]
    db(db.terms.term.belongs(terms) and db.terms.doc_freq > 0).update(doc_freq=db.terms.freq - 1)

#todo: decriment on post delete
db.define_table(
    'terms',
    Field('term', length=MAX_TERM_LEN, unique=True),
    Field('doc_freq', 'double'), #number of posts that contain the word at least once
)

db.define_table(
    'term_freq',
    Field('post', 'reference posts'),
    Field('term', 'reference terms'),
    Field('post_freq', 'double'), #frequency of the term in the post
)



db.commit()
