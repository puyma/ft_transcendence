from urllib import parse
import requests

from django.conf import settings

# def get_token ( provider, code ):

def get_token ( code: str, state: str ) -> str:

	params = {
			"grant_type": "authorization_code",
			"client_id": settings.API_42_UID,
			"client_secret": settings.API_42_SECRET,
			"code": code,
			"redirect_uri": f"{settings.DOMAIN_URL}/oauth/callback/",
			"state": state,
			}

	endpoint = f"{settings.API_42_ENDPOINT}/oauth/token"
	req = requests.request( 'POST', endpoint, params=params )
	token = req.content
	return ( token )
