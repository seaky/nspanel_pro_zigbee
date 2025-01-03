#!/bin/bash

. /vendor/bin/siliconlabs_host/pm_config.sh
. /vendor/bin/siliconlabs_host/pm_utils.sh

stop() {
    killall mosquitto
    sleep 1
}

start() {
    echo "start mosquito"
    stop

    /vendor/bin/siliconlabs_host/mosquitto -c $PKG_CONFIG/mosquitto.conf > /dev/null 2>&1 &
}

handle_start_stop_command $1