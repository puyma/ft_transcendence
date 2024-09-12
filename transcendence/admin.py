from django.contrib import admin

from . import models

@admin.register( models.Profile )
class ProfileAdmin ( admin.ModelAdmin ):
	list_display = ['user', 'avatar']
	raw_id_fields = ['user']
