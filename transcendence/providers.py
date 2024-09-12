from urllib import parse
from urllib import request
from urllib import error

from django.conf import settings

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
			queries["redirect_uri"] = parse.quote( f"{settings.DOMAIN_URL}/oauth/callback/", '' )
			queries["scope"] = 'public'
			queries["response_type"] = 'code'
			return ( compose_url( endpoint, queries ) )
	return ( None )

def get_token ( provider: str, queries: dict = {} ) -> str:
	match provider:
		case "42":
			endpoint = f"{settings.API_42_ENDPOINT}/oauth/token"
			queries["grant_type"] = 'authorization_code'
			queries["client_id"] = settings.API_42_UID
			queries["client_secret"] = settings.API_42_SECRET
			queries["redirect_uri"] = parse.quote( f"{settings.DOMAIN_URL}/oauth/callback/", '' )
			url = compose_url( endpoint, queries )
			req = request.Request( url, parse.urlencode( {} ).encode( 'ascii' ) )
			try:
				resp = request.urlopen( req )
			except error.URLError as e:
				print( e )
				print( e.url )
				print( e.reason )
				print( e.headers )
			token = ""
			return ( token )
	return ( None )
