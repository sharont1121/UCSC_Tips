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

from json import loads as JSON
import json
from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import (
    db,
    session,
    T,
    cache,
    auth,
    logger,
    authenticated,
    unauthenticated,
    Field,
)
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_user_id, get_terms_from_str
from .param_parser import ParamParser, BoolParam
from .random_data import add_fake_data, int_to_color, generate_random_coord

url_signer = URLSigner(session)


def user_profile_url():
    return URL("profile", get_user_id())


@action("index")
@action.uses("index.html", db, auth)
def index():
    print("User:", get_user_email())
    return dict()


@action("feed")
@action.uses("feed.html", auth)
def feed():
    expected_param_types = {
        "selectedid": int,
        "search": str,
        "tags": JSON,
    }  # exludes string types
    params = ParamParser(request.params, expected_param_types)
    # print(generate_random_coord())
    return dict(
        base_load_posts_url=URL("feed", "load"),
        create_post_url=URL("create_post"),
        map_url=URL("map"),
        profile_url=URL("profile"),
        params=json.dumps(params.dict_of(["selectedid", "search", "tags"])),
    )


@action("clear")
@action.uses(db)
def clear():
    db(db.posts).delete()
    db(db.tags).delete()
    db(db.terms).delete()
    redirect(URL("feed"))


@action("fake")
@action.uses(db)
def add_data():
    add_fake_data(db, 50)
    redirect(URL("feed"))


def get_posts(db, query, tags=None, **kwargs):
    tag1 = db.tags.with_alias("tag1")
    tag2 = db.tags.with_alias("tag2")
    tag3 = db.tags.with_alias("tag3")
    user = db.auth_user
    if tags:
        query = query & (
            tag1.tag_name.belongs(tags)
            | tag2.tag_name.belongs(tags)
            | tag3.tag_name.belongs(tags)
        )
    res = db(query).select(
        db.posts.ALL,
        tag1.ALL,
        tag2.ALL,
        tag3.ALL,
        user.id,
        user.first_name,
        **kwargs,
        left=[
            tag1.on(db.posts.tag1 == tag1.id),
            tag2.on(db.posts.tag2 == tag2.id),
            tag3.on(db.posts.tag3 == tag3.id),
            user.on(db.posts.created_by == user.id),
        ],
    )
    return res


def search_posts(
    db, search_terms, tags=None, limitby=None, exclude=[], conditions=None
):

    tag1 = db.tags.with_alias("tag1")
    tag2 = db.tags.with_alias("tag2")
    tag3 = db.tags.with_alias("tag3")
    user = db.auth_user

    num_posts = db(db.posts).count()

    # tf-idf
    div = (
        db.term_freq.post_freq * db.posts.inverse_max_freq * num_posts
    ) / db.terms.doc_freq

    query = db.terms.term.belongs(search_terms) & ~db.posts.id.belongs(exclude)

    if conditions:
        query = query & conditions

    if tags:
        query = query & (
            tag1.tag_name.belongs(tags)
            | tag2.tag_name.belongs(tags)
            | tag3.tag_name.belongs(tags)
        )
    relevent_terms = db(query).select(
        div,
        db.posts.ALL,
        tag1.ALL,
        tag2.ALL,
        tag3.ALL,
        user.id,
        user.first_name,
        orderby=~div,
        groupby=db.posts.id,
        having=(div > 0.0),
        limitby=limitby,
        left=[
            db.terms.on(db.term_freq.term == db.terms.id),
            db.posts.on(db.posts.id == db.term_freq.post),
            tag1.on(db.posts.tag1 == tag1.id),
            tag2.on(db.posts.tag2 == tag2.id),
            tag3.on(db.posts.tag3 == tag3.id),
            user.on(db.posts.created_by == user.id),
        ],
    )
    return relevent_terms


DEFAULT_POST_COUNT = 10


