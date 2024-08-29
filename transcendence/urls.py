# URL configuration for transcendence project.

from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
	path( '', views.HomepageView.as_view(), name='home' ),
	path( 'login/', views.LoginView.as_view(), name='login' ),
	path( 'signup/', views.SignupView.as_view(), name='signup' ),
	path( 'profile/', views.ProfileView.as_view(), name='profile' ),
    path( 'admin/', admin.site.urls ),
]

#path( 'user/<username>', views.username, name='username' ),
# handle404...
