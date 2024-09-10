from django.contrib import admin
from .models import Profile

@admin.register( Profile )
class ProfileAdmin ( admin.ModelAdmin ):
	list_display = ['user', 'avatar']
	raw_id_fields = ['user']
