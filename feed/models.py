from django.db import models

class Message ( models.Model ):
	author = models.CharField( max_length=100 )
	text = models.CharField( max_length=200 )
	created_at = models.DateTimeField( auto_now_add=True )

	class Meta:
		db_table = "messages"
		verbose_name_plural = "Message"

	def __str__ ( self ):
		return ( self.text[:10] + "..." )
