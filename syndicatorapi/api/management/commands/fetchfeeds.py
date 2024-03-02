from time import sleep

from django.core.management.base import BaseCommand, CommandError
from api.models import Feed


class Command(BaseCommand):

    def handle(self, *args, **options):
        while True:
            try:
                feed = Feed.refresh_next()
            except Exception as e:
                print(e)
                feed = None
            if feed:
                print(f"Refreshed {feed}")
            else:
                sleep(1)
