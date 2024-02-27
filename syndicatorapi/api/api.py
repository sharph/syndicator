from ninja import NinjaAPI, Schema
from ninja.security import django_auth

from .models import Feed, Item, Subscription
from .feedreader import discover_feed

from typing import Optional

from datetime import datetime

from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.password_validation import validate_password, ValidationError

api = NinjaAPI(title="syndicator", auth=django_auth, csrf=True)

# auth


class UserIn(Schema):
    email: str
    password: str


class UserOut(Schema):
    email: str


@api.post("/auth/login", auth=None, response=UserOut)
def login(request, data: UserIn):
    user = authenticate(request, username=data.email, password=data.password)
    if user is not None:
        auth_login(request, user)
        return user
    else:
        raise ValueError("Invalid username or password")


@api.post("/auth/logout", auth=None)
def logout(request):
    auth_logout(request)
    return {"success": True}

@api.get("/auth/user", response=UserOut)
def get_user(request):
    return request.user


# feeds


class FeedSchema(Schema):
    title: str
    description: str | None
    image: str | None
    language: str | None
    last_build_date: datetime | None
    pub_date: datetime | None
    generator: str | None
    url: str | None
    feed_url: str
    path: str


class FeedIn(Schema):
    url: str


class ItemSchema(Schema):
    title: str
    description: str | None
    link: str
    image: str | None
    pub_date: datetime
    feed: FeedSchema
    path: str


@api.get("/articles", response=list[ItemSchema], tags=["articles"])
def articles(request):
    return Item.objects.filter(
        feed__subscriptions__user=request.user
    ).order_by(
        "-pub_date"
    )[:1000]


@api.get("/subscriptions/", response=list[FeedSchema], tags=["subscriptions"])
def subscritions(request):
    return Feed.objects.filter(subscriptions__user=request.user)


@api.post("/subscriptions/", response=FeedSchema, tags=["subscriptions"])
def add_subscription(request, data: FeedIn):
    feed_url, metadata = discover_feed(data.url)
    feed = Feed.get_or_create_from_metadata(feed_url, metadata)
    Subscription.objects.get_or_create(feed=feed, user=request.user)
    return feed


@api.delete("/subscriptions/{key}/{slug}", tags=["subscriptions"])
def delete_subscription(request, key: str, slug: str):
    Subscription.objects.filter(
        user=request.user, feed__key=key, feed__slug=slug
    ).delete()
    return {"success": True}


@api.post("/csrf", tags=["csrf"])
@csrf_exempt
@ensure_csrf_cookie
def csrf(request):
    return {"message": "ok"}
