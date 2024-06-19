FROM python:3-alpine

RUN python3 -m pip install django 'psycopg[binary]'
RUN python3 -m pip install daphne 'Twisted[tls,http2]' 
RUN python3 -m pip install Pillow

# Force the stdout and stderr streams to be unbuffered.
ENV PTHONUNBUFFERED=1
