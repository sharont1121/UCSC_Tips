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
import uuid

from .settings import APP_FOLDER
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
from .gcs_url import gcs_url, GCS_API_ENDPOINT
import os

from nqgcs import NQGCS

url_signer = URLSigner(session)

BUCKET = "ucsc-tips-post-images"
GCS_KEY_PATH = os.path.join(APP_FOLDER, "private/ucsc-tips-350117-eb56ef891d43.json")


with open(GCS_KEY_PATH) as gcs_key_file:
    GCS_KEYS = json.load(gcs_key_file)

gcs = NQGCS(json_key_path=GCS_KEY_PATH)


def user_profile_url():
    return URL("profile", get_user_id())


@action("index")
@action.uses("index.html", db, auth)
def index():
    print("User:", get_user_email())
    return dict()


@action("feed")
@action.uses("feed.html", auth, url_signer)
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
        rate_url=URL("rate", signer=url_signer),
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


def get_posts(db, query, tags=None, user_id=-1, **kwargs):
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
    rating = db.rating.user.count()
    rated_condition = db.rating.user == user_id
    rated = rated_condition.case(1, 0).sum()
    res = db(query).select(
        db.posts.ALL,
        tag1.ALL,
        tag2.ALL,
        tag3.ALL,
        user.id,
        user.first_name,
        rating.with_alias("rating"),
        rated.with_alias("rated"),
        orderby=~rating,
        groupby=db.posts.id,
        **kwargs,
        left=[
            tag1.on(db.posts.tag1 == tag1.id),
            tag2.on(db.posts.tag2 == tag2.id),
            tag3.on(db.posts.tag3 == tag3.id),
            user.on(db.posts.created_by == user.id),
            db.rating.on(db.rating.post == db.posts.id),
        ],
    )
    return res


def search_posts(
    db, search_terms, tags=None, limitby=None, exclude=[], conditions=None, user_id=-1
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
    rating = db.rating.user.count()
    rated_condition = db.rating.user.equals(user_id)
    rated = rated_condition.case(1, 0).sum()
    relevent_terms = db(query).select(
        div,
        db.posts.ALL,
        tag1.ALL,
        tag2.ALL,
        tag3.ALL,
        user.id,
        user.first_name,
        rating.with_alias("rating"),
        rated.with_alias("rated"),
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
            db.rating.on(db.rating.post == db.posts.id),
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
    current_user_id = get_user_id()
    params = ParamParser(request.params, expected_param_types)

    min_post = params.min or 0
    max_post = params.max or (min_post + DEFAULT_POST_COUNT)
    assert max_post - min_post < 100
    data = []

    # get the post that equals the selected id
    tinyquery = db.posts.id == params.selectedid
    if params.userid:
        tinyquery = tinyquery & (db.posts.created_by == params.userid)
    post = get_posts(db, query=tinyquery, limitby=(0, 1), user_id=current_user_id)
    missing = False
    if post:
        data.extend(post)
    elif bool(params.selectedid):
        missing = True

    # get posts with title like search, or just the highest rated posts
    query = db.posts.id != params.selectedid
    if params.search:
        query = query & db.posts.title.ilike(f"%{params.search}%")

    if params.userid:
        query = query & (db.posts.created_by == params.userid)

    posts = get_posts(
        db,
        query=query,
        tags=params.tags,
        limitby=(min_post, max_post),
        user_id=current_user_id,
    )

    data.extend(posts)

    # get posts that match search well, only if there is a search, and
    # the number of perfect matches are less than the max_post - min_post.
    if params.search and (len(data) + min_post) < max_post:

        terms = [k for k in get_terms_from_str(params.search)]

        ids = [d["posts"]["id"] for d in data]

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
                user_id=current_user_id,
            )
        )
    return dict(data=data, selectedid=params.selectedid, missing=missing)


@action("map/<pid:int>")
@action.uses(db, "map.html", auth.user, url_signer)
def map(pid=-1):
    return dict(
        map_url=URL("map/" + str(pid)),
        map_load_url=URL("map_load", signer=url_signer),
        map_load_single_url=URL("map_load_single_url", signer=url_signer),
        pid=pid,
    )


@action("map_load")
@action.uses(url_signer.verify(), db)
def map_load():
    rows = db(db.posts).select().as_list()
    # print(rows[0])
    return dict(posts=rows,)


@action("map_load_single")
@action.uses(url_signer.verify(), db)
def map_load_single(post_id=None):
    assert post_id is not None
    p = db(db.posts.id == post_id).select().first()
    print(p)
    return dict(post=p)


