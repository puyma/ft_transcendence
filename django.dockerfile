FROM python:3.12-alpine3.20

ENV PYTHONUNBUFFERED 1
WORKDIR /usr/app/

COPY requirements.txt ./requirements.txt
