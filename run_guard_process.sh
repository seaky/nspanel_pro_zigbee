#!/bin/bash

. /vendor/bin/siliconlabs_host/pm_config.sh
. /vendor/bin/siliconlabs_host/pm_utils.sh

# Function to check if the guard process is running
is_guard_running() {
    pgrep -f "sh /vendor/bin/siliconlabs_host/guard_process.sh"
    return $?
}

# Function to stop whole zstack
stop_zstack() {
    stop_zgateway
    stop_mosquitto
}

stop_zgateway() {
    echo  "zgateway_stop: stop $PKG_NAME gateway"
    sh /vendor/bin/siliconlabs_host/run_zgateway.sh stop
    echo  "zgateway_stop: wait for stop"
	sleep 5
    echo  "zgateway_stop: wait done"
}

stop_mosquitto() {
    echo  "mosquitto_stop: stop mosquitto"
    sh /vendor/bin/siliconlabs_host/run_mosquitto.sh stop
    echo  "mosquitto_stop: wait for stop"
	sleep 3
    echo  "mosquitto_stop: done"
}

# Background monitoring function
guard_zstack() {
    nohup sh /vendor/bin/siliconlabs_host/guard_process.sh > /dev/null &
}

# Handle script arguments
case "$1" in
    stop)
        if is_guard_running
        then
            pkill -9 -f "sh /vendor/bin/siliconlabs_host/guard_process.sh"
            echo "Guard process stopped."
        fi
        stop_zstack
        ;;
    restart)
        if is_guard_running; then
            pkill -9 -f "sh /vendor/bin/siliconlabs_host/guard_process.sh"
            echo "Guard process stopped."
        fi
        stop_zstack
        echo "Restarting guard..."
        guard_zstack
        ;;
    *)
        if ! is_guard_running; then
            echo "Starting zstack guard..."
            guard_zstack
        else
            echo "Guard already started"
        fi
        ;;
esac
