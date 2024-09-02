#!/bin/sh

alias sass="./node_modules/sass/sass.js" 

IN="scss/main.scss"
OUT="static/css/style.css"

npm install

if test "$DEBUG" = "True"
then
	sass --watch "$IN" "$OUT"
else
	sass "$IN" "$OUT"
fi
