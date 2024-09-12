import urllib

from django.conf import settings

# def get_token ( provider, code ):

def get_token ( code: str ) -> str:

	params = {
			"grant_type": "authorization_code",
			"client_id": settings.API_42_UID,
			"client_secret": settings.API_42_SECRET,
			"code": code,
			"redirect_uri": urllib.parse.quote( f"{settings.DOMAIN_URL}/oauth/callback/", '' )
			#"state": "",
			}

	query = urllib.parse.urlencode( params )
	url = f"{settings.API_42_ENDPOINT}/oauth/token?{query}"
	print( f"url: {url}" )

	token = ""

	request = urllib.request.Request( url, data=None, method='POST' )
	try:
		response = urllib.request.urlopen( request )
	except urllib.error.HTTPError:
		pass

	return ( token )
