from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import signals
from django.dispatch import receiver

# Extends django.contrib.auth User
class Profile ( models.Model ):

	user = models.OneToOneField(
			settings.AUTH_USER_MODEL,
			on_delete=models.CASCADE,
			)
			
	avatar = models.ImageField(
			upload_to='avatars/',
			blank=True,
			)

	avatar_url = models.URLField(
			blank=True,
			)
	# if not set, use default avatar

	campus_name = models.CharField(
			max_length=100,
			blank=True,
			)

	display_name = models.CharField(
			max_length=100,
			blank=True,
			)

	kind = models.CharField(
			max_length=42,
			blank=True,
			)

	language = models.CharField(
			max_length=42,
			blank=True,
			)

	language_id = models.CharField(
			max_length=10,
			blank=True,
			)

	time_zone = models.CharField(
			max_length=84,
			blank=True,
			)

	def __str__ ( self ):
		return ( f'Profile of {self.user.username}' )

@receiver( signals.post_save, sender=User )
def create_profile__user ( sender, instance, created, **kwargs ):
	if created:
		Profile.objects.create( user=instance )

@receiver( signals.post_save, sender=User )
def save_profile__user ( sender, instance, update_fields, **kwargs ):
	instance.profile.save()

@receiver( signals.post_save, sender=Profile )
def create_profile__profile ( sender, instance, created, update_fields, **kwargs ):
	print( f"created: {created}" )
	print( f"update_fields: {update_fields}\n" )
	#update img; if url -> set avatar

@receiver( signals.post_save, sender=Profile )
def save_profile__profile ( sender, instance, update_fields, **kwargs ):
	return
