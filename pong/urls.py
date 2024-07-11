from django.urls import path, re_path
from . import views

app_name = "pong"
urlpatterns = [
		# ex: /pong/*
		re_path( r'^', views.index ),
		]
