# Generated by Django 5.0.2 on 2024-03-01 19:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_feed_last_refresh_feed_next_refresh_feed_ttl"),
    ]

    operations = [
        migrations.AddField(
            model_name="item",
            name="guid",
            field=models.CharField(max_length=400, null=True),
        ),
    ]
