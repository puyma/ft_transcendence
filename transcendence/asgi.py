import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

os.environ.setdefault( 'DJANGO_SETTINGS_MODULE', 'transcendence.settings' )

from . import consumers

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter([
			re_path( r"^ws/router/$", consumers.RouterConsumer.as_asgi() ),
			])
		),
	})
