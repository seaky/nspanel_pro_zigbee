#!/bin/bash

. /vendor/bin/siliconlabs_host/pm_config.sh
. /vendor/bin/siliconlabs_host/pm_utils.sh

start_zgateway() {
    echo  "zgateway_start: start $PKG_NAME gateway"
    sh /vendor/bin/siliconlabs_host/run_zgateway.sh
    echo  "zgateway_start: wait for start"
	sleep 30
    echo  "zgateway_start: wait done"
}

start_mosquitto() {
    echo  "mosquitto_start: start mosquitto"
    sh /vendor/bin/siliconlabs_host/run_mosquitto.sh
    echo  "mosquitto_start: wait for start"
	sleep 3
    echo  "mosquitto_start: done"
}

check_zgateway() {
        res=$(/vendor/bin/siliconlabs_host/mosquitto_sub -h "localhost" -t "zigbee/system/availability" -i rkguardsh_zigbee  -u zigbee -P "EWoXIXT!0AouN" -W 5 -C 1)
        if [ "$res" = "{\"online\": false, \"reason\": \"KeepAlive timeout\"}" ]; then
            echo "sub_mqtt_check: zgateway offline"
            echo "zgateway restart `date +"%Y-%m-%d %H:%M:%S"`" >> /data/vendor/siliconlabs_host/zgatewayStatus
            stop_zgateway
            start_zgateway
        fi
}

check_zstack() {
    local z_gw_proc=`ps -ef | grep -w 'zgateway' | grep -v "grep" | wc -l`
    local mosquitto_proc=`ps -A | grep -w 'mosquitto' | grep -v "grep" | wc -l`

    if [ ${mosquitto_proc} -ne 1 ]; then
        echo ""
        echo "check: mosquitto not found"
        echo "mosquitto start `date +"%Y-%m-%d %H:%M:%S"`" >> /data/vendor/siliconlabs_host/zgatewayStatus
        start_mosquitto
    elif [ ${z_gw_proc} -ne 1 ]; then
        echo ""
        echo "check: zgateway not found"
        echo "zgateway start `date +"%Y-%m-%d %H:%M:%S"`" >> /data/vendor/siliconlabs_host/zgatewayStatus
        start_zgateway
    else
	    check_zgateway
    fi
}

# Background monitoring function
while true; do
    check_zstack
    sleep 5
done
