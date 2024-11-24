import os

from django import core
from django import forms
from django.conf import settings
from django.contrib import auth
from django.contrib.auth import forms as auth_forms
from django.contrib.auth import models as auth_models

from . import models


class LoginForm(auth_forms.AuthenticationForm):
    """
    Override username and password fields
    from auth_forms.AuthenticationForm
    in order to customize it's appeareance.
    """

    username = forms.CharField(
        label="Username",
        max_length=255,
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    password = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={"class": "form-control mb-3"}),
    )


class SignupForm(auth_forms.UserCreationForm):

    username = forms.CharField(
        label="Username",
        max_length=255,
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control uniform-input"}),
    )

    password1 = forms.CharField(
        label="Password",
        required=True,
        widget=forms.PasswordInput(
            attrs={"class": "form-control uniform-input"}
        ),
    )

    password2 = forms.CharField(
        label="Repeat password",
        required=True,
        widget=forms.PasswordInput(
            attrs={"class": "form-control uniform-input"}
        ),
    )

    class Meta:
        model = auth.get_user_model()
        fields = ["username", "password1", "password2", "first_name", "email"]


class UpdateUserForm(auth_forms.UserChangeForm):

    username = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={"class": "form-control"}),
    )
    first_name = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    last_name = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    class Meta:
        model = auth_models.User
        fields = ["username", "email", "first_name", "last_name"]

class UpdateProfileForm(forms.ModelForm):

    avatar = forms.ImageField(
        widget=forms.FileInput(attrs={"class": "form-control-file"}),
        required=False,
    )
    avatar_url = forms.URLField(
        widget=forms.TextInput(attrs={"class": "form-control"}),
        required=False,
    )
    bio = forms.CharField(
        widget=forms.Textarea(attrs={"class": "form-control", "rows": 5}),
        required=False,
    )

    class Meta:
        model = models.Profile
        fields = ["avatar", "avatar_url", "bio"]

    """
    def clean_avatar(self):
        avatar = self.cleaned_data.get("avatar")
        if avatar:
            max_size = 2097152 # 2MB
            if avatar.size > max_size:
                raise core.exceptions.ValidationError(
                    "Image size must not exceed 950 KB."
                )
            valid_extensions = [".jpg", ".jpeg", ".png", ".gif"]
            ext = os.path.splitext(avatar.name)[1].lower()
            if ext not in valid_extensions:
                raise core.exceptions.ValidationError(
                        "Unsupported file format. Allowed formats are: JPG, JPEG, PNG, GIF."
                        )
        return avatar
    """
