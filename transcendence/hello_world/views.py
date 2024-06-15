from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def say_hello(request) :
	context = {}
	return render(request, "hello_world/index.html", context)