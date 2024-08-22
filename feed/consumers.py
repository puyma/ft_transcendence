from channels.generic.websocket import JsonWebsocketConsumer
from django.template.loader import render_to_string
from .models import Message
from asgiref.sync import async_to_sync
import math

class FeedConsumer ( JsonWebsocketConsumer ):

	room_name = 'broadcast'
	max_messages_per_page = 1

	def connect ( self ):
		self.accept()
		async_to_sync( self.channel_layer.group_add )( self.room_name, self.channel_name )
		self.send_list_messages()

	def disconnect ( self, close_code ):
		async_to_sync( self.channel_layer.group_discard )( self.room_name, self.channel_name )
	
	def receive_json ( self, data_received ):
		print( data_received )
		data = data_received['data']
		match data_received['action']:
			case 'add message':
				Message.objects.create( author=data['author'], text=data['text'] )
				self.send_list_messages()
			case 'list messages':
				self.send_list_messages( data['page'] )

	def send_html ( self, event ):
		data = { 'selector': event['selector'], 'html': event['html'] }
		self.send_json( data )

	def send_list_messages ( self, page=1 ):
		start_pager = self.max_messages_per_page * ( page - 1 )
		end_pager = start_pager + self.max_messages_per_page

		messages = Message.objects.order_by( '-created_at' )
		messages_page = messages[start_pager:end_pager]
		total_pages = math.ceil( messages.count() / self.max_messages_per_page )
		async_to_sync( self.channel_layer.group_send )( self.room_name, {
			'type': 'send.html',
			'selector': '#messages__list',
			'html': render_to_string( 'feed/components/_list-messages.html',
				{ 'messages': messages_page, 'page': page, 'total_pages': total_pages } ),
			} )
