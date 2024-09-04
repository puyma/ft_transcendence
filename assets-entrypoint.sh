#!/bin/sh

set -x

for item in assets/*
do
	mkdir -p "static/`dirname $item`"
	cp --archive "$item" "static/assets/"
	echo "> $item"
done

FONT_URL="https://fonts.gstatic.com/s/dotgothic16/v18/v6-QGYjBJFKgyw5nSoDAGH7M6X8.woff2"
FILE="static/fonts/dotgothic16/v18/v6-QGYjBJFKgyw5nSoDAGH7M6X8.woff2"

if [ ! -e "$FILE" ]
then
	mkdir -p "static/fonts/dotgothic16/v18/"
	cd "static/fonts/dotgothic16/v18/"
	wget -O "`basename $FILE`" "$FONT_URL"
fi
