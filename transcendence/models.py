from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import signals
from django.dispatch import receiver
from PIL import Image
from django.utils import timezone 
from django.core.exceptions import ValidationError
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.db.models import Sum
from django.db.models import Q


# Extends django.contrib.auth User
# class Profile ( models.Model ):

# 	user = models.OneToOneField(
# 			settings.AUTH_USER_MODEL,
# 			on_delete=models.CASCADE,
# 			)
			
# 	avatar = models.ImageField(
# 			upload_to='avatars/',
# 			blank=True,
# 			)

# 	avatar_url = models.URLField(
# 			blank=True,
# 			)
# 	# if not set, use default avatar

# 	campus_name = models.CharField(
# 			max_length=100,
# 			blank=True,
# 			)

# 	display_name = models.CharField(
# 			max_length=100,
# 			blank=True,
# 			)

# 	kind = models.CharField(
# 			max_length=42,
# 			blank=True,
# 			)

# 	language = models.CharField(
# 			max_length=42,
# 			blank=True,
# 			)

# 	language_id = models.CharField(
# 			max_length=10,
# 			blank=True,
# 			)

# 	time_zone = models.CharField(
# 			max_length=84,
# 			blank=True,
# 			)

# 	def __str__ ( self ):
# 		return ( f'Profile of {self.user.username}' )

#we have the profile class that is linked with the USER class (table) and to access to the first name, last name and email with
# property --- print(profile.first_name)  # This will return profile.user.first_name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(default='profile_images/default.jpg', upload_to='profile_images')
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(default="No bio available.")
    is_online = models.BooleanField(default=False)
    last_active = models.DateTimeField(null=True, blank=True)

    def get_friends(self):
        return Profile.objects.filter(
            Q(receiver__sender=self, receiver__status='accepted') |
            Q(sender__receiver=self, sender__status='accepted')
        )

    def set_online(self):
        self.is_online = True
        self.last_active = timezone.now()
        self.save()

    def set_offline(self):
        self.is_online = False
        self.save()
    
    def get_online_friends(self):
        return self.get_friends().filter(is_online=True)

    def get_friends_num(self):
        return self.get_friends().count()
    
    # STATS METHODS
    def wins(self):
        return self.user.won_matches.count()

    def losses(self):
        return self.user.lost_matches.count()
    
    def matches_played(self):
        return self.wins() + self.losses()

    def win_percentage(self):
        total_matches = self.wins() + self.losses()
        if total_matches == 0:
            return 0
        return (self.wins() / total_matches) * 100
    
    def total_win_points(self):
        return Match.objects.filter(winner_username=self.user).aggregate(Sum('winner_points'))['winner_points__sum'] or 0

    def total_loss_points(self):
        return Match.objects.filter(loser_username=self.user).aggregate(Sum('loser_points'))['loser_points__sum'] or 0

    def loss_percentage(self):
        total_matches = self.wins() + self.losses()
        if total_matches == 0:
            return 0
        return (self.losses() / total_matches) * 100

    def __str__(self):
        return self.user.username

    @property
    def first_name(self):
        return self.user.first_name

    @property
    def last_name(self):
        return self.user.last_name

    @property
    def email(self):
        return self.user.email
    
    @property
    def avatar_image(self):
        if self.avatar and self.avatar.name != 'profile_images/default.jpg':
            return self.avatar.url
        if self.avatar_url:
            return self.avatar_url
        return '/media/profile_images/default.jpg'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

STATUS_CHOICES = (
    ('send', 'Send'),
    ('accepted', 'Accepted'),
    ('removed', 'Removed'),
)

class Relationship(models.Model):
    sender=models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sender')
    receiver=models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='receiver')
    status=models.CharField(max_length=8, choices=STATUS_CHOICES)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
         return f"{self.sender}-{self.receiver}-{self.status}"

    def save(self, *args, **kwargs):
        if self.sender == self.receiver:
            raise ValidationError("You cannot add yourself as a friend.")
        super().save(*args, **kwargs)
    
    def remove_friend(self):
        self.status = 'removed'
        self.save()

@receiver( signals.post_save, sender=User )
def create_profile__user ( sender, instance, created, **kwargs ):
	if created:
		Profile.objects.create( user=instance )

@receiver( signals.post_save, sender=User )
def save_profile__user ( sender, instance, update_fields, **kwargs ):
	instance.profile.save()

@receiver(signals.post_save, sender=Relationship)
def post_save_add_to_friends(sender, instance, created, **kwargs):
    if created and instance.status == 'accepted':
        pass

@receiver(user_logged_in)
def set_user_online(sender, user, request, **kwargs):
    user.profile.set_online()

@receiver(user_logged_out)
def set_user_offline(sender, user, request, **kwargs):
    user.profile.set_offline()
    user.profile.last_active = timezone.now()
    user.profile.save()

@receiver( signals.post_save, sender=Profile )
def save_profile__profile ( sender, instance, update_fields, **kwargs ):
	return

class Match ( models.Model ):
    id = models.AutoField(primary_key=True)
    winner_username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='won_matches', null=True)
    loser_username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lost_matches', null=True)
    winner_points = models.IntegerField(default=0)
    loser_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
