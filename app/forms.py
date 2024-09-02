from django import forms

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
        widget=forms.TextInput(attrs={"id": "signup-username", "class": "input"}),
    )
    email = forms.EmailField(
        label="Email",
        max_length=255,
        widget=forms.EmailInput(attrs={"id": "signup-email", "class": "input"}),
    )
    password = forms.CharField(
        label="Password",
        max_length=255,
        widget=forms.PasswordInput(attrs={"id": "signup-password", "class": "input"}),
    )
    password_confirm = forms.CharField(
        label="Confirm Password",
        max_length=255,
        widget=forms.PasswordInput(
            attrs={"id": "signup-password-confirm", "class": "input"}
        ),
    )
