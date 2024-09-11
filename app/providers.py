import os
from urllib.parse import quote
from django.conf import settings

@staticmethod
def compose_url ( endpoint: str, queries: dict ):
	url = f"{endpoint}?"
	for name, value in queries.items():
		if ( url[-1] != '?' ):
			url += '&'
		url += f"{name}={value}"
	return ( url )

def get_login_url ( request, provider ):
	match provider:
		case "42":
			endpoint = f"{os.environ.get( 'API_42_ENDPOINT' )}/oauth/authorize"
			queries = {
					"client_id": os.environ.get( 'API_42_UID' ),
					"redirect_uri": quote( f"{settings.DOMAIN_URL}/oauth/callback/", '' ),
					"scope": 'public',
					"response_type": 'code'
					}
			return ( compose_url ( endpoint, queries ) )
	return ( None )
