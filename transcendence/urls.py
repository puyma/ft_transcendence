from django.contrib import admin
from django.conf import settings
from django.urls import path

from . import views
from .providers import fortytwo

handler400 = "transcendence.views.custom_400"
handler403 = "transcendence.views.custom_403"
handler404 = "transcendence.views.custom_404"
handler500 = "transcendence.views.custom_500"

urlpatterns = [
    path(
        "",
        views.HomepageView.as_view(),
        name="home",
    ),
    path(
        "login/",
        views.LoginView.as_view(),
        name="login",
    ),
    path(
        "logout/",
        views.LogoutView.as_view(),
        name="logout",
    ),
    path(
        "signup/",
        views.SignupView.as_view(),
        name="signup",
    ),
    path(
        "password/change/",
        views.PasswordChangeView.as_view(),
        name="password_change",
    ),
    path(
        "password/change/done/",
        views.PasswordChangeDoneView.as_view(),
        name="password_change_done",
    ),
    path(
        "password/reset/",
        views.PasswordResetView.as_view(),
        name="password_reset",
    ),
    path(
        "password/reset/done/",
        views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    path(
        "password/reset/<uid64>/<token>/",
        views.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "password/reset/complete/",
        views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
    path(
        "profile/",
        views.ProfileView.as_view(),
        name="profile",
    ),
    path("profile/stats/", views.StatsView.as_view(), name="stats"),
    path("profile/friends/", views.FriendsView.as_view(), name="friends"),
    # path(
    #     "profile/<str:username>/",
    #     views.ProfileOtherView.as_view(),
    # ),
    path(
        "settings/",
        views.ProfileView.as_view(),
        name="settings",
    ),
    path(
        "tournament/",
        views.TournamentView.as_view(),
        name="tournament",
    ),
    path(
        "tournament/register",
        views.TournamentRegisterView.as_view(),
        name="tournament_register",
    ),
    path(
        "tournament/tournament_order/",
        views.TournamentOrderView.as_view(),
        name="tournament_order",
    ),
    path(
        "double_play/",
        views.double_play_view,
        name="double_play",
    ),
    path(
        "solo_play/",
        views.solo_play_view,
        name="solo_play",
    ),
    path(
        "solo_play/play/",
        views.play_view,
        name="play",
    ),
    path(
        "solo_play/play/pong/",
        views.pong_view,
        name="pong",
    ),
    path(
        "tresD/",
        views.tresD_view,
        name="tresD",
    ),
    path(
        "tresD/play",
        views.tresD_play_view,
        name="tresD_play",
    ),
    path(
        "pong/play/solo",
        views.GameView.as_view(),
    ),
    path(
        "oauth/callback/",
        fortytwo.do_provider_login,
    ),
    path(
        "admin/",
        admin.site.urls,
    ),
    path(
        "users/<str:username>/",
        views.HomepageView.as_view(),
    ),
    path(
        "pong/users/<str:username>/",
        views.HomepageView.as_view(),
    ),
    path("tresD/play/save_match/", views.save_match, name="save_match"),

    path(
        "solo_play/save_match/", 
        views.save_match, 
        name='save_match'
    ),
    path("413/", views.error_413, name='error_413'),
]