from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Profile
from .models import Match
from .models import Relationship
#@admin.register( Profile )
#class ProfileAdmin ( admin.ModelAdmin ):
#	list_display = ['user', 'avatar']
#	raw_id_fields = ['user']

class ProfileInline ( admin.StackedInline ):
	can_delete = False
	fields = ['kind', 'avatar']
	model = Profile
	verbose_name = 'profile'
	verbose_name_plural = 'profiles'

class UserAdmin ( BaseUserAdmin ):
	inline = [
			ProfileInline
			]

class MatchAdmin(admin.ModelAdmin):
    list_display = ('winner_username', 'loser_username', 'winner_points', 'loser_points')
    fields = ('winner_username', 'loser_username', 'winner_points', 'loser_points')

admin.site.unregister( User )
admin.site.register( User, UserAdmin )
admin.site.register( Profile )
admin.site.register( Relationship )
admin.site.register( Match, MatchAdmin )
