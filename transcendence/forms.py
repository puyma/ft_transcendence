from django import forms
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Profile

class LoginForm ( forms.Form ):

	username = forms.CharField(
			label="Username",
			max_length=255,
			widget=forms.TextInput(attrs={"class": "form-control"}),
			)

	password = forms.CharField(
			widget=forms.PasswordInput(attrs={"class": "form-control mb-3"}),
			)

class SignupForm ( forms.Form ):

	username = forms.CharField(
			label="Username",
			max_length=255,
			widget=forms.TextInput(attrs={"class": "form-control uniform-input"}),
			)

	password = forms.CharField(
			label='Password',
			widget=forms.PasswordInput(attrs={"class": "form-control uniform-input"}),
			)

	password_confirm = forms.CharField(
			label='Repeat password',
			widget=forms.PasswordInput(attrs={"class": "form-control uniform-input"}),
			)

	class Meta:
		model = auth.get_user_model()
		fields = ['username', 'first_name', 'email']

	def clean_password_confirm ( self ):
		data = self.cleaned_data
		if data['password'] != data['password_confirm']:
			raise forms.ValidationError( "Passwords do not match" )
		return ( data['password'] )

class UpdateUserForm(forms.ModelForm):
    first_name = forms.CharField(max_length=100,
                                  required=False,
                                  widget=forms.TextInput(attrs={'class': 'form-control'}))
    last_name = forms.CharField(max_length=100,
                                 required=False,
                                 widget=forms.TextInput(attrs={'class': 'form-control'}))
    username = forms.CharField(max_length=100,
                               required=True,
                               widget=forms.TextInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(required=True,
                             widget=forms.EmailInput(attrs={'class': 'form-control'}))
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email']


class UpdateProfileForm(forms.ModelForm):
    avatar = forms.ImageField(widget=forms.FileInput(attrs={'class': 'form-control-file'}), required=False)
    avatar_url = forms.URLField(widget=forms.TextInput(attrs={'class': 'form-control'}), required=False)
    bio = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}), required=False)

    class Meta:
        model = Profile
        fields = ['avatar', 'avatar_url','bio']