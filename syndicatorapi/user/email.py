import email_normalize
from asgiref.sync import async_to_sync


async def normalize_email(email):
    normalizer = email_normalize.Normalizer()
    try:
        return (await normalizer.normalize(email)).normalized_address
    except ValueError:
        return email

normalize_email_sync = async_to_sync(normalize_email)