@action("feed/load/")
@action.uses(db, auth)
def feed_load():
    expected_param_types = {
        "min": int,
        "max": int,
        "selectedid": int,
        "search": str,
        "tags": JSON,
        "userid": int,
    }

    params = ParamParser(request.params, expected_param_types)

    min_post = params.min or 0
    max_post = params.max or (min_post + DEFAULT_POST_COUNT)
    assert max_post - min_post < 100
    data = []

    tinyquery = db.posts.id == params.selectedid
    if params.userid:
        tinyquery = db.posts.created_by == params.userid
    post = get_posts(db, query=tinyquery, limitby=(0, 1))
    missing = False
    if post:
        data.extend(post)
    elif bool(params.selectedid):
        missing = True

    query = db.posts.id != params.selectedid
    if params.search:
        query = query & db.posts.title.ilike(f"%{params.search}%")

    if params.userid:
        query = query & (db.posts.created_by == params.userid)

    posts = get_posts(
        db,
        query=query,
        tags=params.tags,
        orderby=~db.posts.rating,
        limitby=(min_post, max_post),
    )

    data.extend(posts)

    if params.search and (len(data) + min_post) < max_post:
        terms = [k for k in get_terms_from_str(params.search)]

        ids = [
            r.id
            for r in db(query).select(
                db.posts.id, orderby=~db.posts.rating, limitby=(0, max_post)
            )
        ]

        if params.selectedid:
            ids.append(params.selectedid)

        query2 = None
        if params.userid:
            query2 = db.posts.created_by == params.userid

        data.extend(
            search_posts(
                db,
                terms,
                tags=params.tags,
                limitby=(len(data) + min_post, max_post),
                exclude=ids,
                conditions=query2,
            )
        )

    return dict(data=data, selectedid=params.selectedid, missing=missing)


@action("map")
@action.uses(db, "map.html", url_signer, auth.user)
def map():
    print("You are viewing the map page")
    # redirect(URL("index"))
    rows = db().select(db.posts.ALL).as_list()
    print(rows)
    return dict(posts=rows, map_url=URL("map"),)


@action("profile/<uid:int>")
@action.uses("profile.html", auth, db)
def profile(uid=None):
    assert uid is not None
    #  assert(db(db.auth_user.id == uid).select().first() is not None), "There exists no User with this uid."
    if (
        db(db.auth_user.id == uid).select().first() is None
    ):  # There is no existing user with this uid
        person = False  # Consider making this redirect to another page instead
    else:  # This is a user that does exist
        person = db(db.auth_user.id == uid).select().first()

    # Stuff for the feed
    expected_param_types = {
        "selectedid": int,
        "search": str,
        "tags": JSON,
    }  # exludes string types
    params = ParamParser(request.params, expected_param_types)

    return dict(
        person=person,
        base_load_posts_url=URL("feed", "load"),
        params=json.dumps(params.dict_of(["selectedid", "search", "tags"])),
    )
    # If, for some reason globals().get('user') is not longer working in profile.html, use: auth.get_user())


@action("create_post")
@action.uses("create_post.html", url_signer, auth.user)
def create_post():
    return dict(add_tip_url=URL("add_tip", signer=url_signer), map_url=URL("map"))


@action("add_tip", method="POST")
@action.uses(url_signer.verify(), db)
def add_tip():

    # If tag1 doesnt exist in the db, insert it and set uses to 1
    t1 = db(db.tags.tag_name == request.json.get("tag1_name")).select().as_list()
    if request.json.get("tag1_name") == "":
        tag1_id = None
    elif len(t1) == 0:
        tag1_id = db.tags.insert(tag_name=request.json.get("tag1_name"), uses=1)
    # Otherwise increment its 'uses' field
    else:
        tag1_id = t1[0]["id"]
        tag1 = db.tags[tag1_id]
        db(db.tags.id == tag1_id).update(uses=tag1.uses + 1)

    # If tag2 doesn't exist in the db, insert it and set uses to 1
    t2 = db(db.tags.tag_name == request.json.get("tag2_name")).select().as_list()
    if request.json.get("tag2_name") == "":
        tag2_id = None
    elif len(t2) == 0:
        tag2_id = db.tags.insert(tag_name=request.json.get("tag2_name"), uses=1)
    # Otherwise increment its 'uses' field
    else:
        tag2_id = t2[0]["id"]
        tag2 = db.tags[tag2_id]
        db(db.tags.id == tag2_id).update(uses=tag2.uses + 1)

    # If tag3 doesn't exist in the db, insert it and set uses to 1
    t3 = db(db.tags.tag_name == request.json.get("tag3_name")).select().as_list()
    if request.json.get("tag3_name") == "":
        tag3_id = None
    elif len(t3) == 0:
        tag3_id = db.tags.insert(tag_name=request.json.get("tag3_name"), uses=1)
    # Otherwise increment its 'uses' field
    else:
        tag3_id = t3[0]["id"]
        tag3 = db.tags[tag3_id]
        db(db.tags.id == tag3_id).update(uses=tag3.uses + 1)

    # Using the ids of the tags, now insert the post into the db
    id = db.posts.insert(
        title=request.json.get("title"),
        body=request.json.get("body"),
        created_by=get_user_id(),
        tag1=tag1_id,
        tag2=tag2_id,
        tag3=tag3_id,
    )

    print("ID of the post created: ", id)
    return dict(id=id)