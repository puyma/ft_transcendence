from django.contrib import admin
from django.contrib import auth
from django.urls import path

from . import views
from .providers import fortytwo

urlpatterns = [
    path(
		'',
		views.HomepageView.as_view(),
		name='home',
		),
    path(
		'login/',
		views.LoginView.as_view(),
		name='login',
		),
    path(
		'logout/', views.do_logout,
		name='logout',
		),
    path(
		'signup/',
		views.SignupView.as_view(),
		name='signup',
		),
	path(
		'password/change/',
		views.PasswordChangeView.as_view(),
		name='password_change',
		),
	path(
		'password/change/done/',
		views.PasswordChangeDoneView.as_view(),
		name='password_change_done',
		),
	path(
		'password/reset/',
		views.PasswordResetView.as_view(),
		name='password_reset'
		),
	path(
		'password/reset/done/',
		views.PasswordResetDoneView.as_view(),
		name='password_reset_done',
		),
	path(
		'password/reset/<uid64>/<token>/',
		views.PasswordResetConfirmView.as_view(),
		name='password_reset_confirm',
		),
	path(
		'password/reset/complete/',
		views.PasswordResetCompleteView.as_view(),
		name='password_reset_complete',
		),
    path(
		'profile/',
		views.ProfileView.as_view(),
		name='profile',
		),
	path(
		'profile/delete/',
		views.profile_delete,
		name='del_account',
		),
    path(
		'settings/',
		views.ProfileView.as_view(),
		name='settings',
		),
    path(
		'tournament/', 
		views.TournamentView.as_view(),
		name='tournament',
		),
    path(
		'double_play/',
		views.double_play_view,
		name='double_play',
		),
    path(
		'solo_play/',
		views.solo_play_view,
		name='solo_play',
		),
    path(
		'solo_play/play/',
		views.play_view,
		name='play',
		),
    path(
		'solo_play/play/pong/',
		views.pong_view,
		name='pong',
		),
    path(
		'pong/play/solo', views.GameView.as_view(),
		),
	path(
		'oauth/callback/', fortytwo.do_provider_login,
		),
	path(
		'admin/', admin.site.urls,
		),
	#the following will use list views
	path(
		'users/<str:username>/', views.HomepageView.as_view(),
		),
	path(
		'pong/users/<str:username>/', views.HomepageView.as_view(),
		),
]

# handle404...
