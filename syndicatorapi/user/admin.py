from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "is_staff", "joined_at")
    list_filter = ("is_active", "is_staff")
    search_fields = ("email",)
    fields = ("email", "is_active", "is_staff", "joined_at")
    ordering = ("id",)
