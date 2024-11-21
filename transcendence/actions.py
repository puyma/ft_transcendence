from datetime import datetime

from asgiref.sync import async_to_sync

from django import setup
from django.template.loader import render_to_string
from django.urls import reverse

setup()

from . import forms


def send_page(self, page):
    """
    Render HTML and send page to client.
    """

    context = {}
    match page:
        case "login":
            context = {"form": forms.LoginForm()}
        case "signup":
            context = {"form": forms.SignupForm()}

    context.update({"active_nav": page})

    self.send_html(
        {
            "selector": "#nav",
            "html": render_to_string("tr/components/_header.html", context),
        }
    )

    self.send_html(
        {
            "selector": "#main",
            "html": render_to_string(f"tr/pages/{page}.html", context),
            "url": reverse(page),
        }
    )
