from django import urls
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views import generic
from .forms import UpdateUserForm, UpdateProfileForm
from . import forms
from .providers import fortytwo
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


# https://django-advanced-training.readthedocs.io/en/latest/features/class-based-views/

class HomepageView ( generic.TemplateView ):
	template_name = "tr/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "tr/pages/home.html"
		return ( context )

class LoginView(auth_views.LoginView):
    redirect_authenticated_user = True
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/login.html"
        context["form"] = forms.LoginForm()
        context['provider_42_login'] = fortytwo.get_login_url(
            "42", {"state": self.request.COOKIES.get('csrftoken')}
        )
        return context

@login_required
def do_logout ( request ):
	auth.logout( request )
	messages.success( request, "proper logout" )
	return redirect( 'home' )

class LogoutView ( auth_views.LogoutView ):
	http_method_names = ["post", "get"]
	template_name = "tr/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "tr/pages/logout.html"
		return ( context )

	def get ( self, request, *args, **kwargs ):
		auth.logout( request )
		redirect_to = self.get_success_url()
		if redirect_to != request.get_full_path():
			return ( HttpResponseRedirect( redirect_to ) )
		return ( super().get( request, *args, **kwargs ) )

class SignupView(generic.CreateView):
    form_class = auth.forms.UserCreationForm
    success_url = urls.reverse_lazy('login')
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/signup.html"
        context["form"] = forms.SignupForm()
        return context

@login_required
def profile_dashboard ( request ):
	return ( render( request, 'tr/pages/base.html', {'page': 'tr/pages/profile.html'} ) )

#    --------------------------  code added by clara --------------------------------------- #

class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/profile.html"  # Make sure this path is correct
        context["user_form"] = UpdateUserForm(instance=self.request.user)
        context["profile_form"] = UpdateProfileForm(instance=self.request.user.profile)
        return context

    def post(self, request, *args, **kwargs):
        user_form = UpdateUserForm(request.POST, instance=request.user)
        profile_form = UpdateProfileForm(request.POST, request.FILES, instance=request.user.profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            # if profile_form.cleaned_data['avatar']:
            #     profile = request.user.profile
                # print("Uploaded Avatar File:", profile_form.cleaned_data['avatar'])
                # print(" New Avatar URL:", profile.avatar.url)
            messages.success(request, 'Your profile is updated successfully')
            return redirect('profile')

        context = self.get_context_data()
        context["user_form"] = user_form
        context["profile_form"] = profile_form
        return self.render_to_response(context)


#   ------------------------------- code added by clara --------------------------------------- #


# @login_required
# def profile(request):
#     if request.method == 'POST':
#         user_form = UpdateUserForm(request.POST, instance=request.user)  # Populates the form with current user data
#         profile_form = UpdateProfileForm(request.POST, request.FILES, instance=request.user.profile)

#         if user_form.is_valid() and profile_form.is_valid():
#             user_form.save()
#             profile_form.save()
#             messages.success(request, 'Your profile is updated successfully')
#             return redirect(to='users-profile')
#     else:
#         messages.success(request, 'Your profile is updated successfully')
#         print("G****************************************************ET method, initializing form with current user data")  # Debugging line
#         user_form = UpdateUserForm(instance=request.user)
#         profile_form = UpdateProfileForm(instance=request.user.profile)

#     return render(request, 'users/profile.html', {'user_form': user_form, 'profile_form': profile_form})	
# # ----------------------------------

@login_required
def profile_delete ( request ):
	user_pk = request.user.pk
	auth.logout( request )
	User = auth.get_user_model()
	User.objects.filter( pk=user_pk ).delete()
	messages.success( request, "account delete successfully" )
	return ( redirect( 'home' ) )

class TournamentView ( generic.TemplateView ):
	template_name = "tr/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "tr/pages/tournament.html"
		return ( context )

class PlayView ( generic.TemplateView ):
	template_name = "tr/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "tr/pages/tournament.html"
		return ( context )

class GameView ( generic.TemplateView ):
	template_name = "tr/pages/pong.html"
	
	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "tr/pages/pong.html"
		return ( context )

def double_play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "tr/pages/double_play.html",
    }
    return ( render( request, 'tr/base.html', context) )

def solo_play_view ( request ):

	context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "tr/pages/solo_play.html",
    }
	return ( render( request, 'tr/base.html', context ) )

def play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "tr/pages/play.html",
    }
    return ( render ( request, 'tr/base.html', context ) )

def pong_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "tr/pages/pong.html",
    }
    return ( render( request, 'tr/base.html', context ) )
