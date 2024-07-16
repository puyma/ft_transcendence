from django.http import HttpResponse
from django.views.generic.base import TemplateView
from django.shortcuts import render

class HomepageView ( TemplateView ):
	template_name = "home.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["title"] = "P4ngP2ong"
		context["lang"] = "en"
		return ( context )
