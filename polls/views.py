from django.db.models import F
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.views import generic
from .models import Question
from .models import Choice

class IndexView ( generic.ListView ):
	template_name = "polls/index.html"
	context_object_name = "latest_question_list"

	def get_queryset ( self ):
		"""Return the last five published questions.
		Actually no. Just returns all published questions"""
		return ( Question.objects
					.filter( pub_date__lte=timezone.now() )
					.order_by( "-pub_date" )[:5] )

class DetailView ( generic.DetailView ):
	model = Question
	template_name = "polls/detail.html"
	context_object_name = "question"

	def get_queryset ( self ):
		return ( Question.objects.filter( pub_date__lte=timezone.now() ) )

class ResultsView ( generic.DetailView ):
	model = Question
	template_name = "polls/results.html"
	context_object_name = "question"

def vote ( request, question_id ):
	question = get_object_or_404( Question, pk=question_id )
	try:
		selected_choice = question.choice_set.get( pk=request.POST["choice"] )
	except ( KeyError, Choice.DoesNotExist ):
		context = {
				"question": question,
				"error_message": "You did not select a message",
				}
		return ( render( request, "polls/detail.html", context ) )
	else:
		selected_choice.votes = F( "votes" ) + 1
		selected_choice.save()
		return ( HttpResponseRedirect( reverse( "polls:results", args=(question_id,) ) ) )
