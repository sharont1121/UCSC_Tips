import pathlib
from random import choice, choices, randint, random, uniform

from .settings import APP_FOLDER

BOOK = []

santa_cruz_lat = [36.947100, 37.014780]
santa_cruz_lon = [-122.076839, -121.984772]


def generate_random_coord():
    lat = uniform(santa_cruz_lat[0], santa_cruz_lat[1])
    lon = uniform(santa_cruz_lon[0], santa_cruz_lon[1])
    # print(lat, lon)
    return lat, lon
    # pass


def generate_shelly_text(n):
    if not BOOK:
        print()
        with open(
            pathlib.Path(APP_FOLDER).joinpath("frankenstein.txt"), "r", encoding="utf-8"
        ) as book:
            full_text = book.read()
            for word in full_text.split():
                BOOK.append(word)
    return " ".join(choices(BOOK, k=n))


def generate_garbage_word(num_chars: int):
    LETTERS = [a for a in "abcdefghijklmnopqrstuvwxyz"]
    res = ""
    for _ in range(num_chars):
        res += choice(LETTERS)
    return res


def generate_garbage_text(num_words: int, max_chars=None):
    WORD_LEN_FREQ = [1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 7, 8, 9]
    res = ""
    for _ in range(num_words):
        res += generate_garbage_word(choice(WORD_LEN_FREQ))
        res += " "
    if max_chars and len(res) > max_chars:
        return res[0:max_chars]
    return res


# please pass in more than 3 tags
def pick_random_tags(tag_ids):
    post_tags = [None, None, None]
    assert len(tag_ids) > 3
    ntags = 0
    while ntags < len(post_tags):
        tag = choice(tag_ids)
        while tag in post_tags:
            tag = choice(tag_ids)
        post_tags[ntags] = tag
        ntags += 1
        if random() < 0.3:
            break

    return post_tags


def add_fake_tags(db, num):
    for _ in range(num):
        db.tags.update_or_insert(tag_name=generate_shelly_text(1))


def add_fake_data(db, num: int):
    if db(db.tags).count() < 3:
        add_fake_tags(db, num // 2)

    max_id = db().select(db.posts.id, orderby=~db.posts.id).first()
    if not max_id:
        max_id = 0
    else:
        max_id = max_id.id

    tag_ids = [x["id"] for x in db().select(db.tags.id).as_list()]
    users = db().select(db.auth_user.id).as_list()

    for i in range(max_id + 1, num + max_id + 1):
        tags = pick_random_tags(tag_ids)
        user = choice(users)
        coord = generate_random_coord()
        db.posts.insert(
            title=f"fake title {i}",
            body=generate_shelly_text(randint(0, 100)),
            created_by=user["id"],
            tag1=tags[0],
            tag2=tags[1],
            tag3=tags[2],
            lat=coord[0],
            lng=coord[1],
            rating=randint(1, 1000),
        )
    return


# 0<=h<360, 0<=s,v<=1.0
def hsv_to_rgb(h, s, v) -> str:
    C = v * s
    X = C * (1 - abs((h / 60) % 2 - 1))
    M = v - C

    def rotate(hue):
        if hue < 60:
            return (C, X, 0)
        if hue < 120:
            return (X, C, 0)
        if hue < 180:
            return (0, C, X)
        if hue < 240:
            return (0, X, C)
        if hue < 300:
            return (X, 0, C)
        return (C, 0, X)

    R, G, B = rotate(h)
    R, G, B = (int((R + M) * 255), int((G + M) * 255), int((B + M) * 255))
    return f"#{R:x}{G:x}{B:x}"


def int_to_color(id: int) -> str:
    return hsv_to_rgb((id * 4091) % 360, 0.8, 0.8)

