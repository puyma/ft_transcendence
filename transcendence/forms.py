from django import forms
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Profile
from django.core.exceptions import ValidationError
import os


class LoginForm(forms.Form):

    username = forms.CharField(
        label="Username",
        max_length=255,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control mb-3"}),
    )


class SignupForm(forms.ModelForm):

    username = forms.CharField(
        label="Username",
        max_length=255,
        widget=forms.TextInput(attrs={"class": "form-control uniform-input"}),
    )

    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"class": "form-control uniform-input"}),
    )

    password_confirm = forms.CharField(
        label="Repeat password",
        widget=forms.PasswordInput(attrs={"class": "form-control uniform-input"}),
    )

    class Meta:
        model = auth.get_user_model()
        fields = ["username", "first_name", "email"]

    def clean_password_confirm(self):
        data = self.cleaned_data
        if data["password"] != data["password_confirm"]:
            raise forms.ValidationError("Passwords do not match")
        return data["password"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class UpdateUserForm(forms.ModelForm):
    username = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    email = forms.EmailField(
        required=True, widget=forms.EmailInput(attrs={"class": "form-control"})
    )

    class Meta:
        model = User
        fields = ["username", "email"]


class UpdateProfileForm(forms.ModelForm):
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
    avatar = forms.ImageField(
        widget=forms.FileInput(attrs={"class": "form-control-file"}), required=False
    )
    avatar_url = forms.URLField(
        widget=forms.TextInput(attrs={"class": "form-control"}), required=False
    )
    bio = forms.CharField(
        widget=forms.Textarea(attrs={"class": "form-control", "rows": 5}),
        required=False,
    )

    class Meta:
        model = Profile
        fields = ["first_name", "last_name", "avatar", "avatar_url", "bio"]

    def clean_avatar(self):
        avatar = self.cleaned_data.get("avatar")
        if avatar:
            max_size = 2 * 1024 * 1024  # 2MB
            if avatar.size > max_size:
                raise ValidationError("Image size must not exceed 950 KB.")
            valid_extensions = [".jpg", ".jpeg", ".png", ".gif"]
            ext = os.path.splitext(avatar.name)[1].lower()
            if ext not in valid_extensions:
                raise ValidationError(
                    "Unsupported file format. Allowed formats are: JPG, JPEG, PNG, GIF."
                )
        return avatar
