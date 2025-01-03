#!/bin/bash

. /vendor/bin/siliconlabs_host/pm_config.sh
. /vendor/bin/siliconlabs_host/pm_utils.sh

stop() {
    killall zgateway
    sleep 5
}

start() {
    echo "start sonoff gateway"

    stop

    export LD_LIBRARY_PATH=/vendor/bin/siliconlabs_host

    /vendor/bin/siliconlabs_host/zgateway &
}

handle_start_stop_command $1