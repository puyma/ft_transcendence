from django import db
from django import urls
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.shortcuts import render
from django.shortcuts import redirect
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views import generic

from .forms import LoginForm
from .forms import SignupForm
from .forms import UpdateUserForm
from .forms import UpdateProfileForm
from .models import Match
from .models import Profile
from .models import Relationship
from .providers import fortytwo


class HomepageView(generic.TemplateView):
    http_method_names = ["get"]
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/home.html"
        context["active_nav"] = "home"
        return context


class LoginView(auth.views.LoginView):
    authentication_form = LoginForm
    http_method_names = ["get", "post"]
    redirect_authenticated_user = True
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/login.html"
        context["provider_42_login"] = fortytwo.get_login_url(
            "42", {"state": self.request.COOKIES.get("csrftoken")}
        )
        return context


class LogoutView(auth.views.LogoutView):
    http_method_names = ["post"]
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/logout.html"
        return context

    def get(self, request, *args, **kwargs):
        return redirect("home")

    def post(self, request, *args, **kwargs):
        auth.logout(request)
        messages.success(request, "Successfully logged out.")
        redirect_to = self.get_success_url()
        if redirect_to != request.get_full_path():
            return HttpResponseRedirect(redirect_to)
        return super().get(request, *args, **kwargs)


class SignupView(generic.FormView):
    form_class = SignupForm
    success_url = reverse_lazy("home")
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/signup.html"
        return context

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            user = form.save()
            auth.login(
                request,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )
            return redirect(self.success_url)
        return self.form_invalid(form)

    def form_invalid(self, form):
        context = self.get_context_data(form=form)
        return self.render_to_response(context)


@login_required
def profile_dashboard(request):
    return render(
        request, "tr/pages/base.html", {"page": "tr/pages/profile.html"}
    )


