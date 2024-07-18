from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.views.generic.base import View
from django.views.generic.base import TemplateView
from django.shortcuts import render

class HomepageView ( TemplateView ):
	template_name = "home.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["title"] = "P4ngP2ong"
		context["lang"] = "en"
		return ( context )

class LoginView ( View ):
	template_name = "components/form_login.html"

	def get ( self, request, *args, **kwargs ):
		return ( render( request, self.template_name, self.get_context_data() ) )

	def post ( self, request, *args, **kwargs ):
		return ( HttpResponseRedirect( "/success/" ) )

	def get_context_data ( self, **kwargs ):
		context = {}
		#context = super().get_context_data( **kwargs )
		context["action"] = "/login/"
		return ( context )
