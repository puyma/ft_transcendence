from django.shortcuts import render
from django.http import HttpResponse
from .models import User

def user_list ( request ):
	user_list = User.objects.all()
	# template = loader.get_template( "user/index.html" )
	context = {
			"user_list": user_list,
			}
	# return ( HttpResponse( template.render( context, request ) ) )
	return ( render( request, "users/index.html", context ) )
