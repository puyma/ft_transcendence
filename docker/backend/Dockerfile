FROM python:3-alpine

RUN python3 -m pip install django 'psycopg[binary]'

# Force the stdout and stderr streams to be unbuffered.
ENV PTHONUNBUFFERED=1

EXPOSE 8000

WORKDIR /ft_transcendence

ENTRYPOINT ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
