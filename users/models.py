from django.db import models

# A model’s database table name is constructed by joining the model’s “app label”
# to the model’s class name, with an underscore between them.

class Avatar ( models.Model ):
	id = models.BigAutoField( primary_key=True )
	img = models.ImageField()

class User ( models.Model ):
	class Meta:
		db_table = 'users'
		db_table_comment = "User information"

	# for sake of clarity, though it is implicit if has not been set.
	# BigAutoField is an unsigned 64-bit integer, starts from 1.
	id = models.BigAutoField( primary_key=True )

	# usernames should have a fixed length?
	username = models.CharField( max_length=64 )

	# maybe we can have a class Avatar that associates a user's identifier
	# with it's location wherever it should be found.
	## consider FileField, FilePathField, mount directory of avatars somewhere
	## consider ImageField, limit img size.
	#old: avatar_link = models.URLField()
	avatar = models.ForeignKey( 'Avatar', on_delete=models.CASCADE )

	created_at = models.DateTimeField()
