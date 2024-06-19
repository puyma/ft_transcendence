FROM python:alpine

RUN python3 -m pip install django 'psycopg[binary]'
RUN python3 -m pip install hypercorn
RUN python3 -m pip install Pillow

# Force the stdout and stderr streams to be unbuffered.
ENV PTHONUNBUFFERED=1
