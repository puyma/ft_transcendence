from django import forms
from django.contrib import auth
from .models import Profile

class LoginForm ( forms.Form ):

	username = forms.CharField(
			label="Username",
			max_length=255,
			widget=forms.TextInput(attrs={"class": "form-control"}),
			)

	password = forms.CharField(
			widget=forms.PasswordInput(attrs={"class": "form-control"}),
			)

class SignupForm ( forms.Form ):

	username = forms.CharField(
			label="Username",
			max_length=255,
			widget=forms.TextInput(attrs={"class": "form-control"}),
			)

	password = forms.CharField(
			label='Password',
			widget=forms.PasswordInput
			)

	password_confirm = forms.CharField(
			label='Repeat password',
			widget=forms.PasswordInput
			)

	class Meta:
		model = auth.get_user_model()
		fields = ['username', 'first_name', 'email']

	def clean_password_confirm ( self ):
		data = self.cleaned_data
		if data['password'] != data['password_confirm']:
			raise forms.ValidationError( "Passwords do not match" )
		return ( data['password'] )

class ProfileForm ( forms.Form ):
	class Meta:
		model = Profile
		fields = ['avatar']
