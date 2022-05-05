"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from .param_parser import ParamParser, BoolParam
from .random_data import add_fake_data

url_signer = URLSigner(session)


@action('index')
@action.uses(db, auth, 'index.html')
def index():
    print("User:", get_user_email())
    return dict()


@action('feed')
@action.uses('feed.html', db, auth)
def feed():
    expected_param_types = {"missing": BoolParam} #missing: bool
    params = ParamParser(request.params, expected_param_types)
    return dict(
        load_posts_url=URL('feed','load', vars=params.dict_of(["selectedid"])),
    )

@action('clear')
@action.uses(db)
def clear():
    db(db.posts).delete()
    db(db.tags).delete()
    redirect(URL('feed'))

DEFAULT_POST_COUNT = 10

def get_posts(db, query, **kwargs):

    tag1 = db.tags.with_alias('tag1')
    tag2 = db.tags.with_alias('tag2')
    tag3 = db.tags.with_alias('tag3')
    return db(query).select(
        db.posts.ALL,
        db.posts.tag1,
        db.posts.tag2,
        db.posts.tag3,
        tag1.ALL,
        tag2.ALL,
        tag3.ALL,
        **kwargs,
        left=[
            tag1.on(db.posts.tag1 == tag1.id),
            tag2.on(db.posts.tag2 == tag2.id),
            tag3.on(db.posts.tag3 == tag3.id),
        ],
    )
@action('feed/load/')
@action.uses(db, auth)
def feed_load():

    expected_param_types = {'min': int, 'max': int, 'selectedid': int}
    params = ParamParser(request.params, expected_param_types)
    min_post = params.min or 0
    max_post = params.max or (min_post + DEFAULT_POST_COUNT)
    
    
    data = get_posts(
        db, 
        query=db.posts.id != params.selectedid, 
        orderby=~db.posts.rating, 
        limitby=(min_post, max_post)
    ).as_list()

    post = get_posts(db, query=db.posts.id == params.selectedid, limitby=(0,1)).first()
    
    missing=False
    if post:
        data.insert(0, post)
    elif bool(params.selectedid):
        missing=True
        
    if not data:
        add_fake_data(db, 50)
        redirect(URL('feed'))

    return dict(
        data= data,
        selectedid= params.selectedid,
        missing= missing,
        mapurl=URL('map'),
        profileurl=URL('profiles'),
    )