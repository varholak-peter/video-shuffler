#!/bin/bash

host="<ENTER HOST>"
pass="<ENTER PASS>"
port="<ENTER PORT>"
media_folder="<ENTER MEDIA FOLDER>"

vlc \
--control http \
--http-host $host \
--http-password $pass \
--http-port $port \
--fullscreen --preferred-resolution -1 --random --loop \
& wait-on http://$host:$port

HOST=$host MEDIA_FOLDER=$media_folder PASS=$pass PORT=$port node .