class ProfileView(LoginRequiredMixin, generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/profile.html"
        context["user_form"] = UpdateUserForm(instance=self.request.user)
        context["profile_form"] = UpdateProfileForm(
            instance=self.request.user.profile
        )
        return context

    def post(self, request, *args, **kwargs):
        user_form = UpdateUserForm(request.POST, instance=request.user)
        profile_form = UpdateProfileForm(
            request.POST, request.FILES, instance=request.user.profile
        )

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            # if profile_form.cleaned_data['avatar']: keep this lines till is all good he avatar tests !!
            #     profile = request.user.profile
            # print("Uploaded Avatar File:", profile_form.cleaned_data['avatar'])
            # print(" New Avatar URL:", profile.avatar.url)
            messages.success(request, "Profile updated successfully.")
            return redirect("profile")

        context = self.get_context_data()
        context["user_form"] = user_form
        context["profile_form"] = profile_form
        return self.render_to_response(context)


@login_required
def profile_delete(request):
    user_pk = request.user.pk
    auth.logout(request)
    User = auth.get_user_model()
    User.objects.filter(pk=user_pk).delete()
    messages.success(request, "Account deleted successfully.")
    return redirect("home")


class PasswordChangeView(auth.views.PasswordChangeView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_change.html"
        return context


class PasswordChangeDoneView(auth.views.PasswordChangeDoneView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_change_done.html"
        return context


class PasswordResetView(auth.views.PasswordResetView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_reset.html"
        return context


class PasswordResetDoneView(auth.views.PasswordResetDoneView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_reset_done.html"
        return context


class PasswordResetConfirmView(auth.views.PasswordResetConfirmView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_reset_confirm.html"
        return context


class PasswordResetCompleteView(auth.views.PasswordResetCompleteView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/password_reset_complete.html"
        return context


class TournamentView(generic.TemplateView):
    template_name = "tr/base.html"

    def get(self, request, *args, **kwargs):
        num_participants = request.session.get("num_participants", None)
        context = super().get_context_data(**kwargs)
        context["num_participants"] = num_participants
        context["page"] = "tr/pages/tournament.html"
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        num_participants = int(request.POST.get("num_participants", 0))

        # Backend validation
        if num_participants < 3:
            messages.error(
                request, "The number of participants must be at least 3."
            )
            return redirect("tournament")  # Reload the current page

        # If validation passes, save to session and redirect
        request.session["num_participants"] = num_participants
        return redirect("tournament_register")


class TournamentRegisterView(generic.TemplateView):
    template_name = "tr/base.html"

    def get(self, request, *args, **kwargs):
        num_participants = request.session.get("num_participants")
        participant_range = range(num_participants) if num_participants else []
        context = super().get_context_data(**kwargs)
        context["num_participants"] = num_participants
        context["participant_range"] = participant_range
        context["page"] = "tr/pages/tournament_register.html"
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        num_participants = request.session.get("num_participants")
        aliases = {
            f"alias_{i+1}": request.POST.get(f"alias_{i+1}")
            for i in range(num_participants)
        }
        alias_values = list(aliases.values())
        if len(alias_values) != len(set(alias_values)):
            # If duplicates found, add error message and re-render the form
            messages.error(
                request,
                "Each alias must be unique. Please correct the duplicates.",
            )
            return redirect("tournament_register")
        request.session["aliases"] = aliases
        return redirect("tournament_order")


class TournamentOrderView(generic.TemplateView):
    template_name = "tr/base.html"

    def get(self, request, *args, **kwargs):
        num_participants = request.session.get("num_participants")
        aliases = request.session.get("aliases", {})
        if isinstance(aliases, dict):
            aliases = list(aliases.values())
        context = super().get_context_data(**kwargs)
        context["num_participants"] = num_participants
        context["aliases"] = aliases
        context["page"] = "tr/pages/tournament_order.html"
        return self.render_to_response(context)


class PlayView(generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/tournament.html"
        return context


class GameView(generic.TemplateView):
    template_name = "tr/pages/pong.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/pong.html"
        return context


def solo_play_view(request):

    context = {
        "title": "P4ngP2ong",
        "lang": "en",
        "username": "clara",
        "page": "tr/pages/solo_play.html",
    }
    return render(request, "tr/base.html", context)


def play_view(request):
    context = {
        "title": "P4ngP2ong",
        "lang": "en",
        "username": "clara",
        "page": "tr/pages/play_anonymous.html",
    }
    return render(request, "tr/base.html", context)


def pong_view(request):
    context = {
        "title": "P4ngP2ong",
        "lang": "en",
        "username": "clara",
        "page": "tr/pages/pong.html",
    }
    return render(request, "tr/base.html", context)


class StatsView(generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profile = self.request.user.profile
        context["page"] = "tr/pages/stats.html"

        context["matches_played"] = profile.matches_played()
        context["wins"] = profile.wins()
        context["losses"] = profile.losses()
        context["win_percentage"] = profile.win_percentage()
        context["loss_percentage"] = profile.loss_percentage()
        context["total_win_points"] = profile.total_win_points()
        context["total_loss_points"] = profile.total_loss_points()
        context["match_history"] = Match.objects.filter(
            db.models.Q(winner_username=self.request.user)
            | db.models.Q(loser_username=self.request.user)
        ).order_by("-created_at")
        return context


class FriendsView(generic.TemplateView):
    template_name = "tr/base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page"] = "tr/pages/friends.html"
        user_profile = self.request.user.profile

        # Handle search query
        search_query = self.request.GET.get("search", "")
        if search_query:
            search_results = Profile.objects.filter(
                db.models.Q(user__username__icontains=search_query)
                & ~db.models.Q(user=self.request.user)
            )
        else:
            search_results = None

        friend_requests_sent = Relationship.objects.filter(
            sender=user_profile, status="send"
        ).select_related("receiver")

        friend_requests_received = Relationship.objects.filter(
            receiver=user_profile, status="send"
        ).select_related("sender")

        friends_list = user_profile.get_friends()

        sent_requests_usernames = [
            req.receiver.user.username for req in friend_requests_sent
        ]

        context["profile"] = user_profile
        context["search_results"] = search_results
        context["friend_requests_sent"] = friend_requests_sent
        context["friend_requests_received"] = friend_requests_received
        context["sent_requests_usernames"] = sent_requests_usernames
        context["friends_list"] = friends_list
        return context

    def post(self, request, *args, **kwargs):
        action = request.POST.get("action")
        username = request.POST.get("username")
        user_profile = request.user.profile

        if action == "send_request":
            profile_to_add = get_object_or_404(
                Profile, user__username=username
            )
            Relationship.objects.filter(
                db.models.Q(sender=user_profile, receiver=profile_to_add)
                | db.models.Q(sender=profile_to_add, receiver=user_profile)
            ).delete()

            Relationship.objects.create(
                sender=user_profile, receiver=profile_to_add, status="send"
            )

        elif action == "accept_request":
            sender_profile = get_object_or_404(
                Profile, user__username=username
            )
            relationship = get_object_or_404(
                Relationship,
                sender=sender_profile,
                receiver=user_profile,
                status="send",
            )
            relationship.status = "accepted"
            relationship.save()

        elif action == "remove_friend":
            friend_profile = get_object_or_404(
                Profile, user__username=username
            )
            Relationship.objects.filter(
                db.models.Q(sender=user_profile, receiver=friend_profile)
                | db.models.Q(sender=friend_profile, receiver=user_profile)
            ).delete()
            messages.success(request, "Friend removed successfully.")

        return redirect("friends")


def double_play_view(request):
    is_player1_anonymous = request.GET.get("anonymous") == "true"
    is_player2_anonymous = request.GET.get("anonymous2") == "true"

    player1 = request.user if request.user.is_authenticated else None
    player2 = None
    context = {
        "title": "P4ngP2ong",
        "lang": "en",
        "username": "clara",
        "page": "tr/pages/double_play.html",
        "is_anonymous": is_player1_anonymous,
        "is_player2_anonymous": is_player2_anonymous,
        "player1": player1,
        "player2": player2,
    }
    if is_player1_anonymous:
        player1 = "guest"
    if is_player2_anonymous:
        player2 = "guest2"
    context["player1"] = player1
    context["player2"] = player2

    if request.method == "POST" and not is_player2_anonymous:
        player2_username = request.POST.get("player2_username", "").strip()
        player2_password = request.POST.get("player2_password", "").strip()

        if player2_username and player2_password:
            try:
                player2 = User.objects.get(username=player2_username)
                user = auth.authenticate(
                    request,
                    username=player2_username,
                    password=player2_password,
                )
                if user is not None:
                    messages.success(
                        request,
                        f"Player 2 verified: {player2_username}. Ready to play!",
                    )
                    context["player2"] = player2.username
                else:
                    messages.error(
                        request, "Incorrect password. Please try again."
                    )
            except User.DoesNotExist:
                messages.error(request, "User not found. Please try again.")

    if context["player1"] and context["player2"]:
        context["play_enabled"] = True
    else:
        context["play_enabled"] = False
    return render(request, "tr/base.html", context)
