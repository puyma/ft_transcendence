#!/bin/sh

#TODO: https://docs.python.org/3/tutorial/venv.html

python3 manage.py collectstatic --noinput
python3 manage.py makemigrations app --noinput
python3 manage.py migrate
#python3 manage.py runserver '0.0.0.0:80'
daphne -e ssl:443:privateKey=key.pem:certKey=crt.pem transcendence.asgi:application -b '0.0.0.0' -p 80
