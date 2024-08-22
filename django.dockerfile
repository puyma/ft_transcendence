FROM python:3.12-alpine3.20

ENV PYTHONUNBUFFERED 1
WORKDIR /usr/app/

RUN python3 -m pip install --upgrade pip
COPY requirements.txt ./requirements.txt
RUN python3 -m pip install -r requirements.txt
