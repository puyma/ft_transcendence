import urllib

from django.conf import settings
from django.contrib.auth.backends import BaseBackend
from django.shortcuts import redirect

from . import oauth

# provider_definition
# wip

def do_oauth ( request ):
	
	code = request.GET.get( 'code' )
	state = request.COOKIES.get( 'csrftoken' )

	token = oauth.get_token ( code, state )
	print( f"token: {token}" )

	return ( redirect( 'profile' ) )

class AuthBackend42 ( BaseBackend ):
	"""
	Authenticates against api.intra.42.fr
	"""

	def authenticate ( self, request, code ):
		try:
			token = oauth.get_token( code )
		except ProviderException:
			return None

@staticmethod
def compose_url ( endpoint: str, queries: dict = {} ) -> str:
	url = f"{endpoint}?"
	for name, value in queries.items():
		if ( url[-1] != '?' ):
			url += '&'
		url += f"{name}={value}"
	return ( url )

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
