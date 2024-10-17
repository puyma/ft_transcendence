from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import signals
from django.dispatch import receiver
from PIL import Image

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
    bio = models.TextField()

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
    
    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs)

        # Only process if the avatar is not using the default path
        # if self.avatar and self.avatar.name != 'profile_images/default.jpg':
        #     img = Image.open(self.avatar.path)
        #     if img.height > 100 or img.width > 100:
        #         new_img = (100, 100)
        #         img.thumbnail(new_img)
        #         img.save(self.avatar.path)

@receiver( signals.post_save, sender=User )
def create_profile__user ( sender, instance, created, **kwargs ):
	if created:
		Profile.objects.create( user=instance )

@receiver( signals.post_save, sender=User )
def save_profile__user ( sender, instance, update_fields, **kwargs ):
	instance.profile.save()


## fins aqui entenc be 
# @receiver( signals.post_save, sender=Profile )
# def create_profile__profile ( sender, instance, created, update_fields, **kwargs ):
# 	print( f"created: {created}" )
# 	print( f"update_fields: {update_fields}\n" )
# 	#update img; if url -> set avatar

# @receiver( signals.post_save, sender=Profile )
# def save_profile__profile ( sender, instance, update_fields, **kwargs ):
# 	return
