# Generated by Django 5.0.2 on 2024-02-26 01:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_feed_key_feed_slug_item_key_item_slug_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="feed",
            name="url",
            field=models.CharField(max_length=400, null=True),
        ),
    ]
