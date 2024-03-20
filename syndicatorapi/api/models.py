import random
from django.db import models, transaction
from django.utils import timezone
from autoslug import AutoSlugField
from . import feedreader

from time import sleep

MAX_ITEMS = 100
DEFAULT_TTL = 60 * 60
MIN_TTL = 60 * 5


def gen_key():
    return "".join(random.choices("abcdefghkmnpqrstuvwxyz23456789", k=8))


class Feed(models.Model):
    feed_url = models.CharField(max_length=400, unique=True)
    url = models.CharField(max_length=400, null=True)
    key = models.CharField(max_length=16, default=gen_key, unique=True)
    title = models.CharField(max_length=200)
    slug = AutoSlugField(populate_from="title", always_update=True)
    description = models.TextField(
        null=True,
    )
    image = models.CharField(max_length=400, null=True)
    language = models.CharField(max_length=20, null=True)
    last_build_date = models.DateTimeField(null=True)
    pub_date = models.DateTimeField(null=True)
    generator = models.CharField(max_length=200, null=True)
    ttl = models.IntegerField(null=True)
    next_refresh = models.DateTimeField(null=True)
    last_refresh = models.DateTimeField(null=True)

    def __str__(self):
        return self.title

    @property
    def path(self):
        return f"{self.key}/{self.slug}"

    def get_next_refresh(self):
        if self.ttl:
            return timezone.now() + timezone.timedelta(seconds=max(self.ttl, MIN_TTL))
        return timezone.now() + timezone.timedelta(seconds=DEFAULT_TTL)

    def refresh(self):
        if self.subscriptions.count() == 0:
            self.delete()
            return
        data = feedreader.get_and_parse_feed(self.feed_url)
        metadata = data["metadata"]
        self.title = metadata["title"]
        self.description = metadata["description"]
        self.image = metadata["image"]
        self.language = metadata["language"]
        self.last_build_date = metadata["lastBuildDate"]
        self.pub_date = metadata["pubDate"]
        self.generator = metadata["generator"]
        self.url = metadata["link"]
        self.ttl = int(metadata["ttl"]) if metadata["ttl"] else None
        self.next_refresh = self.get_next_refresh()
        self.last_refresh = timezone.now()
        self.save()
        for i, item in enumerate(data["items"]):
            try:
                Item.fetch(self, item)
            except Exception as e:
                print(e)
                sleep(2)
            if i > MAX_ITEMS:
                break

    @classmethod
    def get_or_create_from_metadata(cls, feed_url, metadata):
        feed, _ = cls.objects.get_or_create(
            feed_url=feed_url,
            defaults={
                "title": metadata["title"],
                "description": metadata["description"],
                "image": metadata["image"],
                "language": metadata["language"],
                "last_build_date": metadata["lastBuildDate"],
                "pub_date": metadata["pubDate"],
                "generator": metadata["generator"],
                "url": metadata["link"],
                "ttl": int(metadata["ttl"]) if metadata["ttl"] else None,
                "next_refresh": timezone.now(),
            },
        )
        return feed

    @classmethod
    def refresh_next(cls):
        with transaction.atomic():
            feed = cls.objects.filter(next_refresh__lte=timezone.now()).first()
            if feed:
                feed.next_refresh = feed.get_next_refresh()
                feed.save()
        if feed:
            feed.refresh()
            return feed


class Subscription(models.Model):
    feed = models.ForeignKey(
        Feed, related_name="subscriptions", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "user.User", related_name="subscriptions", on_delete=models.CASCADE
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("feed", "user")

    def __str__(self):
        return f"{self.user} subscribed to {self.feed}"


class Item(models.Model):
    feed = models.ForeignKey(Feed, related_name="items", on_delete=models.CASCADE)
    key = models.CharField(max_length=16, default=gen_key, unique=True)
    guid = models.CharField(max_length=400, null=True)
    title = models.CharField(max_length=200)
    slug = AutoSlugField(populate_from="title")
    link = models.CharField(max_length=400)
    description = models.TextField(null=True)
    image = models.TextField(null=True)
    pub_date = models.DateTimeField()
    next_refresh = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-pub_date"]

    def __str__(self):
        return self.title

    def get_next_refresh(self):
        if self.pub_date < timezone.now() - timezone.timedelta(days=30):
            return None
        return timezone.now() + timezone.timedelta(days=1)

    @property
    def display_title(self):
        if self.title.endswith(f" - {self.feed.title}") or self.title.endswith(
            f" | {self.feed.title}"
        ):
            return self.title[: -len(f" - {self.feed.title}")]
        return self.title

    @property
    def path(self):
        return f"{self.key}/{self.slug}"

    @property
    def full_path(self):
        return f"{self.feed.path}/{self.path}"

    @classmethod
    def fetch(cls, feed, item):
        if item.guid:
            obj = cls.objects.filter(feed=feed, guid=item.guid).first()
        if not obj:
            obj = cls.objects.filter(feed=feed, link=item["link"]).first()
        if (
            obj
            and (not obj.next_refresh or obj.next_refresh > timezone.now())
            and obj.link == item["link"]
        ):
            return obj
        head = feedreader.get_pagehead(item["link"])
        title = head.title or item.title
        description = head.description or item.description
        image = head.image or item.image
        pub_date = item["pubDate"]
        guid = item.guid
        next_refresh = timezone.now() + timezone.timedelta(days=1)
        if obj:
            next_refresh = obj.get_next_refresh()
        if guid:
            return cls.objects.update_or_create(
                feed=feed,
                guid=guid,
                defaults={
                    "title": title,
                    "link": item["link"],
                    "description": description,
                    "image": image,
                    "pub_date": pub_date,
                    "next_refresh": next_refresh,
                },
            )[0]
        else:
            return cls.objects.update_or_create(
                feed=feed,
                link=item["link"],
                defaults={
                    "title": title,
                    "description": description,
                    "image": image,
                    "pub_date": pub_date,
                    "next_refresh": next_refresh,
                },
            )[0]


class ItemClick(models.Model):
    item = models.ForeignKey(Item, related_name="clicks", on_delete=models.CASCADE)
    subscription = models.ForeignKey(
        Subscription, related_name="clicks", on_delete=models.CASCADE
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("item", "subscription")

    def __str__(self):
        return f"{self.subscription.user} clicked {self.item}"


class ItemFavorite(models.Model):
    item = models.ForeignKey(Item, related_name="favorites", on_delete=models.CASCADE)
    subscription = models.ForeignKey(
        Subscription, related_name="favorites", on_delete=models.CASCADE
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("item", "subscription")

    def __str__(self):
        return f"{self.subscription.user} favorited {self.item}"
