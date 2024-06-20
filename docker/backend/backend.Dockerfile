FROM python:3-alpine

RUN python3 -m pip install django 'psycopg[binary]' hypercorn Pillow

# Force the stdout and stderr streams to be unbuffered.
ENV PTHONUNBUFFERED=1
