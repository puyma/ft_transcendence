from channels.generic.websocket import JsonWebsocketConsumer
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
from channels.auth import login
from channels.auth import logout
from django.contrib.auth.models import User
from .models import Client
from .models import Room
from .models import Message

class ChatConsumer ( JsonWebsocketConsumer ):

	Client.objects.all().delete()

	def connect ( self ):
		self.accept()
		user = User.objects.exclude( id__in=Client.objects.all().values( "user" ) ).order_by( "?" ).first()
		async_to_sync( login )( self.scope, user )
		self.scope["session"].save()
		self.send_html( { "selector": "#logged-user", "html": self.scope['user'].username } )
		Client.objects.create( user=user, channel=self.channel_name )
		self.add_client_to_room( "hi", True )
		self.list_room_messages()

	def disconnect ( self, close_code ):
		self.remove_client_from_current_room()
		Client.objects.get( channel=self.channel_name ).delete()
		logout( self.scope, self.scope['user'] )

	def receive_json ( self, data_received ):
		print( data_received )
		data = data_received["data"]
		match data_received["action"]:

			case "change group":
				if data["isGroup"]:
					self.add_client_to_room( data["groupName"], data["isGroup"] )
				else:
					user_target = User.objects.filter( username=data['groupName'] ).first()
					room = Room.objects.filter( users_subscribed__in=[self.scope["user"]], 
							is_group=False ).intersection( Room.objects.filter( users_subscribed__in=[user_target], is_group=False ) ).first()
					if room and user_target and room.users_subscribed.count() == 2:
						self.add_client_to_room( room.name )
					else:
						room = Room.objects.filter( users_subscribed__in=[ user_target, ], is_group=False ).last()
						if room and room.users_subscribed.count() == 1:
							self.add_client_to_room( room.name )
						else:
							self.add_client_to_room()
				self.send_room_name()

			case "new message":
				self.save_message( data["message"] )

		self.list_room_messages()

	def send_html ( self, event ):
		data = { "selector": event["selector"], "html": event["html"] }
		self.send_json( data )

	def list_room_messages ( self ):
		room_name = self.get_name_room_active()
		room = Room.objects.get( name=room_name )
		messages = Message.objects.filter( room=room ).order_by( "create_at" )
		async_to_sync( self.channel_layer.group_send )( room_name, {
			"type": "send.html",
			"selector": "#messages-list",
			"html": render_to_string( "chat/components/_list-messages.html", { "messages": messages } ),
			} )

	def send_room_name ( self ):
		room_name = self.get_name_room_active()
		room = Room.objects.get( name=room_name )
		data = { "selector": "#group-name", "html": ( "#" if room.is_group else "" ) + room_name }
		self.send_json( data )

	def save_message ( self, text ):
		room = Room.objects.get( name=self.get_name_room_active() )
		Message.objects.create( user=self.scope["user"], room=room, text=text )

	def add_client_to_room ( self, room_name=None, is_group=False ):
		client = Client.objects.get( user=self.scope["user"] )
		self.remove_client_from_current_room()
		room, created = Room.objects.get_or_create( name=room_name, is_group=is_group )
		if not room.name:
			room.name = f"private_{room.id}"
			room.save()
		room.clients_active.add( client )
		room.users_subscribed.add( client.user )
		room.save()
		async_to_sync( self.channel_layer.group_add )( room.name, self.channel_name )
		self.send_room_name()

	def get_name_room_active ( self ):
		room = Room.objects.filter( clients_active__user_id=self.scope["user"].id ).first()
		return ( room.name )

	def remove_client_from_current_room ( self ):
		client = Client.objects.get( user=self.scope["user"] )
		rooms = Room.objects.filter( clients_active__in=[client] )
		for room in rooms:
			async_to_sync( self.channel_layer.group_discard )( room.name, self.channel_name )
			room.clients_active.remove( client )
			room.save()
