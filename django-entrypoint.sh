#!/bin/sh

#TODO: https://docs.python.org/3/tutorial/venv.html

python3 manage.py collectstatic --noinput
python3 manage.py makemigrations --noinput
python3 manage.py migrate
python3 manage.py runserver '0.0.0.0:8000'
