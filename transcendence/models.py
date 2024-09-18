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

	kind = models.CharField(
			max_length=42,
			blank=True,
			)

	avatar = models.ImageField(
			upload_to='avatars/',
			blank=True,
			)

	def __str__ ( self ):
		return ( f'Profile of {self.user.username}' )

@receiver( signals.post_save, sender=User )
def create_profile ( sender, instance, created, **kwargs ):
	if created:
		Profile.objects.create( user=instance )

@receiver( signals.post_save, sender=User )
def save_profile ( sender, instance, **kwargs ):
	instance.profile.save()
