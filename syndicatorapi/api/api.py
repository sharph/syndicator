from ninja import NinjaAPI, Schema
from ninja.security import django_auth
from ninja.errors import HttpError, ValidationError as NinjaValidationError

from .models import Feed, Item, Subscription, ItemClick, ItemFavorite
from .feedreader import discover_feed

from user.models import User

from typing import Optional

from datetime import datetime

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.password_validation import validate_password, ValidationError
from django.shortcuts import get_object_or_404
from django.core.validators import validate_email

api = NinjaAPI(title="syndicator", auth=django_auth, csrf=True)

# auth


@api.exception_handler(NinjaValidationError)
def ninja_validation_error(request, exc):
    return api.create_response(request, {"errors": exc.errors}, status=400)


@api.exception_handler(ValidationError)
def validation_error(request, exc):
    return api.create_response(request, {"errors": exc.messages}, status=400)


@api.exception_handler(ValueError)
def value_error(request, exc):
    return api.create_response(request, {"error": str(exc)}, status=400)


class UserIn(Schema):
    email: str
    password: str


class ChangePasswordIn(Schema):
    old_password: str
    new_password: str


class UserOut(Schema):
    email: str


@api.post("/auth/register", auth=None, response=UserOut)
def register(request, data: UserIn):
    validate_email(data.email)
    if User.user_exists(data.email):
        raise ValueError("User already exists")
    validate_password(data.password)
    user = User.objects.create_user(email=data.email, password=data.password)
    auth_login(request, user)
    return user


@api.post("/auth/login", auth=None, response=UserOut)
def login(request, data: UserIn):
    user = authenticate(request, username=data.email, password=data.password)
    if user is not None:
        auth_login(request, user)
        return user
    else:
        raise ValueError("Invalid username or password")


@api.post("/auth/change_password", response=UserOut)
def change_password(request, data: ChangePasswordIn):
    if not request.user.check_password(data.old_password):
        raise ValueError("Invalid password")
    validate_password(data.new_password)
    request.user.set_password(data.new_password)
    request.user.save()
    auth_login(request, request.user)
    return request.user


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
    clicked: Optional[bool]
    favorited: Optional[datetime | None]


def add_clicked(request, items):
    if request.user.is_authenticated:
        pks = [item.pk for item in items]
        clicks = [
            click.item.pk
            for click in ItemClick.objects.filter(
                subscription__user=request.user, item__pk__in=pks
            )
        ]
        for item in items:
            item.clicked = item.pk in clicks
    return items


def add_favorited(request, items):
    if request.user.is_authenticated:
        pks = [item.pk for item in items]
        favorited = {
            favorite.item.pk: favorite
            for favorite in ItemFavorite.objects.filter(
                subscription__user=request.user, item__pk__in=pks
            )
        }
        for item in items:
            if item.pk in favorited:
                item.favorited = favorited[item.pk].created
            else:
                item.favorited = None
    return items


@api.get("/articles", response=list[ItemSchema], tags=["articles"])
def articles(request, before: datetime | None = None):
    qs = Item.objects.filter(feed__subscriptions__user=request.user)
    if before:
        qs = qs.filter(pub_date__lt=before)
    qs = qs.order_by("-pub_date").select_related("feed")[:20]
    items = list(qs)
    return add_favorited(request, add_clicked(request, items))


@api.get("/favorites", response=list[ItemSchema], tags=["favorites"])
def favorites(request, before: datetime | None = None):
    qs = ItemFavorite.objects.filter(subscription__user=request.user)
    if before:
        qs = qs.filter(created__lt=before)
    qs = qs.order_by("-created").select_related("item", "item__feed")[:20]
    items = [favorite.item for favorite in qs]
    return add_favorited(request, add_clicked(request, items))


@api.get("/subscriptions/", response=list[FeedSchema], tags=["subscriptions"])
def subscritions(request):
    subscritions = (
        Subscription.objects.filter(user=request.user)
        .order_by("-created")
        .select_related("feed")
    )
    return [subscription.feed for subscription in subscritions]


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


@api.post("/clicks/{feed_key}/{feed_slug}/{item_key}/{item_slug}", tags=["clicks"])
def click(request, feed_key: str, feed_slug: str, item_key: str, item_slug: str):
    item = get_object_or_404(
        Item.objects.filter(
            feed__key=feed_key, feed__slug=feed_slug, key=item_key, slug=item_slug
        )
    )
    subscription = get_object_or_404(
        Subscription.objects.filter(user=request.user, feed=item.feed)
    )
    ItemClick.objects.get_or_create(subscription=subscription, item=item)
    return {"success": True}


@api.delete("/clicks/{feed_key}/{feed_slug}/{item_key}/{item_slug}", tags=["clicks"])
def unclick(request, feed_key: str, feed_slug: str, item_key: str, item_slug: str):
    item = get_object_or_404(
        Item.objects.filter(
            feed__key=feed_key, feed__slug=feed_slug, key=item_key, slug=item_slug
        )
    )
    subscription = get_object_or_404(
        Subscription.objects.filter(user=request.user, feed=item.feed)
    )
    get_object_or_404(
        ItemClick.objects.filter(subscription=subscription, item=item)
    ).delete()
    return {"success": True}


@api.post(
    "/favorites/{feed_key}/{feed_slug}/{item_key}/{item_slug}", tags=["favorites"]
)
def favorite(request, feed_key: str, feed_slug: str, item_key: str, item_slug: str):
    item = get_object_or_404(
        Item.objects.filter(
            feed__key=feed_key, feed__slug=feed_slug, key=item_key, slug=item_slug
        )
    )
    subscription = get_object_or_404(
        Subscription.objects.filter(user=request.user, feed=item.feed)
    )
    ItemFavorite.objects.get_or_create(subscription=subscription, item=item)
    return {"success": True}


@api.delete(
    "/favorites/{feed_key}/{feed_slug}/{item_key}/{item_slug}", tags=["favorites"]
)
def unfavorite(request, feed_key: str, feed_slug: str, item_key: str, item_slug: str):
    item = get_object_or_404(
        Item.objects.filter(
            feed__key=feed_key, feed__slug=feed_slug, key=item_key, slug=item_slug
        )
    )
    subscription = get_object_or_404(
        Subscription.objects.filter(user=request.user, feed=item.feed)
    )
    get_object_or_404(
        ItemFavorite.objects.filter(subscription=subscription, item=item)
    ).delete()
    return {"success": True}


@api.post("/csrf", tags=["csrf"], auth=None)
@ensure_csrf_cookie
@csrf_exempt
def csrf(request):
    return api.create_response(request, {"success": True}, status=200)
