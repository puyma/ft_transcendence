# URL configuration for transcendence project.

from django.contrib import admin
from django.urls import path
from app import views

from .views import HomepageView
from .views import TournamentView
from .views import double_play_view
from .views import solo_play_view
from .views import play_view
from .views import pong_view

urlpatterns = [
	path( '', views.HomepageView.as_view(), name='home' ),
	path( 'login/', views.LoginView.as_view(), name='login' ),
	path( 'signup/', views.SignupView.as_view(), name='signup' ),
	path( 'profile/', views.ProfileView.as_view(), name='profile' ),
    path( 'admin/', admin.site.urls ),
    path( 'tournament/', TournamentView.as_view(), name='tournament' ),
    path( 'double_play/', double_play_view, name='double_play' ),
    path( 'solo_play/', solo_play_view, name='solo_play' ),
    path( 'solo_play/play/', play_view, name='play' ),
    path( 'solo_play/play/pong/', pong_view, name='pong' ),
]

#path( 'user/<username>', views.username, name='username' ),
# handle404...
