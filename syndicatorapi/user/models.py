from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone

from .email import normalize_email_sync as normalize_email


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, normalized_email=None, **extra_fields):
        extra_fields = {"is_staff": False, "is_superuser": False, **extra_fields}
        if not email:
            raise ValueError("Users must have an email address")

        if not normalized_email:
            normalized_email = normalize_email(email)

        user = User(email=normalized_email, display_email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields = {**extra_fields, "is_staff": True, "is_superuser": True}

        user = self.create_user(email=email, password=password, **extra_fields)
        user.save()

        return user


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    display_email = models.EmailField()
    joined_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    @classmethod
    def user_exists(cls, email):
        return cls.objects.filter(email=normalize_email(email)).exists()
