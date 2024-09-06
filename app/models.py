from django.db import models
from django.conf import settings

# Extends django.contrib.auth User
class Profile ( models.Model ):
	user = models.OneToOneField(
			settings.AUTH_USER_MODEL,
			on_delete=models.CASCADE
			)

	avatar = models.ImageField(
			upload_to='avatars/',
			blank=True
			)

	def __str__ ( self ):
		return ( f'Profile of {self.user.username}' )
