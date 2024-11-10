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
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from .models import Profile, Relationship
from .models import Match


# https://django-advanced-training.readthedocs.io/en/latest/features/class-based-views/

class HomepageView ( generic.TemplateView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/home.html'
		context['active_nav'] = 'home'
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
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = "tr/pages/logout.html"
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

class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/profile.html"
        context["user_form"] = UpdateUserForm(instance=self.request.user)
        context["profile_form"] = UpdateProfileForm(instance=self.request.user.profile)
        return context

    def post(self, request, *args, **kwargs):
        user_form = UpdateUserForm(request.POST, instance=request.user)
        profile_form = UpdateProfileForm(request.POST, request.FILES, instance=request.user.profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            # if profile_form.cleaned_data['avatar']: keep this lines till is all good he avatar tests !!
            #     profile = request.user.profile
                # print("Uploaded Avatar File:", profile_form.cleaned_data['avatar'])
                # print(" New Avatar URL:", profile.avatar.url)
            messages.success(request, 'Your profile is updated successfully')
            return redirect('profile')

        context = self.get_context_data()
        context["user_form"] = user_form
        context["profile_form"] = profile_form
        return self.render_to_response(context)


@login_required
def profile_delete ( request ):
	user_pk = request.user.pk
	auth.logout( request )
	User = auth.get_user_model()
	User.objects.filter( pk=user_pk ).delete()
	messages.success( request, "account delete successfully" )
	return ( redirect( 'home' ) )

class PasswordChangeView ( auth_views.PasswordChangeView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_change.html'
		return ( context )

class PasswordChangeDoneView ( auth_views.PasswordChangeDoneView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_change_done.html'
		return ( context )

class PasswordResetView ( auth_views.PasswordResetView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_reset.html'
		return ( context )

class PasswordResetDoneView ( auth_views.PasswordResetDoneView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_reset_done.html'
		return ( context )

class PasswordResetConfirmView ( auth_views.PasswordResetConfirmView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_reset_confirm.html'
		return ( context )

class PasswordResetCompleteView ( auth_views.PasswordResetCompleteView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/password_reset_complete.html'
		return ( context )

## LEGACY CODE TOURNAMENT---- ##
class TournamentView(generic.TemplateView):
    template_name = 'tr/base.html'
    
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants', None)
        
        # Render the page with the current number of participants, if any
        context = super().get_context_data(**kwargs)
        context['num_participants'] = num_participants
        context['page'] = 'tr/pages/tournament.html'
        
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        # Get the number of participants from the form and store it in the session
        num_participants = int(request.POST.get('num_participants'))
        request.session['num_participants'] = num_participants
        
        # Redirect to the registration page
        return redirect('tournament_register')


class TournamentRegisterView(generic.TemplateView):
    template_name = 'tr/base.html'
    
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        
        # Create the participant range based on the number of participants
        participant_range = range(num_participants) if num_participants else []
        
        context = super().get_context_data(**kwargs)
        context['num_participants'] = num_participants
        context['participant_range'] = participant_range
        context['page'] = 'tr/pages/tournament_register.html'
        
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        
        # Collect aliases from the POST request
        aliases = {f"alias_{i+1}": request.POST.get(f"alias_{i+1}") for i in range(num_participants)}

        # Check if all aliases are unique
        alias_values = list(aliases.values())
        if len(alias_values) != len(set(alias_values)):
            # If duplicates found, add error message and re-render the form
            messages.error(request, "Each alias must be unique. Please correct the duplicates.")
            return redirect('tournament_register')

        # Store aliases in the session if no duplicates
        request.session['aliases'] = aliases

        # Redirect to the order page
        return redirect('tournament_order')

class TournamentOrderView(generic.TemplateView):
    template_name = 'tr/base.html'
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        aliases = request.session.get('aliases', {})
        
        context = super().get_context_data(**kwargs)
        
        context['num_participants'] = num_participants
        context['aliases'] = aliases
        context['page'] = 'tr/pages/tournament_order.html'
        
        return self.render_to_response(context)
    
class PlayView ( generic.TemplateView ):
	template_name = 'tr/base.html'

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/tournament.html'
		return ( context )

class GameView ( generic.TemplateView ):
	template_name = 'tr/pages/pong.html'
	
	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context['page'] = 'tr/pages/pong.html'
		return ( context )

def double_play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		'page': 'tr/pages/double_play.html',
    }
    return ( render( request, 'tr/base.html', context) )

def solo_play_view ( request ):

	context = {
		'title':'P4ngP2ong',
		'lang':'en',
        'username': 'clara',
		'page':'tr/pages/solo_play.html',
    }
	return ( render( request, 'tr/base.html', context ) )

def play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		'page': 'tr/pages/play.html',
    }
    return ( render ( request, 'tr/base.html', context ) )

def pong_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		'page': "tr/pages/pong.html",
    }
    return ( render( request, 'tr/base.html', context ) )

class StatsView(generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profile = self.request.user.profile
        context["page"] = "tr/pages/stats.html"
        
        context['matches_played'] = profile.matches_played()
        context['wins'] = profile.wins()
        context['losses'] = profile.losses()
        context['win_percentage'] = profile.win_percentage()
        context['loss_percentage'] = profile.loss_percentage()
        context['total_win_points'] = profile.total_win_points()
        context['total_loss_points'] = profile.total_loss_points()
        context['match_history'] = Match.objects.filter(
            Q(winner_username=self.request.user) | Q(loser_username=self.request.user)
        ).order_by('-created_at')
        return context

class FriendsView(generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/friends.html"
        user_profile = self.request.user.profile
        
        # Handle search query
        search_query = self.request.GET.get('search', '')
        if search_query:
            search_results = Profile.objects.filter(
                Q(user__username__icontains=search_query) & 
                ~Q(user=self.request.user)
            )
        else:
            search_results = None
        
        friend_requests_sent = Relationship.objects.filter(
            sender=user_profile, status='send'
        ).select_related('receiver')
        
        friend_requests_received = Relationship.objects.filter(
            receiver=user_profile, status='send'
        ).select_related('sender')
        
        friends_list = user_profile.get_friends()

        sent_requests_usernames = [req.receiver.user.username for req in friend_requests_sent]

        context["profile"] = user_profile
        context["search_results"] = search_results
        context["friend_requests_sent"] = friend_requests_sent
        context["friend_requests_received"] = friend_requests_received
        context["sent_requests_usernames"] = sent_requests_usernames
        context["friends_list"] = friends_list
        return context
	
    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        username = request.POST.get('username')
        user_profile = request.user.profile

        if action == "send_request":
            profile_to_add = get_object_or_404(Profile, user__username=username)
            Relationship.objects.filter(
                Q(sender=user_profile, receiver=profile_to_add) | 
                Q(sender=profile_to_add, receiver=user_profile)
            ).delete()
            
            Relationship.objects.create(
                sender=user_profile,
                receiver=profile_to_add,
                status='send'
            )

        elif action == "accept_request":
            sender_profile = get_object_or_404(Profile, user__username=username)
            relationship = get_object_or_404(Relationship, sender=sender_profile, receiver=user_profile, status='send')
            relationship.status = 'accepted'
            relationship.save()

        elif action == "remove_friend":
            friend_profile = get_object_or_404(Profile, user__username=username)            
            Relationship.objects.filter(
                Q(sender=user_profile, receiver=friend_profile) | 
                Q(sender=friend_profile, receiver=user_profile)
            ).delete()
            messages.success(request, "Friend removed successfully.")

        return redirect('friends')

    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/friends.html"
        user_profile = self.request.user.profile
        
        # Handle search query
        search_query = self.request.GET.get('search', '')
        if search_query:
            search_results = Profile.objects.filter(
                Q(user__username__icontains=search_query) & 
                ~Q(user=self.request.user)
            )
        else:
            search_results = None
        
        friend_requests_sent = Relationship.objects.filter(
            sender=user_profile, status='send'
        ).select_related('receiver')