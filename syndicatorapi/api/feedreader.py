import json
import datetime
from itertools import chain
from pprint import pprint

from urllib.parse import urljoin

from django.conf import settings

import requests

from bs4 import BeautifulSoup

VERSION = settings.GIT_HASH[:7] if settings.GIT_HASH != "unknown" else "dev"


USER_AGENT = (
    f"Mozilla/5.0 (compatible; syndicator/{VERSION}; +mailto:ua@syndicator.garden)"
)
TIMEOUT = 5


def get_feed(url):
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
    return response.text


def get_content(item, tag):
    content = item.find(tag)
    if content:
        if tag == "pubDate" or tag == "lastBuildDate":
            try:
                return datetime.datetime.strptime(
                    content.text, "%a, %d %b %Y %H:%M:%S %Z"
                )
            except ValueError:
                return datetime.datetime.strptime(
                    content.text, "%a, %d %b %Y %H:%M:%S %z"
                )
        return content.text
    return None


class FeedMetadata:
    FIELDS = [
        "title",
        "description",
        "link",
        "language",
        "lastBuildDate",
        "pubDate",
        "generator",
        "image",
    ]

    def __init__(self, soup, url):
        self.soup = soup
        self.url = url

    def __getitem__(self, key):
        if key == "image":
            return (
                urljoin(self.url, self.soup.image.url.text)
                if hasattr(self.soup, "image") and self.soup.image
                else None
            )
        if key == "link":
            return (
                urljoin(self.url, get_content(self.soup, "link"))
                if get_content(self.soup, "link")
                else None
            )
        return get_content(self.soup, key)

    @property
    def obj(self):
        return {field: self[field] for field in self.FIELDS if self[field] is not None}


class FeedItem:
    def __init__(self, item, url):
        self.item = item
        self.url = url

    def __getitem__(self, key):
        return get_content(self.item, key)

    @property
    def title(self):
        return self["title"]

    @property
    def description(self):
        return self["description"]

    @property
    def image(self):
        return (
            urljoin(self.url, self.item.find("media:content")["url"])
            if self.item.find("media:content")
            else None
        )

    @property
    def guid(self):
        guid = self["guid"]
        if guid and len(guid) > 5:
            return guid


class PageHead:
    def __init__(self, soup, url):
        self.head = soup.head
        self.url = url

    def __getitem__(self, key):
        if not self.head:
            return None
        return (
            self.head.find("meta", property=key)["content"]
            if self.head.find("meta", property=key)
            else None
        )

    @property
    def title(self):
        return self["og:title"]

    @property
    def description(self):
        return self["og:description"]

    @property
    def image(self):
        if not self["og:image"]:
            print("image missing")
            print(self.head)
        return urljoin(self.url, self["og:image"])

    @property
    def rss(self):
        tag = self.head.find("link", type="application/rss+xml")
        if tag and tag.has_attr("href"):
            return urljoin(self.url, tag["href"])

    def __repr__(self):
        return json.dumps(
            {
                "title": self.title,
                "description": self.description,
                "image": self.image,
            }
        )


def parse_feed(xml, url):
    soup = BeautifulSoup(xml, "xml")
    items = soup.find_all("item")
    return {
        "metadata": FeedMetadata(soup.channel, url),
        "items": [FeedItem(item, url) for item in items],
    }


def get_and_parse_feed(url):
    xml = get_feed(url)
    return parse_feed(xml, url)


def discover_feed(url) -> (str, str):
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
    if response.headers.get("content-type", "").startswith("text/html"):
        soup = BeautifulSoup(response.text, "html.parser")
        head = PageHead(soup, url)
        if head.rss:
            feed_url = head.rss
            print(feed_url)
            response = requests.get(
                feed_url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT
            )
        else:
            raise ValueError("No feed found in HTML")
    else:
        feed_url = url
    if (
        response.headers.get("content-type", "").startswith("text/xml")
        or response.headers.get("content-type", "").startswith("application/rss+xml")
        or response.headers.get("content-type", "").startswith("application/xml")
    ):
        return feed_url, FeedMetadata(BeautifulSoup(response.text, "xml"), feed_url)
    else:
        print(response.headers.get("content-type", ""))
        raise ValueError("No feed found")


def get_pagehead(url):
    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
        return PageHead(BeautifulSoup(response.text, "html.parser"), url)
    except Exception as e:
        print(e)
        return PageHead(None, url)


if __name__ == "__main__":
    print("--FEED--")
    pprint(get_and_parse_feed("https://flaminghydra.com/rss/"))
    print("--OPENGRAPH--")
    pprint(get_pagehead("https://flaminghydra.com/"))
