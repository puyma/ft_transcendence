from channels.generic.websocket import JsonWebsocketConsumer

from . import actions

class RouterConsumer ( JsonWebsocketConsumer ):

	def connect ( self ):
		self.accept()

	def disconnect ( self, close_code ):
		pass

	def receive_json ( self, data_received ):
		print( f"data_received {data_received}" )
		data = data_received['data']
		match data_received['action']:
			case 'change_page':
				actions.send_page( self, data['page'] )

	def send_html ( self, event ):
		data = {
				'selector': event['selector'],
				'html': event['html'],
				'append': 'append' in event and event['append'],
				'url': event['url'] if 'url' in event else '',
				}
		self.send_json( data )