@action("profile/<uid:int>")
@action.uses("profile.html", auth, db, url_signer)
def profile(uid=None):
    assert uid is not None
    #  assert(db(db.auth_user.id == uid).select().first() is not None), "There exists no User with this uid."
    if (
        db(db.auth_user.id == uid).select().first() is None
    ):  # There is no existing user with this uid
        person = False  # Consider making this redirect to another page instead
    else:  # This is a user that does exist
        person = (
            db(db.auth_user.id == uid)
            .select(
                db.auth_user.id,
                db.auth_user.first_name,
                db.auth_user.last_name,
                db.auth_user.email,
            )
            .first()
        )
    expected_param_types = {
        "selectedid": int,
        "search": str,
        "tags": JSON,
    }  # exludes string types
    params = ParamParser(request.params, expected_param_types)
    return dict(
        person=person,
        base_load_posts_url=URL("feed", "load"),
        rate_url=URL("rate", signer=url_signer),
        map_url=URL("map"),
        profile_url=URL("profile"),
        params=json.dumps(
            dict(userid=uid, **params.dict_of(["selectedid", "search", "tags"]),)
        ),
    )
    # If, for some reason globals().get('user') is not longer working in profile.html, use: auth.get_user())


@action("create_post")
@action.uses("create_post.html", url_signer, auth.user)
def create_post():
    return dict(
        add_tip_url=URL("add_tip", signer=url_signer),
        obtain_gcs_upload_url=URL("obtain_gcs_upload", signer=url_signer),
        upload_complete_url=URL("notify_post_image_upload", signer=url_signer),
        api_endpoint=GCS_API_ENDPOINT,
        map_url=URL("map"),
    )


@action("add_tip", method="POST")
@action.uses(url_signer.verify(), db)
def add_tip():

    # get the tags from the database
    tag_names = []
    for request_tag_name in ["tag1_name", "tag2_name", "tag3_name"]:
        t = request.json.get(request_tag_name).lower()
        if t:
            tag_names.append(t)
    tags_in_db = db(db.tags.tag_name.belongs(tag_names)).select(
        db.tags.id, db.tags.tag_name
    )
    tags_dict = {t.tag_name: t.id for t in tags_in_db}

    tag_ids = []
    for tn in tag_names:
        if tn in tags_dict:
            id = tags_dict[tn]
            tag_ids.append(id)
        else:
            new_id = db.tags.insert(tag_name=tn)
            tag_ids.append(new_id)
    db(db.tags.tag_name.belongs(tag_names)).update(uses=(db.tags.uses + 1))
    while len(tag_ids) < 3:
        tag_ids.append(None)
        
    id = db.posts.insert(
        title=request.json.get("title"),
        body=request.json.get("body"),
        created_by=get_user_id(),
        tag1=tag_ids[0],
        tag2=tag_ids[1],
        tag3=tag_ids[2],
        lat=request.json.get("lat"),
        lng=request.json.get("lng"),
    )

    print("ID of the post created: ", id)
    return dict(id=id)


# this code is from prof Luca De Alpharo
@action("obtain_gcs_upload", method="POST")
@action.uses(db, url_signer.verify())
def obtain_gcs():
    """Returns the URL to upload for GCS."""
    mimetype = request.json.get("mimetype", "")
    file_name = request.json.get("file_name")
    extension = os.path.splitext(file_name)[1]
    # Use + and not join for Windows, thanks Blayke Larue
    file_path = BUCKET + "/" + str(uuid.uuid1()) + extension
    # Marks that the path may be used to upload a file.
    upload_url = gcs_url(GCS_KEYS, file_path, verb="PUT", content_type=mimetype)
    return dict(signed_url=upload_url, file_path=file_path,)


@action("notify_post_image_upload", method="POST")
@action.uses(db, url_signer.verify())
def confirm_upload():
    post_id = request.json.get("post_id")
    image_url = request.json.get("image_url")
    print(post_id, image_url)
    db(db.posts.id == post_id).update(image_url=image_url)
    return dict()


@action("rate", method="POST")
@action.uses(db, url_signer.verify(), auth.user)
def rate():

    post_id = request.json.get("post_id")
    user_id = get_user_id()

    if not post_id or not user_id:
        return "error"

    if request.json.get("delete"):
        db((db.rating.post == post_id) & (db.rating.user == user_id)).delete()
    else:
        db.rating.update_or_insert(
            (db.rating.post == post_id) & (db.rating.user == user_id),
            post=post_id,
            user=user_id,
        )
        return "ok"
