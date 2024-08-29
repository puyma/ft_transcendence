from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.views import generic
from .forms import LoginForm
from .forms import SignupForm


class HomepageView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/home.html"
		return ( context )

class LoginView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/login.html"
		context["form"] = LoginForm()
		return ( context )

class SignupView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/signup.html"
		context["form"] = SignupForm()
		return ( context )

#@login_required
class ProfileView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/profile.html"
		return ( context )

class TournamentView ( generic.TemplateView ):
	template_name = "app/pages/tournament.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/tournament.html"
		return ( context )

class PlayView ( generic.TemplateView ):
	template_name = "app/pages/tournament.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/tournament.html"
		return ( context )

class GameView ( generic.TemplateView ):
	template_name = "app/pages/pong.html"
	
	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/pong.html"
		return ( context )

##

def double_play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara"
    }
    return ( render( request, 'app/pages/double_play.html', context) )

def solo_play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara"
    }
    return ( render( request, 'app/pages/solo_play.html', context ) )

def play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara"
    }
    return render ( request, 'app/pages/play.html', context )

def pong_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara"
    }
    return ( render( request, 'app/pages/pong.html', context ) )
