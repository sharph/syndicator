import requests
from bs4 import BeautifulSoup
import json
from itertools import chain
import datetime
from pprint import pprint


def get_feed(url):
    response = requests.get(url)
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

    def __init__(self, soup):
        self.soup = soup

    def __getitem__(self, key):
        if key == "image":
            return self.soup.image.url.text if hasattr(self.soup, "image") else None
        return get_content(self.soup, key)

    @property
    def obj(self):
        return {field: self[field] for field in self.FIELDS if self[field] is not None}


class FeedItem:
    def __init__(self, item):
        self.item = item

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
            self.item.find("media:content")["url"]
            if self.item.find("media:content")
            else None
        )


class PageHead:
    def __init__(self, soup):
        self.head = soup.head

    def __getitem__(self, key):
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
        return self["og:image"]

    @property
    def rss(self):
        tag = self.head.find("link", type="application/rss+xml")
        if tag and tag.has_attr("href"):
            return tag["href"]

    def __repr__(self):
        return json.dumps(
            {
                "title": self.title,
                "description": self.description,
                "image": self.image,
            }
        )


def parse_feed(xml):
    soup = BeautifulSoup(xml, "xml")
    items = soup.find_all("item")
    return {
        "metadata": FeedMetadata(soup.channel),
        "items": [FeedItem(item) for item in items],
    }


def get_and_parse_feed(url):
    xml = get_feed(url)
    return parse_feed(xml)


def discover_feed(url) -> (str, str):
    response = requests.get(url)
    if response.headers.get("content-type", "").startswith("text/html"):
        soup = BeautifulSoup(response.text, "html.parser")
        head = PageHead(soup)
        if head.rss:
            feed_url = head.rss
            response = requests.get(head.rss)
        else:
            raise ValueError("No feed found in HTML")
    else:
        feed_url = url
    if (
        response.headers.get("content-type", "").startswith("text/xml")
        or response.headers.get("content-type", "").startswith("application/rss+xml")
        or response.headers.get("content-type", "").startswith("application/xml")
    ):
        return feed_url, FeedMetadata(BeautifulSoup(response.text, "xml"))
    else:
        print(response.headers.get("content-type", ""))
        raise ValueError("No feed found")


def get_pagehead(url):
    response = requests.get(url)
    return PageHead(BeautifulSoup(response.text, "html.parser"))


if __name__ == "__main__":
    print("--FEED--")
    pprint(get_and_parse_feed("https://flaminghydra.com/rss/"))
    print("--OPENGRAPH--")
    pprint(get_pagehead("https://flaminghydra.com/"))
