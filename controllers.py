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

from sys import stderr
from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, add_fake_data

url_signer = URLSigner(session)

from py4web.utils.param import Param


class ParamParser:
    def __init__(self, params: "dict(str,str)", param_types: "dict(str, type)", *, default=None):
        self.dict = {}
        self.default = default
        for name, value_str in params.items():
            try:
                val = param_types[name](value_str)
                self.dict[name] = val
            except (ValueError,  KeyError) as e:
                print(e)
                continue
    def __getattr__(self, key: str):
        return self.dict.get(key, self.default)

    def __getitem__(self, key:str):
        return self.dict.get(key, self.default)

    def __str__(self) -> str:
        return self.dict.__str__() + f" default= {self.default}"
    def __repr__(self) -> str:
        return self.__str__()

@action('index')
@action.uses(db, auth, 'index.html')
def index():
    print("User:", get_user_email())
    return dict()


@action('feed')
@action.uses('feed.html', db, auth)
def feed():
    return dict(
        load_posts_url=URL('feed','load') # should this be signed ???
    )

@action('clear')
@action.uses(db)
def clear():
    db(db.posts).delete()
    redirect(URL('feed'))





@action('feed/load/')
@action.uses(db, auth)
def feed_load():
    expected_param_types = {'min': int, 'max': int, 'include': int}
    params = ParamParser(request.params, expected_param_types)

    posts = db().select(db.posts.ALL, orderby=~db.posts.rating, limitby=(params.min, params.max)).as_list()
    if not posts:
        add_fake_data(db, 50)
        redirect(URL('feed'))

    return dict(
        posts=posts        
    )