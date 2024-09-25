import urllib
import requests
import json

from io import BytesIO
from PIL import Image

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from django.shortcuts import redirect

from . import oauth


class ProviderException ( BaseException ):
	pass
#pass ?

# every (almost, not common) method should be inside AuthBackendX

def do_provider_login ( request ):
	try:
		user = authenticate( request )
		if user is None:
			#use django messages
			return ( redirect( 'login' ) )
		login( request, user )
		return ( redirect( 'home' ) )
	except ProviderException:
		#use django messages
		return ( redirect( 'login' ) )
	return ( redirect( 'profile' ) )

class AuthBackend42 ( BaseBackend ):
	"""
	Authenticates against API_42.
	"""

	endpoint = settings.API_42_ENDPOINT

	def authenticate ( self, request ) -> User:
		csrf = request.COOKIES.get( 'csrftoken', None )
		# if csrf is None... abort
		state = request.GET.get( 'state', None )
		# if state is None... abort
		code = request.GET.get( 'code', None )
		token = oauth.get_token( code, state )
		if token is None:
			return ( None )
		me = self.queryMe( token )
		if me is None:
			# exception
			return ( None )
		username = me.get( 'login' )
		print( f"username: {username}" )
		try:
			user = User.objects.get( username=username )
		except User.DoesNotExist:
			user = User( username=username )
			user.email = me.get( 'email' )
			user.first_name = me.get( 'first_name' )
			user.last_name = me.get( 'last_name' )
			user.save()
			user.profile.avatar_url = me.get( 'image' ).get( 'link' )
			user.profile.display_name = me.get( 'displayname' )
			user.profile.kind = me.get( 'kind' )
			campus = me.get( 'campus' )[0]
			user.profile.campus_name = campus.get( 'name' )
			user.profile.time_zone = campus.get( 'time_zone' )
			language = campus.get( 'language' )
			user.profile.language_id = language.get( 'id' )
			user.profile.language = language.get( 'identifier' )
			user.profile.save()
			return ( user )
		return ( user )

	def user_can_authenticate ( self, user ):
		"""
		Reject users with is_active=False. Custom user models that don't have
		that attribute are allowed.
		"""
		return ( getattr( user, "is_active", True ) )

	# permissions for AnonymousUser

	def get_user ( self, user_id ):
		try:
			user = User._default_manager.get( pk=user_id )
		except User.DoesNotExist:
			return ( None )
		return user if self.user_can_authenticate( user ) else None

	def queryMe ( self, token: str = None ) -> dict:
		if token is None:
			return ( None )
		params = { "Authorization": f"Bearer {token}" }
		response = requests.request(
				'GET',
				f"{self.endpoint}/v2/me",
				headers=params
				)
		me = response.json()
		# check response if OK
		# else return None
		return ( me )

def compose_url ( endpoint: str, queries: dict = {} ) -> str:
	url = f"{endpoint}?"
	for name, value in queries.items():
		if ( url[-1] != '?' ):
			url += '&'
		url += f"{name}={value}"
	return ( url )

#make generic, move to oauth/__init__.py
#replace request, not needed
def get_login_url ( provider, queries: dict = {} ) -> str:
	match provider:
		case "42":
			endpoint = f"{settings.API_42_ENDPOINT}/oauth/authorize"
			queries["client_id"] = settings.API_42_UID
			queries["redirect_uri"] = urllib.parse.quote( f"{settings.DOMAIN_URL}/oauth/callback/", '' )
			queries["scope"] = 'public'
			queries["response_type"] = 'code'
			return ( compose_url( endpoint, queries ) )
	return ( None )
