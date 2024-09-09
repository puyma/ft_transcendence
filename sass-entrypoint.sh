#!/bin/sh

alias sass="./node_modules/sass/sass.js" 
IN="style/main.scss"
OUT="static/css/style.css"

npm install

if test "$DEBUG" = "true"
then
	sass --watch "$IN" "$OUT"
else
	sass "$IN" "$OUT"
fi
