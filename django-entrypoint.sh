#!/bin/sh

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Collect static files and apply migrations
python3 manage.py collectstatic --noinput
python3 manage.py makemigrations transcendence --noinput
python3 manage.py migrate

# Create 'computer' and 'anonymous' users if they don't exist
python3 manage.py shell <<EOF
from django.contrib.auth.models import User

# Create 'Computer' user
if not User.objects.filter(username='Computer').exists():
    User.objects.create_user(
        username='Computer',
        password='Computer_password',
        email='computer@example.com'
    )

# Create 'Guest' user
if not User.objects.filter(username='Guest').exists():
    User.objects.create_user(
        username='Guest',
        password='guest_password',
        email='guest@example.com'
    )

EOF

# Run server or Daphne depending on the DEBUG environment variable
if test "$DEBUG" = "true"
then
    python3 manage.py runserver '0.0.0.0:80' &
    python3 manage.py runsslserver '0.0.0.0:443'
else
    daphne -e ssl:443:privateKey=key.pem:certKey=crt.pem transcendence.asgi:application -b '0.0.0.0' -p 80
fi
