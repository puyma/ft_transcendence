from django import urls
from django.urls import reverse_lazy
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views import generic
from .forms import LoginForm, SignupForm, UpdateUserForm, UpdateProfileForm
from . import forms
from .providers import fortytwo
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from .models import Profile, Relationship
from .models import Match
from django.contrib.auth import authenticate
from django.http import JsonResponse
import json
from django.contrib.auth.models import User


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
        context["form"] = LoginForm()
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

class SignupView(generic.FormView):
    form_class = SignupForm
    success_url = reverse_lazy('home')
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/signup.html"
        return context

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            user = form.save()
            auth.login(request, user, backend='django.contrib.auth.backends.ModelBackend') 
            return redirect(self.success_url)
        return self.form_invalid(form)
	
    def form_invalid(self, form):
        context = self.get_context_data(form=form)
        return self.render_to_response(context)

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

class TournamentView(generic.TemplateView):
    template_name = 'tr/base.html'
    
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants', None)
        context = super().get_context_data(**kwargs)
        context['num_participants'] = num_participants
        context['page'] = 'tr/pages/tournament.html'
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        num_participants = int(request.POST.get('num_participants', 0))

        # Backend validation
        if num_participants < 3:
            messages.error(request, "The number of participants must be at least 3.")
            return redirect('tournament')  # Reload the current page

        # If validation passes, save to session and redirect
        request.session['num_participants'] = num_participants
        return redirect('tournament_register')

class TournamentRegisterView(generic.TemplateView):
    template_name = 'tr/base.html'
    
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        participant_range = range(num_participants) if num_participants else []
        context = super().get_context_data(**kwargs)
        context['num_participants'] = num_participants
        context['participant_range'] = participant_range
        context['page'] = 'tr/pages/tournament_register.html'
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        aliases = {f"alias_{i+1}": request.POST.get(f"alias_{i+1}") for i in range(num_participants)}
        alias_values = list(aliases.values())
        if len(alias_values) != len(set(alias_values)):
            # If duplicates found, add error message and re-render the form
            messages.error(request, "Each alias must be unique. Please correct the duplicates.")
            return redirect('tournament_register')
        request.session['aliases'] = aliases
        return redirect('tournament_order')

class TournamentOrderView(generic.TemplateView):
    template_name = 'tr/base.html'
    
    def get(self, request, *args, **kwargs):
        num_participants = request.session.get('num_participants')
        aliases = request.session.get('aliases', {})
        if isinstance(aliases, dict):
            aliases = list(aliases.values())
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
		'page': 'tr/pages/play_anonymous.html',
    }
    return ( render ( request, 'tr/base.html', context ) )


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
                & ~Q(user__username__in=["Computer", "Guest"])  # Exclude restricted usernames

            )
        else:
            search_results = None
        
        friend_requests_sent = Relationship.objects.filter(
            sender=user_profile, status='send'
        ).select_related('receiver')
        
        friend_requests_received = Relationship.objects.filter(
            receiver=user_profile, status='send'
        ).select_related('sender')
        
        sent_requests_usernames = [req.receiver.user.username for req in friend_requests_sent]
        friends_usernames = [friend.user.username for friend in user_profile.get_friends()]

        context["friends_usernames"] = friends_usernames
        context["profile"] = user_profile
        context["search_results"] = search_results
        context["friend_requests_sent"] = friend_requests_sent
        context["friend_requests_received"] = friend_requests_received
        context["sent_requests_usernames"] = sent_requests_usernames
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

def double_play_view(request):
    is_player1_anonymous = request.GET.get('anonymous') == 'true'
    is_player2_anonymous = request.GET.get('anonymous2') == 'true'
    
    player1 = request.user if request.user.is_authenticated else None
    player2 = None
    context = {
        "title": "P4ngP2ong",
        "lang": "en",
        "username": "clara",
        "page": 'tr/pages/double_play.html',
        "is_anonymous": is_player1_anonymous,
        "is_player2_anonymous": is_player2_anonymous,
        "player1": player1,
        "player2": player2,
    }
    if is_player1_anonymous:
        player1 = "guest"
    if is_player2_anonymous:
        player2 = "guest2"
    context['player1'] = player1
    context['player2'] = player2

    if request.method == 'POST' and not is_player2_anonymous:
        player2_username = request.POST.get('player2_username', '').strip()
        player2_password = request.POST.get('player2_password', '').strip()

        if player2_username and player2_password:
            try:
                player2 = User.objects.get(username=player2_username)
                user = authenticate(request, username=player2_username, password=player2_password)
                if user is not None:
                    messages.success(request, f'Player 2 verified: {player2_username}. Ready to play!')
                    context['player2'] = player2.username
                else:
                    messages.error(request, 'Incorrect password. Please try again.')
            except User.DoesNotExist:
                messages.error(request, 'User not found. Please try again.')


    if context['player1'] and context['player2']:
        context['play_enabled'] = True
    else:        
        context['play_enabled'] = False
    return render(request, 'tr/base.html', context)

# store varibales in the games database
def save_match(request):
    if not request.user.is_authenticated:
        print("User not authenticated")
        return JsonResponse({'status': 'success', 'message': 'User not authenticated, match not saved'}, status=200)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Request body received:", request.body)
            print("Parsed JSON data:", data)

            winner_username = data.get('winner')
            loser_username = data.get('loser')
            winner_points = data.get('winner_points')
            loser_points = data.get('loser_points')
            
            if winner_username == "guest2":
                winner_username = "Guest"
            if loser_username == "guest2":
                loser_username = "Guest"
            if not winner_username or not loser_username or winner_points is None or loser_points is None:
                return JsonResponse({'status': 'error', 'message': 'Missing data'}, status=400)

            try:
                winner = User.objects.get(username=winner_username)
                loser = User.objects.get(username=loser_username)
            except User.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

            match = Match.objects.create(
                winner_username=winner,
                loser_username=loser,
                winner_points=winner_points,
                loser_points=loser_points
            )
            return JsonResponse({'status': 'success', 'match_id': match.id})

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
