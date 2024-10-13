from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone 

class Match(models.Model):
    id = models.AutoField(primary_key=True)
    winner_username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='won_matches', null=True)
    loser_username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lost_matches', null=True)
    winner_points = models.IntegerField(default=0)
    loser_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Match: {self.winner_username} vs {self.loser_username} on {self.created_at}"