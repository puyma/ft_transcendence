from channels.generic.websocket import WebsocketConsumer
from channels.generic.websocket import JsonWebsocketConsumer
from django.template.loader import render_to_string

class EchoConsumer ( WebsocketConsumer ):

	def connect ( self ):
		self.accept()
		self.send( text_data="YOurre" )

	def disconnect ( self, close_code ):
		pass

	def receive ( self, text_data ):
		pass

class BMIConsumer ( JsonWebsocketConsumer ):
	
	def connect ( self ):
		self.accept()

	def disconnect ( self, close_code ):
		pass

	def receive_json ( self, data ):
		height = data['height'] / 100
		weight = data['weight']
		bmi = round( weight / ( height ** 2 ), 1 )
		self.send_json( content={
			"action": "BMI result",
			"html": render_to_string(
				"components/_bmi_result.html", { "height": height, "weight": weight, "bmi": bmi },
				),
			} )
