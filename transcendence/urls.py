# URL configuration for transcendence project.

from django.contrib import admin
from django.urls import path
from django.urls import include

from users import views

urlpatterns = [
    path( '', include( 'pong.urls' ) ),
	path( 'user/', include( 'users.urls' ) ),
    path( 'bmi/', views.bmi, name='bmi' ),
	path( 'feed/', include( 'feed.urls' ) ),
    path( 'admin/', admin.site.urls ),
]
