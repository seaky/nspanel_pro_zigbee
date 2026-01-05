#!/data/data/com.termux/files/usr/bin/sh
export HOME=/data/data/com.termux/files/home
export PREFIX=/data/data/com.termux/files/usr
export LANG=en_US.UTF-8
export PATH=/data/data/com.termux/files/usr/bin
export TMPDIR=/data/data/com.termux/files/usr/tmp
export SVDIR=/data/data/com.termux/files/usr/var/service

sv start mosquitto/log
sv start mosquitto
sv start cube/log
sv start cube
