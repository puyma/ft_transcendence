FROM python:alpine

#RUN python3 -m venv /project/.venv && source /project/.venv/bin/activate

RUN python3 -m pip install django 'psycopg2-binary'
RUN python3 -m pip install hypercorn
RUN python3 -m pip install Pillow

# Force the stdout and stderr streams to be unbuffered.
ENV PTHONUNBUFFERED=1

COPY backend-entrypoint.sh /
RUN chmod +x /backend-entrypoint.sh

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
#CMD ["hypercorn", "--certfile", "cert.pem", "--keyfile", "key.pem", "-b", "0.0.0.0:8001", "transcendence.asgi:application"]

ENTRYPOINT ["/backend-entrypoint.sh"]
