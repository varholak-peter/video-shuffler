#!/bin/bash

host="localhost"
pass="123"
port="10004"
media_folder="/media"

setterm --blank force

cvlc \
--control http \
--http-host $host \
--http-password $pass \
--http-port $port \
--fullscreen --preferred-resolution -1 --random --loop \
& sleep 3 \
&& HOST=$host MEDIA_FOLDER=$media_folder PASS=$pass PORT=$port node .
