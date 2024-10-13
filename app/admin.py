from django.contrib import admin
from .models import Match

class MatchAdmin(admin.ModelAdmin):
    list_display = ('winner_username', 'loser_username', 'winner_points', 'loser_points')
    fields = ('winner_username', 'loser_username', 'winner_points', 'loser_points')

admin.site.register(Match, MatchAdmin)
