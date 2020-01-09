#!/bin/bash

host="<ENTER HOST>"
pass="<ENTER PASS>"
port="<ENTER PORT>"

vlc \
--control http
--http-host $host \
--http-password $pass \
--http-port $port \
--fullscreen --preferred-resolution -1 --random --loop \
&& \
HOST=$host PASS=$pass PORT=$port node ./video-shuffler/index.js
