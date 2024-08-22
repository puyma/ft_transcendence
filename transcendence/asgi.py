# ASGI config for transcendence project.

import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter
from django.urls import re_path
from users.consumers import EchoConsumer
from users.consumers import BMIConsumer
from feed.consumers import FeedConsumer

os.environ.setdefault( 'DJANGO_SETTINGS_MODULE', 'transcendence.settings' )

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter([
			re_path( r"^ws/echo/$", EchoConsumer.as_asgi() ),
			re_path( r"^ws/bmi/$", BMIConsumer.as_asgi() ),
			re_path( r"^ws/feed/$", FeedConsumer.as_asgi() ),
			])
		),
	})
